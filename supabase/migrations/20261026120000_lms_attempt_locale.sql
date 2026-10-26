-- Additive: record the questionnaire language on an attempt.
-- The app writes the language in meta.locale (jsonb, already present). This column
-- is filled by a BEFORE INSERT trigger so existing inserts keep working, and so the
-- application does not have to name the column before this migration is applied.
-- Not applied to production from this change. Test on a Supabase branch only.

alter table public.lms_attempts
  add column if not exists locale text;

comment on column public.lms_attempts.locale is
  'Language the learner was reading (en, fr, ar, pt, sw, zu, af). Copied from meta.locale. Not used in scoring.';

create or replace function public.lms_attempts_set_locale()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.locale is null
     and new.meta is not null
     and new.meta->>'locale' in ('en', 'fr', 'ar', 'pt', 'sw', 'zu', 'af') then
    new.locale := new.meta->>'locale';
  end if;
  return new;
end;
$$;

drop trigger if exists lms_attempts_set_locale on public.lms_attempts;
create trigger lms_attempts_set_locale
  before insert on public.lms_attempts
  for each row execute procedure public.lms_attempts_set_locale();

revoke all on function public.lms_attempts_set_locale() from public;
revoke all on function public.lms_attempts_set_locale() from anon;
revoke all on function public.lms_attempts_set_locale() from authenticated;
