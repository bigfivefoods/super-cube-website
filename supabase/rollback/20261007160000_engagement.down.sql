-- Rollback for 20261007160000_engagement.sql
-- Streak rows and events written by lms_record_activity stay (they live in 008's tables).
drop function if exists public.lms_record_activity(uuid, text, text, text, numeric, date, jsonb);
drop table if exists public.push_subscriptions;
delete from public.badges b
 where b.id in ('first-session','baseline-set','streak-3','streak-7','streak-30','face-complete','pathway-complete')
   and not exists (select 1 from public.learner_badges lb where lb.badge_id = b.id);
