import type { Metadata } from "next";
import { Handshake } from "lucide-react";
import Link from "next/link";
import { createPublicPageMetadata } from "@/lib/metadata";

const sponsorRsvpUrl = "https://stageflow.cumberlandmountainmusic.com/sponsor-rsvp";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Sponsor RSVP | Cumberland Mountain Music",
  description:
    "Sponsor RSVP information for Cumberland Mountain Music sponsors who received a Sponsor Appreciation Packet.",
  path: "/sponsor-rsvp",
});

export default function SponsorRsvpPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#d7a84f]/25 bg-[#120d08]/85 p-6 text-center shadow-[0_22px_70px_rgba(0,0,0,0.3)] sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d7a84f]/35 bg-black/25 text-[#f4d28b]">
          <Handshake aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
          Sponsor RSVP
        </h1>
        <div className="mx-auto mt-5 max-w-2xl space-y-4 text-lg leading-8 text-[#d9c8aa]">
          <p>Already one of our valued sponsors?</p>
          <p>
            If you&apos;ve received your Sponsor Appreciation Packet and would like
            to let us know whether you&apos;ll be attending the upcoming Cumberland
            Mountain Music Show, you can submit your Sponsor RSVP online.
          </p>
          <p>
            If you won&apos;t be able to attend, that&apos;s absolutely okay&mdash;we
            simply appreciate knowing so we can make those reserved seats
            available to other guests.
          </p>
        </div>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={sponsorRsvpUrl}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            Submit Sponsor RSVP
          </a>
          <Link
            href="/sponsors"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
          >
            Back to Sponsors
          </Link>
        </div>
      </section>
    </main>
  );
}