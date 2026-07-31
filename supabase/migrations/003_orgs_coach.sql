-- Super-Cube® org cohorts, coach roster, certificates, growth shares
-- Safe to re-run. Requires auth.users + public.profiles (002).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organisations / cohorts
-- ---------------------------------------------------------------------------
create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  kind text not null default 'cohort'
    check (kind in ('cohort', 'school', 'company', 'network')),
  owner_user_id uuid references auth.users (id) on delete set null,
  contact_email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organisations_code_idx
  on public.organisations (lower(code));

-- Members of an org (learners + coaches)
create table if not exists public.org_members (
  org_id uuid not null references public.organisations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'learner'
    check (role in ('learner', 'coach', 'admin')),
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists org_members_user_idx on public.org_members (user_id);

-- Progress snapshot for coach dashboards (consented / non-journal)
create table if not exists public.org_progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text,
  pathway_pct int not null default 0,
  lessons_completed int not null default 0,
  pre_overall numeric,
  post_overall numeric,
  growth numeric,
  certificate_id text,
  client_updated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists org_progress_org_idx
  on public.org_progress_snapshots (org_id);

-- Certificate registry (verify page can look up)
create table if not exists public.certificates (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  learner_name text not null,
  programme_id text,
  pre_overall numeric,
  post_overall numeric,
  growth numeric,
  issued_at timestamptz not null default now(),
  org_code text,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists certificates_user_idx on public.certificates (user_id);

-- Optional server-side share tokens (long links can also be self-contained)
create table if not exists public.growth_shares (
  token text primary key,
  user_id uuid references auth.users (id) on delete set null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.organisations enable row level security;
alter table public.org_members enable row level security;
alter table public.org_progress_snapshots enable row level security;
alter table public.certificates enable row level security;
alter table public.growth_shares enable row level security;

-- Organisations: anyone authenticated can read active orgs by code (join flow)
drop policy if exists "orgs_select_active" on public.organisations;
create policy "orgs_select_active"
  on public.organisations for select
  to authenticated
  using (active = true);

-- Members: see own memberships; coaches see all members of their orgs
drop policy if exists "org_members_select" on public.org_members;
create policy "org_members_select"
  on public.org_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.org_members m
      where m.org_id = org_members.org_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'admin')
    )
  );

drop policy if exists "org_members_insert_self" on public.org_members;
create policy "org_members_insert_self"
  on public.org_members for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "org_members_delete_self" on public.org_members;
create policy "org_members_delete_self"
  on public.org_members for delete
  to authenticated
  using (user_id = auth.uid());

-- Progress: learners upsert own; coaches read their org
drop policy if exists "org_progress_select" on public.org_progress_snapshots;
create policy "org_progress_select"
  on public.org_progress_snapshots for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.org_members m
      where m.org_id = org_progress_snapshots.org_id
        and m.user_id = auth.uid()
        and m.role in ('coach', 'admin')
    )
  );

drop policy if exists "org_progress_upsert_own" on public.org_progress_snapshots;
create policy "org_progress_upsert_own"
  on public.org_progress_snapshots for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "org_progress_update_own" on public.org_progress_snapshots;
create policy "org_progress_update_own"
  on public.org_progress_snapshots for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Certificates: public read by id for verify page (anon)
drop policy if exists "certificates_select_public" on public.certificates;
create policy "certificates_select_public"
  on public.certificates for select
  using (true);

drop policy if exists "certificates_insert_own" on public.certificates;
create policy "certificates_insert_own"
  on public.certificates for insert
  to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- Growth shares: public read by token
drop policy if exists "growth_shares_select_public" on public.growth_shares;
create policy "growth_shares_select_public"
  on public.growth_shares for select
  using (true);

drop policy if exists "growth_shares_insert_own" on public.growth_shares;
create policy "growth_shares_insert_own"
  on public.growth_shares for insert
  to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- Seed demo cohort for pilots
insert into public.organisations (code, name, kind, contact_email, notes)
values (
  'DEMO2026',
  'Super-Cube® Demo Cohort',
  'cohort',
  'hello@super-cube.me',
  'Default pilot code for testing join + coach roster'
)
on conflict (code) do update
  set name = excluded.name,
      active = true,
      updated_at = now();
