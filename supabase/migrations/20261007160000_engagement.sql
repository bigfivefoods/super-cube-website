-- LMS Phase 1 · stage 5: engagement on the server.
-- Additive only. Uses the roadmap tables from 008 (learning_events, practice_streaks,
-- badges, learner_badges) and adds push_subscriptions. Rollback: supabase/rollback/.
--   - lms_record_activity(): one transaction appends the event and moves the streak,
--     spending a streak freeze to cover a missed day. Service role only.
--   - Badge catalogue rows (awarded by the server; learners can only read their own).
--   - push_subscriptions: Web Push endpoints, never readable by clients.

create or replace function public.lms_record_activity(
  p_user uuid,
  p_kind text,
  p_ref text,
  p_programme text,
  p_minutes numeric,
  p_local_day date,
  p_meta jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  s public.practice_streaks%rowtype;
  v_gap integer;
  v_used integer := 0;
  v_earned boolean := false;
  v_counted boolean := false;
begin
  if p_kind not in ('session_complete', 'practice_complete', 'pulse', 'assessment') then
    raise exception 'unsupported activity kind %', p_kind using errcode = '22023';
  end if;
  if p_local_day is null then
    raise exception 'local day is required' using errcode = '22023';
  end if;

  insert into public.practice_streaks (user_id) values (p_user) on conflict (user_id) do nothing;
  select * into s from public.practice_streaks where user_id = p_user for update;

  if s.last_day is null then
    s.current_days := 1;
    v_counted := true;
  elsif p_local_day > s.last_day then
    v_counted := true;
    v_gap := p_local_day - s.last_day;
    if v_gap = 1 then
      s.current_days := s.current_days + 1;
    elsif v_gap - 1 <= s.freezes_available then
      -- Freezes cover the missed day(s); the streak carries on
      v_used := v_gap - 1;
      s.freezes_available := s.freezes_available - v_used;
      s.current_days := s.current_days + 1;
    else
      s.current_days := 1;
    end if;
  end if;
  -- An event for today (or a late one for an earlier day) leaves the streak as it is

  if v_counted then
    s.last_day := p_local_day;
    -- Earn a freeze every 7 days in a row, holding at most 2
    if s.current_days % 7 = 0 and s.freezes_available < 2 then
      s.freezes_available := s.freezes_available + 1;
      v_earned := true;
    end if;
    s.best_days := greatest(s.best_days, s.current_days);
    update public.practice_streaks
       set current_days = s.current_days,
           best_days = s.best_days,
           freezes_available = s.freezes_available,
           last_day = s.last_day,
           updated_at = now()
     where user_id = p_user;
  end if;

  insert into public.learning_events (user_id, programme_id, kind, ref, minutes, meta, local_day)
  values (
    p_user, p_programme, p_kind, left(p_ref, 120), p_minutes,
    coalesce(p_meta, '{}'::jsonb) || jsonb_build_object('freezes_used', v_used, 'freeze_earned', v_earned),
    p_local_day
  );

  return jsonb_build_object(
    'current', s.current_days,
    'best', s.best_days,
    'freezes', s.freezes_available,
    'lastDay', s.last_day,
    'freezesUsed', v_used,
    'freezeEarned', v_earned,
    'counted', v_counted
  );
end;
$$;

revoke all on function public.lms_record_activity(uuid, text, text, text, numeric, date, jsonb) from public, anon, authenticated;
grant execute on function public.lms_record_activity(uuid, text, text, text, numeric, date, jsonb) to service_role;

insert into public.badges (id, name, criteria) values
  ('first-session', 'First session', 'Completed a first Super-Cube session.'),
  ('baseline-set', 'Baseline set', 'Measured a starting profile across all six faces.'),
  ('streak-3', '3-day streak', 'Practised, checked in or learned on 3 days in a row.'),
  ('streak-7', '7-day streak', 'Practised, checked in or learned on 7 days in a row.'),
  ('streak-30', '30-day streak', 'Practised, checked in or learned on 30 days in a row.'),
  ('face-complete', 'Face complete', 'Finished every session of one Super-Cube face.'),
  ('pathway-complete', 'Pathway complete', 'Took the after-programme re-measure to see growth.')
on conflict (id) do nothing;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique check (endpoint ~ '^https://' and length(endpoint) <= 1000),
  p256dh text not null check (length(p256dh) <= 200),
  auth text not null check (length(auth) <= 100),
  user_agent text check (length(user_agent) <= 300),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id) where revoked_at is null;
alter table public.push_subscriptions enable row level security;
-- No policies: clients never read or write endpoints; the server uses the service role.
revoke all on public.push_subscriptions from anon, authenticated;
