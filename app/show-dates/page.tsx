import type { Metadata } from "next";
import Link from "next/link";
import { PromoLightbox } from "@/components/PromoLightbox";
import { getNextShow, shows, venue } from "./showData";

export const metadata: Metadata = {
  title: "Show Dates | Cumberland Mountain Music",
  description:
    "2026 Cumberland Mountain Music Show dates, tickets, venue details, and showtime information in Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "/show-dates",
  },
};

export default function ShowDatesPage() {
  const featuredEvent = getNextShow();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = featuredEvent
    ? shows.filter(
        (event) =>
          event.dateValue !== featuredEvent.dateValue &&
          new Date(event.dateValue) >= today,
      )
    : shows.filter((event) => new Date(event.dateValue) >= today);

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
                {featuredEvent.time} at {venue.name}, {venue.cityStateZip}.
              </p>
              <p className="mt-4 text-[#e7d8c2]">
                Advance tickets are $8 online. Admission is $10 at the door.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={featuredEvent.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
                >
                  Buy Tickets
                </a>
                {featuredEvent.detailsUrl ? (
                  <Link
                    href={featuredEvent.detailsUrl}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                  >
                    Show Details
                  </Link>
                ) : null}
              </div>
            </div>

            <aside className="rounded-lg border border-[#d7a84f]/20 bg-black/25 p-6">
              <h3 className="text-xl font-semibold text-white">Venue</h3>
              <p className="mt-3 leading-7 text-[#d9c8aa]">
                {venue.name}
                <br />
                {venue.address}
                <br />
                {venue.cityStateZip}
              </p>
              <p className="mt-5 text-[#d9c8aa]">
                Concessions available during the show.
              </p>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {upcomingEvents.map((event) => (
          <article
            key={event.date}
            className="rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d7a84f]">
              2026
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
                  {venue.name}, {venue.cityStateZip}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9946e]">
                  Tickets
                </dt>
                <dd className="mt-1">$8 online in advance. $10 at the door.</dd>
              </div>
            </dl>
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Buy Tickets
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
