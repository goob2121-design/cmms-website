import Image from "next/image";
import Link from "next/link";
import { HeroFogVideo } from "@/components/HeroFogVideo";
import { Ticker } from "@/components/Ticker";
import { TicketCheckoutNote } from "@/components/TicketCheckoutNote";
import { getActiveTickerMessages, getSiteSetting } from "@/lib/supabase/cms";
import { getPublishedShows, type DbShow } from "@/lib/supabase/shows";
import { shows } from "./show-dates/showData";

const generalTicketUrl = "https://www.pinnaclestudiotn.com/cmms";

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
  const [databaseShows, tickerMessages, tickerSpeedSetting] = await Promise.all([
    getPublishedShows(),
    getActiveTickerMessages(),
    getSiteSetting("homepage_ticker_speed"),
  ]);
  const schedule =
    databaseShows.length > 0
      ? [...databaseShows]
          .sort((a, b) => a.show_date.localeCompare(b.show_date))
          .map(fromDatabaseShow)
      : fallbackSchedule;
  const nextScheduleDate = getNextScheduleDate(schedule);
  const nextTicketUrl = nextScheduleDate?.ticketUrl ?? generalTicketUrl;

  return (
    <main className="relative z-10">
      <section className="relative min-h-[78svh] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/cmms-header.png')" }}
        />
        <HeroFogVideo />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,4,0.74),rgba(8,6,4,0.3)_48%,rgba(8,6,4,0.08)),linear-gradient(180deg,rgba(8,6,4,0.28),rgba(8,6,4,0.08)_34%,rgba(8,6,4,0.78)_68%,rgba(8,6,4,1)),radial-gradient(circle_at_50%_28%,rgba(215,168,79,0.12),transparent_42%)]" />

        <div className="relative flex min-h-[78svh] flex-col pt-[124px] sm:pt-[104px]">
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
                className="h-auto w-[min(88vw,620px)] object-contain drop-shadow-[0_18px_42px_rgba(0,0,0,0.72)] sm:w-[min(76vw,680px)]"
              />
              <p className="mt-5 text-balance text-xl font-semibold leading-8 text-[#fff7ea] drop-shadow-[0_8px_24px_rgba(0,0,0,0.58)] sm:text-2xl">
                The #1 Live Music Show in the Tri-State Area
              </p>
              <p className="mt-2 text-balance text-sm font-semibold uppercase tracking-[0.18em] text-[#f4d28b] drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] sm:text-base sm:tracking-[0.22em]">
                Bluegrass • Gospel • Country • Traditional Mountain Music
              </p>
              <div className="mt-7 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
                <a
                  href={nextTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.38)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604]"
                >
                  Buy Tickets
                </a>
                <Link
                  href={nextScheduleDate?.detailsUrl ?? "/show-dates"}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#f4d28b]/65 bg-black/20 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#fff7ea] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#f4d28b] hover:text-[#f4d28b]"
                >
                  View Show Details
                </Link>
              </div>
              <TicketCheckoutNote />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d7a84f]/12 bg-[#080604] px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d7a84f]">
              About The Show
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
              Built for families, stories, and real live music.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#e7d8c2]">
              The Cumberland Mountain Music Show was created by Bryan Turner as
              a place to celebrate the music, stories, and people that make this
              region special. Built around bluegrass, gospel, country, and
              traditional mountain music, the show brings families together for
              an evening of live entertainment in the heart of Cumberland Gap.
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
                      {show.ticketUrl ? (
                        <a
                          href={show.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4d28b] transition hover:text-white"
                        >
                          Buy Tickets
                        </a>
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

            <a
              href={nextScheduleDate?.ticketUrl ?? "/show-dates"}
              target={nextScheduleDate?.ticketUrl ? "_blank" : undefined}
              rel={nextScheduleDate?.ticketUrl ? "noopener noreferrer" : undefined}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              Buy Tickets
            </a>
            {nextScheduleDate?.ticketUrl ? <TicketCheckoutNote /> : null}
          </article>
        </div>
      </section>
    </main>
  );
}
