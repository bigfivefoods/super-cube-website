-- Roll back LTI 1.3 / LTI Advantage tables.
-- Does not touch organisations, cohorts, org_members or certificates.

drop table if exists public.lti_grade_passes;
drop table if exists public.lti_launch_tokens;
drop table if exists public.lti_launches;
drop table if exists public.lti_user_links;
drop table if exists public.lti_contexts;
drop table if exists public.lti_login_states;
drop table if exists public.lti_platforms;
