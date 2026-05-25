import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shows, venue } from "../showData";

const juneShow = shows[0];

export const metadata: Metadata = {
  title: "June 20, 2026 Show | Cumberland Mountain Music",
  description:
    "Details for the June 20, 2026 Cumberland Mountain Music Show at Cumberland Gap Convention Center in Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "/show-dates/june-20-2026",
  },
};

export default function JuneShowPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="overflow-hidden rounded-lg border border-[#d7a84f]/25 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <Image
            src="/june-20-promo.png"
            alt="June 20 Cumberland Mountain Music Show promo"
            width={1200}
            height={628}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Show Details
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            June 20, 2026 Cumberland Mountain Music Show
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#e7d8c2]">
            Join us Saturday, June 20th for another exciting night of live music
            at The Cumberland Mountain Music Show at the Cumberland Gap
            Convention Center! Featuring Bryan Turner and the Cumberland
            Mountain Music Show Band, along with special guest Kelly Caldwell
            and more, this show will be packed with bluegrass, country, gospel,
            mountain music, laughs, and great family entertainment.
          </p>
          <p className="mt-5 text-lg leading-8 text-[#d9c8aa]">
            Whether you&apos;re a longtime fan or planning your first visit,
            we&apos;d love to have you with us for an unforgettable evening of
            live music in the heart of Cumberland Gap.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.3)] sm:p-8">
          <p className="text-lg leading-8 text-[#e7d8c2]">
            Doors open at 6:00 PM and the show begins at 7:00 PM at the
            Cumberland Gap Convention Center, located at 601 Colwyn Avenue in
            Cumberland Gap, TN.
          </p>
          <p className="mt-5 text-lg leading-8 text-[#d9c8aa]">
            Advance tickets are just $8 online or $10 at the door, and
            concessions will be available during the show.
          </p>
          <p className="mt-5 text-lg leading-8 text-[#f4d28b]">
            Come see why so many people are calling it &ldquo;The #1 Live Music
            Show in the Tri-State Area!&rdquo;
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={juneShow.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              Advance Tickets
            </a>
            <Link
              href="/show-dates"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Back to Show Dates
            </Link>
          </div>
        </article>

        <aside className="rounded-lg border border-[#d7a84f]/25 bg-[linear-gradient(135deg,rgba(31,21,10,0.9),rgba(10,7,4,0.92))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.3)]">
          <h2 className="text-2xl font-semibold text-white">Show Info</h2>
          <dl className="mt-5 space-y-5 text-[#d9c8aa]">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Date
              </dt>
              <dd className="mt-2">{juneShow.date}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Time
              </dt>
              <dd className="mt-2">Doors 6:00 PM. Show 7:00 PM.</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Venue
              </dt>
              <dd className="mt-2">
                {venue.name}
                <br />
                {venue.address}
                <br />
                {venue.cityStateZip}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Tickets
              </dt>
              <dd className="mt-2">$8 online in advance. $10 at the door.</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Concessions
              </dt>
              <dd className="mt-2">Available during the show.</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
