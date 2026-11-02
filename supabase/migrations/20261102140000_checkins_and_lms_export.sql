-- Manager and peer check-ins for Super-Cube® Learn.
-- A learner invites a manager and peers by email. Each rater scores the same
-- six faces as the self-report (0–100). The learner sees aggregates only.
-- Organisation admins see a further aggregate, and only for learners who
-- currently share progress (org_progress_snapshots.sharing).
--
-- Anonymity (must match src/lib/lms/checkin.ts):
--   * A manager rating is shown to the learner (they invited that role).
--   * Peer ratings are included only once 3 peers have answered, so one
--     colleague cannot be singled out.
--   * "Others" is the mean of the ratings that are allowed to be shown.
--     One manager plus one or two peers does not produce an "others" score,
--     because subtracting the manager would reveal a peer.
--   * org_checkin_comparison suppresses any group under 3 learners and never
--     returns names, emails, user ids or a single rater's scores.
--
-- Row access is service-role only (the API). There is no client policy.
-- This file is committed for review. Do not apply it to production from here;
-- it is applied on a temporary Supabase branch, exercised, then that branch
-- is deleted.
-- Rollback: supabase/rollback/20261102140000_checkins_and_lms_export.down.sql

create table if not exists public.checkin_invites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text not null default 'adults',
  relationship text not null check (relationship in ('manager', 'peer')),
  email text not null,
  locale text not null default 'en',
  token_hash text not null unique,
  sent_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists checkin_invites_user_idx
  on public.checkin_invites (user_id, created_at desc);

comment on table public.checkin_invites is
  'Email invitations to rate a learner on the six Super-Cube® faces. The raw link token is never stored.';
comment on column public.checkin_invites.email is
  'Visible only to the inviting learner via the service-role API. Organisation results never read this column.';

create table if not exists public.checkin_responses (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null unique references public.checkin_invites (id) on delete cascade,
  responses jsonb not null,
  face_scores jsonb not null,
  created_at timestamptz not null default now()
);

comment on table public.checkin_responses is
  'One rater submission. Clients cannot read this table; the API returns aggregates only.';

alter table public.checkin_invites enable row level security;
alter table public.checkin_responses enable row level security;

revoke all on public.checkin_invites, public.checkin_responses from public, anon, authenticated;
grant select, insert, update, delete on public.checkin_invites, public.checkin_responses to service_role;

-- Aggregate self vs others for one organisation. Caller must be an org admin.
create or replace function public.org_checkin_comparison(p_org uuid)
returns jsonb
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

  with consented as (
    select m.user_id
    from public.org_members m
    join public.org_progress_snapshots s
      on s.org_id = m.org_id and s.user_id = m.user_id and s.sharing
    where m.org_id = p_org and m.role = 'learner'
  ),
  self_attempt as (
    select distinct on (a.user_id)
      a.user_id,
      case when jsonb_typeof(a.construct_scores) = 'array' then a.construct_scores else '[]'::jsonb end as construct_scores
    from public.lms_attempts a
    join consented c on c.user_id = a.user_id
    where a.phase in ('pre', 'post')
    order by a.user_id, (a.phase = 'post') desc, a.created_at desc
  ),
  self_faces as (
    select a.user_id,
           f.value ->> 'constructId' as face,
           (f.value ->> 'score')::numeric as score
    from self_attempt a
    cross join lateral jsonb_array_elements(a.construct_scores) f
    where (f.value ->> 'score') ~ '^[0-9]+(\.[0-9]+)?$'
  ),
  responses as (
    select i.user_id, i.id as invite_id, i.relationship,
           f.value ->> 'constructId' as face,
           (f.value ->> 'score')::numeric as score
    from public.checkin_invites i
    join public.checkin_responses r on r.invite_id = i.id
    join consented c on c.user_id = i.user_id
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(r.face_scores) = 'array' then r.face_scores else '[]'::jsonb end
    ) f
    where i.completed_at is not null
      and (f.value ->> 'score') ~ '^[0-9]+(\.[0-9]+)?$'
  ),
  rater_counts as (
    select user_id,
           count(distinct invite_id) filter (where relationship = 'manager')::int as managers,
           count(distinct invite_id) filter (where relationship = 'peer')::int as peers
    from responses
    group by user_id
  ),
  others_faces as (
    select r.user_id, r.face, avg(r.score) as score
    from responses r
    join rater_counts n on n.user_id = r.user_id
    where (r.relationship = 'peer' and n.peers >= 3)
       or (r.relationship = 'manager' and (n.peers = 0 or n.peers >= 3))
    group by r.user_id, r.face
  ),
  paired as (
    select s.user_id, s.face, s.score as self_score, o.score as others_score
    from self_faces s
    join others_faces o on o.user_id = s.user_id and o.face = s.face
  ),
  face_stats as (
    select face,
           count(*)::int as n,
           avg(self_score) as self_mean,
           avg(others_score) as others_mean,
           avg(others_score - self_score) as gap_mean
    from paired
    group by face
  ),
  learner_overall as (
    select user_id, avg(self_score) as self_mean, avg(others_score) as others_mean
    from paired
    group by user_id
  )
  select jsonb_build_object(
    'min_group', k,
    'generated_at', now(),
    'learners_with_both', (select count(*) from learner_overall),
    'overall', (
      select case when count(*) >= k then jsonb_build_object(
        'n', count(*),
        'self_mean', avg(self_mean),
        'others_mean', avg(others_mean),
        'gap_mean', avg(others_mean - self_mean)
      ) else jsonb_build_object('n', count(*), 'suppressed', true) end
      from learner_overall
    ),
    'faces', (
      select coalesce(jsonb_agg(
        case when n >= k then jsonb_build_object(
          'face', face, 'n', n,
          'self_mean', self_mean, 'others_mean', others_mean, 'gap_mean', gap_mean
        ) else jsonb_build_object('face', face, 'n', n, 'suppressed', true) end
        order by face
      ), '[]'::jsonb)
      from face_stats
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.org_checkin_comparison(uuid) from public, anon;
grant execute on function public.org_checkin_comparison(uuid) to authenticated, service_role;
