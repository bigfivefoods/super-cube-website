-- Open Badges 3.0 credentials and facilitator-led cohorts.
-- Additive. Does not change certificates, organisations, teams or the public verify function.
-- Rollback: supabase/rollback/20261026120000_open_badges_and_cohorts.down.sql
--
-- Credentials are written by the server (service role) and read one id at a time,
-- the same door as verify_certificate(). Cohorts are visible only to their
-- members, their facilitators and the organisation's admins. Other coaches
-- in the same organisation do not see a cohort they were not added to.

-- ---------------------------------------------------------------------------
-- Open Badges
-- ---------------------------------------------------------------------------
create table if not exists public.open_badge_credentials (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('certificate', 'milestone')),
  certificate_id text references public.certificates (id) on delete cascade,
  learner_badge_id text references public.learner_badges (id) on delete cascade,
  achievement_id text not null,
  issued_at timestamptz not null default now(),
  revoked boolean not null default false,
  signed boolean not null default false,
  credential jsonb not null,
  created_at timestamptz not null default now(),
  constraint open_badge_id_format check (
    id ~ '^(SC-[0-9]{8}-[0-9A-F]{6,12}|SCB-[A-Za-z0-9_-]{8,40})$'
  ),
  constraint open_badge_kind_link check (
    (kind = 'certificate' and certificate_id is not null and learner_badge_id is null)
    or (kind = 'milestone' and learner_badge_id is not null and certificate_id is null)
  )
);

create unique index if not exists open_badge_certificate_idx
  on public.open_badge_credentials (certificate_id) where certificate_id is not null;
create unique index if not exists open_badge_learner_badge_idx
  on public.open_badge_credentials (learner_badge_id) where learner_badge_id is not null;

alter table public.open_badge_credentials enable row level security;
revoke all on public.open_badge_credentials from public, anon, authenticated;
grant select, insert, update, delete on public.open_badge_credentials to service_role;

-- One credential, no user id and no list. Revocation follows the certificate
-- or milestone badge as well as this row, so /verify and this lookup agree.
-- Only the service role may call it. Public checks go through the site routes.
create or replace function public.open_badge_credential(p_id text)
returns table (
  id text,
  kind text,
  revoked boolean,
  signed boolean,
  credential jsonb
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    c.id,
    c.kind,
    (c.revoked or coalesce(cert.revoked, false) or coalesce(lb.revoked, false)) as revoked,
    c.signed,
    c.credential
  from public.open_badge_credentials c
  left join public.certificates cert on cert.id = c.certificate_id
  left join public.learner_badges lb on lb.id = c.learner_badge_id
  where p_id ~ '^(SC-[0-9]{8}-[0-9A-F]{6,12}|SCB-[A-Za-z0-9_-]{8,40})$'
    and c.id = p_id
  limit 1;
$$;

revoke all on function public.open_badge_credential(text) from public, anon, authenticated;
grant execute on function public.open_badge_credential(text) to service_role;

-- ---------------------------------------------------------------------------
-- Cohorts (a scheduled run inside an organisation)
-- ---------------------------------------------------------------------------
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  programme_id text check (programme_id is null or programme_id in ('kids', 'adolescents', 'adults')),
  start_on date not null,
  timezone text not null default 'Africa/Johannesburg' check (char_length(timezone) between 1 and 64),
  description text check (description is null or char_length(description) <= 2000),
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'active', 'completed', 'archived')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohort_members (
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('learner', 'facilitator')),
  display_name text check (display_name is null or char_length(display_name) <= 80),
  joined_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);

create table if not exists public.cohort_sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 120),
  starts_at timestamptz not null,
  ends_at timestamptz,
  join_url text check (
    join_url is null
    or (join_url ~ '^https://' and char_length(join_url) <= 500)
  ),
  position integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cohort_sessions_ends check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.cohort_attendance (
  session_id uuid not null references public.cohort_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'excused')),
  marked_by uuid references auth.users (id) on delete set null,
  marked_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table if not exists public.cohort_threads (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  session_id uuid references public.cohort_sessions (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 140),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  locked boolean not null default false,
  hidden boolean not null default false
);

create table if not exists public.cohort_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.cohort_threads (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hidden boolean not null default false,
  hidden_reason text check (hidden_reason is null or char_length(hidden_reason) <= 300),
  hidden_by uuid references auth.users (id) on delete set null
);

