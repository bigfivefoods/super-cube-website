-- Reverses 20261007180000_security_hardening.sql. Run by hand only if needed.
-- (Drops only objects that migration created; counters are disposable.)
drop function if exists public.lms_rate_hit(text, text, integer, integer);
drop table if exists public.rate_limit_hits;

grant execute on function public.touch_learner_state_updated() to anon, authenticated;
grant execute on function public.lms_attempts_block_update() to anon, authenticated;

alter function private.is_org_admin(uuid) set schema public;
alter function private.is_org_member(uuid) set schema public;
alter function private.is_org_staff(uuid) set schema public;
alter function private.is_team_manager(uuid) set schema public;
alter function private.is_team_member(uuid) set schema public;
alter function public.is_org_admin(uuid) set search_path = public;
alter function public.is_org_member(uuid) set search_path = public;
alter function public.is_org_staff(uuid) set search_path = public;
alter function public.is_team_manager(uuid) set search_path = public;
alter function public.is_team_member(uuid) set search_path = public;
alter function public.handle_new_user() set search_path = public;
-- The (empty) private schema is left in place.
