-- LMS Phase 1 · stage 8: lock down RPC helpers and add a rate-limit counter.
-- Additive and reversible (see supabase/rollback/20261007180000_security_hardening.down.sql).

-- 1. Membership helpers used by RLS policies move out of the API schema.
--    Policies reference functions by OID, so they keep working; PostgREST no
--    longer exposes them at /rest/v1/rpc/* (advisor lint 0029).
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

alter function public.is_org_admin(uuid) set schema private;
alter function public.is_org_member(uuid) set schema private;
alter function public.is_org_staff(uuid) set schema private;
alter function public.is_team_manager(uuid) set schema private;
alter function public.is_team_member(uuid) set schema private;

-- SECURITY DEFINER functions: put pg_temp last so temp tables can't shadow ours.
alter function private.is_org_admin(uuid) set search_path = public, pg_temp;
alter function private.is_org_member(uuid) set search_path = public, pg_temp;
alter function private.is_org_staff(uuid) set search_path = public, pg_temp;
alter function private.is_team_manager(uuid) set search_path = public, pg_temp;
alter function private.is_team_member(uuid) set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;

-- Policies still need to call them as the signed-in user; nobody else.
revoke execute on function private.is_org_admin(uuid) from public, anon;
revoke execute on function private.is_org_member(uuid) from public, anon;
revoke execute on function private.is_org_staff(uuid) from public, anon;
revoke execute on function private.is_team_manager(uuid) from public, anon;
revoke execute on function private.is_team_member(uuid) from public, anon;
grant execute on function private.is_org_admin(uuid) to authenticated, service_role;
grant execute on function private.is_org_member(uuid) to authenticated, service_role;
grant execute on function private.is_org_staff(uuid) to authenticated, service_role;
grant execute on function private.is_team_manager(uuid) to authenticated, service_role;
grant execute on function private.is_team_member(uuid) to authenticated, service_role;

-- Trigger functions are never called directly.
revoke execute on function public.lms_attempts_block_update() from public, anon, authenticated;
revoke execute on function public.touch_learner_state_updated() from public, anon, authenticated;

-- 2. Fixed-window rate-limit counters. Keys are hashed on the server
--    (never a raw IP or email). Service role only.
create table if not exists public.rate_limit_hits (
  bucket text not null check (char_length(bucket) <= 40),
  key_hash text not null check (char_length(key_hash) <= 128),
  window_start timestamptz not null,
  hits integer not null default 1,
  primary key (bucket, key_hash, window_start)
);
alter table public.rate_limit_hits enable row level security;
revoke all on table public.rate_limit_hits from public, anon, authenticated;
grant select, insert, update on table public.rate_limit_hits to service_role;

create or replace function public.lms_rate_hit(
  p_bucket text,
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  w timestamptz;
  n integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit';
  end if;
  w := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limit_hits as r (bucket, key_hash, window_start, hits)
  values (left(p_bucket, 40), left(p_key, 128), w, 1)
  on conflict (bucket, key_hash, window_start)
  do update set hits = r.hits + 1
  returning r.hits into n;
  return jsonb_build_object(
    'allowed', n <= p_limit,
    'hits', n,
    'limit', p_limit,
    'resetAt', w + make_interval(secs => p_window_seconds)
  );
end;
$$;
revoke execute on function public.lms_rate_hit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.lms_rate_hit(text, text, integer, integer) to service_role;
