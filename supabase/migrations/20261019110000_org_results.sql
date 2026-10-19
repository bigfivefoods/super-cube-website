-- Organisation results dashboard (corporate clients / org admins).
-- One SECURITY DEFINER function that returns AGGREGATES ONLY for one organisation,
-- and only to that organisation's admins (org_members.role = 'admin' or the owner,
-- via private.is_org_admin(), which reads auth.uid() from the caller's JWT).
--
-- Privacy
--  * Only learners who CURRENTLY share progress with their cohort count
--    (org_progress_snapshots.sharing = true for this org; see
--    20261019105000_org_sharing_consent.sql and /api/org/progress).
--    Turning sharing off removes a learner from every figure at once.
--  * Scores come from the server-scored, immutable lms_attempts (28-question
--    baseline = phase 'pre', after-test = phase 'post'), paired per learner.
--  * Any score group with fewer than 3 paired learners is suppressed (only n is returned).
--  * No names, emails, user ids or journal text ever leave this function.
--
-- No table grants change: org admins still cannot read other learners' rows directly.
-- Rollback: supabase/rollback/20261019110000_org_results.down.sql

create or replace function public.org_results(
  p_org uuid,
  p_session_totals jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  k constant integer := 3;
  result jsonb;
begin
  if auth.uid() is null or p_org is null or not private.is_org_admin(p_org) then
    raise exception 'org admins only' using errcode = '42501';
  end if;

  with learners as (
    select m.user_id, m.joined_at
    from public.org_members m
    where m.org_id = p_org and m.role = 'learner'
  ),
  consented as (
    select l.user_id, l.joined_at, s.programme_id as snap_programme
    from learners l
    join public.org_progress_snapshots s
      on s.org_id = p_org and s.user_id = l.user_id and s.sharing
  ),
  pre as (
    select distinct on (a.user_id) a.user_id, a.programme_id, a.overall, a.construct_scores
    from public.lms_attempts a
    join consented c on c.user_id = a.user_id
    where a.phase = 'pre'
    order by a.user_id, a.created_at desc
  ),
  post as (
    select a.user_id, a.overall, a.construct_scores
    from public.lms_attempts a
    join pre p on p.user_id = a.user_id and p.programme_id = a.programme_id
    where a.phase = 'post'
  ),
  per as (
    select
      c.user_id,
      coalesce(p.programme_id, c.snap_programme, 'adults') as programme_id,
      p.user_id is not null as has_pre,
      po.user_id is not null as has_post,
      (select count(*) from public.lms_lesson_completions lc
        where lc.user_id = c.user_id
          and lc.programme_id = coalesce(p.programme_id, c.snap_programme, 'adults'))::int as sessions,
      coalesce((p_session_totals ->> coalesce(p.programme_id, c.snap_programme, 'adults'))::int, 0) as total_sessions,
      exists (select 1 from public.certificates ce
        where ce.user_id = c.user_id and not ce.revoked) as certified,
      greatest(
        (select max(e.created_at) from public.learning_events e where e.user_id = c.user_id),
        (select max(lc.completed_at) from public.lms_lesson_completions lc where lc.user_id = c.user_id),
        (select max(a.created_at) from public.lms_attempts a where a.user_id = c.user_id)
      ) as last_active,
      (select ps.current_days from public.practice_streaks ps where ps.user_id = c.user_id) as streak
    from consented c
    left join pre p on p.user_id = c.user_id
    left join post po on po.user_id = c.user_id
  ),
  pairs as (
    select pre.overall::numeric as pre_v, post.overall::numeric as post_v
    from pre join post on post.user_id = pre.user_id
  ),
  face_pairs as (
    select f.value ->> 'constructId' as face,
           (f.value ->> 'score')::numeric as pre_v,
           (g.value ->> 'score')::numeric as post_v
    from pre
    join post on post.user_id = pre.user_id
    cross join lateral jsonb_array_elements(case when jsonb_typeof(pre.construct_scores) = 'array' then pre.construct_scores else '[]'::jsonb end) f
    join lateral jsonb_array_elements(case when jsonb_typeof(post.construct_scores) = 'array' then post.construct_scores else '[]'::jsonb end) g
      on g.value ->> 'constructId' = f.value ->> 'constructId'
  ),
  face_stats as (
    select face, count(*)::int as n,
           avg(pre_v) as pre_mean, stddev_samp(pre_v) as pre_sd,
           avg(post_v) as post_mean, stddev_samp(post_v) as post_sd,
           avg(post_v - pre_v) as diff_mean, stddev_samp(post_v - pre_v) as diff_sd
    from face_pairs
    group by face
  ),
  activity as (
    select e.user_id, e.created_at from public.learning_events e join consented c on c.user_id = e.user_id
      where e.created_at >= now() - interval '8 weeks'
    union all
    select lc.user_id, lc.completed_at from public.lms_lesson_completions lc join consented c on c.user_id = lc.user_id
      where lc.completed_at >= now() - interval '8 weeks'
  ),
  weeks as (
    select gs::date as week_start,
           (select count(distinct a.user_id) from activity a
             where a.created_at >= gs and a.created_at < gs + interval '1 week')::int as active
    from generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') gs
  )
  select jsonb_build_object(
    'org', (select jsonb_build_object('id', o.id, 'name', o.name, 'code', o.code, 'kind', o.kind)
            from public.organisations o where o.id = p_org),
    'min_group', k,
    'generated_at', now(),
    'members', jsonb_build_object(
      'learners', (select count(*) from learners),
      'staff', (select count(*) from public.org_members m where m.org_id = p_org and m.role in ('coach', 'admin'))
    ),
    'funnel', jsonb_build_object(
      'joined', (select count(*) from learners),
      'consented', (select count(*) from per),
      'baseline', (select count(*) from per where has_pre),
      'started', (select count(*) from per where sessions > 0),
      'halfway', (select count(*) from per where total_sessions > 0 and sessions * 2 >= total_sessions),
      'completed', (select count(*) from per where total_sessions > 0 and sessions >= total_sessions),
      'remeasured', (select count(*) from per where has_post),
      'certified', (select count(*) from per where certified)
    ),
    'engagement', jsonb_build_object(
      'active_7d', (select count(*) from per where last_active >= now() - interval '7 days'),
      'active_30d', (select count(*) from per where last_active >= now() - interval '30 days'),
      'sessions_completed', (select coalesce(sum(sessions), 0) from per),
      'avg_session_share', (select avg(least(1, sessions::numeric / nullif(total_sessions, 0))) from per),
      'median_streak', (select percentile_cont(0.5) within group (order by streak) from per where streak is not null),
      'minutes_30d', (select coalesce(sum(e.minutes), 0) from public.learning_events e join per on per.user_id = e.user_id
                       where e.created_at >= now() - interval '30 days'),
      'weekly_active', (select coalesce(jsonb_agg(jsonb_build_object('week', week_start, 'active', active) order by week_start), '[]'::jsonb) from weeks)
    ),
    'overall', (
      select case when count(*) >= k then jsonb_build_object(
        'n', count(*), 'pre_mean', avg(pre_v), 'pre_sd', stddev_samp(pre_v),
        'post_mean', avg(post_v), 'post_sd', stddev_samp(post_v),
        'diff_mean', avg(post_v - pre_v), 'diff_sd', stddev_samp(post_v - pre_v))
      else jsonb_build_object('n', count(*), 'suppressed', true) end
      from pairs
    ),
    'faces', (
      select coalesce(jsonb_agg(
        case when n >= k then jsonb_build_object(
          'face', face, 'n', n, 'pre_mean', pre_mean, 'pre_sd', pre_sd,
          'post_mean', post_mean, 'post_sd', post_sd, 'diff_mean', diff_mean, 'diff_sd', diff_sd)
        else jsonb_build_object('face', face, 'n', n, 'suppressed', true) end
        order by face), '[]'::jsonb)
      from face_stats
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.org_results(uuid, jsonb) from public, anon;
grant execute on function public.org_results(uuid, jsonb) to authenticated, service_role;
