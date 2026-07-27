import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createPublicPageMetadata } from "@/lib/metadata";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=601%20Colwyn%20Avenue%2C%20Cumberland%20Gap%2C%20TN%2037724";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Venue & Directions | Cumberland Mountain Music",
  description:
    "Plan your visit to the Cumberland Mountain Music Show at the Lincoln Memorial University Cumberland Gap Convention Center in Cumberland Gap, Tennessee.",
  path: "/venue",
});

export default function VenuePage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Plan Your Visit
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Cumberland Mountain Music Show
          </h1>
          <p className="mt-3 text-xl font-semibold leading-8 text-[#f4d28b]">
            Lincoln Memorial University Cumberland Gap Convention Center
          </p>
          <p className="mt-6 text-lg leading-8 text-[#e7d8c2]">
            Every Cumberland Mountain Music Show is hosted at the beautiful LMU Cumberland Gap Convention Center in historic Cumberland Gap, Tennessee. Plan ahead, find your way, and arrive ready for an evening of live mountain music in a warm, welcoming venue.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/show-dates"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              View Upcoming Shows
            </Link>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#d7a84f]/20 bg-black/25 shadow-[0_22px_70px_rgba(0,0,0,0.3)]">
          <Image
            src="/images/cumberland-gap-convention-center-night.webp"
            alt="Lincoln Memorial University Cumberland Gap Convention Center at dusk"
            width={1200}
            height={675}
            priority
            className="aspect-video w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-lg border border-[#d7a84f]/25 bg-[#120d08]/85 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.3)]">
          <h2 className="text-2xl font-semibold text-white">Venue Information</h2>
          <div className="mt-5 space-y-6 text-[#d9c8aa]">
            <div>
              <p className="text-lg font-semibold leading-7 text-[#f8efe2]">
                Lincoln Memorial University
                <br />
                Cumberland Gap Convention Center
              </p>
              <p className="mt-3 leading-7">
                601 Colwyn Avenue
                <br />
                Cumberland Gap, TN 37724
              </p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
                <dt className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                  Doors Open
                </dt>
                <dd className="mt-2 text-xl font-semibold text-white">6:00 PM</dd>
              </div>
              <div className="rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
                <dt className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                  Show Begins
                </dt>
                <dd className="mt-2 text-xl font-semibold text-white">7:00 PM</dd>
              </div>
            </dl>
            <p className="leading-7">
              Show dates and special guests can be found on the Show Dates page.
            </p>
            <Link
              href="/show-dates"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              View Upcoming Shows
            </Link>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-lg border border-[#d7a84f]/20 bg-black/25 p-6">
            <h2 className="text-2xl font-semibold text-white">Getting Here</h2>
            <p className="mt-4 leading-7 text-[#d9c8aa]">
              Lincoln Memorial University Cumberland Gap Convention Center
              <br />
              601 Colwyn Avenue
              <br />
              Cumberland Gap, TN 37724
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] sm:w-auto"
            >
              Open in Google Maps
            </a>
          </article>

          <article className="rounded-lg border border-[#d7a84f]/20 bg-black/25 p-6">
            <h2 className="text-2xl font-semibold text-white">Reserved Seating</h2>
            <div className="mt-4 space-y-3 leading-7 text-[#d9c8aa]">
              <p>Advance ticket holders receive a private seat-selection email.</p>
              <p>Bring your seat information with you.</p>
              <p>Our volunteers will gladly help you find your seats.</p>
            </div>
            <Link
              href="/show-dates"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b] sm:w-auto"
            >
              Purchase Tickets
            </Link>
          </article>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1fr]">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-black/25 p-6">
          <h2 className="text-2xl font-semibold text-white">Before You Arrive</h2>
          <ul className="mt-5 space-y-3 leading-7 text-[#d9c8aa]">
            <li>Arrive a little early.</li>
            <li>Doors open at 6 PM.</li>
            <li>Concessions are available.</li>
            <li>Family-friendly environment.</li>
            <li>Volunteers are available to help.</li>
          </ul>
        </article>

        <article className="rounded-lg border border-[#d7a84f]/25 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <h2 className="text-2xl font-semibold text-white">Contact</h2>
          <p className="mt-4 text-lg leading-8 text-[#e7d8c2]">Questions?</p>
          <p className="mt-2 text-[#d9c8aa]">
            <a
              href="mailto:info@cumberlandmountainmusic.com"
              className="transition hover:text-[#f4d28b]"
            >
              info@cumberlandmountainmusic.com
            </a>
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              Contact Us
            </Link>
            <Link
              href="/show-dates"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Show Dates
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Home
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}