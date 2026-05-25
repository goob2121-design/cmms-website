-- Cumberland Mountain Music public website schema
-- Run this in the SQL editor for the CMMS Supabase project.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values
  ('sponsor-logos', 'sponsor-logos', true),
  ('show-promos', 'show-promos', true)
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

alter table public.sponsors enable row level security;
alter table public.show_sponsors enable row level security;

drop policy if exists "Public visitors can read CMMS public images" on storage.objects;
create policy "Public visitors can read CMMS public images"
on storage.objects
for select
using (bucket_id in ('sponsor-logos', 'show-promos'));

drop policy if exists "Authenticated users can upload CMMS public images" on storage.objects;
create policy "Authenticated users can upload CMMS public images"
on storage.objects
for insert
to authenticated
with check (bucket_id in ('sponsor-logos', 'show-promos'));

drop policy if exists "Authenticated users can update CMMS public images" on storage.objects;
create policy "Authenticated users can update CMMS public images"
on storage.objects
for update
to authenticated
using (bucket_id in ('sponsor-logos', 'show-promos'))
with check (bucket_id in ('sponsor-logos', 'show-promos'));

drop policy if exists "Authenticated users can delete CMMS public images" on storage.objects;
create policy "Authenticated users can delete CMMS public images"
on storage.objects
for delete
to authenticated
using (bucket_id in ('sponsor-logos', 'show-promos'));

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
