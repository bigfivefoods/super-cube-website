-- LTI 1.3 / LTI Advantage for Super-Cube®.
--
-- NOT APPLIED by this change. Commit the file only. A person applies it to the
-- database when they are ready. Do not run it from the app, from CI, or from
-- a Supabase branch in this pull request.
--
-- Rollback: supabase/rollback/20261109120000_lti_advantage.down.sql
--
-- An organisation admin registers one row in lti_platforms (issuer, client id,
-- deployment id, and the platform's login, token and key-set URLs). A launch
-- then maps the platform user into that organisation and, when the platform
-- sends a course context, into a cohort. Tables are service-role only. The
-- API checks the org admin before it writes, the same way open badges do.

create table if not exists public.lti_platforms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  issuer text not null check (char_length(issuer) between 8 and 500),
  client_id text not null check (char_length(client_id) between 1 and 255),
  deployment_id text not null check (char_length(deployment_id) between 1 and 255),
  auth_login_url text not null,
  token_url text not null,
  jwks_url text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (issuer, client_id, deployment_id)
);

create table if not exists public.lti_login_states (
  state text primary key,
  nonce text not null,
  platform_id uuid not null references public.lti_platforms (id) on delete cascade,
  target_link_uri text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lti_contexts (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.lti_platforms (id) on delete cascade,
  context_id text not null check (char_length(context_id) between 1 and 255),
  context_title text,
  cohort_id uuid references public.cohorts (id) on delete set null,
  programme_id text,
  created_at timestamptz not null default now(),
  unique (platform_id, context_id)
);

create table if not exists public.lti_user_links (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.lti_platforms (id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 255),
  user_id uuid references auth.users (id) on delete set null,
  org_id uuid not null references public.organisations (id) on delete cascade,
  cohort_id uuid references public.cohorts (id) on delete set null,
  email text,
  full_name text,
  role text not null check (role in ('learner', 'facilitator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform_id, subject)
);

create table if not exists public.lti_launches (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.lti_platforms (id) on delete cascade,
  user_link_id uuid references public.lti_user_links (id) on delete set null,
  message_type text not null,
  resource_link_id text,
  programme_id text,
  course_id text,
  context_id text,
  subject text not null,
  deployment_id text not null,
  ags_lineitem_url text,
  ags_scopes text[] not null default '{}',
  nrps_url text,
  return_url text,
  dl_data text,
  accept_multiple boolean not null default true,
  locale text,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.lti_launch_tokens (
  token text primary key,
  launch_id uuid not null references public.lti_launches (id) on delete cascade,
  kind text not null check (kind in ('enter', 'deep')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lti_grade_passes (
  id uuid primary key default gen_random_uuid(),
  launch_id uuid not null references public.lti_launches (id) on delete cascade,
  score_given numeric not null,
  score_maximum numeric not null,
  activity_progress text not null,
  grading_progress text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  http_status integer,
  sent_at timestamptz not null default now()
);

create index if not exists lti_platforms_org_idx on public.lti_platforms (org_id);
create index if not exists lti_login_states_expires_idx on public.lti_login_states (expires_at);
create index if not exists lti_user_links_user_idx on public.lti_user_links (user_id);
create index if not exists lti_launches_platform_idx on public.lti_launches (platform_id, created_at desc);
create index if not exists lti_launch_tokens_expires_idx on public.lti_launch_tokens (expires_at);

alter table public.lti_platforms enable row level security;
alter table public.lti_login_states enable row level security;
alter table public.lti_contexts enable row level security;
alter table public.lti_user_links enable row level security;
alter table public.lti_launches enable row level security;
alter table public.lti_launch_tokens enable row level security;
alter table public.lti_grade_passes enable row level security;

revoke all on public.lti_platforms from public, anon, authenticated;
revoke all on public.lti_login_states from public, anon, authenticated;
revoke all on public.lti_contexts from public, anon, authenticated;
revoke all on public.lti_user_links from public, anon, authenticated;
revoke all on public.lti_launches from public, anon, authenticated;
revoke all on public.lti_launch_tokens from public, anon, authenticated;
revoke all on public.lti_grade_passes from public, anon, authenticated;

grant select, insert, update, delete on public.lti_platforms to service_role;
grant select, insert, update, delete on public.lti_login_states to service_role;
grant select, insert, update, delete on public.lti_contexts to service_role;
grant select, insert, update, delete on public.lti_user_links to service_role;
grant select, insert, update, delete on public.lti_launches to service_role;
grant select, insert, update, delete on public.lti_launch_tokens to service_role;
grant select, insert, update, delete on public.lti_grade_passes to service_role;

comment on table public.lti_platforms is
  'LTI 1.3 platforms registered by an organisation admin. Service role only.';
