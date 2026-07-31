-- Seed programmes + $6 USD one-time plans
-- price stored in cents (600 = $6.00)

insert into public.programmes (id, name, age_label, age_min, age_max, tagline, description, sort_order) values
  ('kids', 'Super-Cube® Kids', 'Ages 5–12', 5, 12,
   'Growing character, curiosity, and kindness.',
   'A guided Super-Cube journey for younger learners—simple language, stories, play-based practice, and parent/teacher support.',
   1),
  ('adolescents', 'Super-Cube® Adolescents', 'Ages 13–21', 13, 21,
   'Identity, influence, and wise decisions.',
   'For teens and young adults navigating school, sport, first jobs, and digital life.',
   2),
  ('adults', 'Super-Cube® Adults', 'Ages 22+', 22, 99,
   'Human-centric leadership for work and life.',
   'The full professional Super-Cube pathway with assessment, courses, and personal report.',
   3)
on conflict (id) do update set
  name = excluded.name,
  age_label = excluded.age_label,
  tagline = excluded.tagline,
  description = excluded.description;

insert into public.subscription_plans (id, programme_id, name, price_zar, interval, paystack_plan_code, features) values
  -- price_zar column holds cents for the configured currency (USD cents here: 600 = $6)
  ('kids_once', 'kids', 'Kids · One-time access', 600, 'once', null,
   '["Pre-assessment","6 construct courses","Practice labs","Parent tips","Personal report"]'),
  ('adolescents_once', 'adolescents', 'Adolescents · One-time access', 600, 'once', null,
   '["Pre & post assessment","6 courses","Scenarios","Personal report"]'),
  ('adults_once', 'adults', 'Adults · One-time access', 600, 'once', null,
   '["Full leadership profile","6 construct courses","Workplace practice","Growth report"]')
on conflict (id) do update set
  price_zar = excluded.price_zar,
  name = excluded.name,
  interval = excluded.interval,
  features = excluded.features;
