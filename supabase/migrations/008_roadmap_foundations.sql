-- 008: Foundations for the approved roadmap (schema only, no features yet).
-- Every table is RLS-on, read-own (or staff via helpers from 007), and written
-- only by server routes with the service role. Idempotent.
--   - learning_events / practice_streaks : habit features (streaks, 5-min daily practice, reminders)
--   - notification_prefs                 : WhatsApp / email / push reminders with explicit opt-in
--   - teams / team_members               : manager "team cube"
--   - feedback_requests / feedback_raters / feedback_responses : 360 feedback
--   - coach_settings / coach_messages    : AI Cube Coach with child-safe settings
--   - content_translations               : i18n content keys (isiZulu, Afrikaans) + low-data variants
--   - badges / learner_badges            : shareable growth badges (LinkedIn)
--   - cpd_records                        : SETA / CPD evidence (hours, assessments)

-- Habit / analytics event log (append-only)
create table if not exists public.learning_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text,
  kind text not null check (kind in (
    'session_complete','practice_complete','pulse','assessment','reminder_sent',
    'reminder_opened','coach_nudge','coach_chat','badge_awarded','feedback_received')),
  ref text,              -- lesson id, practice id, badge id …
  minutes numeric(5,1),  -- time on task (CPD hours, 5-minute practice)
  meta jsonb not null default '{}'::jsonb,
  local_day date,        -- learner's local calendar day (streaks)
  created_at timestamptz not null default now()
);
create index if not exists learning_events_user_day on public.learning_events (user_id, local_day);
alter table public.learning_events enable row level security;
drop policy if exists "learning_events_select_own" on public.learning_events;
create policy "learning_events_select_own" on public.learning_events
  for select to authenticated using (user_id = auth.uid());
revoke all on public.learning_events from anon;
revoke insert, update, delete on public.learning_events from authenticated;

create table if not exists public.practice_streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_days integer not null default 0,
  best_days integer not null default 0,
  last_day date,
  freezes_available integer not null default 0,
  daily_goal_minutes integer not null default 5,
  timezone text not null default 'Africa/Johannesburg',
  updated_at timestamptz not null default now()
);
alter table public.practice_streaks enable row level security;
drop policy if exists "practice_streaks_select_own" on public.practice_streaks;
create policy "practice_streaks_select_own" on public.practice_streaks
  for select to authenticated using (user_id = auth.uid());
revoke all on public.practice_streaks from anon;
revoke insert, update, delete on public.practice_streaks from authenticated;

create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  channel text not null default 'none' check (channel in ('none','email','whatsapp','push')),
  whatsapp_e164 text,               -- stored only after explicit opt-in
  whatsapp_opt_in_at timestamptz,
  reminder_local_time time,
  quiet_hours int4range,
  guardian_approved boolean not null default false, -- required for under-18 learners
  updated_at timestamptz not null default now()
);
alter table public.notification_prefs enable row level security;
drop policy if exists "notification_prefs_select_own" on public.notification_prefs;
create policy "notification_prefs_select_own" on public.notification_prefs
  for select to authenticated using (user_id = auth.uid());
revoke all on public.notification_prefs from anon;
revoke insert, update, delete on public.notification_prefs from authenticated;

-- Manager team cube
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organisations (id) on delete cascade,
  name text not null,
  manager_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('manager','member')),
  share_scores boolean not null default false,  -- member's explicit consent for the team cube
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
-- SECURITY DEFINER helpers avoid teams <-> team_members policy recursion (same fix as 007)
create or replace function public.is_team_member(p_team uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where team_id = p_team and user_id = auth.uid())
$$;
create or replace function public.is_team_manager(p_team uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teams where id = p_team and manager_user_id = auth.uid())
$$;
revoke all on function public.is_team_member(uuid), public.is_team_manager(uuid) from public;
grant execute on function public.is_team_member(uuid), public.is_team_manager(uuid) to authenticated;
drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member" on public.teams for select to authenticated
  using (manager_user_id = auth.uid() or public.is_team_member(id));
drop policy if exists "team_members_select_own_or_manager" on public.team_members;
create policy "team_members_select_own_or_manager" on public.team_members for select to authenticated
  using (user_id = auth.uid() or (share_scores and public.is_team_manager(team_id)));
revoke all on public.teams, public.team_members from anon;
revoke insert, update, delete on public.teams, public.team_members from authenticated;

