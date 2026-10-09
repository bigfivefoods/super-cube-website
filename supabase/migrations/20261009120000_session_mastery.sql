-- Session mastery: each knowledge-check attempt the server graded when a
-- learner marked a session complete. The completion route reads these to
-- allow "complete after one retry with explanations".
-- Additive only. Rollback: supabase/rollback/20261009120000_session_mastery.down.sql
-- Until this is applied the route falls back to grading the submitted answers
-- (pass, or a retry the client says it made), so nothing breaks before it lands.

create table if not exists public.lms_session_checks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  programme_id text not null,
  correct smallint not null check (correct >= 0),
  total smallint not null check (total >= 0 and correct <= total),
  needed smallint not null check (needed >= 0),
  passed boolean not null,
  retry boolean not null default false,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists lms_session_checks_user_lesson_idx
  on public.lms_session_checks (user_id, lesson_id, created_at desc);

alter table public.lms_session_checks enable row level security;

drop policy if exists "lms_session_checks_select_own" on public.lms_session_checks;
create policy "lms_session_checks_select_own"
  on public.lms_session_checks for select
  to authenticated
  using (user_id = auth.uid());

-- Only the server (service role) writes attempts.
revoke all on public.lms_session_checks from anon;
revoke insert, update, delete on public.lms_session_checks from authenticated;
