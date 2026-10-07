-- LMS Phase 1 · Stage 2: assessment integrity.
-- Additive only. Rollback: supabase/rollback/20261007120000_assessment_integrity.down.sql
--  * lms_attempts.flags   : data-quality flags set by the server (attention check,
--                           straight-lining, too fast). Attempts are never rejected for them.
--  * lms_attempts.meta    : source ('live' | 'claimed_device'), item order shown, duration.
--  * lms_item_responses   : one row per item answer (psychometrics / reliability).
-- Safe to re-run.

alter table public.lms_attempts add column if not exists flags text[] not null default '{}';
alter table public.lms_attempts add column if not exists meta jsonb not null default '{}'::jsonb;

create table if not exists public.lms_item_responses (
  attempt_id uuid not null references public.lms_attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text not null,
  instrument_id text not null,
  phase text not null check (phase in ('pre', 'mid', 'post')),
  item_id text not null,
  construct_id text not null,       -- face id, or 'attention' for the attention check
  value smallint not null check (value between 1 and 5),
  position smallint,                -- order the item was shown in (1-based)
  created_at timestamptz not null default now(),
  primary key (attempt_id, item_id)
);
create index if not exists lms_item_responses_item_idx
  on public.lms_item_responses (programme_id, phase, construct_id);
create index if not exists lms_item_responses_user_idx on public.lms_item_responses (user_id);
alter table public.lms_item_responses enable row level security;
drop policy if exists "lms_item_responses_select_own" on public.lms_item_responses;
create policy "lms_item_responses_select_own"
  on public.lms_item_responses for select
  to authenticated
  using (user_id = (select auth.uid()));
revoke all on public.lms_item_responses from anon;
revoke insert, update, delete on public.lms_item_responses from authenticated;

-- Item answers are as immutable as the attempt they belong to
create or replace function public.lms_item_responses_block_update()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'lms_item_responses rows are immutable';
end;
$$;
revoke execute on function public.lms_item_responses_block_update() from public, anon, authenticated;
drop trigger if exists lms_item_responses_no_update on public.lms_item_responses;
create trigger lms_item_responses_no_update
  before update on public.lms_item_responses
  for each row execute procedure public.lms_item_responses_block_update();

-- Backfill item rows for attempts recorded before this migration
insert into public.lms_item_responses (attempt_id, user_id, programme_id, instrument_id, phase, item_id, construct_id, value)
select a.id, a.user_id, a.programme_id, a.instrument_id, a.phase, r.key,
       coalesce(nullif(split_part(substring(r.key from length(a.instrument_id) + 2), '-', 1), ''), 'unknown'),
       (r.value)::text::smallint
from public.lms_attempts a
cross join lateral jsonb_each(a.responses) r
where jsonb_typeof(r.value) = 'number'
  and (r.value)::text ~ '^[1-5]$'
on conflict (attempt_id, item_id) do nothing;
