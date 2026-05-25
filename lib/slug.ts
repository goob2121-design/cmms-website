export const slugPattern = /^[a-z0-9-]+$/;

export function sanitizeSlugInput(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createShowSlug(title: string, showDate: string) {
  return slugify([title, showDate].filter(Boolean).join(" "));
}
