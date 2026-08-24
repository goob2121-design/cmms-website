import type { Metadata } from "next";
import { GmailGuide } from "@/components/GmailGuide";
import { MailingListForm } from "./mailing-list-form";
import { createPublicPageMetadata } from "@/lib/metadata";

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

        <MailingListForm />

        <p className="mt-5 text-sm leading-6 text-[#bda987]">
          Occasional show announcements, ticket reminders, and CMMS news.
          Unsubscribe anytime.
        </p>
      </section>

      <GmailGuide variant="mailingList" />
    </main>
  );
}
