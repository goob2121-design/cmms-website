-- Cumberland Mountain Music public website schema
-- Run this in the SQL editor for the CMMS Supabase project.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values
  ('sponsor-logos', 'sponsor-logos', true),
  ('show-promos', 'show-promos', true),
  ('media-images', 'media-images', true),
  ('people-photos', 'people-photos', true)
on conflict (id) do update set
  public = excluded.public;

create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  show_date date not null,
  doors_time text,
  show_time text,
  end_time text,
  venue text,
  address text,
  advance_ticket_price text,
  door_ticket_price text,
  ticket_url text,
  details_url text,
  promo_image_url text,
  short_description text,
  full_details text,
  special_guests text,
  featured_text text,
  is_featured boolean default false,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.shows add column if not exists end_time text;
alter table public.shows add column if not exists advance_ticket_price text;
alter table public.shows add column if not exists door_ticket_price text;
alter table public.shows add column if not exists details_url text;
alter table public.shows add column if not exists special_guests text;
alter table public.shows add column if not exists featured_text text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shows_slug_format_check'
      and conrelid = 'public.shows'::regclass
  ) then
    alter table public.shows
    add constraint shows_slug_format_check
    check (slug ~ '^[a-z0-9-]+$');
  end if;
end;
$$;

alter table public.shows enable row level security;

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  website_url text,
  description text,
  sponsor_level text,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.show_sponsors (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references public.shows(id) on delete cascade,
  sponsor_id uuid references public.sponsors(id) on delete cascade,
  display_order int default 0,
  featured boolean default false,
  created_at timestamptz default now(),
  unique(show_id, sponsor_id)
);

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text unique not null,
  title text,
  body text,
  image_url text,
  email text,
  mailing_list_url text,
  venue_name text,
  venue_address text,
  updated_at timestamptz default now()
);

alter table public.site_pages add column if not exists email text;
alter table public.site_pages add column if not exists mailing_list_url text;
alter table public.site_pages add column if not exists venue_name text;
alter table public.site_pages add column if not exists venue_address text;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text,
  image_url text,
  published boolean default true,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  image_url text,
  video_url text,
  caption text,
  display_order int default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.people_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_type text not null check (profile_type in ('band', 'team')),
  name text not null,
  slug text unique,
  role_title text,
  instruments text,
  bio text,
  hobbies_interests text,
  photo_url text,
  facebook_url text,
  website_url text,
  display_order int default 0,
  active boolean default true,
  status text default 'draft' check (status in ('draft', 'published')),
  review_token text unique,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.people_profiles add column if not exists hobbies_interests text;

create table if not exists public.people_profile_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.people_profiles(id) on delete cascade,
  review_token text not null,
  submitted_name text,
  submitted_role_title text,
  submitted_instruments text,
  submitted_bio text,
  submitted_hobbies_interests text,
  submitted_facebook_url text,
  submitted_website_url text,
  submitted_photo_note text,
  submitted_at timestamptz default now(),
  status text default 'pending' check (status in ('pending', 'reviewed', 'applied', 'rejected'))
);

alter table public.people_profile_submissions
add column if not exists submitted_hobbies_interests text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sponsors_slug_format_check'
      and conrelid = 'public.sponsors'::regclass
  ) then
    alter table public.sponsors
    add constraint sponsors_slug_format_check
    check (slug is null or slug ~ '^[a-z0-9-]+$');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'news_posts_slug_format_check'
      and conrelid = 'public.news_posts'::regclass
  ) then
    alter table public.news_posts
    add constraint news_posts_slug_format_check
    check (slug ~ '^[a-z0-9-]+$');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'people_profiles_slug_format_check'
      and conrelid = 'public.people_profiles'::regclass
  ) then
    alter table public.people_profiles
    add constraint people_profiles_slug_format_check
    check (slug is null or slug ~ '^[a-z0-9-]+$');
  end if;
end;
$$;

