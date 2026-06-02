import type { Metadata } from "next";
import Link from "next/link";
import { MediaCard } from "@/components/MediaCard";
import { createPublicPageMetadata } from "@/lib/metadata";
import { getPublishedMediaItems, type MediaItem } from "@/lib/supabase/cms";
import { getPublishedShows, type DbShow } from "@/lib/supabase/shows";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Media | Cumberland Mountain Music",
  description:
    "Photos and videos from The Cumberland Mountain Music Show in Cumberland Gap, Tennessee.",
  path: "/media",
});

export const dynamic = "force-dynamic";

function formatShowDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function byMediaOrder(
  a: MediaItem,
  b: MediaItem,
) {
  return (
    (a.display_order ?? 0) - (b.display_order ?? 0) ||
    (a.created_at ?? "").localeCompare(b.created_at ?? "")
  );
}

function getManualShowKey(item: MediaItem) {
  return `${item.manual_show_date ?? "0000-00-00"}|${item.manual_show_title}`;
}

function getManualShowGroups(mediaItems: MediaItem[]) {
  const groups = new Map<
    string,
    { title: string; date: string | null; items: MediaItem[] }
  >();

  mediaItems.forEach((item) => {
    if (!item.manual_show_title) {
      return;
    }

    const key = getManualShowKey(item);
    const group = groups.get(key) ?? {
      title: item.manual_show_title,
      date: item.manual_show_date,
      items: [],
    };

    group.items.push(item);
    groups.set(key, group);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: group.items.sort(byMediaOrder),
    }))
    .sort(
      (a, b) =>
        (b.date ?? "").localeCompare(a.date ?? "") ||
        a.title.localeCompare(b.title),
    );
}

export default async function MediaPage() {
  const [mediaItems, shows] = await Promise.all([
    getPublishedMediaItems(),
    getPublishedShows(),
  ]);
  const showsById = new Map(shows.map((show) => [show.id, show]));
  const generalItems = mediaItems
    .filter(
      (item) =>
        (!item.show_id || !showsById.has(item.show_id)) &&
        !item.manual_show_title,
    )
    .sort(byMediaOrder);
  const manualShowGroups = getManualShowGroups(
    mediaItems.filter((item) => !item.show_id || !showsById.has(item.show_id)),
  );
  const showGroups = shows
    .map((show) => ({
      show,
      items: mediaItems
        .filter((item) => item.show_id === show.id)
        .sort(byMediaOrder),
    }))
    .filter((group) => group.items.length > 0)
    .sort((a, b) => b.show.show_date.localeCompare(a.show.show_date));

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Media
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Media Gallery
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

      {showGroups.map(({ show, items }) => (
        <MediaSection key={show.id} show={show} items={items} />
      ))}

      {manualShowGroups.map((group) => (
        <ManualMediaSection
          key={`${group.date ?? "undated"}-${group.title}`}
          title={group.title}
          date={group.date}
          items={group.items}
        />
      ))}

      {generalItems.length > 0 ? (
        <section className="mt-12 border-t border-[#d7a84f]/18 pt-8">
          <h2 className="text-3xl font-semibold text-white">General Media</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {generalItems.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

type MediaSectionProps = {
  show: DbShow;
  items: MediaItem[];
};

function MediaSection({ show, items }: MediaSectionProps) {
  return (
    <section className="mt-12 border-t border-[#d7a84f]/18 pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d7a84f]">
            {formatShowDate(show.show_date)}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {show.title}
          </h2>
        </div>
        <Link
          href={`/media/${show.slug}`}
          className="text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b] transition hover:text-white"
        >
          View Show Media
        </Link>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

type ManualMediaSectionProps = {
  title: string;
  date: string | null;
  items: MediaItem[];
};

function ManualMediaSection({ title, date, items }: ManualMediaSectionProps) {
  return (
    <section className="mt-12 border-t border-[#d7a84f]/18 pt-8">
      <div>
        {date ? (
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d7a84f]">
            {formatShowDate(date)}
          </p>
        ) : null}
        <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
