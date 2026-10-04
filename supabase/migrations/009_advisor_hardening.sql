-- 009: Supabase security-advisor hardening (applied to production 2026-10-04). Idempotent.
-- Trigger-only functions: no API caller needs EXECUTE (the privilege is checked at
-- CREATE TRIGGER time, not when the trigger fires), so remove it from the API roles.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
alter function public.touch_learner_state_updated() set search_path = public;
alter function public.lms_attempts_block_update() set search_path = public;
-- Team helpers (008): signed-in users only; RLS policies need authenticated EXECUTE.
revoke all on function public.is_team_member(uuid), public.is_team_manager(uuid) from public, anon;
grant execute on function public.is_team_member(uuid), public.is_team_manager(uuid) to authenticated, service_role;