-- 360 feedback: learner invites raters by single-use token (raters need no account)
create table if not exists public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text not null,
  phase text not null check (phase in ('pre','post')),
  instrument_id text not null,
  min_raters_to_show integer not null default 3, -- anonymity threshold
  closes_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.feedback_raters (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.feedback_requests (id) on delete cascade,
  relationship text not null check (relationship in ('manager','peer','direct_report','other')),
  token_hash text not null unique,
  invited_label text,          -- e.g. first name only; no email stored by default
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null unique references public.feedback_raters (id) on delete cascade,
  responses jsonb not null,
  construct_scores jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.feedback_requests enable row level security;
alter table public.feedback_raters enable row level security;
alter table public.feedback_responses enable row level security;
drop policy if exists "feedback_requests_select_own" on public.feedback_requests;
create policy "feedback_requests_select_own" on public.feedback_requests
  for select to authenticated using (user_id = auth.uid());
-- Raters and individual responses are never readable by clients; the server
-- aggregates them per relationship only once min_raters_to_show is reached.
revoke all on public.feedback_requests, public.feedback_raters, public.feedback_responses from anon;
revoke insert, update, delete on public.feedback_requests from authenticated;
revoke all on public.feedback_raters, public.feedback_responses from authenticated;

-- AI Cube Coach
create table if not exists public.coach_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  enabled boolean not null default false,
  daily_nudge boolean not null default false,
  child_safe boolean not null default true,     -- forced true for under-18 by the server
  guardian_approved boolean not null default false,
  store_transcripts boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.coach_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user','assistant','system_nudge')),
  content text not null,
  safety_flags text[] not null default '{}',
  model text,
  created_at timestamptz not null default now()
);
create index if not exists coach_messages_user on public.coach_messages (user_id, created_at desc);
alter table public.coach_settings enable row level security;
alter table public.coach_messages enable row level security;
drop policy if exists "coach_settings_select_own" on public.coach_settings;
create policy "coach_settings_select_own" on public.coach_settings
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "coach_messages_select_own" on public.coach_messages;
create policy "coach_messages_select_own" on public.coach_messages
  for select to authenticated using (user_id = auth.uid());
revoke all on public.coach_settings, public.coach_messages from anon;
revoke insert, update, delete on public.coach_settings, public.coach_messages from authenticated;

-- i18n content keys (lesson text, prompts, items) + low-data variants
create table if not exists public.content_translations (
  content_key text not null,          -- e.g. 'lesson:adults-choices-skill-1:section:2:body'
  locale text not null check (locale in ('en','zu','af')),
  body text not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published')),
  translator text,
  reviewed_by text,
  low_data boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (content_key, locale, low_data)
);
alter table public.content_translations enable row level security;
drop policy if exists "content_translations_read_published" on public.content_translations;
create policy "content_translations_read_published" on public.content_translations
  for select to anon, authenticated using (status = 'published');
revoke insert, update, delete on public.content_translations from anon, authenticated;
grant select on public.content_translations to anon, authenticated;

-- Shareable badges (LinkedIn "add to profile" uses the certificate / badge id)
create table if not exists public.badges (
  id text primary key,                 -- e.g. 'streak-7', 'face-emotional-real-growth'
  name text not null,
  criteria text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.learner_badges (
  id text primary key,                 -- public verification id
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null references public.badges (id),
  evidence jsonb not null default '{}'::jsonb,
  awarded_at timestamptz not null default now(),
  revoked boolean not null default false,
  unique (user_id, badge_id)
);
alter table public.badges enable row level security;
alter table public.learner_badges enable row level security;
drop policy if exists "badges_read" on public.badges;
create policy "badges_read" on public.badges for select to anon, authenticated using (true);
grant select on public.badges to anon, authenticated;
drop policy if exists "learner_badges_select_own" on public.learner_badges;
create policy "learner_badges_select_own" on public.learner_badges
  for select to authenticated using (user_id = auth.uid());
revoke all on public.learner_badges from anon;
revoke insert, update, delete on public.learner_badges from authenticated;
revoke insert, update, delete on public.badges from anon, authenticated;

-- SETA / CPD evidence
create table if not exists public.cpd_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  programme_id text not null,
  scheme text not null default 'internal' check (scheme in ('internal','seta','cpd')),
  notional_hours numeric(5,1) not null default 0,
  evidence jsonb not null default '{}'::jsonb,  -- attempt ids, completions, assessor sign-off
  certificate_id text references public.certificates (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.cpd_records enable row level security;
drop policy if exists "cpd_records_select_own" on public.cpd_records;
create policy "cpd_records_select_own" on public.cpd_records
  for select to authenticated using (user_id = auth.uid());
revoke all on public.cpd_records from anon;
revoke insert, update, delete on public.cpd_records from authenticated;
