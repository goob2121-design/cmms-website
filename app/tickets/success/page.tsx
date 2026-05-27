import type { Metadata } from "next";
import Link from "next/link";
import { createPublicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...createPublicPageMetadata({
    title: "Ticket Purchase Confirmation | Cumberland Mountain Music",
    description:
      "Thank you for supporting The Cumberland Mountain Music Show. Ticket receipt and confirmation details.",
    path: "/tickets/success",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function TicketSuccessPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Cumberland Mountain Music
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Thank You for Supporting the Cumberland Mountain Music Show!
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#e7d8c2]">
          Your ticket confirmation and receipt should arrive by email shortly.
        </p>

        <div className="mx-auto mt-7 max-w-xl rounded-lg border border-[#d7a84f]/18 bg-black/25 p-5 text-left text-[#d9c8aa]">
          <p className="font-semibold text-white">Please bring:</p>
          <ul className="mt-3 space-y-2 leading-7">
            <li>your printed receipt</li>
            <li>OR</li>
            <li>your phone confirmation email</li>
          </ul>
          <div className="mt-5 border-t border-[#d7a84f]/15 pt-5 leading-7">
            <p>Doors open at 6:00 PM</p>
            <p>Show starts at 7:00 PM</p>
            <p>Cumberland Gap Convention Center</p>
          </div>
        </div>

        <p className="mt-6 text-lg font-semibold text-[#f4d28b]">
          We can&apos;t wait to see you in Cumberland Gap!
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/show-dates"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            View Show Details
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
          >
            Back to Homepage
          </Link>
          <Link
            href="/snack-shop"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/45 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
          >
            Visit Mamaw Gerald&apos;s Snack Shop
          </Link>
        </div>
      </section>
    </main>
  );
}
