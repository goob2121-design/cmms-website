import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroFogVideo } from "@/components/HeroFogVideo";
import { Ticker } from "@/components/Ticker";
import { TicketCheckoutNote } from "@/components/TicketCheckoutNote";
import {
  getActiveTickerMessages,
  getSitePage,
  getSiteSetting,
} from "@/lib/supabase/cms";
import { getPublishedShows, type DbShow } from "@/lib/supabase/shows";
import { getSoldOutMessage, isTicketsAvailable } from "@/lib/tickets";
import { shows } from "./show-dates/showData";

const homepageShareImage =
  "https://www.cumberlandmountainmusic.com/cmms-og-image.png?v=2026-06-02";

export const metadata: Metadata = {
  title: "Cumberland Mountain Music Show",
  description:
    "Live bluegrass, gospel, and classic country music from Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "https://www.cumberlandmountainmusic.com/",
  },
  openGraph: {
    title: "Cumberland Mountain Music Show",
    description:
      "Live bluegrass, gospel, and classic country music from Cumberland Gap, Tennessee.",
    url: "https://www.cumberlandmountainmusic.com/",
    type: "website",
    images: [
      {
        url: homepageShareImage,
        width: 1200,
        height: 630,
        alt: "Cumberland Mountain Music Show",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cumberland Mountain Music Show",
    description:
      "Live bluegrass, gospel, and classic country music from Cumberland Gap, Tennessee.",
    images: [homepageShareImage],
  },
};

const fallbackHomepageAbout = {
  title: "About The Show",
  subtitle: "Built for families, stories, and real live music.",
  body:
    "The Cumberland Mountain Music Show was created by Bryan Turner as a place to celebrate the music, stories, and people that make this region special. Built around bluegrass, gospel, country, and traditional mountain music, the show brings families together for an evening of live entertainment in the heart of Cumberland Gap.",
};

const fallbackHomepageHeroText = {
  tagline: "The #1 Live Music Show in the Tri-State Area",
  genres: "Bluegrass • Gospel • Country • Traditional Mountain Music",
};

export const dynamic = "force-dynamic";

type ScheduleItem = {
  label: string;
  date: Date;
  title?: string;
  time?: string;
  venue?: string;
  advanceTicketPrice?: string;
  doorTicketPrice?: string;
  ticketUrl?: string;
  ticketsAvailable?: boolean;
  soldOutMessage?: string;
  detailsUrl?: string;
  promoImageUrl?: string;
  isFeatured?: boolean;
};

const fallbackSchedule: ScheduleItem[] = [
  { label: "February 7, 2026", date: new Date("2026-02-07T00:00:00") },
  { label: "April 18, 2026", date: new Date("2026-04-18T00:00:00") },
  ...shows.map((show) => ({
    label: show.shortDate,
    date: new Date(show.dateValue),
    ticketUrl: show.ticketUrl,
    ticketsAvailable: true,
    detailsUrl: show.detailsUrl,
  })),
];

function formatShowDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function formatShowTime(show: DbShow) {
  const parts = [];

  if (show.doors_time) {
    parts.push(`Doors ${show.doors_time}`);
  }

  if (show.show_time) {
    parts.push(`Show ${show.show_time}`);
  }

  return parts.join(" / ");
}

function fromDatabaseShow(show: DbShow): ScheduleItem {
  return {
    label: formatShowDate(show.show_date),
    date: new Date(`${show.show_date}T00:00:00`),
    title: show.title,
    time: formatShowTime(show),
    venue: show.venue ?? undefined,
    advanceTicketPrice: show.advance_ticket_price ?? undefined,
    doorTicketPrice: show.door_ticket_price ?? undefined,
    ticketUrl: show.ticket_url ?? undefined,
    ticketsAvailable: isTicketsAvailable(show.tickets_available),
    soldOutMessage: show.sold_out_message ?? undefined,
    detailsUrl: show.slug ? `/show-dates/${show.slug}` : undefined,
    promoImageUrl: show.promo_image_url ?? undefined,
    isFeatured: Boolean(show.is_featured),
  };
}

function getNextScheduleDate(schedule: ScheduleItem[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return schedule.find((show) => show.date >= today);
}

export default async function Home() {
  const [
    databaseShows,
    tickerMessages,
    tickerSpeedSetting,
    homepageAboutPage,
    homepageHeroTaglineSetting,
    homepageHeroGenresSetting,
  ] = await Promise.all([
    getPublishedShows(),
    getActiveTickerMessages(),
    getSiteSetting("homepage_ticker_speed"),
    getSitePage("homepage_about"),
    getSiteSetting("homepage_hero_tagline"),
    getSiteSetting("homepage_hero_genres"),
  ]);
  const schedule =
    databaseShows.length > 0
      ? [...databaseShows]
          .sort((a, b) => a.show_date.localeCompare(b.show_date))
          .map(fromDatabaseShow)
      : fallbackSchedule;
  const nextScheduleDate = getNextScheduleDate(schedule);
  const nextTicketsAvailable = isTicketsAvailable(
    nextScheduleDate?.ticketsAvailable,
  );
  const nextTicketUrl = nextScheduleDate?.ticketUrl;
  const nextTicketHref = nextTicketUrl ?? "/show-dates";
  const homepageAbout = {
    title: homepageAboutPage?.title?.trim() || fallbackHomepageAbout.title,
    subtitle:
      homepageAboutPage?.subtitle?.trim() || fallbackHomepageAbout.subtitle,
    body: homepageAboutPage?.body?.trim() || fallbackHomepageAbout.body,
  };
  const homepageHeroText = {
    tagline:
      homepageHeroTaglineSetting?.setting_value?.trim() ||
      fallbackHomepageHeroText.tagline,
    genres:
      homepageHeroGenresSetting?.setting_value?.trim() ||
      fallbackHomepageHeroText.genres,
  };

  return (
    <main className="relative z-10">
      <section className="relative isolate min-h-[78svh] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center brightness-[1.16]"
          style={{ backgroundImage: "url('/cmms-heade-V2.png')" }}
        />
        <HeroFogVideo />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(8,6,4,0.6),rgba(8,6,4,0.2)_48%,rgba(8,6,4,0.04)),linear-gradient(180deg,rgba(8,6,4,0.18),rgba(8,6,4,0.05)_34%,rgba(8,6,4,0.6)_68%,rgba(8,6,4,0.9)),radial-gradient(circle_at_50%_28%,rgba(215,168,79,0.12),transparent_42%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
        >
          <img
            src="/cmms-header-fg.png?v=2"
            alt=""
            className="h-full w-full object-cover object-center brightness-[0.88] drop-shadow-[0_0_18px_rgba(8,6,4,0.42)]"
          />
        </div>

        <div className="relative z-[3] flex min-h-[78svh] flex-col pt-[124px] sm:pt-[104px]">
          <Ticker
            messages={tickerMessages.map((ticker) => ticker.message)}
            speedSeconds={Number(tickerSpeedSetting?.setting_value ?? 30)}
          />

          <div className="mx-auto flex w-full max-w-7xl flex-1 items-end justify-center px-5 pb-8 pt-8 sm:px-8 lg:pb-10">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
              <Image
                src="/cmms-logo.png"
                alt="Cumberland Mountain Music Show"
                width={760}
                height={360}
                priority
                className="h-auto w-[min(84vw,580px)] object-contain drop-shadow-[0_18px_42px_rgba(0,0,0,0.72)] sm:w-[min(72vw,640px)]"
              />
              <p className="mt-5 text-balance text-xl font-semibold leading-8 text-[#fff7ea] drop-shadow-[0_8px_24px_rgba(0,0,0,0.58)] sm:text-2xl">
                {homepageHeroText.tagline}
              </p>
              <p className="mt-2 text-balance text-sm font-semibold uppercase tracking-[0.18em] text-[#f4d28b] drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] sm:text-base sm:tracking-[0.22em]">
                {homepageHeroText.genres}
              </p>
              <div className="mt-7 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
                {nextScheduleDate && !nextTicketsAvailable ? (
                  <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/45 bg-black/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#f4d28b]">
                    {getSoldOutMessage(nextScheduleDate.soldOutMessage)}
                  </span>
                ) : nextTicketUrl ? (
                  <a
                    href={nextTicketHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.38)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604]"
                  >
                    Buy Advance Tickets
                  </a>
                ) : (
                  <Link
                    href={nextTicketHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.38)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604]"
                  >
                    Buy Advance Tickets
                  </Link>
                )}
                <Link
                  href={nextScheduleDate?.detailsUrl ?? "/show-dates"}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#f4d28b]/65 bg-black/20 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#fff7ea] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#f4d28b] hover:text-[#f4d28b]"
                >
                  View Show Details
                </Link>
              </div>
              {nextTicketUrl && nextTicketsAvailable ? (
                <TicketCheckoutNote ticketUrl={nextTicketUrl} />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d7a84f]/12 bg-[#080604] px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d7a84f]">
              {homepageAbout.title}
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
              {homepageAbout.subtitle}
            </h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-8 text-[#e7d8c2]">
              {homepageAbout.body}
            </p>
          </article>

          <article className="rounded-lg border border-[#d7a84f]/25 bg-[linear-gradient(135deg,rgba(31,21,10,0.96),rgba(10,7,4,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Image
                src="/cmms-logo.png"
                alt="Cumberland Mountain Music"
                width={180}
                height={90}
                className="h-auto w-36 object-contain"
              />
              {nextScheduleDate ? (
                <p className="rounded-full bg-[#d7a84f] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#120d07]">
                  Next Show
                </p>
              ) : null}
            </div>

            <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
              2026 CMMS Schedule
            </h2>
            <p className="mt-3 text-[#d9c8aa]">
              Live bluegrass, gospel, and traditional mountain music in
              Cumberland Gap, Tennessee.
            </p>

            <ul className="mt-5 grid gap-3">
              {schedule.map((show) => {
                const isNextShow = nextScheduleDate?.label === show.label;
                const priceLine =
                  show.advanceTicketPrice && show.doorTicketPrice
                    ? `${show.advanceTicketPrice} advance / ${show.doorTicketPrice} at door`
                    : null;

                return (
                  <li
                    key={`${show.label}-${show.title ?? "cmms"}`}
                    className={`flex flex-col gap-2 rounded-md border px-4 py-3 transition sm:flex-row sm:items-center sm:justify-between ${
                      isNextShow
                        ? "border-[#d7a84f]/60 bg-[#d7a84f]/12 text-white"
                        : "border-[#d7a84f]/15 bg-black/20 text-[#e7d8c2]"
                    }`}
                  >
                    <span className="font-semibold">{show.label}</span>
                    <div className="flex flex-wrap items-center gap-3">
                      {isNextShow ? (
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                          Next Show
                        </span>
                      ) : null}
                      {show.detailsUrl ? (
                        <Link
                          href={show.detailsUrl}
                          className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4d28b] transition hover:text-white"
                        >
                          View Details
                        </Link>
                      ) : null}
                      {show.ticketUrl && isTicketsAvailable(show.ticketsAvailable) ? (
                        <a
                          href={show.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4d28b] transition hover:text-white"
                        >
                          Buy Advance Tickets
                        </a>
                      ) : !isTicketsAvailable(show.ticketsAvailable) ? (
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4d28b]">
                          {getSoldOutMessage(show.soldOutMessage)}
                        </span>
                      ) : null}
                    </div>
                    {(show.title || show.time || show.venue || priceLine) && (
                      <div className="text-sm leading-6 text-[#d9c8aa] sm:hidden">
                        {show.title ? <p>{show.title}</p> : null}
                        {show.time ? <p>{show.time}</p> : null}
                        {show.venue ? <p>{show.venue}</p> : null}
                        {priceLine ? <p>{priceLine}</p> : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {nextScheduleDate && !nextTicketsAvailable ? (
              <p className="mt-6 inline-flex rounded-full border border-[#d7a84f]/45 bg-black/25 px-5 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                {getSoldOutMessage(nextScheduleDate.soldOutMessage)}
              </p>
            ) : nextTicketUrl ? (
              <a
                href={nextTicketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
              >
                Buy Advance Tickets
              </a>
            ) : (
              <Link
                href="/show-dates"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
              >
                Buy Advance Tickets
              </Link>
            )}
            {nextTicketUrl && nextTicketsAvailable ? (
              <TicketCheckoutNote ticketUrl={nextTicketUrl} />
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}
