-- Rollback for 20261019105000_org_sharing_consent.sql (run AFTER rolling back org_results).
drop policy if exists "org_progress_select" on public.org_progress_snapshots;
create policy "org_progress_select"
  on public.org_progress_snapshots for select
  to authenticated
  using (user_id = auth.uid() or private.is_org_staff(org_id));
alter table public.org_progress_snapshots
  drop column if exists sharing_changed_at,
  drop column if exists sharing;
