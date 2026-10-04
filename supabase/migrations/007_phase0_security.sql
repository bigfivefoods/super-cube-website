-- Super-Cube® LMS Phase 0 — "safe and honest"
-- Run AFTER 001–006. Safe to re-run.
--
-- What this does
--  1. Closes RLS gaps from 003: no self-promotion to coach/admin, no listing every
--     organisation, no anonymous/self-made certificates, no self-activated subscriptions,
--     no public listing of growth shares.
--  2. Adds coach/admin invites issued by an org admin (token stored as a hash).
--  3. Adds server-written, immutable assessment attempts (baseline can never be
--     overwritten) and server-recorded session completions.
--  4. Adds guardian consent records (POPIA s35) and a PII-free deletion log.
--
-- All writes to these tables happen in server routes with the service role.
-- Learners/coaches only ever READ through RLS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER avoids RLS recursion on org_members)
-- ---------------------------------------------------------------------------
create or replace function public.is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_staff(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid()
      and m.role in ('coach', 'admin')
  );
$$;

create or replace function public.is_org_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid() and m.role = 'admin'
  ) or exists (
    select 1 from public.organisations o
    where o.id = p_org and o.owner_user_id = auth.uid()
  );
$$;

revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.is_org_staff(uuid) from public, anon;
revoke all on function public.is_org_admin(uuid) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated, service_role;
grant execute on function public.is_org_staff(uuid) to authenticated, service_role;
grant execute on function public.is_org_admin(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Organisations: only members/owner can see their org (codes are no longer listable)
-- ---------------------------------------------------------------------------
drop policy if exists "orgs_select_active" on public.organisations;
drop policy if exists "orgs_select_member" on public.organisations;
create policy "orgs_select_member"
  on public.organisations for select
  to authenticated
  using (owner_user_id = auth.uid() or public.is_org_member(id));
revoke insert, update, delete on public.organisations from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Members: joins only via server routes (cohort code for learners, invite for staff)
-- ---------------------------------------------------------------------------
drop policy if exists "org_members_select" on public.org_members;
drop policy if exists "org_members_insert_self" on public.org_members;
drop policy if exists "org_members_delete_self" on public.org_members;

create policy "org_members_select"
  on public.org_members for select
  to authenticated
  using (user_id = auth.uid() or public.is_org_staff(org_id));

-- Anyone may leave a cohort themselves
create policy "org_members_delete_self"
  on public.org_members for delete
  to authenticated
  using (user_id = auth.uid());

revoke insert, update on public.org_members from anon, authenticated;
revoke all on public.org_members from anon;

-- ---------------------------------------------------------------------------
-- Staff invites (coach / admin). Token shown once; only its SHA-256 is stored.
-- ---------------------------------------------------------------------------
create table if not exists public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  role text not null check (role in ('coach', 'admin')),
  token_hash text not null unique,
  email text,
  created_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null,
  max_uses int not null default 1 check (max_uses between 1 and 50),
  used_count int not null default 0,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists org_invites_org_idx on public.org_invites (org_id);

alter table public.org_invites enable row level security;
drop policy if exists "org_invites_select_admin" on public.org_invites;
create policy "org_invites_select_admin"
  on public.org_invites for select
  to authenticated
  using (public.is_org_admin(org_id));
revoke all on public.org_invites from anon;
revoke insert, update, delete on public.org_invites from authenticated;

-- ---------------------------------------------------------------------------
-- Progress snapshots: staff of the org read; server writes (scores from server)
-- ---------------------------------------------------------------------------
drop policy if exists "org_progress_select" on public.org_progress_snapshots;
drop policy if exists "org_progress_upsert_own" on public.org_progress_snapshots;
drop policy if exists "org_progress_update_own" on public.org_progress_snapshots;

create policy "org_progress_select"
  on public.org_progress_snapshots for select
  to authenticated
  using (user_id = auth.uid() or public.is_org_staff(org_id));
revoke all on public.org_progress_snapshots from anon;
revoke insert, update, delete on public.org_progress_snapshots from authenticated;

-- ---------------------------------------------------------------------------
-- Certificates: issued only by the server; public lookup goes through the API
-- ---------------------------------------------------------------------------
drop policy if exists "certificates_select_public" on public.certificates;
drop policy if exists "certificates_insert_own" on public.certificates;
drop policy if exists "certificates_select_own" on public.certificates;

alter table public.certificates add column if not exists revoked boolean not null default false;
alter table public.certificates add column if not exists pre_attempt_id uuid;
alter table public.certificates add column if not exists post_attempt_id uuid;

create policy "certificates_select_own"
  on public.certificates for select
  to authenticated
  using (user_id = auth.uid());
revoke all on public.certificates from anon;
revoke insert, update, delete on public.certificates from authenticated;

-- ---------------------------------------------------------------------------
-- Growth shares: no public listing; read by exact token through the server
-- ---------------------------------------------------------------------------
drop policy if exists "growth_shares_select_public" on public.growth_shares;
drop policy if exists "growth_shares_insert_own" on public.growth_shares;
drop policy if exists "growth_shares_select_own" on public.growth_shares;
create policy "growth_shares_select_own"
  on public.growth_shares for select
  to authenticated
  using (user_id = auth.uid());
revoke all on public.growth_shares from anon;
revoke insert, update, delete on public.growth_shares from authenticated;

-- ---------------------------------------------------------------------------
-- Subscriptions: only Paystack-verified server code may write
-- ---------------------------------------------------------------------------
drop policy if exists "subs_insert_own" on public.subscriptions;
drop policy if exists "subs_update_own" on public.subscriptions;
revoke all on public.subscriptions from anon;
revoke insert, update, delete on public.subscriptions from authenticated;

alter table public.subscriptions add column if not exists amount_cents integer;
alter table public.subscriptions add column if not exists currency text;
create unique index if not exists subscriptions_reference_uidx
  on public.subscriptions (paystack_subscription_code)
  where paystack_subscription_code is not null;

-- ---------------------------------------------------------------------------
-- Immutable, server-scored assessment attempts
-- ---------------------------------------------------------------------------
create table if not exists public.lms_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text not null check (programme_id in ('kids', 'adolescents', 'adults')),
  instrument_id text not null,
  phase text not null check (phase in ('pre', 'mid', 'post')),
  responses jsonb not null,
  construct_scores jsonb not null,
  overall numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists lms_attempts_user_idx on public.lms_attempts (user_id, created_at);
-- One baseline and one post per learner per programme: a retake can never overwrite
create unique index if not exists lms_attempts_one_pre
  on public.lms_attempts (user_id, programme_id) where phase = 'pre';
create unique index if not exists lms_attempts_one_post
  on public.lms_attempts (user_id, programme_id) where phase = 'post';

create or replace function public.lms_attempts_block_update()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'lms_attempts rows are immutable';
end;
$$;
drop trigger if exists lms_attempts_no_update on public.lms_attempts;
create trigger lms_attempts_no_update
  before update on public.lms_attempts
  for each row execute procedure public.lms_attempts_block_update();

alter table public.lms_attempts enable row level security;
drop policy if exists "lms_attempts_select_own" on public.lms_attempts;
create policy "lms_attempts_select_own"
  on public.lms_attempts for select
  to authenticated
  using (user_id = auth.uid());
revoke all on public.lms_attempts from anon;
revoke insert, update, delete on public.lms_attempts from authenticated;

-- ---------------------------------------------------------------------------
-- Server-recorded session completions (used for the post-assessment gate)
-- ---------------------------------------------------------------------------
create table if not exists public.lms_lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  programme_id text not null,
  construct_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lms_lesson_completions enable row level security;
drop policy if exists "lms_completions_select_own" on public.lms_lesson_completions;
create policy "lms_completions_select_own"
  on public.lms_lesson_completions for select
  to authenticated
  using (user_id = auth.uid());
revoke all on public.lms_lesson_completions from anon;
revoke insert, update, delete on public.lms_lesson_completions from authenticated;

-- ---------------------------------------------------------------------------
-- Guardian consent for learners under 18 (POPIA s35)
-- ---------------------------------------------------------------------------
create table if not exists public.guardian_consents (
  id uuid primary key default gen_random_uuid(),
  learner_user_id uuid references auth.users (id) on delete cascade,
  learner_display_name text,
  learner_age_band text not null,
  guardian_name text not null,
  guardian_email text,
  relationship text not null,
  scope text[] not null default array['assessment', 'learning', 'progress_reports'],
  method text not null default 'on_device_attestation'
    check (method in ('on_device_attestation', 'email_verified', 'school_contract')),
  status text not null default 'granted'
    check (status in ('pending', 'granted', 'withdrawn')),
  consent_text_version text not null,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.guardian_consents enable row level security;
drop policy if exists "guardian_consents_select_own" on public.guardian_consents;
create policy "guardian_consents_select_own"
  on public.guardian_consents for select
  to authenticated
  using (learner_user_id = auth.uid());
revoke all on public.guardian_consents from anon;
revoke insert, update, delete on public.guardian_consents from authenticated;

-- ---------------------------------------------------------------------------
-- Deletion log (no personal data: salted hash of the user id only)
-- ---------------------------------------------------------------------------
create table if not exists public.data_deletion_log (
  id uuid primary key default gen_random_uuid(),
  subject_hash text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  scope text not null default 'account_and_learning_data'
);
alter table public.data_deletion_log enable row level security;
revoke all on public.data_deletion_log from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Legacy learner tables from 001: keep learners read-own; writes server-only
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.assessment_scores') is not null then
    execute 'drop policy if exists "scores_via_attempt" on public.assessment_scores';
    execute 'drop policy if exists "scores_select_via_attempt" on public.assessment_scores';
    execute 'create policy "scores_select_via_attempt" on public.assessment_scores for select using (exists (select 1 from public.assessment_attempts a where a.id = attempt_id and a.user_id = auth.uid()))';
  end if;
  if to_regclass('public.reports') is not null then
    execute 'drop policy if exists "reports_all_own" on public.reports';
    execute 'drop policy if exists "reports_select_own" on public.reports';
    execute 'create policy "reports_select_own" on public.reports for select using (auth.uid() = user_id)';
  end if;
end $$;
