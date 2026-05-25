import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Cumberland Mountain Music",
  description:
    "Contact Cumberland Mountain Music, email the show team, and join the mailing list for updates from Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Contact Cumberland Mountain Music
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#e7d8c2]">
            For show information, sponsorship conversations, or general
            questions about The Cumberland Mountain Music Show, reach out by
            email or join the mailing list for updates.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:cumberlandmountainmusic@gmail.com"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:bg-[#f1c86e]"
            >
              Email Us
            </a>
            <a
              href="https://pinnaclestudiotn.com/cmms-mailing-list"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Join the Mailing List
            </a>
          </div>
        </div>

        <aside className="rounded-lg border border-[#d7a84f]/25 bg-[#120d08]/85 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.3)]">
          <h2 className="text-2xl font-semibold text-white">Contact Details</h2>
          <dl className="mt-5 space-y-5 text-[#d9c8aa]">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Email
              </dt>
              <dd className="mt-2">
                <a
                  href="mailto:cumberlandmountainmusic@gmail.com"
                  className="transition hover:text-[#f4d28b]"
                >
                  cumberlandmountainmusic@gmail.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Venue
              </dt>
              <dd className="mt-2">Cumberland Gap Convention Center</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Address
              </dt>
              <dd className="mt-2">
                601 Colwyn Avenue, Cumberland Gap, TN 37724
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
