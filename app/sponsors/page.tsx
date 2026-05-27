import type { Metadata } from "next";
import Link from "next/link";
import { createPublicPageMetadata } from "@/lib/metadata";
import { SponsorLevelBadge } from "@/lib/sponsorLevels";
import { getActiveSponsors } from "@/lib/supabase/sponsors";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Sponsors | Cumberland Mountain Music",
  description:
    "Sponsor information for Cumberland Mountain Music and The Cumberland Mountain Music Show in Cumberland Gap, Tennessee.",
  path: "/sponsors",
});

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const sponsors = await getActiveSponsors();

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Sponsors
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Support Live Mountain Music
        </h1>
        <p className="mt-6 text-lg leading-8 text-[#e7d8c2]">
          Cumberland Mountain Music welcomes community partners who want to help
          keep live bluegrass, gospel, and traditional mountain music thriving
          in Cumberland Gap.
        </p>
        <Link
          href="/become-a-sponsor"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
        >
          Become a Sponsor
        </Link>
      </section>

      <section className="mt-10">
        {sponsors.length === 0 ? (
          <div className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6">
            <h2 className="text-2xl font-semibold text-white">
              Sponsor Information Coming Soon
            </h2>
            <p className="mt-4 leading-7 text-[#d9c8aa]">
              Sponsor details are being prepared. Use the contact page to start
              a conversation about supporting the show.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => {
              const content = (
                <>
                  {sponsor.logo_url ? (
                    <div className="flex min-h-24 items-center justify-center rounded-md border border-[#d7a84f]/12 bg-black/25 p-4">
                      <img
                        src={sponsor.logo_url}
                        alt={`${sponsor.name} logo`}
                        className="max-h-20 w-auto max-w-full object-contain"
                      />
                    </div>
                  ) : null}
                  <h2 className="mt-5 text-2xl font-semibold text-white">
                    {sponsor.name}
                  </h2>
                  <div className="mt-3">
                    <SponsorLevelBadge level={sponsor.sponsor_level} />
                  </div>
                  {sponsor.description ? (
                    <p className="mt-4 leading-7 text-[#d9c8aa]">
                      {sponsor.description}
                    </p>
                  ) : null}
                </>
              );

              return (
                <article
                  key={sponsor.id}
                  className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
                >
                  {content}
                  {sponsor.website_url ? (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                    >
                      Visit Website
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
