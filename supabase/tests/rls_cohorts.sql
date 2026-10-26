-- RLS checks for live cohorts. Run on a NON-production database. Rolls back.
begin;

insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin-cohort@test.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000b1', 'learner-cohort@test.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000c1', 'outsider-cohort@test.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000d1', 'coach-cohort@test.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e1', 'other-coach@test.invalid', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.organisations (id, code, name, kind, owner_user_id)
values ('00000000-0000-0000-0000-00000000f0c1', 'RLSCOHORT', 'RLS Cohort Org', 'school', '00000000-0000-0000-0000-0000000000a1')
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role) values
  ('00000000-0000-0000-0000-00000000f0c1', '00000000-0000-0000-0000-0000000000a1', 'admin'),
  ('00000000-0000-0000-0000-00000000f0c1', '00000000-0000-0000-0000-0000000000b1', 'learner'),
  ('00000000-0000-0000-0000-00000000f0c1', '00000000-0000-0000-0000-0000000000d1', 'coach'),
  ('00000000-0000-0000-0000-00000000f0c1', '00000000-0000-0000-0000-0000000000e1', 'coach')
on conflict do nothing;

insert into public.cohorts (id, org_id, name, start_on, timezone, created_by)
values (
  '00000000-0000-0000-0000-00000000c0c1',
  '00000000-0000-0000-0000-00000000f0c1',
  'Closed cohort',
  '2026-11-04',
  'Africa/Johannesburg',
  '00000000-0000-0000-0000-0000000000d1'
) on conflict (id) do nothing;

insert into public.cohort_members (cohort_id, user_id, role, display_name) values
  ('00000000-0000-0000-0000-00000000c0c1', '00000000-0000-0000-0000-0000000000d1', 'facilitator', 'Coach'),
  ('00000000-0000-0000-0000-00000000c0c1', '00000000-0000-0000-0000-0000000000b1', 'learner', 'Learner')
on conflict do nothing;

insert into public.cohort_sessions (id, cohort_id, title, starts_at, join_url, created_by)
values
  (
    '00000000-0000-0000-0000-0000000050c1',
    '00000000-0000-0000-0000-00000000c0c1',
    'Live lab',
    '2026-11-04 07:00:00+00',
    'https://meet.example.com/room',
    '00000000-0000-0000-0000-0000000000d1'
  ),
  (
    '00000000-0000-0000-0000-0000000051c1',
    '00000000-0000-0000-0000-00000000c0c1',
    'Extra',
    '2026-11-11 07:00:00+00',
    null,
    '00000000-0000-0000-0000-0000000000d1'
  )
on conflict (id) do nothing;

insert into public.cohort_threads (id, cohort_id, title, created_by)
values (
  '00000000-0000-0000-0000-0000000070c1',
  '00000000-0000-0000-0000-00000000c0c1',
  'Welcome',
  '00000000-0000-0000-0000-0000000000b1'
) on conflict (id) do nothing;

insert into public.cohort_posts (id, thread_id, author_id, body)
values (
  '00000000-0000-0000-0000-00000000a0c1',
  '00000000-0000-0000-0000-0000000070c1',
  '00000000-0000-0000-0000-0000000000b1',
  'Hello cohort'
) on conflict (id) do nothing;

create temp table results (test text, pass boolean) on commit drop;

create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid, true);
end $$;

-- Outsider sees nothing
select pg_temp.as_user('00000000-0000-0000-0000-0000000000c1');
set local role authenticated;
insert into results select 'outsider cannot see cohort', count(*) = 0 from public.cohorts;
insert into results select 'outsider cannot see members', count(*) = 0 from public.cohort_members;
insert into results select 'outsider cannot see sessions', count(*) = 0 from public.cohort_sessions;
insert into results select 'outsider cannot see posts', count(*) = 0 from public.cohort_posts;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000e1');
set local role authenticated;
insert into results select 'other coach cannot see the cohort', count(*) = 0 from public.cohorts;
reset role;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000d1');
set local role authenticated;
insert into results select 'facilitator sees cohort', count(*) = 1 from public.cohorts;
reset role;

-- Learner sees the cohort and their own attendance only, not a peer mark
insert into public.cohort_attendance (session_id, user_id, status, marked_by)
values
  ('00000000-0000-0000-0000-0000000050c1', '00000000-0000-0000-0000-0000000000b1', 'present', '00000000-0000-0000-0000-0000000000d1'),
  ('00000000-0000-0000-0000-0000000050c1', '00000000-0000-0000-0000-0000000000d1', 'present', '00000000-0000-0000-0000-0000000000d1')
on conflict do nothing;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1');
set local role authenticated;
insert into results select 'learner sees cohort', count(*) = 1 from public.cohorts;
insert into results select 'learner sees join link row', count(*) = 1 from public.cohort_sessions;
insert into results select 'learner sees only own attendance', count(*) = 1 from public.cohort_attendance;
insert into results select 'learner sees discussion', count(*) = 1 from public.cohort_posts;

do $$ begin
  begin
    insert into public.cohort_attendance (session_id, user_id, status, marked_by)
    values ('00000000-0000-0000-0000-0000000051c1', '00000000-0000-0000-0000-0000000000b1', 'absent', '00000000-0000-0000-0000-0000000000b1');
    insert into results values ('learner cannot mark attendance', false);
  exception when others then
    insert into results values ('learner cannot mark attendance', true);
  end;
end $$;
reset role;

-- Org admin sees the cohort without being a member
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1');
set local role authenticated;
insert into results select 'org admin sees cohort', count(*) = 1 from public.cohorts;
insert into results select 'org admin sees both attendance rows', count(*) = 2 from public.cohort_attendance;
reset role;

-- Anonymous sees nothing
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  begin
    perform 1 from public.cohorts;
    insert into results values ('anonymous cannot read cohorts', false);
  exception when others then
    insert into results values ('anonymous cannot read cohorts', true);
  end;
end $$;
reset role;

select test, pass from results order by test;
rollback;
