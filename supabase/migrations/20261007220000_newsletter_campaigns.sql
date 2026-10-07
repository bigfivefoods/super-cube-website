-- Newsletter campaigns: email a published /news post to confirmed subscribers.
-- Additive only. Service role access; RLS on, no public policies.

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null check (char_length(post_slug) between 3 and 90),
  subject text not null check (char_length(subject) between 3 and 150),
  preheader text not null default '' check (char_length(preheader) <= 200),
  intro text not null default '' check (char_length(intro) <= 1200),
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent')),
  -- Test send: always to the signed-in admin's own address. content_hash ties it to the exact email.
  test_sent_at timestamptz,
  test_sent_to text,
  test_content_hash text,
  -- Real send: explicit confirmation by an admin, then batches until done.
  send_confirmed_at timestamptz,
  send_confirmed_by text,
  content_hash text,
  recipients_total integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  completed_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_campaigns_created_idx on public.newsletter_campaigns (created_at desc);

create table if not exists public.newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.newsletter_campaigns (id),
  subscriber_id uuid not null references public.newsletter_subscribers (id),
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  error text,
  claimed_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  -- Idempotency: one email per subscriber per campaign, however often the send is resumed.
  unique (campaign_id, subscriber_id)
);

create index if not exists newsletter_sends_pending_idx
  on public.newsletter_sends (campaign_id, created_at)
  where status = 'pending';

alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_sends enable row level security;
revoke all on table public.newsletter_campaigns from anon, authenticated;
revoke all on table public.newsletter_sends from anon, authenticated;

comment on table public.newsletter_campaigns is
  'Super-Cube® News campaigns (admin › Campaigns). Test send goes to the admin only; the real send needs an explicit confirmation and reaches confirmed, not-unsubscribed subscribers once each.';
comment on table public.newsletter_sends is
  'One row per subscriber per campaign (unique), claimed before sending so a resumed or repeated send never emails anyone twice.';
