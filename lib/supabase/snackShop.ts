import { supabase } from "./client";

export type SnackShopSettings = {
  id: string;
  menu_image_url: string | null;
  menu_pdf_url: string | null;
  hot_food_image_url: string | null;
  desserts_image_url: string | null;
  drinks_image_url: string | null;
  intermission_image_url: string | null;
  special_text: string | null;
  mamaw_message: string | null;
  active: boolean | null;
  updated_at: string | null;
};

export async function getSnackShopSettings() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("snack_shop_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Unable to load snack shop settings:", error.message);
    return null;
  }

  return data as SnackShopSettings | null;
}
