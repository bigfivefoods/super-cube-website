-- Rollback for 20261007100000_lms_admin_console.sql.
-- Run only if Stage 1 must be undone. Seat limits already granted stay on
-- organisations.seat_limit (remove them by hand first if needed).
drop function if exists public.admin_revoke_seat_grant(uuid, text, text);
drop function if exists public.admin_grant_seats(uuid, integer, text, text, text, text);
alter table public.certificates drop column if exists revoked_reason;
alter table public.certificates drop column if exists revoked_at;
drop table if exists public.org_seat_grants;
drop trigger if exists admin_audit_log_no_update on public.admin_audit_log;
drop function if exists public.admin_audit_log_append_only();
drop table if exists public.admin_audit_log;
