-- Rollback for 20261007120000_assessment_integrity.sql
drop trigger if exists lms_item_responses_no_update on public.lms_item_responses;
drop function if exists public.lms_item_responses_block_update();
drop table if exists public.lms_item_responses;
alter table public.lms_attempts drop column if exists meta;
alter table public.lms_attempts drop column if exists flags;
