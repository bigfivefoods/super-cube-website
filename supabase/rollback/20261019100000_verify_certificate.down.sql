-- Rollback for 20261019100000_verify_certificate.sql
-- /verify falls back to "Registry unavailable" on servers without the service role key.
drop function if exists public.verify_certificate(text);
