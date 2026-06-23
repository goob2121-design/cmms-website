import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaCard } from "@/components/MediaCard";
import { PromoLightbox } from "@/components/PromoLightbox";
import { TicketCheckoutNote } from "@/components/TicketCheckoutNote";
import { SponsorLevelBadge } from "@/lib/sponsorLevels";
import { getPublishedMediaItemsForShow } from "@/lib/supabase/cms";
import { getActiveSponsorsForShow } from "@/lib/supabase/sponsors";
import { getPublishedShowBySlug } from "@/lib/supabase/shows";
import { getSoldOutMessage, isTicketsAvailable } from "@/lib/tickets";

type ShowDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function formatSponsorShowDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  const day = date.getUTCDate();
  const suffix =
    day % 100 >= 11 && day % 100 <= 13
      ? "th"
      : day % 10 === 1
        ? "st"
        : day % 10 === 2
          ? "nd"
          : day % 10 === 3
            ? "rd"
            : "th";
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  }).format(date);

  return `${month} ${day}${suffix}`;
}

function getSponsorShowTitle(showTitle: string) {
  return showTitle.toLowerCase().includes("christmas")
    ? "Cumberland Mountain Music Christmas Show"
    : "Cumberland Mountain Music Show";
}

function formatPriceLine(
  advanceTicketPrice?: string | null,
  doorTicketPrice?: string | null,
) {
  if (advanceTicketPrice && doorTicketPrice) {
    return `${advanceTicketPrice} advance / ${doorTicketPrice} at the door.`;
  }

  if (advanceTicketPrice) {
    return `${advanceTicketPrice} advance.`;
  }

  if (doorTicketPrice) {
    return `${doorTicketPrice} at the door.`;
  }

  return null;
}

export async function generateMetadata({
  params,
}: ShowDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const show = await getPublishedShowBySlug(slug);

  if (!show) {
    return {
      title: "Show Not Found | Cumberland Mountain Music",
    };
  }

  return {
    title: `${show.title} | Cumberland Mountain Music`,
    description:
      show.short_description ??
      `Details for ${show.title} at The Cumberland Mountain Music Show.`,
    alternates: {
      canonical: `/show-dates/${show.slug}`,
    },
  };
}

