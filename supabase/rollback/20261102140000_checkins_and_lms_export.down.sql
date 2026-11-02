-- Rollback for 20261102140000_checkins_and_lms_export.sql

drop function if exists public.org_checkin_comparison(uuid);
drop table if exists public.checkin_responses;
drop table if exists public.checkin_invites;
