-- Newsletter double opt-in. Additive only: new nullable columns and indexes on
-- public.newsletter_subscribers. RLS stays on with no public policies
-- (server-only via the service role); anon/authenticated keep no access.
--
-- A subscriber receives campaigns only when confirmed_at is set and
-- unsubscribed_at is null. confirm_token is the single-use link in the
-- confirmation email; it is rotated on every new signup request.

alter table public.newsletter_subscribers
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirm_token uuid default gen_random_uuid(),
  add column if not exists confirm_sent_at timestamptz,
  add column if not exists confirm_ip_hash text;

create unique index if not exists newsletter_subscribers_confirm_token_key
  on public.newsletter_subscribers (confirm_token);

create index if not exists newsletter_subscribers_confirmed_active_idx
  on public.newsletter_subscribers (confirmed_at)
  where unsubscribed_at is null and confirmed_at is not null;

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon, authenticated;

comment on column public.newsletter_subscribers.confirmed_at is
  'Double opt-in: set when the subscriber clicks the confirmation link. Only confirmed, not-unsubscribed rows receive campaigns.';
comment on column public.newsletter_subscribers.confirm_token is
  'Single-use confirmation link token (rotated on each signup request).';
