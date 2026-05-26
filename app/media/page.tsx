import type { Metadata } from "next";
import { getPublishedMediaItems } from "@/lib/supabase/cms";

export const metadata: Metadata = {
  title: "Media | Cumberland Mountain Music",
  description:
    "Photos and videos from The Cumberland Mountain Music Show in Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "/media",
  },
};

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const mediaItems = await getPublishedMediaItems();
  const photos = mediaItems.filter((item) => item.media_type === "photo");
  const videos = mediaItems.filter((item) => item.media_type === "video");

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Media
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Photos & Videos
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          Moments from The Cumberland Mountain Music Show, shared for friends,
          families, fans, and visitors.
        </p>
      </section>

      {mediaItems.length === 0 ? (
        <section className="mt-10 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-[#d9c8aa] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          No media posted yet.
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-3xl font-semibold text-white">Photos</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/85 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-64 w-full object-cover"
                  />
                ) : null}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  {item.caption ? (
                    <p className="mt-3 leading-7 text-[#d9c8aa]">
                      {item.caption}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {videos.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-3xl font-semibold text-white">Videos</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {videos.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
              >
                <h3 className="text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                {item.caption ? (
                  <p className="mt-3 leading-7 text-[#d9c8aa]">
                    {item.caption}
                  </p>
                ) : null}
                {item.video_url ? (
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                  >
                    Watch Video
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
