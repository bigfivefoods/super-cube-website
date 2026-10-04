-- RLS regression tests for migration 007 (run as a superuser on a NON-production DB).
-- Variant for hosted Supabase SQL runners (e.g. MCP execute_sql): uses SET ROLE (no explicit transaction) and deletes its fixtures at the end.
-- Fixtures (as superuser)
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@test.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000b1', 'learner@test.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000c1', 'outsider@test.invalid', 'authenticated', 'authenticated');
insert into public.organisations (id, code, name, kind, owner_user_id)
  values ('00000000-0000-0000-0000-00000000f001', 'RLSTEST1', 'RLS School', 'school', '00000000-0000-0000-0000-0000000000a1');
insert into public.org_members (org_id, user_id, role) values
  ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-0000000000a1', 'admin'),
  ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-0000000000b1', 'learner');
insert into public.org_progress_snapshots (org_id, user_id, pre_overall, post_overall)
  values ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-0000000000b1', 50, 60);
insert into public.certificates (id, user_id, learner_name) values ('SC-20261004-AAAAAAAAAA', '00000000-0000-0000-0000-0000000000b1', 'Learner');

drop table if exists pg_temp.results;
create temp table results (test text, pass boolean);
grant all on results to anon, authenticated;

create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, false);
  perform set_config('request.jwt.claim.sub', uid, false);
end $$;

-- 1. Outsider (non-member) cannot read the cohort's members, progress or the org itself
select pg_temp.as_user('00000000-0000-0000-0000-0000000000c1');
set role authenticated;
insert into results select 'non-member cannot read org_progress_snapshots', count(*) = 0 from public.org_progress_snapshots;
insert into results select 'non-member cannot read org_members', count(*) = 0 from public.org_members;
insert into results select 'non-member cannot list organisations/codes', count(*) = 0 from public.organisations;

-- 2. Outsider cannot self-insert as coach
do $$ begin
  begin
    insert into public.org_members (org_id, user_id, role) values ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-0000000000c1', 'coach');
    insert into results values ('outsider cannot self-join as coach', false);
  exception when others then
    insert into results values ('outsider cannot self-join as coach', true);
  end;
end $$;

-- 3. Authenticated user cannot create/overwrite a certificate
do $$ begin
  begin
    insert into public.certificates (id, user_id, learner_name, growth) values ('SC-20261004-BBBBBBBBBB', '00000000-0000-0000-0000-0000000000c1', 'Forged', 99);
    insert into results values ('authenticated cannot insert certificate', false);
  exception when others then
    insert into results values ('authenticated cannot insert certificate', true);
  end;
end $$;

-- 4. Authenticated user cannot self-activate a subscription
do $$ begin
  begin
    insert into public.subscriptions (user_id, plan_id, programme_id, status) values ('00000000-0000-0000-0000-0000000000c1', 'adults_once', 'adults', 'active');
    insert into results values ('authenticated cannot self-activate subscription', false);
  exception when others then
    insert into results values ('authenticated cannot self-activate subscription', true);
  end;
end $$;

-- 5. Authenticated user cannot write their own attempt (server-only scoring)
do $$ begin
  begin
    insert into public.lms_attempts (user_id, programme_id, instrument_id, phase, responses, construct_scores, overall)
      values ('00000000-0000-0000-0000-0000000000c1', 'adults', 'x', 'pre', '{}', '[]', 100);
    insert into results values ('authenticated cannot write own assessment attempt', false);
  exception when others then
    insert into results values ('authenticated cannot write own assessment attempt', true);
  end;
end $$;
reset role;

-- 6. Anonymous cannot read or write certificates
set role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', false);
do $$ begin
  begin
    insert into public.certificates (id, learner_name, growth) values ('SC-20261004-CCCCCCCCCC', 'Anon forged', 50);
    insert into results values ('anonymous cannot insert certificate', false);
  exception when others then
    insert into results values ('anonymous cannot insert certificate', true);
  end;
  begin
    update public.certificates set growth = 99 where id = 'SC-20261004-AAAAAAAAAA';
    insert into results values ('anonymous cannot update certificate', not found);
  exception when others then
    insert into results values ('anonymous cannot update certificate', true);
  end;
  begin
    perform 1 from public.certificates;
    insert into results values ('anonymous cannot select certificates table directly', false);
  exception when others then
    insert into results values ('anonymous cannot select certificates table directly', true);
  end;
end $$;
reset role;

-- 7. Learner sees own snapshot; admin/coach of the org sees the cohort
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1');
set role authenticated;
insert into results select 'learner reads own snapshot only', count(*) = 1 from public.org_progress_snapshots;
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1');
set role authenticated;
insert into results select 'org admin reads cohort snapshots', count(*) = 1 from public.org_progress_snapshots;
insert into results select 'org admin reads cohort members', count(*) = 2 from public.org_members;
reset role;

-- 8. Attempts are immutable and baseline is unique (even for the service role)
insert into public.lms_attempts (user_id, programme_id, instrument_id, phase, responses, construct_scores, overall)
  values ('00000000-0000-0000-0000-0000000000b1', 'adults', 'super_cube_adults_v1', 'pre', '{}', '[]', 50);
do $$ begin
  begin
    insert into public.lms_attempts (user_id, programme_id, instrument_id, phase, responses, construct_scores, overall)
      values ('00000000-0000-0000-0000-0000000000b1', 'adults', 'super_cube_adults_v1', 'pre', '{}', '[]', 90);
    insert into results values ('second baseline rejected', false);
  exception when unique_violation then
    insert into results values ('second baseline rejected', true);
  end;
  begin
    update public.lms_attempts set overall = 99 where user_id = '00000000-0000-0000-0000-0000000000b1';
    insert into results values ('attempt rows immutable', false);
  exception when others then
    insert into results values ('attempt rows immutable', true);
  end;
end $$;

-- cleanup (fixtures only, fixed test ids)
delete from public.lms_attempts where user_id in ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000c1');
delete from public.certificates where id like 'SC-20261004-%';
delete from public.organisations where id = '00000000-0000-0000-0000-00000000f001';
delete from auth.users where id in ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000c1');
select set_config('request.jwt.claims', '', false);
select count(*) filter (where pass) as passed, count(*) as total, string_agg(case when pass then 'PASS ' else 'FAIL ' end || test, ' | ' order by test) as detail from results;
