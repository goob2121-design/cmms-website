import { supabase } from "./client";

export type SitePage = {
  id: string;
  page_key: string;
  title: string | null;
  subtitle: string | null;
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
  show_id: string | null;
  manual_show_title: string | null;
  manual_show_date: string | null;
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

export type MerchProduct = {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  product_url: string;
  display_order: number | null;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TickerMessage = {
  id: string;
  message: string;
  active: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value: string | null;
  updated_at: string | null;
};

export async function getSitePage(pageKey: "about" | "contact" | "homepage_about") {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("site_pages")
    .select(
      "id,page_key,title,subtitle,body,image_url,email,mailing_list_url,venue_name,venue_address,updated_at",
    )
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) {
    console.warn(`Unable to load ${pageKey} page content:`, error.message);
    return null;
  }

  return data as SitePage | null;
}

export async function getActiveTickerMessages() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("ticker_messages")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Unable to load ticker messages:", error.message);
    return [];
  }

  return (data ?? []) as TickerMessage[];
}

export async function getSiteSetting(settingKey: string) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("setting_key", settingKey)
    .maybeSingle();

  if (error) {
    console.warn(`Unable to load site setting "${settingKey}":`, error.message);
    return null;
  }

  return data as SiteSetting | null;
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

export async function getPublishedMediaItemsForShow(showId: string) {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("published", true)
    .eq("show_id", showId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Unable to load show media items:", error.message);
    return [];
  }

  return (data ?? []) as MediaItem[];
}

export async function getPublishedMerchProducts() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("merch_products")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Unable to load merch products:", error.message);
    return [];
  }

  return (data ?? []) as MerchProduct[];
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
