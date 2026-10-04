-- Website enquiries (contact, quote, keynote). Additive only: one new table.
-- Server-only via the service role; RLS enabled with NO policies and
-- anon/authenticated privileges revoked.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  intent text not null default 'general',
  name text not null,
  email text not null,
  organisation text,
  message text not null,
  source text,
  delivered boolean not null default false,
  handled_at timestamptz,
  handled_by text
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

revoke all on table public.enquiries from anon, authenticated;

comment on table public.enquiries is
  'Super-Cube website enquiries. Server-only (service role). No public policies.';
