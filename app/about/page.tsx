import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createPublicPageMetadata } from "@/lib/metadata";
import { getSitePage } from "@/lib/supabase/cms";

export const metadata: Metadata = createPublicPageMetadata({
  title: "About | Cumberland Mountain Music",
  description:
    "Learn about The Cumberland Mountain Music Show in Cumberland Gap, Tennessee, founded and hosted by Bryan Turner.",
  path: "/about",
  image: "/cmms-people-saying.png",
});

const fallbackBody = `The Cumberland Mountain Music Show grew out of a desire to create a family-friendly stage show that celebrates the musical heritage of the Cumberland Gap region. Founded and hosted by Bryan Turner, the show brings together bluegrass, gospel, country, and traditional mountain music in a format that feels welcoming, local, and rooted in the stories of the people who live here.

Each show is built to highlight talented musicians, special guests, and the kind of songs that have been passed down through families, churches, jam sessions, front porches, and stages across Appalachia. The goal is simple: give people a place to gather, laugh, remember, sing along, and enjoy real live music together.

The Cumberland Mountain Music Show is held at the Cumberland Gap Convention Center in Cumberland Gap, Tennessee.`;

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await getSitePage("about");
  const title = page?.title?.trim() || "The Cumberland Mountain Music Show";
  const body = page?.body?.trim() || fallbackBody;
  const imageUrl = page?.image_url?.trim() || "/cmms-people-saying.png";

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="overflow-hidden rounded-lg border border-[#d7a84f]/25 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          {imageUrl.startsWith("/") ? (
            <Image
              src={imageUrl}
              alt="Cumberland Mountain Music"
              width={1200}
              height={900}
              priority
              className="h-auto w-full object-contain"
            />
          ) : (
            <img
              src={imageUrl}
              alt="Cumberland Mountain Music"
              className="h-auto w-full object-contain"
            />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            About
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          <div className="mt-6 space-y-5 text-lg leading-8 text-[#d9c8aa]">
            {body.split(/\n+/).map((paragraph, index) => (
              <p key={paragraph} className={index === 0 ? "text-[#e7d8c2]" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/80 p-6 text-center shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d7a84f]">
          Honoring The Story
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Remembering those who helped shape the show.
        </h2>
        <Link
          href="/in-memory"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/60 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
        >
          View our In Memory tribute
        </Link>
      </section>
    </main>
  );
}
