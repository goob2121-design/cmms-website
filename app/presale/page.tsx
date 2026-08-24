import type { Metadata } from "next";
import Link from "next/link";
import { GmailGuide } from "@/components/GmailGuide";
import { formatNewYorkShowDate } from "@/lib/countdown";
import { createPublicPageMetadata } from "@/lib/metadata";
import {
  formatTicketSaleDate,
  getPresalePageState,
  type PresalePageState,
} from "@/lib/presale";
import { getNextPublishedShow } from "@/lib/supabase/shows";
import {
  getPublicTicketSalesStatus,
  getTicketSaleAvailability,
} from "@/lib/ticket-sales-status";
import { shows } from "@/app/show-dates/showData";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Early Access Presale | Cumberland Mountain Music",
  description:
    "Learn about CMMS Early Access, see upcoming ticket-sale dates, and join the Cumberland Mountain Music mailing list.",
  path: "/presale",
});

export const dynamic = "force-dynamic";

const stateContent: Record<
  PresalePageState,
  { title: string; description: string }
> = {
  upcoming: {
    title: "Early Access Opens Soon",
    description:
      "Join the CMMS Mailing List now so you’re ready when Early Access opens.",
  },
  active: {
    title: "Early Access Presale Is Open",
    description:
      "Early Access is currently available to CMMS mailing-list subscribers. Subscribers receive ticket access through private CMMS email communications.",
  },
  public: {
    title: "Public Ticket Sales Are Open",
    description: "Advance tickets are now available to the general public.",
  },
  not_on_sale: {
    title: "Tickets Coming Soon",
    description: "Tickets for the next show are not on sale yet.",
  },
  no_show: {
    title: "Presale Details Coming Soon",
    description:
      "There is no upcoming show to announce right now. Please check back soon.",
  },
  unavailable: {
    title: "Presale Information Temporarily Unavailable",
    description:
      "Presale information is temporarily unavailable. Please check back shortly.",
  },
};

export default async function PresalePage() {
  const [lookup, nextPublishedShow] = await Promise.all([
    getPublicTicketSalesStatus(),
    getNextPublishedShow(),
  ]);
  const pageState = getPresalePageState(lookup);
  const stageFlowShow = lookup.ok ? lookup.data.show : null;
  const ticketSales = lookup.ok ? lookup.data.ticketSales : null;
  const fallbackShow = stageFlowShow
    ? shows.find((show) => show.dateValue.split("T")[0] === stageFlowShow.date)
    : undefined;
  const databaseShowMatches = Boolean(
    stageFlowShow &&
    nextPublishedShow &&
    (nextPublishedShow.slug === stageFlowShow.slug ||
      nextPublishedShow.show_date === stageFlowShow.date),
  );
  const publicTicketUrl =
    pageState === "public"
      ? databaseShowMatches
        ? nextPublishedShow?.ticket_url
        : fallbackShow?.ticketUrl
      : null;
  const publicAvailability =
    nextPublishedShow && databaseShowMatches
      ? getTicketSaleAvailability(lookup, {
          slug: nextPublishedShow.slug,
          name: nextPublishedShow.title,
          date: nextPublishedShow.show_date,
        })
      : null;
  const canShowPublicTicket =
    pageState === "public" &&
    Boolean(publicTicketUrl) &&
    (publicAvailability === null || publicAvailability.kind === "public");
  const content = stateContent[pageState];

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Cumberland Mountain Music
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Early Access Presale
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#e7d8c2]">
          Mailing List subscribers get Early Access before tickets go on sale to
          the general public. When Early Access begins, subscribers will receive
          an email with their private ticket link.
        </p>
        <a
          href="#gmail-help"
          className="mt-3 inline-block text-sm font-semibold text-[#d9c8aa] underline decoration-[#d7a84f]/55 underline-offset-4 transition hover:text-white"
        >
          Using Gmail? Check Promotions, Social, or Spam.
        </a>
      </section>

      <section className="mx-auto mt-8 max-w-4xl rounded-lg border border-[#d7a84f]/25 bg-[linear-gradient(135deg,rgba(31,21,10,0.92),rgba(10,7,4,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4d28b]">
            {content.title}
          </p>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#e7d8c2]">
            {content.description}
          </p>
        </div>

        {stageFlowShow && ticketSales ? (
          <>
            <dl className="mt-7 grid border-y border-[#d7a84f]/20 sm:grid-cols-3">
              <div className="border-b border-[#d7a84f]/20 px-4 py-5 text-center sm:border-b-0 sm:border-r">
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7a84f]">
                  Next Show
                </dt>
                <dd className="mt-2 font-semibold text-white">
                  {formatNewYorkShowDate(stageFlowShow.date)}
                </dd>
              </div>
              <SaleDate
                label="Early Access Begins"
                value={ticketSales.presaleStartsAt}
              />
              <SaleDate
                label="Public Ticket Sales Begin"
                value={ticketSales.publicSaleStartsAt}
                isLast
              />
            </dl>
          </>
        ) : null}

        {canShowPublicTicket ? (
          <div className="mt-6 text-center">
            <a
              href={publicTicketUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              Buy Advance Tickets
            </a>
          </div>
        ) : null}

        <div className="mt-6 border-t border-[#d7a84f]/20 pt-6 text-center">
          <p className="mx-auto max-w-2xl leading-7 text-[#d9c8aa]">
            Join the CMMS Mailing List now so you&apos;re ready when Early
            Access opens.
          </p>
          <Link
            href="/mailing-list"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            Join the Mailing List
          </Link>
        </div>
      </section>

      <GmailGuide variant="presale" />
    </main>
  );
}

function SaleDate({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string | null;
  isLast?: boolean;
}) {
  return (
    <div
      className={`border-b border-[#d7a84f]/20 px-4 py-5 text-center sm:border-b-0 ${isLast ? "" : "sm:border-r"}`}
    >
      <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7a84f]">
        {label}
      </dt>
      <dd className="mt-2 font-semibold text-white">
        {value ? formatTicketSaleDate(value) : "To be announced"}
      </dd>
    </div>
  );
}
