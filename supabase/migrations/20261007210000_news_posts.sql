-- Super-Cube® News: admin-authored posts for /news, plus a public bucket for covers.
-- Additive only. Server-side access with the service role; RLS on, no public policies.

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 90),
  title text not null check (char_length(title) between 3 and 160),
  excerpt text not null default '' check (char_length(excerpt) <= 320),
  body text not null default '' check (char_length(body) <= 60000),
  tag text not null default 'News' check (char_length(tag) <= 60),
  status text not null default 'draft' check (status in ('draft', 'published')),
  cover_image text check (cover_image is null or cover_image ~ '^(https://|/)'),
  cover_wide text check (cover_wide is null or cover_wide ~ '^(https://|/)'),
  cover_alt text not null default '' check (char_length(cover_alt) <= 300),
  author text check (author is null or char_length(author) <= 80),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text
);

create index if not exists news_posts_published_idx
  on public.news_posts (published_at desc)
  where status = 'published';

alter table public.news_posts enable row level security;
revoke all on table public.news_posts from anon, authenticated;

comment on table public.news_posts is
  'Super-Cube® News posts written in the admin (/newsletter/admin?tab=news). Read and written server-side with the service role only.';
comment on column public.news_posts.body is 'Simple markdown (## headings, paragraphs, - lists, **bold**, *italic*, [links](/x), ![alt](https://…)).';

-- Public bucket for post images (covers and inline images). Files are uploaded
-- server-side by admins (service role); anyone can read them by URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-media', 'news-media', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
