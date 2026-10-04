-- Newsletter subscribers (POPIA single opt-in with recorded consent).
-- Additive only: creates one new table. Server-only access via the service
-- role; RLS is enabled with NO policies, so anon/authenticated cannot read
-- or write it through the public API.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and position('@' in email) > 1),
  source text,
  consent_text text not null,
  consent_at timestamptz not null default now(),
  ip_hash text,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

revoke all on table public.newsletter_subscribers from anon, authenticated;

comment on table public.newsletter_subscribers is
  'Super-Cube newsletter signups. Server-only (service role). No public policies.';
