-- Rollback for 20261007140000_report_share_links.sql
-- Existing share links stop working (viewers see "link not found").
drop function if exists public.report_share_link_viewed(uuid);
drop table if exists public.report_share_links;
