-- Super-Cube® LMS schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  organisation text,
  programme_id text, -- kids | adolescents | adults
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Three age-based programmes
create table if not exists public.programmes (
  id text primary key,
  name text not null,
  age_label text not null,
  age_min int not null,
  age_max int not null,
  tagline text not null,
  description text not null,
  sort_order int not null default 0
);

create table if not exists public.subscription_plans (
  id text primary key,
  programme_id text not null references public.programmes (id),
  name text not null,
  price_zar integer not null, -- cents
  interval text not null check (interval in ('month', 'year', 'once')),
  paystack_plan_code text,
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null references public.subscription_plans (id),
  programme_id text not null references public.programmes (id),
  status text not null default 'incomplete'
    check (status in ('incomplete', 'active', 'trialing', 'past_due', 'cancelled')),
  paystack_customer_code text,
  paystack_subscription_code text,
  paystack_email_token text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

-- Curriculum: courses per programme × construct
create table if not exists public.courses (
  id text primary key, -- e.g. adults-choices
  programme_id text not null references public.programmes (id),
  construct_id text not null,
  title text not null,
  summary text not null,
  cover_path text,
  sort_order int not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses (id) on delete cascade,
  title text not null,
  body_md text not null default '',
  lesson_type text not null default 'content'
    check (lesson_type in ('content', 'practice', 'quiz')),
  sort_order int not null default 0,
  duration_minutes int not null default 10
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

-- Assessments
create table if not exists public.assessment_instruments (
  id text primary key,
  programme_id text not null references public.programmes (id),
  title text not null,
  version int not null default 1
);

create table if not exists public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  instrument_id text not null references public.assessment_instruments (id) on delete cascade,
  construct_id text not null,
  prompt text not null,
  item_type text not null default 'likert_5'
    check (item_type in ('likert_5', 'scenario')),
  sort_order int not null default 0
);

create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  instrument_id text not null references public.assessment_instruments (id),
  programme_id text not null references public.programmes (id),
  phase text not null check (phase in ('pre', 'post')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts (id) on delete cascade,
  item_id uuid not null references public.assessment_items (id) on delete cascade,
  value numeric not null,
  raw jsonb,
  unique (attempt_id, item_id)
);

create table if not exists public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts (id) on delete cascade,
  construct_id text not null,
  score numeric not null,
  raw_mean numeric not null,
  unique (attempt_id, construct_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  programme_id text not null references public.programmes (id),
  pre_attempt_id uuid references public.assessment_attempts (id),
  post_attempt_id uuid references public.assessment_attempts (id),
  payload jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.programmes enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assessment_instruments enable row level security;
alter table public.assessment_items enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.reports enable row level security;

-- Public read curriculum & plans
create policy "programmes_read" on public.programmes for select using (true);
create policy "plans_read" on public.subscription_plans for select using (true);
create policy "courses_read" on public.courses for select using (auth.role() = 'authenticated');
create policy "lessons_read" on public.lessons for select using (auth.role() = 'authenticated');
create policy "instruments_read" on public.assessment_instruments for select using (auth.role() = 'authenticated');
create policy "items_read" on public.assessment_items for select using (auth.role() = 'authenticated');

-- Own data only
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "subs_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subs_insert_own" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "subs_update_own" on public.subscriptions for update using (auth.uid() = user_id);

create policy "progress_all_own" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "attempts_all_own" on public.assessment_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "responses_via_attempt" on public.assessment_responses
  for all using (
    exists (
      select 1 from public.assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

create policy "scores_via_attempt" on public.assessment_scores
  for all using (
    exists (
      select 1 from public.assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

create policy "reports_all_own" on public.reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
