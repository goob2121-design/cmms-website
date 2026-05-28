import type { MetadataRoute } from "next";

const baseUrl = "https://cumberlandmountainmusic.com";

const routes = [
  { path: "/", priority: 1 },
  { path: "/show-dates", priority: 0.9 },
  { path: "/show-dates/june-20-2026", priority: 0.85 },
  { path: "/about", priority: 0.8 },
  { path: "/meet-the-band", priority: 0.75 },
  { path: "/meet-the-team", priority: 0.72 },
  { path: "/news", priority: 0.65 },
  { path: "/media", priority: 0.65 },
  { path: "/sponsors", priority: 0.7 },
  { path: "/become-a-sponsor", priority: 0.68 },
  { path: "/snack-shop", priority: 0.68 },
  { path: "/in-memory", priority: 0.62 },
  { path: "/contact", priority: 0.7 },
  { path: "/mailing-list", priority: 0.65 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: new Date("2026-05-25"),
    changeFrequency: "monthly",
    priority: route.priority,
  }));
}