alter table public.sponsors enable row level security;
alter table public.show_sponsors enable row level security;
alter table public.site_pages enable row level security;
alter table public.news_posts enable row level security;
alter table public.media_items enable row level security;
alter table public.people_profiles enable row level security;
alter table public.people_profile_submissions enable row level security;

drop policy if exists "Public visitors can read CMMS public images" on storage.objects;
create policy "Public visitors can read CMMS public images"
on storage.objects
for select
using (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos'));

drop policy if exists "Authenticated users can upload CMMS public images" on storage.objects;
create policy "Authenticated users can upload CMMS public images"
on storage.objects
for insert
to authenticated
with check (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos'));

drop policy if exists "Authenticated users can update CMMS public images" on storage.objects;
create policy "Authenticated users can update CMMS public images"
on storage.objects
for update
to authenticated
using (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos'))
with check (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos'));

drop policy if exists "Authenticated users can delete CMMS public images" on storage.objects;
create policy "Authenticated users can delete CMMS public images"
on storage.objects
for delete
to authenticated
using (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos'));

drop policy if exists "Public visitors can read published shows" on public.shows;
create policy "Public visitors can read published shows"
on public.shows
for select
using (published = true);

drop policy if exists "Authenticated users can read all shows" on public.shows;
create policy "Authenticated users can read all shows"
on public.shows
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert shows" on public.shows;
create policy "Authenticated users can insert shows"
on public.shows
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update shows" on public.shows;
create policy "Authenticated users can update shows"
on public.shows
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete shows" on public.shows;
create policy "Authenticated users can delete shows"
on public.shows
for delete
to authenticated
using (true);

drop policy if exists "Public visitors can read active sponsors" on public.sponsors;
create policy "Public visitors can read active sponsors"
on public.sponsors
for select
using (active = true);

drop policy if exists "Authenticated users can read all sponsors" on public.sponsors;
create policy "Authenticated users can read all sponsors"
on public.sponsors
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert sponsors" on public.sponsors;
create policy "Authenticated users can insert sponsors"
on public.sponsors
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update sponsors" on public.sponsors;
create policy "Authenticated users can update sponsors"
on public.sponsors
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete sponsors" on public.sponsors;
create policy "Authenticated users can delete sponsors"
on public.sponsors
for delete
to authenticated
using (true);

drop policy if exists "Public visitors can read show sponsors" on public.show_sponsors;
create policy "Public visitors can read show sponsors"
on public.show_sponsors
for select
using (true);

drop policy if exists "Authenticated users can read all show sponsors" on public.show_sponsors;
create policy "Authenticated users can read all show sponsors"
on public.show_sponsors
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert show sponsors" on public.show_sponsors;
create policy "Authenticated users can insert show sponsors"
on public.show_sponsors
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update show sponsors" on public.show_sponsors;
create policy "Authenticated users can update show sponsors"
on public.show_sponsors
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete show sponsors" on public.show_sponsors;
create policy "Authenticated users can delete show sponsors"
on public.show_sponsors
for delete
to authenticated
using (true);

drop policy if exists "Public visitors can read site pages" on public.site_pages;
create policy "Public visitors can read site pages"
on public.site_pages
for select
using (true);

drop policy if exists "Authenticated users can manage site pages" on public.site_pages;
create policy "Authenticated users can manage site pages"
on public.site_pages
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public visitors can read published news" on public.news_posts;
create policy "Public visitors can read published news"
on public.news_posts
for select
using (published = true);

drop policy if exists "Authenticated users can manage news" on public.news_posts;
create policy "Authenticated users can manage news"
on public.news_posts
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public visitors can read published media" on public.media_items;
create policy "Public visitors can read published media"
on public.media_items
for select
using (published = true);

drop policy if exists "Authenticated users can manage media" on public.media_items;
create policy "Authenticated users can manage media"
on public.media_items
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public visitors can read published people profiles" on public.people_profiles;
create policy "Public visitors can read published people profiles"
on public.people_profiles
for select
using (active = true and status = 'published');

drop policy if exists "Authenticated users can manage people profiles" on public.people_profiles;
create policy "Authenticated users can manage people profiles"
on public.people_profiles
for all
to authenticated
using (true)
with check (true);

create or replace function public.is_valid_people_review_token(
  requested_profile_id uuid,
  token_value text
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.people_profiles pp
    where pp.id = requested_profile_id
      and pp.review_token = token_value
      and pp.active = true
  );
$$;

grant execute on function public.is_valid_people_review_token(uuid, text) to anon;
grant execute on function public.is_valid_people_review_token(uuid, text) to authenticated;

drop policy if exists "Public review links can insert people submissions" on public.people_profile_submissions;
create policy "Public review links can insert people submissions"
on public.people_profile_submissions
for insert
with check (public.is_valid_people_review_token(profile_id, review_token));

drop policy if exists "Authenticated users can manage people submissions" on public.people_profile_submissions;
create policy "Authenticated users can manage people submissions"
on public.people_profile_submissions
for all
to authenticated
using (true)
with check (true);

create or replace function public.get_people_profile_for_review(
  requested_profile_type text,
  requested_slug text,
  token_value text
)
returns table (
  id uuid,
  profile_type text,
  name text,
  slug text,
  role_title text,
  instruments text,
  bio text,
  hobbies_interests text,
  photo_url text,
  facebook_url text,
  website_url text,
  display_order int,
  active boolean,
  status text,
  review_token text,
  reviewed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    pp.id,
    pp.profile_type,
    pp.name,
    pp.slug,
    pp.role_title,
    pp.instruments,
    pp.bio,
    pp.hobbies_interests,
    pp.photo_url,
    pp.facebook_url,
    pp.website_url,
    pp.display_order,
    pp.active,
    pp.status,
    pp.review_token,
    pp.reviewed_at,
    pp.created_at,
    pp.updated_at
  from public.people_profiles pp
  where pp.profile_type = requested_profile_type
    and pp.slug = requested_slug
    and pp.review_token = token_value
    and pp.active = true
  limit 1;
$$;

grant execute on function public.get_people_profile_for_review(text, text, text) to anon;
grant execute on function public.get_people_profile_for_review(text, text, text) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_shows_updated_at on public.shows;
create trigger set_shows_updated_at
before update on public.shows
for each row
execute function public.set_updated_at();

drop trigger if exists set_sponsors_updated_at on public.sponsors;
create trigger set_sponsors_updated_at
before update on public.sponsors
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_pages_updated_at on public.site_pages;
create trigger set_site_pages_updated_at
before update on public.site_pages
for each row
execute function public.set_updated_at();

drop trigger if exists set_news_posts_updated_at on public.news_posts;
create trigger set_news_posts_updated_at
before update on public.news_posts
for each row
execute function public.set_updated_at();

drop trigger if exists set_media_items_updated_at on public.media_items;
create trigger set_media_items_updated_at
before update on public.media_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_people_profiles_updated_at on public.people_profiles;
create trigger set_people_profiles_updated_at
before update on public.people_profiles
for each row
execute function public.set_updated_at();

insert into public.site_pages (page_key, title, body, image_url)
values
  ('about', 'The Cumberland Mountain Music Show', null, null),
  ('contact', 'Contact Cumberland Mountain Music', null, null)
on conflict (page_key) do nothing;

-- Optional seed examples. Re-running this block updates matching slugs.
insert into public.shows (
  title,
  slug,
  show_date,
  doors_time,
  show_time,
  end_time,
  venue,
  address,
  advance_ticket_price,
  door_ticket_price,
  ticket_url,
  details_url,
  promo_image_url,
  short_description,
  full_details,
  special_guests,
  featured_text,
  is_featured,
  published
) values
(
  'Cumberland Mountain Music Show',
  'june-20-2026',
  '2026-06-20',
  '6:00 PM',
  '7:00 PM',
  '9:00 PM',
  'Cumberland Gap Convention Center',
  'Cumberland Gap, TN 37724',
  '$8',
  '$10',
  'https://pinnaclestudiotn.com/event/6394938/748518290/cumberland-mountain-music-show',
  null,
  '/june-20-promo.png',
  'Family-friendly bluegrass, country, gospel, and traditional mountain music in Cumberland Gap.',
  'Join us Saturday, June 20th for another exciting night of live music at The Cumberland Mountain Music Show at the Cumberland Gap Convention Center! Featuring Bryan Turner and the Cumberland Mountain Music Show Band, along with special guest Kelly Caldwell and more, this show will be packed with bluegrass, country, gospel, mountain music, laughs, and great family entertainment.

Whether you are a longtime fan or planning your first visit, we would love to have you with us for an unforgettable evening of live music in the heart of Cumberland Gap.

Advance tickets are just $8 online or $10 at the door, and concessions will be available during the show.',
  'Kelly Caldwell',
  'Featuring Bryan Turner and the Cumberland Mountain Music Show Band with special guest Kelly Caldwell.',
  true,
  true
),
(
  'Cumberland Mountain Music Show',
  'august-15-2026',
  '2026-08-15',
  '6:00 PM',
  '7:00 PM',
  '9:00 PM',
  'Cumberland Gap Convention Center',
  'Cumberland Gap, TN 37724',
  '$8',
  '$10',
  'https://pinnaclestudiotn.com/event/6394941/748518295/cumberland-mountain-music-show',
  null,
  null,
  'Family-friendly bluegrass, country, gospel, and traditional mountain music in Cumberland Gap.',
  'The Cumberland Mountain Music Show is a family-friendly hometown stage show in Cumberland Gap featuring bluegrass, country, gospel, traditional mountain music, live band performances, comedy, and wholesome entertainment.',
  null,
  null,
  false,
  true
),
(
  'Cumberland Mountain Music Show',
  'october-3-2026',
  '2026-10-03',
  '6:00 PM',
  '7:00 PM',
  '9:00 PM',
  'Cumberland Gap Convention Center',
  'Cumberland Gap, TN 37724',
  '$8',
  '$10',
  'https://pinnaclestudiotn.com/event/6394948/748518307/cumberland-mountain-music-show',
  null,
  null,
  'Family-friendly bluegrass, country, gospel, and traditional mountain music in Cumberland Gap.',
  'The Cumberland Mountain Music Show is a family-friendly hometown stage show in Cumberland Gap featuring bluegrass, country, gospel, traditional mountain music, live band performances, comedy, and wholesome entertainment.',
  null,
  null,
  false,
  true
),
(
  'Cumberland Mountain Music Christmas Show',
  'december-12-2026-christmas-show',
  '2026-12-12',
  '6:00 PM',
  '7:00 PM',
  '9:00 PM',
  'Cumberland Gap Convention Center',
  'Cumberland Gap, TN 37724',
  '$8',
  '$10',
  'https://pinnaclestudiotn.com/event/6394950/748518309/cumberland-mountain-music-christmas-show',
  null,
  null,
  'A Christmas edition of The Cumberland Mountain Music Show.',
  'The Cumberland Mountain Music Christmas Show brings the same family-friendly hometown stage show spirit to the Christmas season with live music, laughter, and wholesome entertainment in Cumberland Gap.',
  null,
  'Christmas Show',
  false,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  show_date = excluded.show_date,
  doors_time = excluded.doors_time,
  show_time = excluded.show_time,
  end_time = excluded.end_time,
  venue = excluded.venue,
  address = excluded.address,
  advance_ticket_price = excluded.advance_ticket_price,
  door_ticket_price = excluded.door_ticket_price,
  ticket_url = excluded.ticket_url,
  details_url = excluded.details_url,
  promo_image_url = excluded.promo_image_url,
  short_description = excluded.short_description,
  full_details = excluded.full_details,
  special_guests = excluded.special_guests,
  featured_text = excluded.featured_text,
  is_featured = excluded.is_featured,
  published = excluded.published,
  updated_at = now();