create index if not exists cohorts_org_idx on public.cohorts (org_id);
create index if not exists cohort_members_user_idx on public.cohort_members (user_id);
create index if not exists cohort_sessions_when_idx on public.cohort_sessions (cohort_id, starts_at);
create index if not exists cohort_threads_cohort_idx on public.cohort_threads (cohort_id, created_at);
create index if not exists cohort_posts_thread_idx on public.cohort_posts (thread_id, created_at);
create index if not exists cohorts_created_by_idx on public.cohorts (created_by);
create index if not exists cohort_attendance_user_idx on public.cohort_attendance (user_id);
create index if not exists cohort_attendance_marked_by_idx on public.cohort_attendance (marked_by);
create index if not exists cohort_posts_author_idx on public.cohort_posts (author_id);
create index if not exists cohort_posts_hidden_by_idx on public.cohort_posts (hidden_by);
create index if not exists cohort_sessions_created_by_idx on public.cohort_sessions (created_by);
create index if not exists cohort_threads_created_by_idx on public.cohort_threads (created_by);
create index if not exists cohort_threads_session_idx on public.cohort_threads (session_id);
create index if not exists open_badge_user_idx on public.open_badge_credentials (user_id);

alter table public.cohorts enable row level security;
alter table public.cohort_members enable row level security;
alter table public.cohort_sessions enable row level security;
alter table public.cohort_attendance enable row level security;
alter table public.cohort_threads enable row level security;
alter table public.cohort_posts enable row level security;

-- Helpers live in private so PostgREST does not expose them. SECURITY DEFINER
-- avoids policy recursion. They still read auth.uid() from the caller's JWT.
create or replace function private.can_staff_org(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select private.is_org_staff(p_org) or private.is_org_admin(p_org);
$$;

create or replace function private.can_see_cohort(p_cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.cohorts c
    where c.id = p_cohort
      and (
        private.is_org_admin(c.org_id)
        or exists (
          select 1 from public.cohort_members m
          where m.cohort_id = c.id and m.user_id = (select auth.uid())
        )
        or (
          c.created_by = (select auth.uid())
          and private.can_staff_org(c.org_id)
        )
      )
  );
$$;

create or replace function private.can_facilitate_cohort(p_cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.cohorts c
    where c.id = p_cohort
      and (
        private.is_org_admin(c.org_id)
        or exists (
          select 1 from public.cohort_members m
          where m.cohort_id = c.id
            and m.user_id = (select auth.uid())
            and m.role = 'facilitator'
        )
      )
  );
$$;

revoke all on function private.can_staff_org(uuid) from public, anon;
revoke all on function private.can_see_cohort(uuid) from public, anon;
revoke all on function private.can_facilitate_cohort(uuid) from public, anon;
grant execute on function private.can_staff_org(uuid) to authenticated, service_role;
grant execute on function private.can_see_cohort(uuid) to authenticated, service_role;
grant execute on function private.can_facilitate_cohort(uuid) to authenticated, service_role;

create or replace function private.guard_cohort()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
       or new.org_id is distinct from old.org_id
       or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'cohort identity is fixed';
    end if;
    new.updated_at = now();
  end if;
  return new;
end;
$$;

create or replace function private.guard_cohort_thread()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.session_id is not null and not exists (
    select 1 from public.cohort_sessions s
    where s.id = new.session_id and s.cohort_id = new.cohort_id
  ) then
    raise exception 'session is not in this cohort';
  end if;
  if tg_op = 'UPDATE' then
    if new.cohort_id is distinct from old.cohort_id
       or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'thread identity is fixed';
    end if;
    if not private.can_facilitate_cohort(new.cohort_id) then
      if new.locked is distinct from old.locked or new.hidden is distinct from old.hidden then
        raise exception 'only a facilitator can moderate';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.guard_cohort_post()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  cohort uuid;
begin
  select t.cohort_id into cohort from public.cohort_threads t where t.id = new.thread_id;
  if cohort is null then
    raise exception 'unknown thread';
  end if;
  if tg_op = 'UPDATE' then
    if new.thread_id is distinct from old.thread_id
       or new.author_id is distinct from old.author_id
       or new.created_at is distinct from old.created_at then
      raise exception 'post identity is fixed';
    end if;
    new.updated_at = now();
    if not private.can_facilitate_cohort(cohort) then
      if new.hidden is distinct from old.hidden
         or new.hidden_reason is distinct from old.hidden_reason
         or new.hidden_by is distinct from old.hidden_by then
        raise exception 'only a facilitator can moderate';
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.guard_cohort() from public, anon, authenticated;
revoke all on function private.guard_cohort_thread() from public, anon, authenticated;
revoke all on function private.guard_cohort_post() from public, anon, authenticated;

drop trigger if exists cohorts_guard on public.cohorts;
create trigger cohorts_guard before update on public.cohorts
  for each row execute procedure private.guard_cohort();

drop trigger if exists cohort_threads_guard on public.cohort_threads;
create trigger cohort_threads_guard before insert or update on public.cohort_threads
  for each row execute procedure private.guard_cohort_thread();

drop trigger if exists cohort_posts_guard on public.cohort_posts;
create trigger cohort_posts_guard before insert or update on public.cohort_posts
  for each row execute procedure private.guard_cohort_post();

-- Cohorts
drop policy if exists "cohorts_select" on public.cohorts;
create policy "cohorts_select" on public.cohorts
  for select to authenticated
  using (private.can_see_cohort(id));

drop policy if exists "cohorts_insert" on public.cohorts;
create policy "cohorts_insert" on public.cohorts
  for insert to authenticated
  with check (created_by = (select auth.uid()) and private.can_staff_org(org_id));

drop policy if exists "cohorts_update" on public.cohorts;
create policy "cohorts_update" on public.cohorts
  for update to authenticated
  using (private.can_facilitate_cohort(id))
  with check (private.can_facilitate_cohort(id));

-- Members. Display names only; emails are not stored here.
drop policy if exists "cohort_members_select" on public.cohort_members;
create policy "cohort_members_select" on public.cohort_members
  for select to authenticated
  using (private.can_see_cohort(cohort_id));

drop policy if exists "cohort_members_insert_creator" on public.cohort_members;
create policy "cohort_members_insert_creator" on public.cohort_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'facilitator'
    and exists (
      select 1 from public.cohorts c
      where c.id = cohort_id
        and c.created_by = (select auth.uid())
        and private.can_staff_org(c.org_id)
    )
  );

