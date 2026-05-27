import { supabase } from "./client";

export type DbShow = {
  id: string;
  title: string;
  slug: string;
  show_date: string;
  doors_time: string | null;
  show_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  advance_ticket_price: string | null;
  door_ticket_price: string | null;
  ticket_url: string | null;
  details_url: string | null;
  promo_image_url: string | null;
  short_description: string | null;
  full_details: string | null;
  special_guests: string | null;
  featured_text: string | null;
  is_featured: boolean | null;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

const selectFields =
  "id,title,slug,show_date,doors_time,show_time,end_time,venue,address,advance_ticket_price,door_ticket_price,ticket_url,details_url,promo_image_url,short_description,full_details,special_guests,featured_text,is_featured,published,created_at,updated_at";

export async function getPublishedShows() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("shows")
    .select(selectFields)
    .eq("published", true)
    .order("show_date", { ascending: true });

  if (error) {
    console.warn("Unable to load Supabase shows:", error.message);
    return [];
  }

  return (data ?? []) as DbShow[];
}

export async function getNextPublishedShow() {
  if (!supabase) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("shows")
    .select(selectFields)
    .eq("published", true)
    .gte("show_date", today)
    .order("show_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Unable to load next Supabase show:", error.message);
    return null;
  }

  return data as DbShow | null;
}

export async function getPublishedShowBySlug(slug: string) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("shows")
    .select(selectFields)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.warn(`Unable to load Supabase show "${slug}":`, error.message);
    return null;
  }

  return data as DbShow | null;
}
