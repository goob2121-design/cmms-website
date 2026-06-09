import { supabase } from "./client";
import { getSponsorLevelRank } from "@/lib/sponsorLevels";

export type DbSponsor = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  sponsor_level: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  display_order: number | null;
  show_on_homepage: boolean | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PublicSponsor = Pick<
  DbSponsor,
  | "id"
  | "name"
  | "slug"
  | "logo_url"
  | "website_url"
  | "description"
  | "sponsor_level"
  | "display_order"
  | "show_on_homepage"
  | "active"
>;

type ShowSponsorRow = {
  sponsor_id: string;
  display_order: number | null;
  featured: boolean | null;
};

const publicSponsorFields =
  "id,name,slug,logo_url,website_url,description,sponsor_level,display_order,show_on_homepage,active";

function compareSponsors(a: PublicSponsor, b: PublicSponsor) {
  return (
    (a.display_order ?? 0) - (b.display_order ?? 0) ||
    getSponsorLevelRank(a.sponsor_level) - getSponsorLevelRank(b.sponsor_level) ||
    a.name.localeCompare(b.name)
  );
}

export async function getActiveSponsors() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sponsors")
    .select(publicSponsorFields)
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.warn("Unable to load Supabase sponsors:", error.message);
    return [];
  }

  return ((data ?? []) as PublicSponsor[]).sort(compareSponsors);
}

export async function getHomepageSponsors() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sponsors")
    .select(publicSponsorFields)
    .eq("active", true)
    .eq("show_on_homepage", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.warn("Unable to load homepage sponsors:", error.message);
    return [];
  }

  return ((data ?? []) as PublicSponsor[]).sort(compareSponsors);
}

export async function getActiveSponsorsForShow(showId: string) {
  if (!supabase) {
    return [];
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("show_sponsors")
    .select("sponsor_id,display_order,featured")
    .eq("show_id", showId)
    .order("display_order", { ascending: true });

  if (assignmentError) {
    console.warn("Unable to load show sponsor assignments:", assignmentError.message);
    return [];
  }

  const rows = (assignments ?? []) as ShowSponsorRow[];
  const sponsorIds = rows.map((row) => row.sponsor_id);

  if (sponsorIds.length === 0) {
    return [];
  }

  const { data: sponsors, error: sponsorError } = await supabase
    .from("sponsors")
    .select(publicSponsorFields)
    .eq("active", true)
    .in("id", sponsorIds);

  if (sponsorError) {
    console.warn("Unable to load sponsors for show:", sponsorError.message);
    return [];
  }

  const sponsorsById = new Map(
    ((sponsors ?? []) as PublicSponsor[]).map((sponsor) => [sponsor.id, sponsor]),
  );

  return rows
    .map((row) => ({
      assignmentOrder: row.display_order ?? 0,
      sponsor: sponsorsById.get(row.sponsor_id),
    }))
    .filter(
      (item): item is { assignmentOrder: number; sponsor: PublicSponsor } =>
        Boolean(item.sponsor),
    )
    .sort(
      (a, b) =>
        a.assignmentOrder - b.assignmentOrder ||
        compareSponsors(a.sponsor, b.sponsor),
    )
    .map((item) => item.sponsor);
}
