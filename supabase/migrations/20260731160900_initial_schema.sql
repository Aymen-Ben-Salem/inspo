create extension if not exists citext with schema extensions;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  creator_name text not null,
  creator_handle text,
  creator_url text,
  creator_avatar_url text not null,
  description text not null,
  category text not null,
  industries text[] not null default '{}',
  colors text[] not null default '{}',
  styles text[] not null default '{}',
  source_url text not null,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint posts_title_not_blank check (length(trim(title)) > 0),
  constraint posts_category_valid check (
    category in ('Web', 'Branding', 'Product', 'Motion', 'Illustration', '3D', 'Print')
  ),
  constraint posts_status_valid check (status in ('draft', 'published')),
  constraint posts_published_at_required check (status = 'draft' or published_at is not null)
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  type text not null default 'image',
  url text not null,
  poster_url text,
  alt text not null default '',
  width integer not null,
  height integer not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint post_media_type_valid check (type in ('image', 'video')),
  constraint post_media_dimensions_valid check (width > 0 and height > 0),
  constraint post_media_position_valid check (position >= 0),
  constraint post_media_post_position_unique unique (post_id, position)
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique,
  source text not null default 'website',
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint subscribers_email_length check (length(email::text) between 3 and 254)
);

create index posts_published_at_idx
  on public.posts (published_at desc)
  where status = 'published';

create index posts_category_published_at_idx
  on public.posts (category, published_at desc)
  where status = 'published';

create index post_media_post_position_idx
  on public.post_media (post_id, position);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

revoke all on function public.set_updated_at() from public;

alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.subscribers enable row level security;

revoke all on table public.posts from anon, authenticated;
revoke all on table public.post_media from anon, authenticated;
revoke all on table public.subscribers from anon, authenticated;

grant select on table public.posts to anon, authenticated;
grant select on table public.post_media to anon, authenticated;

grant all on table public.posts to service_role;
grant all on table public.post_media to service_role;
grant all on table public.subscribers to service_role;

create policy "published posts are publicly readable"
on public.posts
for select
to anon, authenticated
using (status = 'published' and published_at <= now());

create policy "media for published posts is publicly readable"
on public.post_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_media.post_id
      and posts.status = 'published'
      and posts.published_at <= now()
  )
);
