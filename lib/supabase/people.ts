import { supabase } from "./client";

export type ProfileType = "band" | "team";

export type PeopleProfile = {
  id: string;
  profile_type: ProfileType;
  name: string;
  slug: string | null;
  role_title: string | null;
  instruments: string | null;
  bio: string | null;
  hobbies_interests: string | null;
  photo_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  display_order: number | null;
  active: boolean | null;
  status: "draft" | "published" | null;
  review_token: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PeopleProfileSubmission = {
  id: string;
  profile_id: string;
  review_token: string;
  submitted_name: string | null;
  submitted_role_title: string | null;
  submitted_instruments: string | null;
  submitted_bio: string | null;
  submitted_hobbies_interests: string | null;
  submitted_facebook_url: string | null;
  submitted_website_url: string | null;
  submitted_photo_note: string | null;
  submitted_at: string | null;
  status: "pending" | "reviewed" | "applied" | "rejected" | null;
};

export async function getPublishedPeopleProfiles(profileType: ProfileType) {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("people_profiles")
    .select("*")
    .eq("profile_type", profileType)
    .eq("active", true)
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.warn(`Unable to load ${profileType} profiles:`, error.message);
    return [];
  }

  return (data ?? []) as PeopleProfile[];
}

export async function hasPublishedPeopleProfiles(profileType: ProfileType) {
  if (!supabase) {
    return false;
  }

  const { count, error } = await supabase
    .from("people_profiles")
    .select("id", { count: "exact", head: true })
    .eq("profile_type", profileType)
    .eq("active", true)
    .eq("status", "published");

  return !error && Boolean(count && count > 0);
}

export async function getPublishedPeopleProfileBySlug(
  profileType: ProfileType,
  slug: string,
) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("people_profiles")
    .select("*")
    .eq("profile_type", profileType)
    .eq("slug", slug)
    .eq("active", true)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.warn(`Unable to load ${profileType} profile "${slug}":`, error.message);
    return null;
  }

  return data as PeopleProfile | null;
}

export async function getPeopleProfileForReview(
  profileType: ProfileType,
  slug: string,
  reviewToken: string,
) {
  if (!supabase || !reviewToken) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_people_profile_for_review", {
    requested_profile_type: profileType,
    requested_slug: slug,
    token_value: reviewToken,
  });

  if (error) {
    console.warn(`Unable to load review profile "${slug}":`, error.message);
    return null;
  }

  return Array.isArray(data) && data.length > 0
    ? (data[0] as PeopleProfile)
    : null;
}
