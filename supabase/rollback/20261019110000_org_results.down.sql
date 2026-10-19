-- Rollback for 20261019110000_org_results.sql
-- /learn/org/results then shows "Results are not switched on yet".
drop function if exists public.org_results(uuid, jsonb);
