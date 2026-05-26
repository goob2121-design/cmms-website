import { supabase } from "./client";

export type SitePage = {
  id: string;
  page_key: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  email: string | null;
  mailing_list_url: string | null;
  venue_name: string | null;
  venue_address: string | null;
  updated_at: string | null;
};

export type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type MediaItem = {
  id: string;
  title: string;
  media_type: "photo" | "video";
  image_url: string | null;
  video_url: string | null;
  caption: string | null;
  display_order: number | null;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getSitePage(pageKey: "about" | "contact") {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("site_pages")
    .select(
      "id,page_key,title,body,image_url,email,mailing_list_url,venue_name,venue_address,updated_at",
    )
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) {
    console.warn(`Unable to load ${pageKey} page content:`, error.message);
    return null;
  }

  return data as SitePage | null;
}

export async function getPublishedNewsPosts() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("Unable to load news posts:", error.message);
    return [];
  }

  return (data ?? []) as NewsPost[];
}

export async function getPublishedNewsPostBySlug(slug: string) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.warn(`Unable to load news post "${slug}":`, error.message);
    return null;
  }

  return data as NewsPost | null;
}

export async function getPublishedMediaItems() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to load media items:", error.message);
    return [];
  }

  return (data ?? []) as MediaItem[];
}

export async function hasPublishedNews() {
  if (!supabase) {
    return false;
  }

  const { count, error } = await supabase
    .from("news_posts")
    .select("id", { count: "exact", head: true })
    .eq("published", true);

  return !error && Boolean(count && count > 0);
}

export async function hasPublishedMedia() {
  if (!supabase) {
    return false;
  }

  const { count, error } = await supabase
    .from("media_items")
    .select("id", { count: "exact", head: true })
    .eq("published", true);

  return !error && Boolean(count && count > 0);
}
