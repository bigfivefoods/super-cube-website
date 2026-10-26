-- Roll back Open Badges 3.0 credentials and facilitator-led cohorts.
-- Does not touch certificates, organisations, teams or verify_certificate().

drop trigger if exists cohort_posts_guard on public.cohort_posts;
drop trigger if exists cohort_threads_guard on public.cohort_threads;
drop trigger if exists cohorts_guard on public.cohorts;

drop table if exists public.cohort_posts;
drop table if exists public.cohort_threads;
drop table if exists public.cohort_attendance;
drop table if exists public.cohort_sessions;
drop table if exists public.cohort_members;
drop table if exists public.cohorts;

drop function if exists private.guard_cohort_post();
drop function if exists private.guard_cohort_thread();
drop function if exists private.guard_cohort();
drop function if exists private.can_facilitate_cohort(uuid);
drop function if exists private.can_see_cohort(uuid);
drop function if exists private.can_staff_org(uuid);

drop function if exists public.open_badge_credential(text);
drop table if exists public.open_badge_credentials;