drop policy if exists "cohort_members_insert_staff" on public.cohort_members;
create policy "cohort_members_insert_staff" on public.cohort_members
  for insert to authenticated
  with check (
    private.can_facilitate_cohort(cohort_id)
    and role in ('learner', 'facilitator')
    and exists (
      select 1
      from public.cohorts c
      join public.org_members om
        on om.org_id = c.org_id and om.user_id = cohort_members.user_id
      where c.id = cohort_members.cohort_id
    )
  );

drop policy if exists "cohort_members_delete" on public.cohort_members;
create policy "cohort_members_delete" on public.cohort_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or private.can_facilitate_cohort(cohort_id));

-- Sessions, including the join link, are part of the cohort.
drop policy if exists "cohort_sessions_select" on public.cohort_sessions;
create policy "cohort_sessions_select" on public.cohort_sessions
  for select to authenticated
  using (private.can_see_cohort(cohort_id));

drop policy if exists "cohort_sessions_write" on public.cohort_sessions;
create policy "cohort_sessions_write" on public.cohort_sessions
  for insert to authenticated
  with check (private.can_facilitate_cohort(cohort_id) and created_by = (select auth.uid()));

drop policy if exists "cohort_sessions_update" on public.cohort_sessions;
create policy "cohort_sessions_update" on public.cohort_sessions
  for update to authenticated
  using (private.can_facilitate_cohort(cohort_id))
  with check (private.can_facilitate_cohort(cohort_id));

drop policy if exists "cohort_sessions_delete" on public.cohort_sessions;
create policy "cohort_sessions_delete" on public.cohort_sessions
  for delete to authenticated
  using (private.can_facilitate_cohort(cohort_id));

-- Attendance: a learner sees their own mark. Facilitators and org admins see the session.
drop policy if exists "cohort_attendance_select" on public.cohort_attendance;
create policy "cohort_attendance_select" on public.cohort_attendance
  for select to authenticated
  using (
    (
      user_id = (select auth.uid())
      and exists (
        select 1 from public.cohort_sessions s
        where s.id = session_id and private.can_see_cohort(s.cohort_id)
      )
    )
    or exists (
      select 1 from public.cohort_sessions s
      where s.id = session_id and private.can_facilitate_cohort(s.cohort_id)
    )
  );

