import type { Metadata } from "next";
import Link from "next/link";
import { MailingListForm } from "@/app/mailing-list/mailing-list-form";
import { formatNewYorkShowDate } from "@/lib/countdown";
import { createPublicPageMetadata } from "@/lib/metadata";
import {
  formatTicketSaleDate,
  getPresalePageState,
  isActivePresaleDeliveryWindow,
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
    description: "There is no upcoming show to announce right now. Please check back soon.",
  },
  unavailable: {
    title: "Presale Information Temporarily Unavailable",
    description: "Presale information is temporarily unavailable. Please check back shortly.",
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
  const activeDeliveryWindow = isActivePresaleDeliveryWindow(ticketSales);
  const fallbackShow = stageFlowShow
    ? shows.find(
        (show) => show.dateValue.split("T")[0] === stageFlowShow.date,
      )
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
  const detailsUrl = databaseShowMatches
    ? `/show-dates/${nextPublishedShow?.slug}`
    : fallbackShow?.detailsUrl ??
      (stageFlowShow?.slug ? `/show-dates/${stageFlowShow.slug}` : "/show-dates");
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
          CMMS Mailing List subscribers get early access to tickets before they
          go on sale to the general public, giving you the first opportunity to
          purchase tickets and choose from available reserved seats.
        </p>
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
          <dl className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-[#d7a84f]/18 bg-black/25 p-4 text-center sm:col-span-3">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7a84f]">
                Next Show
              </dt>
              <dd className="mt-2 text-lg font-semibold text-white">
                {stageFlowShow.name}
              </dd>
              <dd className="mt-1 text-sm text-[#d9c8aa]">
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
            />
            <div className="flex min-h-24 items-center justify-center rounded-md border border-[#d7a84f]/18 bg-black/25 p-4 text-center">
              <Link
                href={detailsUrl}
                className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4d28b] transition hover:text-white"
              >
                View Show Details
              </Link>
            </div>
          </dl>
        ) : null}

        {activeDeliveryWindow ? (
          <aside className="mt-6 rounded-md border border-[#d7a84f]/25 bg-black/25 px-5 py-4 text-center">
            <h2 className="text-sm font-semibold text-white">
              Already on the mailing list?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#d9c8aa]">
              Watch your inbox for your Early Access ticket link. If you don’t
              see it, check your Spam, Promotions, or Social folders.
            </p>
          </aside>
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
      </section>

      <section className="mx-auto mt-8 max-w-4xl rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d7a84f]">
          Stay Connected
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          Join the Mailing List
        </h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#d9c8aa]">
          {activeDeliveryWindow
            ? "Not on the list yet? Join below and we’ll send you the current Early Access ticket link while the presale is open."
            : pageState === "upcoming"
              ? "Join now so you’re on the list when Early Access opens."
              : "Join for future Early Access announcements, show news, and exclusive offers."}
        </p>
        <MailingListForm />
        <p className="mt-5 text-sm leading-6 text-[#bda987]">
          Occasional show announcements, ticket reminders, and CMMS news.
          Unsubscribe anytime.
        </p>
      </section>
    </main>
  );
}

function SaleDate({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-md border border-[#d7a84f]/18 bg-black/25 p-4 text-center">
      <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7a84f]">
        {label}
      </dt>
      <dd className="mt-2 font-semibold text-white">
        {value ? formatTicketSaleDate(value) : "To be announced"}
      </dd>
    </div>
  );
}
