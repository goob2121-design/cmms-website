import type { Metadata } from "next";
import Link from "next/link";
import { SponsorInterestForm } from "@/components/SponsorInterestForm";
import { createPublicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Become a Sponsor | Cumberland Mountain Music",
  description:
    "Learn how businesses, community partners, and supporters can sponsor The Cumberland Mountain Music Show in Cumberland Gap, Tennessee.",
  path: "/become-a-sponsor",
});

const sponsorLevels = [
  "Platinum Sponsor",
  "Gold Sponsor",
  "Silver Sponsor",
  "Community Partner",
  "In-Kind Sponsor",
];

const whySponsor = [
  "Support live bluegrass, gospel, country, and traditional mountain music",
  "Reach a local and regional audience",
  "Help keep family-friendly entertainment available in Cumberland Gap",
  "Be recognized on the website, show materials, and select event promotions where applicable",
];

export default function BecomeASponsorPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Sponsorship
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Become a Sponsor
        </h1>
        <p className="mt-6 text-lg leading-8 text-[#e7d8c2]">
          The Cumberland Mountain Music Show is made possible by local
          businesses, community partners, and supporters who believe in live
          music, family entertainment, and keeping our mountain music traditions
          alive.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="mailto:cumberlandmountainmusic@gmail.com?subject=CMMS Sponsorship Interest"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            Contact Us About Sponsorship
          </a>
          <Link
            href="/sponsors"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
          >
            View Current Sponsors
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <h2 className="text-2xl font-semibold text-white">Why Sponsor?</h2>
          <div className="mt-5 grid gap-3">
            {whySponsor.map((item) => (
              <div
                key={item}
                className="rounded-md border border-[#d7a84f]/15 bg-black/20 p-4 text-[#d9c8aa]"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.92),rgba(10,7,4,0.96))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.26)]">
          <h2 className="text-2xl font-semibold text-white">Sponsor Levels</h2>
          <div className="mt-5 grid gap-3">
            {sponsorLevels.map((level) => (
              <div
                key={level}
                className="rounded-md border border-[#d7a84f]/18 bg-black/20 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b]"
              >
                {level}
              </div>
            ))}
          </div>
          <p className="mt-5 leading-7 text-[#d9c8aa]">
            In-kind sponsorships may include food, supplies, services,
            giveaways, printing, lodging, or other support that helps make the
            show possible.
          </p>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <SponsorInterestForm />
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-[#d9c8aa] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <h2 className="text-2xl font-semibold text-white">Contact</h2>
          <p className="mt-4 leading-7">
            Prefer email? You can still reach us directly at{" "}
            <a
              href="mailto:cumberlandmountainmusic@gmail.com"
              className="font-semibold text-[#f4d28b] transition hover:text-white"
            >
              cumberlandmountainmusic@gmail.com
            </a>
            .
          </p>
          <p className="mt-4 leading-7">
            Sponsorship conversations are handled personally, with room for
            local businesses, families, churches, community partners, and
            in-kind supporters.
          </p>
        </article>
      </section>
    </main>
  );
}
