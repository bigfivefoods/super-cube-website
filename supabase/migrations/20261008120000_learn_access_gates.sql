-- Learn access gates: trusted session completions, and guardian consent
-- recorded by someone other than the learner.
-- Additive. Rollback: supabase/rollback/20261008120000_learn_access_gates.down.sql

-- A completion counts toward the after-test only when the server says so.
-- Existing rows stay trusted (they were the only record we had). New rows
-- default to false until the app sets the flag.
alter table public.lms_lesson_completions
  add column if not exists counts_for_gate boolean;

update public.lms_lesson_completions
  set counts_for_gate = true
  where counts_for_gate is null;

alter table public.lms_lesson_completions
  alter column counts_for_gate set default false;

alter table public.lms_lesson_completions
  alter column counts_for_gate set not null;

-- First time this server saw the learner open a session. The completion
-- route reads opened_at; it does not trust a client timestamp.
create table if not exists public.lms_lesson_opens (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  programme_id text not null,
  opened_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lms_lesson_opens enable row level security;
drop policy if exists "lms_lesson_opens_select_own" on public.lms_lesson_opens;
create policy "lms_lesson_opens_select_own"
  on public.lms_lesson_opens for select
  to authenticated
  using (user_id = auth.uid());
revoke all on public.lms_lesson_opens from anon;
revoke insert, update, delete on public.lms_lesson_opens from authenticated;

-- Who recorded the consent. On-device rows written by the learner's own
-- session are not a competent person's consent.
alter table public.guardian_consents
  add column if not exists recorded_by uuid references auth.users (id) on delete set null;

update public.guardian_consents
  set recorded_by = learner_user_id
  where recorded_by is null
    and method = 'on_device_attestation'
    and learner_user_id is not null;

-- Refuse syncing assessment answers for an under-18 learner unless someone
-- else has recorded consent. Also keep profile, consent and entitlement when
-- a push leaves those keys out (second-device sync).
create or replace function public.learner_state_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  band text;
  allowed boolean;
  has_answers boolean;
begin
  if tg_op = 'UPDATE' and old.payload is not null and new.payload is not null then
    if not (new.payload ? 'profile') and (old.payload ? 'profile') then
      new.payload := new.payload || jsonb_build_object('profile', old.payload->'profile');
    end if;
    if not (new.payload ? 'guardianConsent') and (old.payload ? 'guardianConsent') then
      new.payload := new.payload || jsonb_build_object('guardianConsent', old.payload->'guardianConsent');
    end if;
    if not (new.payload ? 'serverEntitlement') and (old.payload ? 'serverEntitlement') then
      new.payload := new.payload || jsonb_build_object('serverEntitlement', old.payload->'serverEntitlement');
    end if;
  end if;

  band := new.payload #>> '{profile,ageBand}';
  if band in ('under-13', '13-17') then
    select exists (
      select 1
      from public.guardian_consents g
      where g.learner_user_id = new.user_id
        and g.status = 'granted'
        and (
          g.method in ('email_verified', 'school_contract')
          or (g.recorded_by is not null and g.recorded_by <> new.user_id)
        )
    ) into allowed;

    has_answers := false;
    if jsonb_typeof(new.payload->'attempts') = 'array' and exists (
      select 1
      from jsonb_array_elements(new.payload->'attempts') att
      where jsonb_typeof(att->'responses') = 'object'
        and att->'responses' <> '{}'::jsonb
    ) then
      has_answers := true;
    end if;
    if jsonb_typeof(new.payload #> '{assessmentDraft,responses}') = 'object'
       and (new.payload #> '{assessmentDraft,responses}') <> '{}'::jsonb then
      has_answers := true;
    end if;
    if jsonb_typeof(new.payload #> '{orientation,responses}') = 'object'
       and (new.payload #> '{orientation,responses}') <> '{}'::jsonb then
      has_answers := true;
    end if;

    -- Same removal as redactAssessmentAnswers in src/lib/lms/guardian-gate.ts.
    if has_answers and not allowed then
      new.payload := new.payload - 'attempts' - 'assessmentDraft';
      if jsonb_typeof(new.payload->'orientation') = 'object' then
        new.payload := jsonb_set(new.payload, '{orientation}', (new.payload->'orientation') - 'responses', true);
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.learner_state_guard() from public, anon, authenticated;

drop trigger if exists learner_state_guard on public.learner_state;
create trigger learner_state_guard
  before insert or update on public.learner_state
  for each row execute procedure public.learner_state_guard();
