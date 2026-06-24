-- Cumberland Mountain Music public website schema
-- Run this in the SQL editor for the CMMS Supabase project.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values
  ('sponsor-logos', 'sponsor-logos', true),
  ('show-promos', 'show-promos', true),
  ('media-images', 'media-images', true),
  ('people-photos', 'people-photos', true),
  ('snack-shop', 'snack-shop', true),
  ('people-submissions', 'people-submissions', true)
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
  reserved_seating_url text,
  tickets_available boolean default true,
  sold_out_message text,
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
alter table public.shows add column if not exists reserved_seating_url text;
alter table public.shows add column if not exists tickets_available boolean default true;
alter table public.shows add column if not exists sold_out_message text;
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
  display_order int default 0,
  show_on_homepage boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.sponsors add column if not exists display_order int default 0;
alter table public.sponsors add column if not exists show_on_homepage boolean default false;

create table if not exists public.show_sponsors (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references public.shows(id) on delete cascade,
  sponsor_id uuid references public.sponsors(id) on delete cascade,
  display_order int default 0,
  featured boolean default false,
  created_at timestamptz default now(),
  unique(show_id, sponsor_id)
);

create table if not exists public.sponsor_inquiries (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  contact_name text not null,
  email text not null,
  phone text,
  sponsor_interest text,
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'follow-up', 'closed')),
  created_at timestamptz default now()
);

create table if not exists public.snack_shop_settings (
  id uuid primary key default gen_random_uuid(),
  menu_image_url text,
  menu_pdf_url text,
  hot_food_image_url text,
  desserts_image_url text,
  drinks_image_url text,
  intermission_image_url text,
  special_text text,
  mamaw_message text,
  active boolean default true,
  updated_at timestamptz default now()
);

alter table public.snack_shop_settings add column if not exists hot_food_image_url text;
alter table public.snack_shop_settings add column if not exists desserts_image_url text;
alter table public.snack_shop_settings add column if not exists drinks_image_url text;
alter table public.snack_shop_settings add column if not exists intermission_image_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sponsor_inquiries_status_check'
      and conrelid = 'public.sponsor_inquiries'::regclass
  ) then
    alter table public.sponsor_inquiries
    add constraint sponsor_inquiries_status_check
    check (status in ('new', 'contacted', 'follow-up', 'closed'));
  end if;
end;
$$;

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text unique not null,
  title text,
  subtitle text,
  body text,
  image_url text,
  email text,
  mailing_list_url text,
  venue_name text,
  venue_address text,
  updated_at timestamptz default now()
);

alter table public.site_pages add column if not exists subtitle text;
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
  show_id uuid references public.shows(id) on delete set null,
  manual_show_title text,
  manual_show_date date,
  title text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  image_url text,
  thumbnail_url text,
  video_url text,
  caption text,
  display_order int default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.media_items add column if not exists show_id uuid references public.shows(id) on delete set null;
alter table public.media_items add column if not exists manual_show_title text;
alter table public.media_items add column if not exists manual_show_date date;
alter table public.media_items add column if not exists thumbnail_url text;

create table if not exists public.merch_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price text,
  image_url text,
  product_url text not null,
  display_order int default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'merch_products_product_url_key'
      and conrelid = 'public.merch_products'::regclass
  ) then
    alter table public.merch_products
    add constraint merch_products_product_url_key
    unique (product_url);
  end if;
end;
$$;

create table if not exists public.ticker_messages (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  active boolean default true,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value text,
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
  photo_display_mode text default 'show' check (photo_display_mode in ('show', 'hide', 'coming_soon')),
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
alter table public.people_profiles add column if not exists photo_display_mode text default 'show';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'people_profiles_photo_display_mode_check'
      and conrelid = 'public.people_profiles'::regclass
  ) then
    alter table public.people_profiles
    add constraint people_profiles_photo_display_mode_check
    check (photo_display_mode in ('show', 'hide', 'coming_soon'));
  end if;
end;
$$;

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
  submitted_photo_url text,
  submitted_at timestamptz default now(),
  status text default 'pending' check (status in ('pending', 'reviewed', 'applied', 'rejected'))
);

alter table public.people_profile_submissions
add column if not exists submitted_hobbies_interests text;

alter table public.people_profile_submissions
add column if not exists submitted_photo_url text;

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
alter table public.sponsor_inquiries enable row level security;
alter table public.snack_shop_settings enable row level security;
alter table public.site_pages enable row level security;
alter table public.news_posts enable row level security;
alter table public.media_items enable row level security;
alter table public.merch_products enable row level security;
alter table public.ticker_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.people_profiles enable row level security;
alter table public.people_profile_submissions enable row level security;

