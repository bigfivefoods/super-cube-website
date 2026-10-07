-- LMS Phase 1 · Stage 1: admin console (cohorts, manual seat grants, audit log).
-- Additive only: two new tables, two new columns, two service-role-only functions.
-- Rollback: supabase/rollback/20261007100000_lms_admin_console.down.sql
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- Admin audit log: every admin write (who, what, when). Server-only.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor text not null,                       -- admin email (or 'api-secret')
  action text not null,                      -- e.g. 'cohort.create', 'seats.grant'
  target_type text not null,                 -- 'organisation' | 'certificate' | 'invite' | 'seat_grant' | 'member'
  target_id text,
  detail jsonb not null default '{}'::jsonb, -- never journals, answers or scores
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log (target_type, target_id);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;

-- Append-only: the log can't be edited or deleted through the API.
create or replace function public.admin_audit_log_append_only()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'admin_audit_log is append-only';
end;
$$;
revoke execute on function public.admin_audit_log_append_only() from public, anon, authenticated;
drop trigger if exists admin_audit_log_no_update on public.admin_audit_log;
create trigger admin_audit_log_no_update
  before update or delete on public.admin_audit_log
  for each row execute procedure public.admin_audit_log_append_only();

-- ---------------------------------------------------------------------------
-- Manual / invoiced seat grants (pilots without Paystack)
-- organisations.seat_limit stays the number the entitlement check reads;
-- grants add to it and revoking a grant takes its seats back off.
-- ---------------------------------------------------------------------------
create table if not exists public.org_seat_grants (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  seats integer not null check (seats between 1 and 10000),
  kind text not null check (kind in ('comped', 'invoiced', 'eft', 'paystack', 'other')),
  reference text,                            -- invoice / PO / EFT reference
  note text,
  granted_by text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by text,
  revoked_reason text
);
create index if not exists org_seat_grants_org_idx on public.org_seat_grants (org_id, created_at desc);
alter table public.org_seat_grants enable row level security;
revoke all on public.org_seat_grants from anon, authenticated;

-- Certificate revocation details (revoked flag already exists from 007)
alter table public.certificates add column if not exists revoked_at timestamptz;
alter table public.certificates add column if not exists revoked_reason text;

-- ---------------------------------------------------------------------------
-- Atomic grant / revoke (seat_limit + grant row + audit row in one transaction)
-- Service role only: never callable by anon or signed-in users.
-- ---------------------------------------------------------------------------
create or replace function public.admin_grant_seats(
  p_org uuid, p_seats integer, p_kind text, p_reference text, p_note text, p_actor text
) returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  v_id uuid;
  v_limit integer;
begin
  if p_seats is null or p_seats < 1 or p_seats > 10000 then
    raise exception 'seats must be between 1 and 10000';
  end if;
  insert into public.org_seat_grants (org_id, seats, kind, reference, note, granted_by)
  values (p_org, p_seats, p_kind, nullif(trim(p_reference), ''), nullif(trim(p_note), ''), p_actor)
  returning id into v_id;
  update public.organisations
     set seat_limit = coalesce(seat_limit, 0) + p_seats, updated_at = now()
   where id = p_org
  returning seat_limit into v_limit;
  if v_limit is null then
    raise exception 'organisation not found';
  end if;
  insert into public.admin_audit_log (actor, action, target_type, target_id, detail)
  values (p_actor, 'seats.grant', 'organisation', p_org::text,
          jsonb_build_object('grant_id', v_id, 'seats', p_seats, 'kind', p_kind,
                             'reference', nullif(trim(p_reference), ''), 'seat_limit_after', v_limit));
  return v_id;
end;
$$;

create or replace function public.admin_revoke_seat_grant(
  p_grant uuid, p_actor text, p_reason text
) returns integer
language plpgsql security invoker set search_path = public as $$
declare
  g public.org_seat_grants;
  v_limit integer;
begin
  select * into g from public.org_seat_grants where id = p_grant for update;
  if g.id is null then raise exception 'grant not found'; end if;
  if g.revoked_at is not null then raise exception 'grant already revoked'; end if;
  update public.org_seat_grants
     set revoked_at = now(), revoked_by = p_actor, revoked_reason = nullif(trim(p_reason), '')
   where id = p_grant;
  update public.organisations
     set seat_limit = greatest(0, coalesce(seat_limit, 0) - g.seats), updated_at = now()
   where id = g.org_id
  returning seat_limit into v_limit;
  insert into public.admin_audit_log (actor, action, target_type, target_id, detail)
  values (p_actor, 'seats.revoke', 'organisation', g.org_id::text,
          jsonb_build_object('grant_id', g.id, 'seats', g.seats, 'reason', nullif(trim(p_reason), ''),
                             'seat_limit_after', v_limit));
  return v_limit;
end;
$$;

revoke all on function public.admin_grant_seats(uuid, integer, text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_revoke_seat_grant(uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_grant_seats(uuid, integer, text, text, text, text) to service_role;
grant execute on function public.admin_revoke_seat_grant(uuid, text, text) to service_role;
