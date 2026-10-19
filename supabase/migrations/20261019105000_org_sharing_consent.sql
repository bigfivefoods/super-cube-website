-- Current "share progress with my cohort" consent, recorded on the server.
-- Until now the choice lived only on the learner's device: a snapshot row meant
-- "shared at some point". From here a learner who turns sharing off is hidden
-- from coaches (RLS) and from org_results() straight away, and their snapshot
-- scores are cleared by /api/org/progress.
-- Rollback: supabase/rollback/20261019105000_org_sharing_consent.down.sql

alter table public.org_progress_snapshots
  add column if not exists sharing boolean not null default true,
  add column if not exists sharing_changed_at timestamptz;

comment on column public.org_progress_snapshots.sharing is
  'Learner''s current consent to share progress with this cohort. false = withdrawn; staff cannot read the row.';

-- Staff of the org read only rows whose learner currently shares; learners always read their own.
drop policy if exists "org_progress_select" on public.org_progress_snapshots;
create policy "org_progress_select"
  on public.org_progress_snapshots for select
  to authenticated
  using (user_id = auth.uid() or (sharing and private.is_org_staff(org_id)));