drop policy if exists "Public visitors can read CMMS public images" on storage.objects;
create policy "Public visitors can read CMMS public images"
on storage.objects
for select
using (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos', 'snack-shop'));

drop policy if exists "Authenticated users can upload CMMS public images" on storage.objects;
create policy "Authenticated users can upload CMMS public images"
on storage.objects
for insert
to authenticated
with check (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos', 'snack-shop'));

drop policy if exists "Authenticated users can update CMMS public images" on storage.objects;
create policy "Authenticated users can update CMMS public images"
on storage.objects
for update
to authenticated
using (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos', 'snack-shop'))
with check (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos', 'snack-shop'));

drop policy if exists "Authenticated users can delete CMMS public images" on storage.objects;
create policy "Authenticated users can delete CMMS public images"
on storage.objects
for delete
to authenticated
using (bucket_id in ('sponsor-logos', 'show-promos', 'media-images', 'people-photos', 'snack-shop'));

drop policy if exists "Public visitors can read people submission photos" on storage.objects;
create policy "Public visitors can read people submission photos"
on storage.objects
for select
using (bucket_id = 'people-submissions');

drop policy if exists "Review visitors can upload people submission photos" on storage.objects;
create policy "Review visitors can upload people submission photos"
on storage.objects
for insert
with check (
  bucket_id = 'people-submissions'
  and name ~* '\.(jpe?g|png|webp)$'
);

drop policy if exists "Authenticated users can manage people submission photos" on storage.objects;
create policy "Authenticated users can manage people submission photos"
on storage.objects
for all
to authenticated
using (bucket_id = 'people-submissions')
with check (bucket_id = 'people-submissions');

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

drop policy if exists "Public visitors can insert sponsor inquiries" on public.sponsor_inquiries;
create policy "Public visitors can insert sponsor inquiries"
on public.sponsor_inquiries
for insert
with check (true);

drop policy if exists "Authenticated users can read sponsor inquiries" on public.sponsor_inquiries;
create policy "Authenticated users can read sponsor inquiries"
on public.sponsor_inquiries
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update sponsor inquiries" on public.sponsor_inquiries;
create policy "Authenticated users can update sponsor inquiries"
on public.sponsor_inquiries
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete sponsor inquiries" on public.sponsor_inquiries;
create policy "Authenticated users can delete sponsor inquiries"
on public.sponsor_inquiries
for delete
to authenticated
using (true);

drop policy if exists "Public visitors can read snack shop settings" on public.snack_shop_settings;
create policy "Public visitors can read snack shop settings"
on public.snack_shop_settings
for select
using (true);

drop policy if exists "Authenticated users can manage snack shop settings" on public.snack_shop_settings;
create policy "Authenticated users can manage snack shop settings"
on public.snack_shop_settings
for all
to authenticated
using (true)
with check (true);

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

drop policy if exists "Public visitors can read published merch products" on public.merch_products;
create policy "Public visitors can read published merch products"
on public.merch_products
for select
using (published = true);

drop policy if exists "Authenticated users can manage merch products" on public.merch_products;
create policy "Authenticated users can manage merch products"
on public.merch_products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public visitors can read active ticker messages" on public.ticker_messages;
create policy "Public visitors can read active ticker messages"
on public.ticker_messages
for select
using (active = true);

drop policy if exists "Authenticated users can manage ticker messages" on public.ticker_messages;
create policy "Authenticated users can manage ticker messages"
on public.ticker_messages
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public visitors can read site settings" on public.site_settings;
create policy "Public visitors can read site settings"
on public.site_settings
for select
using (true);

drop policy if exists "Authenticated users can manage site settings" on public.site_settings;
create policy "Authenticated users can manage site settings"
on public.site_settings
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
  photo_display_mode text,
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
    pp.photo_display_mode,
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

drop trigger if exists set_merch_products_updated_at on public.merch_products;
create trigger set_merch_products_updated_at
before update on public.merch_products
for each row
execute function public.set_updated_at();

drop trigger if exists set_ticker_messages_updated_at on public.ticker_messages;
create trigger set_ticker_messages_updated_at
before update on public.ticker_messages
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_snack_shop_settings_updated_at on public.snack_shop_settings;
create trigger set_snack_shop_settings_updated_at
before update on public.snack_shop_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_people_profiles_updated_at on public.people_profiles;
create trigger set_people_profiles_updated_at
before update on public.people_profiles
for each row
execute function public.set_updated_at();

insert into public.ticker_messages (message, display_order, active)
select seed.message, seed.display_order, true
from (
  values
    ('★ June 20th • Cumberland Gap Convention Center • Doors Open 6PM • Show Starts 7PM', 10),
    ('◆ Featuring Bryan Turner & The Cumberland Mountain Music Show Band', 20),
    ('★ Special Guest Kelly Caldwell • More Guests To Be Announced', 30),
    ('◆ Advance Tickets $8 Online • $10 At The Door', 40),
    ('★ Bluegrass • Gospel • Country • Traditional Mountain Music', 50),
    ('◆ Family Friendly Entertainment For All Ages', 60),
    ('★ The #1 Live Music Show in the Tri-State Area', 70),
    ('◆ Visit CumberlandMountainMusic.com For Tickets & Show Info', 80)
) as seed(message, display_order)
where not exists (
  select 1
  from public.ticker_messages existing
  where existing.message = seed.message
);

insert into public.site_settings (setting_key, setting_value)
values ('homepage_ticker_speed', '30')
on conflict (setting_key) do nothing;

insert into public.site_settings (setting_key, setting_value)
values
  ('homepage_hero_tagline', 'The #1 Live Music Show in the Tri-State Area'),
  ('homepage_hero_genres', 'Bluegrass • Gospel • Country • Traditional Mountain Music')
on conflict (setting_key) do nothing;

insert into public.site_settings (setting_key, setting_value)
values
  ('show_meet_the_band', 'false'),
  ('show_meet_the_team', 'false')
on conflict (setting_key) do nothing;

insert into public.site_settings (setting_key, setting_value)
values
  ('meet_the_band_feature_image', '/cartoon-band.jpg'),
  ('meet_the_band_feature_title', null),
  ('meet_the_band_feature_subtitle', null)
on conflict (setting_key) do nothing;

insert into public.merch_products (
  title,
  description,
  price,
  image_url,
  product_url,
  display_order,
  published
)
values
  (
    'Cumberland Mountain Music T-Shirt',
    'A comfortable everyday shirt for show nights, road trips, and fans of live mountain music.',
    '$12.50',
    'https://imgproxy.fourthwall.dev/czSyHhgJrQ0lnH_yzeHkfS2VAvNYxBekuZJniA-Y3cY/w:1200/sm:1/enc/6HRBAwQBl41_soMC/Ji3kohTAzNZACK7R/3j0uqWKW_0Lg4rK_/YLINWpSzvq335hn9/BoJH7e-nP-Ntx31l/NoXiERu-bQy8Bjk3/PfnEDLWCiu7tmZue/DOseZEkNNRY_m0hn/J2h8lISYHCmujxaX/-3R38g25o2oxM1Di/Rt9IVq24E2zKzrST/0XeeFNZ5bHXA7eax/0IG9F_wq8xkS0qsw/akWb_mcWLu7LaZfg/FC2Afm_QTTc.png',
    'https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-t',
    0,
    true
  ),
  (
    'Cumberland Mountain Music Band T-Shirt',
    'A band-style shirt for folks who want a little more stage-night energy in their merch.',
    '$18.45',
    'https://imgproxy.fourthwall.dev/ExUlfWThtC1MMjwHmhy4ahvBGQw7qokzJEAxE4HZm2Y/w:1200/sm:1/enc/t3Ar5QXnKxBL8Oek/Ag4Pmuvs1fGGLYB1/Xzg-WZTebcUQBKzB/Nv2LiIMyk7u7swA3/Uw92XYJHRy18e6ll/TYU3SBl5aXcpcPP0/DLowmOIJdxl8-dOL/9wMBNkGefGNkTkcT/qM3GP20q0SwVMxvg/cvfnAMnLG4Hr3wx_/HWFM2UCC3ucKbYjK/ZWhsn4jYKXLssiNI/fYN8JjM_L8cNzwQg/fOhwsUUVqNnD22EF/y2RVENh5XqM.png',
    'https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-band-t',
    1,
    true
  ),
  (
    'Cumberland Mountain Music Hat',
    'A classic cap with Cumberland Mountain Music style for the show, the porch, or the road.',
    '$18.65',
    'https://imgproxy.fourthwall.dev/0ki2r8-6S7UPiShWNcqDkw74BveqF5ufLugOFbQrA64/w:1200/sm:1/enc/KumBAeD-XXR7f6L_/sZjzR2BWVHFFn3HK/a4hbBuhAa4Z6jG2u/f-YIzt2cYgQ4HlFM/m8LueAsuk3VNo7iU/FVb3ax_Axzk4Js9_/m46bqolXe_4gUEGB/wk7yWYegnn0goxZr/lDZ12zOn1goNHZib/Po9IHTYaytN7WA9K/wKlPlk0PexhtbVvh/j_ON2ng2As63dh4y/I0-2j0rEEh8PJEJJ/d5-JqMULlNhlkvra/_JrcKdFeD14.png',
    'https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-hat',
    2,
    true
  ),
  (
    'Cumberland Mountain Music Trucker Hat',
    'A breathable trucker hat made for long days, live music, and Cumberland Gap pride.',
    '$15.95',
    'https://imgproxy.fourthwall.dev/br5NzGORwIdtF8EuXC_3jsq5qK0vAKEOqzZyT-S3lKw/w:1200/sm:1/enc/hGitBjaJi7F8tGwr/6bKc9jEe_rX3Fa-_/joAr7clHxMOoWyRq/LGxeSxF6FHrsJYMQ/_2rYABVlQq59eGq-/k13lQtdxkFX5H0nJ/5MhQaCrJ0-TsZz-H/FrgJLVuLCgDLVPrj/QFjssApFm7uaIZXC/pweGLX0t-ba_SVuu/0WnfaA4dRuNHxpin/Q9SrSOYDt8m3SaWr/PFLzBBCI1Ir099lS/MrEes7Q3jRQQ3LPR/g0J4Zb5nNo0.png',
    'https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-trucker-hat',
    3,
    true
  ),
  (
    'Cumberland Mountain Music Hoodie',
    'A cozy hoodie for cool evenings, festival weather, and staying warm between sets.',
    '$31.00',
    'https://imgproxy.fourthwall.dev/5tC5KZB-Zg3PvurwkoxSv9mNPH56aV3t2MhZJVngJZg/w:1200/sm:1/enc/nSsPMw6Aj09JSkeq/jn8e-vIZJCH_JtDr/v7tisk0Y99vdTxBy/qVygzir12eybOGq9/j75nZXWVVTlGnXVO/AyqYNm92MJHFaiAP/rLBaR4jSKMYWQ19k/P8NDkUaHTYjQGChb/74Xh2e2WXZVgYle_/1ejHAhf2TrRF5yb9/V7pR8s2Chbw5LQ6F/fsj7Ee-aRseoXIYa/FFZH6KY7jmYs3AMI/FuIELUy8zNd5pTpj/XUPl8fddtg0.png',
    'https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-hoodie',
    4,
    true
  ),
  (
    'Cumberland Mountain Music Coffee Mug',
    'A sturdy mug for morning coffee, late-night picking sessions, and everyday support.',
    '$11.95',
    'https://imgproxy.fourthwall.dev/JHlcaV8r6E6SIpsygWF2fmMQjGn3yLKnXc7fHJSRWL4/w:1200/sm:1/enc/zPx-coDQ-wAMsEX2/0qTojKo_8OsyD940/9YFrsholBipyCHWT/pGKi-8y-aU3C1Uv4/uZb6gvzxz_bl6qyd/RHA_3gas1xKSCA4I/NMXUgCqAV3oCTbhM/ekYKEHlQEypnx7qN/XeDuiwLsAJLqbj3D/J5ul4izlL49Wt-Ll/v4JnJBZmu8nVCOON/3PCRtpry3F1HLIqV/rGnKmoeUeOCWTEWo/Qa4r35K49NLfam7k/2gVDZQVRIZQ.png',
    'https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-coffee-mug',
    5,
    true
  )
on conflict (product_url) do update set
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  display_order = excluded.display_order,
  published = excluded.published;

insert into public.snack_shop_settings (
  menu_image_url,
  menu_pdf_url,
  special_text,
  mamaw_message,
  active
)
select
  null,
  null,
  null,
  'Yes, Mamaw probably WILL ask if you want extra butter.',
  true
where not exists (
  select 1 from public.snack_shop_settings
);

insert into public.site_pages (page_key, title, subtitle, body, image_url)
values
  ('about', 'The Cumberland Mountain Music Show', null, null, null),
  ('contact', 'Contact Cumberland Mountain Music', null, null, null),
  (
    'homepage_about',
    'About The Show',
    'Built for families, stories, and real live music.',
    'The Cumberland Mountain Music Show was created by Bryan Turner as a place to celebrate the music, stories, and people that make this region special. Built around bluegrass, gospel, country, and traditional mountain music, the show brings families together for an evening of live entertainment in the heart of Cumberland Gap.',
    null
  )
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
  reserved_seating_url,
  tickets_available,
  sold_out_message,
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
  'https://square.link/u/mzWHWprw',
  null,
  true,
  null,
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
  'https://stageflow.cumberlandmountainmusic.com/available-seats',
  true,
  null,
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
  true,
  null,
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
  true,
  null,
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
  ticket_url = coalesce(public.shows.ticket_url, excluded.ticket_url),
  reserved_seating_url = coalesce(public.shows.reserved_seating_url, excluded.reserved_seating_url),
  tickets_available = coalesce(public.shows.tickets_available, excluded.tickets_available),
  sold_out_message = coalesce(public.shows.sold_out_message, excluded.sold_out_message),
  details_url = excluded.details_url,
  promo_image_url = excluded.promo_image_url,
  short_description = excluded.short_description,
  full_details = excluded.full_details,
  special_guests = excluded.special_guests,
  featured_text = excluded.featured_text,
  is_featured = excluded.is_featured,
  published = excluded.published,
  updated_at = now();
