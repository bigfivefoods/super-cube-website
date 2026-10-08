-- Rollback for 20261008120000_learn_access_gates.sql
drop trigger if exists learner_state_guard on public.learner_state;
drop function if exists public.learner_state_guard();

alter table public.guardian_consents drop column if exists recorded_by;
alter table public.lms_lesson_completions drop column if exists counts_for_gate;
drop table if exists public.lms_lesson_opens;
