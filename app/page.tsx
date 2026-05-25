import Image from "next/image";
import { Ticker } from "@/components/Ticker";
import { getNextShow, shows } from "./show-dates/showData";

const generalTicketUrl = "https://www.pinnaclestudiotn.com/cmms";

type ScheduleItem = {
  label: string;
  date: Date;
  ticketUrl?: string;
  detailsUrl?: string;
};

const schedule: ScheduleItem[] = [
  { label: "February 7, 2026", date: new Date("2026-02-07T00:00:00") },
  { label: "April 18, 2026", date: new Date("2026-04-18T00:00:00") },
  ...shows.map((show) => ({
    label: show.shortDate,
    date: new Date(show.dateValue),
    ticketUrl: show.ticketUrl,
    detailsUrl: show.detailsUrl,
  })),
];

function getNextScheduleDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return schedule.find((show) => show.date >= today);
}

export default function Home() {
  const nextShow = getNextShow();
  const nextScheduleDate = getNextScheduleDate();

  return (
    <main className="relative z-10">
      <section className="relative min-h-[78svh] overflow-hidden">
        <div className="absolute inset-x-0 top-0 aspect-[2073/758] max-h-[78svh] min-h-[360px] overflow-hidden sm:min-h-[420px] lg:min-h-0">
          <Image
            src="/cmms-header.png"
            alt="Cumberland Mountain Music live show"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-contain object-top"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,4,0.74),rgba(8,6,4,0.3)_48%,rgba(8,6,4,0.08)),linear-gradient(180deg,rgba(8,6,4,0.28),rgba(8,6,4,0.08)_34%,rgba(8,6,4,0.78)_68%,rgba(8,6,4,1)),radial-gradient(circle_at_50%_28%,rgba(215,168,79,0.12),transparent_42%)]" />

        <div className="relative flex min-h-[78svh] flex-col pt-[124px] sm:pt-[104px]">
          <Ticker />

          <div className="mx-auto flex w-full max-w-7xl flex-1 items-end px-5 pb-8 pt-8 sm:px-8 lg:pb-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#f4d28b]">
                Home of
              </p>
              <h1 className="mt-3 text-balance text-5xl font-semibold leading-[1.02] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
                The Cumberland Mountain Music Show
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-8 text-[#f8ead6] sm:text-xl">
                Live bluegrass, gospel, and traditional mountain music from the
                heart of Appalachia.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <a
                  href={nextShow?.ticketUrl ?? generalTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.38)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604]"
                >
                  Get Tickets
                </a>
                <a
                  href="/show-dates"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#f4d28b]/65 bg-black/20 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#fff7ea] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#f4d28b] hover:text-[#f4d28b]"
                >
                  See Upcoming Shows
                </a>
                {nextShow?.detailsUrl ? (
                  <a
                    href={nextShow.detailsUrl}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#f4d28b]/40 bg-black/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#fff7ea] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#f4d28b] hover:text-[#f4d28b]"
                  >
                    Show Details
                  </a>
                ) : null}
              </div>
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

                return (
                  <li
                    key={show.label}
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
                  </li>
                );
              })}
            </ul>

            <a
              href={nextShow?.ticketUrl ?? "/show-dates"}
              target={nextShow?.ticketUrl ? "_blank" : undefined}
              rel={nextShow?.ticketUrl ? "noopener noreferrer" : undefined}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              Buy Tickets
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
