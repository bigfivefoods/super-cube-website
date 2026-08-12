-- Phase 2: seat packs / cohort capacity on organisations
-- Safe to re-run.

alter table public.organisations
  add column if not exists seat_limit integer;

alter table public.organisations
  add column if not exists seats_used integer default 0;

comment on column public.organisations.seat_limit is
  'Max learner seats purchased for this cohort (Paystack seat pack)';
comment on column public.organisations.seats_used is
  'Optional counter; roster length is source of truth for coaches';
