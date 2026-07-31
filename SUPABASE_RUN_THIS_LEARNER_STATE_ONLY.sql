-- Learner progress snapshot (multi-device sync)
-- Safe to re-run. Does NOT require other LMS tables except auth.users.
-- Optionally creates public.profiles if missing (needed by rest of LMS).

create extension if not exists "pgcrypto";

-- Ensure profiles exists (full schema may not have been applied yet)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  organisation text,
  programme_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Learner state (JSON snapshot of LocalLmsState)
create table if not exists public.learner_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  client_updated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learner_state_updated_idx
  on public.learner_state (updated_at desc);

alter table public.learner_state enable row level security;

drop policy if exists "learner_state_select_own" on public.learner_state;
create policy "learner_state_select_own"
  on public.learner_state for select
  using (auth.uid() = user_id);

drop policy if exists "learner_state_insert_own" on public.learner_state;
create policy "learner_state_insert_own"
  on public.learner_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "learner_state_update_own" on public.learner_state;
create policy "learner_state_update_own"
  on public.learner_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "learner_state_delete_own" on public.learner_state;
create policy "learner_state_delete_own"
  on public.learner_state for delete
  using (auth.uid() = user_id);

create or replace function public.touch_learner_state_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learner_state_touch on public.learner_state;
create trigger learner_state_touch
  before update on public.learner_state
  for each row execute procedure public.touch_learner_state_updated();
