-- LMS Phase 1 · Stage 3: server-backed growth-report share links.
-- Additive only. Rollback: supabase/rollback/20261007140000_report_share_links.down.sql
--  * The link carries a random token only; scores are read from the server at view time.
--  * Only a SHA-256 hash of the token is stored.
--  * Links expire (7 / 30 / 90 days) and the learner can revoke them at any time.
--  * No client grants: the API (service role) creates, lists, revokes and resolves links.
-- Safe to re-run.

create table if not exists public.report_share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text not null,
  token_hash text not null unique,
  label text check (label is null or char_length(label) <= 80),
  show_name boolean not null default true,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  view_count integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);
create index if not exists report_share_links_user_idx
  on public.report_share_links (user_id, created_at desc);

alter table public.report_share_links enable row level security;
-- Learners may read their own links (no token is stored, only its hash); all writes go through the API.
drop policy if exists "report_share_links_select_own" on public.report_share_links;
create policy "report_share_links_select_own"
  on public.report_share_links for select
  to authenticated
  using (user_id = (select auth.uid()));
revoke all on public.report_share_links from anon;
revoke insert, update, delete on public.report_share_links from authenticated;

-- Count a view atomically (service role only).
create or replace function public.report_share_link_viewed(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.report_share_links
     set view_count = view_count + 1, last_viewed_at = now()
   where id = p_id;
$$;
revoke execute on function public.report_share_link_viewed(uuid) from public, anon, authenticated;
grant execute on function public.report_share_link_viewed(uuid) to service_role;
