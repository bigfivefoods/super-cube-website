-- Continuous face-pulse metadata for coach reliability + research exports
-- Safe to re-run after 004_face_scores.sql

alter table public.org_progress_snapshots
  add column if not exists pulse_count int not null default 0;

alter table public.org_progress_snapshots
  add column if not exists pulse_consistency int not null default 0;

alter table public.org_progress_snapshots
  add column if not exists last_pulse_at timestamptz;

alter table public.org_progress_snapshots
  add column if not exists pulse_window_days int not null default 28;

comment on column public.org_progress_snapshots.face_scores is
  'JSON map of constructId -> { pre?, post?, mid?, pulse? } 0-100 scores. pulse = recent daily/weekly average.';

comment on column public.org_progress_snapshots.pulse_count is
  'Number of face pulses in the recent window (consented snapshots only).';

comment on column public.org_progress_snapshots.pulse_consistency is
  '0-100 consistency of face tracking in the recent window.';

comment on column public.org_progress_snapshots.last_pulse_at is
  'ISO timestamp of the learner''s most recent face pulse (if any).';
