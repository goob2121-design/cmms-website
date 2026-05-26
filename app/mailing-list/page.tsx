import type { Metadata } from "next";
import { createPublicPageMetadata } from "@/lib/metadata";

const mailingListUrl = "https://pinnaclestudiotn.com/cmms-mailing-list";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Join the Mailing List | Cumberland Mountain Music",
  description:
    "Join the Cumberland Mountain Music mailing list for show announcements, ticket reminders, special guests, and behind-the-scenes updates.",
  path: "/mailing-list",
});

export default function MailingListPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Cumberland Mountain Music
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Join the Cumberland Mountain Music Mailing List
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          Get show announcements, special guest reveals, ticket reminders,
          behind-the-scenes updates, and CMMS news delivered straight to you.
        </p>

        <div className="mt-8">
          <a
            href={mailingListUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            Join the Mailing List
          </a>
        </div>

        <p className="mt-5 text-sm leading-6 text-[#bda987]">
          Mailing list signup is securely handled through our Pinnacle Recording
          Studio page.
        </p>
      </section>
    </main>
  );
}
