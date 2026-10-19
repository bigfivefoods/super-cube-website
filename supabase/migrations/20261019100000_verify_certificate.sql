-- Public certificate check: look up ONE certificate by its exact ID.
-- Returns only what is printed on the certificate (holder name, programme,
-- issue date) plus revocation status. Never scores, user id, cohort or meta.
-- The table itself stays closed to anon (007): this function is the only door.
-- Rollback: supabase/rollback/20261019100000_verify_certificate.down.sql

create or replace function public.verify_certificate(p_id text)
returns table (
  id text,
  learner_name text,
  programme_id text,
  issued_at timestamptz,
  revoked boolean,
  revoked_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select c.id, c.learner_name, c.programme_id, c.issued_at, c.revoked, c.revoked_at
  from public.certificates c
  where p_id ~ '^SC-[0-9]{8}-[0-9A-F]{6,12}$'
    and c.id = p_id
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated, service_role;
