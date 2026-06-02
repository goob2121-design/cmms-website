import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaCard } from "@/components/MediaCard";
import { getPublishedMediaItemsForShow } from "@/lib/supabase/cms";
import { getPublishedShowBySlug } from "@/lib/supabase/shows";

type ShowMediaPageProps = {
  params: Promise<{ showSlug: string }>;
};

function formatShowDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

export async function generateMetadata({
  params,
}: ShowMediaPageProps): Promise<Metadata> {
  const { showSlug } = await params;
  const show = await getPublishedShowBySlug(showSlug);

  if (!show) {
    return {
      title: "Show Media Not Found | Cumberland Mountain Music",
    };
  }

  return {
    title: `${show.title} Media | Cumberland Mountain Music`,
    description: `Photos and videos from ${show.title}.`,
    alternates: {
      canonical: `/media/${show.slug}`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ShowMediaPage({ params }: ShowMediaPageProps) {
  const { showSlug } = await params;
  const show = await getPublishedShowBySlug(showSlug);

  if (!show) {
    notFound();
  }

  const mediaItems = await getPublishedMediaItemsForShow(show.id);

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Show Media
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          {show.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          {formatShowDate(show.show_date)}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/media"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
          >
            All Media
          </Link>
          <Link
            href={`/show-dates/${show.slug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/35 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
          >
            Show Details
          </Link>
        </div>
      </section>

      {mediaItems.length === 0 ? (
        <section className="mt-10 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-[#d9c8aa] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          No media posted for this show yet.
        </section>
      ) : (
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </main>
  );
}
