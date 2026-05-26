import type { Metadata } from "next";
import Link from "next/link";
import { PromoLightbox } from "@/components/PromoLightbox";
import { TicketCheckoutNote } from "@/components/TicketCheckoutNote";
import { createPublicPageMetadata } from "@/lib/metadata";
import { getActiveSponsorsForShow } from "@/lib/supabase/sponsors";
import { getPublishedShows, type DbShow } from "@/lib/supabase/shows";
import { shows, venue } from "./showData";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Show Dates | Cumberland Mountain Music",
  description:
    "2026 Cumberland Mountain Music Show dates, tickets, venue details, and showtime information in Cumberland Gap, Tennessee.",
  path: "/show-dates",
});

export const dynamic = "force-dynamic";

type DisplayShow = {
  key: string;
  date: string;
  dateValue: string;
  title: string;
  time: string;
  priceLine: string;
  venueName: string;
  venueLine: string;
  address?: string;
  ticketUrl?: string;
  detailsUrl?: string;
  promoImage?: string;
  shortDescription?: string;
  featuredText?: string;
  isFeatured?: boolean;
  source: "database" | "fallback";
};

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function formatYear(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function formatTime(show: DbShow) {
  const parts = [];

  if (show.doors_time) {
    parts.push(`Doors ${show.doors_time}`);
  }

  if (show.show_time) {
    parts.push(`Show ${show.show_time}`);
  }

  if (show.end_time) {
    parts.push(`Ends ${show.end_time}`);
  }

  return parts.length > 0 ? `${parts.join(". ")}.` : "Show time to be announced";
}

function formatPriceLine(
  advanceTicketPrice?: string | null,
  doorTicketPrice?: string | null,
) {
  if (advanceTicketPrice && doorTicketPrice) {
    return `${advanceTicketPrice} advance / ${doorTicketPrice} at the door.`;
  }

  if (advanceTicketPrice) {
    return `${advanceTicketPrice} advance.`;
  }

  if (doorTicketPrice) {
    return `${doorTicketPrice} at the door.`;
  }

  return "$8 advance / $10 at the door.";
}

function fromDatabaseShow(show: DbShow): DisplayShow {
  return {
    key: show.id,
    date: formatDate(show.show_date),
    dateValue: `${show.show_date}T00:00:00`,
    title: show.title,
    time: formatTime(show),
    priceLine: formatPriceLine(
      show.advance_ticket_price,
      show.door_ticket_price,
    ),
    venueName: show.venue ?? venue.name,
    venueLine: show.venue ?? venue.name,
    address: show.address ?? undefined,
    ticketUrl: show.ticket_url ?? undefined,
    detailsUrl: show.details_url ?? (show.slug ? `/show-dates/${show.slug}` : undefined),
    promoImage: show.promo_image_url ?? undefined,
    shortDescription: show.short_description ?? undefined,
    featuredText: show.featured_text ?? undefined,
    isFeatured: Boolean(show.is_featured),
    source: "database",
  };
}

function fromFallbackShow(show: (typeof shows)[number]): DisplayShow {
  return {
    key: show.dateValue,
    date: show.date,
    dateValue: show.dateValue,
    title: show.title,
    time: show.time,
    priceLine: "$8 advance / $10 at the door.",
    venueName: venue.name,
    venueLine: `${venue.name}, ${venue.cityStateZip}`,
    address: `${venue.address}, ${venue.cityStateZip}`,
    ticketUrl: show.ticketUrl,
    detailsUrl: show.detailsUrl,
    promoImage: show.promoImage,
    source: "fallback",
  };
}

export default async function ShowDatesPage() {
  const databaseShows = await getPublishedShows();
  const displayShows =
    databaseShows.length > 0
      ? databaseShows.map(fromDatabaseShow)
      : shows.map(fromFallbackShow);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureEvents = displayShows.filter(
    (event) => new Date(event.dateValue) >= today,
  );
  const featuredEvent = futureEvents[0];
  const featuredSponsors =
    featuredEvent?.source === "database"
      ? await getActiveSponsorsForShow(featuredEvent.key)
      : [];
  const upcomingEvents = featuredEvent
    ? futureEvents.filter(
        (event) =>
          event.key !== featuredEvent.key &&
          event.dateValue !== featuredEvent.dateValue,
      )
    : futureEvents;

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Show Dates
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          2026 Cumberland Mountain Music Shows
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          Join us at the Cumberland Gap Convention Center for live bluegrass,
          gospel, and traditional mountain music from the heart of Appalachia.
          Advance tickets are $8 online, or $10 at the door.
        </p>
      </section>

      {featuredEvent ? (
        <section className="mt-10 overflow-hidden rounded-lg border border-[#d7a84f]/30 bg-[linear-gradient(135deg,rgba(31,21,10,0.96),rgba(10,7,4,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
          <div className="border-b border-[#d7a84f]/20 bg-black/25 px-6 py-5 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f4d28b]">
              Featured Next Show
            </p>
          </div>

          {featuredEvent.promoImage ? (
            <div className="px-6 pt-6 sm:px-8 sm:pt-8">
              <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-[#d7a84f]/20 bg-black/30 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <PromoLightbox
                  src={featuredEvent.promoImage}
                  alt={`${featuredEvent.title} promo`}
                  priority
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                {featuredEvent.date}
              </h2>
              <p className="mt-4 text-xl font-semibold text-[#f4d28b]">
                {featuredEvent.title}
              </p>
              <p className="mt-4 text-lg leading-8 text-[#d9c8aa]">
                {featuredEvent.time} at {featuredEvent.venueLine}.
              </p>
              {featuredEvent.featuredText || featuredEvent.shortDescription ? (
                <p className="mt-4 text-[#e7d8c2]">
                  {featuredEvent.featuredText ?? featuredEvent.shortDescription}
                </p>
              ) : null}
              <p className="mt-4 text-[#e7d8c2]">
                {featuredEvent.priceLine}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {featuredEvent.ticketUrl ? (
                  <a
                    href={featuredEvent.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
                  >
                    Buy Tickets
                  </a>
                ) : null}
                {featuredEvent.detailsUrl ? (
                  <Link
                    href={featuredEvent.detailsUrl}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                  >
                    Show Details
                  </Link>
                ) : null}
              </div>
              {featuredEvent.ticketUrl ? <TicketCheckoutNote /> : null}
            </div>

            <aside className="rounded-lg border border-[#d7a84f]/20 bg-black/25 p-6">
              <h3 className="text-xl font-semibold text-white">Venue</h3>
              <p className="mt-3 leading-7 text-[#d9c8aa]">
                {featuredEvent.venueName}
                {featuredEvent.address ? (
                  <>
                    <br />
                    {featuredEvent.address}
                  </>
                ) : null}
              </p>
              <p className="mt-5 text-[#d9c8aa]">
                Concessions available during the show.
              </p>
            </aside>
          </div>

          {featuredSponsors.length > 0 ? (
            <section className="border-t border-[#d7a84f]/18 px-6 py-3 sm:px-8">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {featuredSponsors.map((sponsor) => {
                  const sponsorContent = (
                    <div className="flex h-14 min-w-24 max-w-36 items-center justify-center rounded-md border border-[#d7a84f]/12 bg-black/18 px-3 transition hover:border-[#d7a84f]/38 sm:h-16 sm:min-w-28 sm:max-w-40">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={`${sponsor.name} logo`}
                          className="max-h-9 w-auto max-w-full object-contain sm:max-h-12"
                        />
                      ) : (
                        <p className="line-clamp-2 text-center text-xs font-semibold leading-4 text-[#f8efe2]">
                          {sponsor.name}
                        </p>
                      )}
                    </div>
                  );

                  return sponsor.website_url ? (
                    <a
                      key={sponsor.id}
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={sponsor.name}
                    >
                      {sponsorContent}
                    </a>
                  ) : (
                    <div key={sponsor.id}>{sponsorContent}</div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {upcomingEvents.map((event) => (
          <article
            key={event.date}
            className="rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d7a84f]">
              {formatYear(event.dateValue.slice(0, 10))}
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              {event.date}
            </h2>
            <p className="mt-3 text-lg font-semibold text-[#f4d28b]">
              {event.title}
            </p>
            <dl className="mt-5 space-y-3 text-[#d9c8aa]">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9946e]">
                  Time
                </dt>
                <dd className="mt-1">{event.time}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9946e]">
                  Venue
                </dt>
                <dd className="mt-1">
                  {event.venueLine}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9946e]">
                  Tickets
                </dt>
                <dd className="mt-1">{event.priceLine}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {event.ticketUrl ? (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                >
                  Buy Tickets
                </a>
              ) : null}
              {event.detailsUrl ? (
                <Link
                  href={event.detailsUrl}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/35 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                >
                  Show Details
                </Link>
              ) : null}
            </div>
            {event.ticketUrl ? <TicketCheckoutNote /> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
