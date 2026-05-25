import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsors | Cumberland Mountain Music",
  description:
    "Sponsor information for Cumberland Mountain Music and The Cumberland Mountain Music Show in Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "/sponsors",
  },
};

export default function SponsorsPage() {
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
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6">
          <h2 className="text-2xl font-semibold text-white">
            Community Presence
          </h2>
          <p className="mt-4 leading-7 text-[#d9c8aa]">
            Connect your business or organization with audiences who value local
            culture, live music, and regional traditions.
          </p>
        </article>
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6">
          <h2 className="text-2xl font-semibold text-white">
            Show Support
          </h2>
          <p className="mt-4 leading-7 text-[#d9c8aa]">
            Sponsorship helps support a professional public music show at the
            Cumberland Gap Convention Center.
          </p>
        </article>
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6">
          <h2 className="text-2xl font-semibold text-white">Get In Touch</h2>
          <p className="mt-4 leading-7 text-[#d9c8aa]">
            Sponsor details are being prepared. Use the contact page to start a
            conversation about supporting the show.
          </p>
        </article>
      </section>
    </main>
  );
}