drop policy if exists "cohort_attendance_write" on public.cohort_attendance;
create policy "cohort_attendance_write" on public.cohort_attendance
  for insert to authenticated
  with check (
    marked_by = (select auth.uid())
    and exists (
      select 1
      from public.cohort_sessions s
      join public.cohort_members m on m.cohort_id = s.cohort_id and m.user_id = cohort_attendance.user_id
      where s.id = session_id and private.can_facilitate_cohort(s.cohort_id)
    )
  );

drop policy if exists "cohort_attendance_update" on public.cohort_attendance;
create policy "cohort_attendance_update" on public.cohort_attendance
  for update to authenticated
  using (
    exists (
      select 1 from public.cohort_sessions s
      where s.id = session_id and private.can_facilitate_cohort(s.cohort_id)
    )
  )
  with check (
    marked_by = (select auth.uid())
    and exists (
      select 1 from public.cohort_sessions s
      where s.id = session_id and private.can_facilitate_cohort(s.cohort_id)
    )
  );

-- Discussions. Hidden threads and posts are visible to facilitators and org admins only.
drop policy if exists "cohort_threads_select" on public.cohort_threads;
create policy "cohort_threads_select" on public.cohort_threads
  for select to authenticated
  using (
    private.can_see_cohort(cohort_id)
    and (not hidden or private.can_facilitate_cohort(cohort_id))
  );

drop policy if exists "cohort_threads_insert" on public.cohort_threads;
create policy "cohort_threads_insert" on public.cohort_threads
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and hidden = false
    and locked = false
    and private.can_see_cohort(cohort_id)
  );

drop policy if exists "cohort_threads_update" on public.cohort_threads;
create policy "cohort_threads_update" on public.cohort_threads
  for update to authenticated
  using (private.can_facilitate_cohort(cohort_id))
  with check (private.can_facilitate_cohort(cohort_id));

drop policy if exists "cohort_posts_select" on public.cohort_posts;
create policy "cohort_posts_select" on public.cohort_posts
  for select to authenticated
  using (
    exists (
      select 1 from public.cohort_threads t
      where t.id = thread_id
        and private.can_see_cohort(t.cohort_id)
        and (not t.hidden or private.can_facilitate_cohort(t.cohort_id))
        and (not cohort_posts.hidden or private.can_facilitate_cohort(t.cohort_id))
    )
  );

drop policy if exists "cohort_posts_insert" on public.cohort_posts;
create policy "cohort_posts_insert" on public.cohort_posts
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and hidden = false
    and exists (
      select 1 from public.cohort_threads t
      where t.id = thread_id
        and not t.locked
        and not t.hidden
        and private.can_see_cohort(t.cohort_id)
    )
  );

drop policy if exists "cohort_posts_update_author" on public.cohort_posts;
create policy "cohort_posts_update_author" on public.cohort_posts
  for update to authenticated
  using (
    author_id = (select auth.uid())
    and hidden = false
    and exists (
      select 1 from public.cohort_threads t
      where t.id = thread_id
        and not t.locked
        and not t.hidden
        and private.can_see_cohort(t.cohort_id)
    )
  )
  with check (author_id = (select auth.uid()) and hidden = false);

drop policy if exists "cohort_posts_update_moderator" on public.cohort_posts;
create policy "cohort_posts_update_moderator" on public.cohort_posts
  for update to authenticated
  using (
    exists (
      select 1 from public.cohort_threads t
      where t.id = thread_id and private.can_facilitate_cohort(t.cohort_id)
    )
  )
  with check (
    exists (
      select 1 from public.cohort_threads t
      where t.id = thread_id and private.can_facilitate_cohort(t.cohort_id)
    )
  );

revoke all on public.cohorts, public.cohort_members, public.cohort_sessions,
  public.cohort_attendance, public.cohort_threads, public.cohort_posts
  from anon;
grant select, insert, update, delete on public.cohorts, public.cohort_members,
  public.cohort_sessions, public.cohort_attendance, public.cohort_threads, public.cohort_posts
  to authenticated;
revoke delete on public.cohorts from authenticated;