export default async function ShowDetailsPage({ params }: ShowDetailsPageProps) {
  const { slug } = await params;
  const show = await getPublishedShowBySlug(slug);

  if (!show) {
    notFound();
  }

  const [sponsors, mediaItems] = await Promise.all([
    getActiveSponsorsForShow(show.id),
    getPublishedMediaItemsForShow(show.id),
  ]);
  const ticketsAvailable = isTicketsAvailable(show.tickets_available);

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12 pt-32 sm:px-8 lg:pb-16 lg:pt-34">
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Show Details
        </p>
        <h1 className="mx-auto mt-3 max-w-5xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:whitespace-nowrap lg:text-6xl">
          {show.title}
        </h1>
        {show.short_description ? (
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#e7d8c2]">
            {show.short_description}
          </p>
        ) : null}
        {show.featured_text ? (
          <p className="mx-auto mt-3 max-w-3xl text-lg font-semibold leading-8 text-[#f4d28b]">
            {show.featured_text}
          </p>
        ) : null}

        {show.promo_image_url ? (
          <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-lg border border-[#d7a84f]/25 bg-black/25 shadow-[0_18px_55px_rgba(0,0,0,0.3)]">
            <PromoLightbox
              src={show.promo_image_url}
              alt={`${show.title} promo`}
              priority
            />
          </div>
        ) : null}
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="rounded-lg border border-[#d7a84f]/25 bg-[linear-gradient(135deg,rgba(31,21,10,0.9),rgba(10,7,4,0.92))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.26)] sm:p-6">
          <h2 className="text-2xl font-semibold text-white">Show Info</h2>
          <dl className="mt-4 space-y-4 text-[#d9c8aa]">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                Date
              </dt>
              <dd className="mt-2">{formatDate(show.show_date)}</dd>
            </div>
            {(show.doors_time || show.show_time || show.end_time) && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                  Time
                </dt>
                <dd className="mt-2">
                  {show.doors_time ? `Doors ${show.doors_time}. ` : ""}
                  {show.show_time ? `Show ${show.show_time}.` : ""}
                  {show.end_time ? ` Ends ${show.end_time}.` : ""}
                </dd>
              </div>
            )}
            {(show.venue || show.address) && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                  Venue
                </dt>
                <dd className="mt-2">
                  {show.venue}
                  {show.address ? (
                    <>
                      <br />
                      {show.address}
                    </>
                  ) : null}
                </dd>
              </div>
            )}
            {formatPriceLine(
              show.advance_ticket_price,
              show.door_ticket_price,
            ) ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                  Tickets
                </dt>
                <dd className="mt-2">
                  {formatPriceLine(
                    show.advance_ticket_price,
                    show.door_ticket_price,
                  )}
                </dd>
              </div>
            ) : null}
            {show.special_guests ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
                  Special Guests
                </dt>
                <dd className="mt-2 whitespace-pre-line">
                  {show.special_guests}
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>

        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.28)] sm:p-6">
          {show.full_details ? (
            <div className="whitespace-pre-line text-lg leading-8 text-[#e7d8c2]">
              {show.full_details}
            </div>
          ) : (
            <p className="text-lg leading-8 text-[#e7d8c2]">
              More details for this show will be announced soon.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {show.ticket_url && ticketsAvailable ? (
              <a
                href={show.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
              >
                Buy Advance Tickets
              </a>
            ) : !ticketsAvailable ? (
              <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/45 bg-black/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                {getSoldOutMessage(show.sold_out_message)}
              </span>
            ) : null}
            {show.reserved_seating_url ? (
              <a
                href={show.reserved_seating_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
              >
                Reserved Seating
              </a>
            ) : null}
            <Link
              href="/show-dates"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Back to Show Dates
            </Link>
          </div>
          {show.reserved_seating_url ? (
            <p className="mt-3 text-center text-sm leading-6 text-[#bda987]">
              Reserved seating links are emailed after ticket purchase. Please allow up to 24 hours for delivery.
            </p>
          ) : null}
          {show.ticket_url && ticketsAvailable ? (
            <TicketCheckoutNote ticketUrl={show.ticket_url} />
          ) : null}
        </article>
      </section>

      {mediaItems.length > 0 ? (
        <section className="mt-7 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d7a84f]">
                Media
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Photos & Videos From This Show
              </h2>
            </div>
            <Link
              href="/media"
              className="text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b] transition hover:text-white"
            >
              View Gallery
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mediaItems.slice(0, 6).map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-7 rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.88),rgba(10,7,4,0.96))] p-5 text-center shadow-[0_18px_55px_rgba(0,0,0,0.22)] sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d7a84f]">
          Concessions
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Visit Mamaw Gerald&apos;s Snack Shop during the show!
        </h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#d9c8aa]">
          Grab hot dogs, pizza, homemade fried pies, fresh coffee, cold drinks,
          and intermission favorites while helping support the Cumberland
          Mountain Music Show.
        </p>
        <Link
          href="/snack-shop"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
        >
          View Snack Menu
        </Link>
      </section>

      {sponsors.length > 0 ? (
        <section className="mt-7 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Proud Sponsors of the {formatSponsorShowDate(show.show_date)}{" "}
            {getSponsorShowTitle(show.title)}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-[#d9c8aa] sm:text-base">
            Please support the businesses that help make live music possible.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sponsors.map((sponsor) => {
              const sponsorContent = (
                <div className="flex h-full flex-col items-center justify-center rounded-md border border-[#d7a84f]/15 bg-black/25 p-5 text-center transition hover:border-[#d7a84f]/45">
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={`${sponsor.name} logo`}
                      className="max-h-20 w-auto max-w-full object-contain"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-white">
                      {sponsor.name}
                    </p>
                  )}
                  {sponsor.logo_url ? (
                    <p className="mt-4 font-semibold text-white">
                      {sponsor.name}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <SponsorLevelBadge level={sponsor.sponsor_level} />
                  </div>
                </div>
              );

              return sponsor.website_url ? (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sponsorContent}
                </a>
              ) : (
                <div key={sponsor.id}>{sponsorContent}</div>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
