-- Optional face-level scores for coach heat maps (consented snapshots only)
-- Safe to re-run after 003_orgs_coach.sql

alter table public.org_progress_snapshots
  add column if not exists face_scores jsonb not null default '{}'::jsonb;

comment on column public.org_progress_snapshots.face_scores is
  'JSON map of constructId -> { pre?: number, post?: number, mid?: number } 0-100 scores';
