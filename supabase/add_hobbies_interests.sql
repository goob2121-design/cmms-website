-- Add optional hobbies/interests text to unified people profiles.
alter table public.people_profiles
add column if not exists hobbies_interests text;

alter table public.people_profile_submissions
add column if not exists submitted_hobbies_interests text;

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
