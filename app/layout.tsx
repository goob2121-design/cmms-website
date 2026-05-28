import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  defaultDescription,
  defaultSocialImage,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/metadata";
import {
  getSiteSetting,
  hasPublishedMedia,
  hasPublishedNews,
} from "@/lib/supabase/cms";
import { getNextPublishedShow } from "@/lib/supabase/shows";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    images: [
      {
        url: defaultSocialImage,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultSocialImage],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [
    showNews,
    showMedia,
    showBandSetting,
    showTeamSetting,
    nextShow,
  ] =
    await Promise.all([
    hasPublishedNews(),
    hasPublishedMedia(),
    getSiteSetting("show_meet_the_band"),
    getSiteSetting("show_meet_the_team"),
    getNextPublishedShow(),
  ]);
  const showBand = showBandSetting?.setting_value === "true";
  const showTeam = showTeamSetting?.setting_value === "true";
  const nextShowAnnouncement = nextShow
    ? getNextShowAnnouncement(nextShow)
    : null;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#080604] text-[#f8efe2]">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(191,142,62,0.18),transparent_32%),linear-gradient(135deg,rgba(15,13,10,0.88),rgba(8,6,4,0.98)_50%,rgba(37,24,12,0.92))]" />
          <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6a54c]/70 to-transparent" />
          <Navbar
            showNews={showNews}
            showMedia={showMedia}
            showBand={showBand}
            showTeam={showTeam}
            nextShowAnnouncement={nextShowAnnouncement}
          />

          {children}

          <footer className="relative z-10 border-t border-[#d7a84f]/15 px-6 py-8 text-center text-sm text-[#bda987] sm:px-8">
            <p>
              Cumberland Mountain Music, Cumberland Gap, Tennessee.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link
                href="/mailing-list"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7a84f] transition hover:text-[#f4d28b]"
              >
                Mailing List
              </Link>
              <Link
                href="/contact"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7a84f] transition hover:text-[#f4d28b]"
              >
                Contact
              </Link>
              <Link
                href="/become-a-sponsor"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7a84f] transition hover:text-[#f4d28b]"
              >
                Become a Sponsor
              </Link>
              <Link
                href="/snack-shop"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7a84f] transition hover:text-[#f4d28b]"
              >
                Snack Shop
              </Link>
              <Link
                href="/in-memory"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7a84f] transition hover:text-[#f4d28b]"
              >
                In Memory
              </Link>
            </div>
            <Link
              href="/admin"
              className="mt-4 inline-flex text-[11px] uppercase tracking-[0.18em] text-[#7d705f] transition hover:text-[#bda987]"
            >
              Staff Login
            </Link>
          </footer>
        </div>
      </body>
    </html>
  );
}

function getNextShowAnnouncement(show: {
  show_date: string;
  advance_ticket_price?: string | null;
}) {
  const today = new Date();
  const todayStart = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const [year, month, day] = show.show_date.split("-").map(Number);
  const showStart = Date.UTC(year, month - 1, day);
  const daysUntil = Math.ceil((showStart - todayStart) / 86_400_000);
  const showDateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(showStart));
  const daysLabel = daysUntil <= 0 ? "Today" : `${daysUntil} Days Away`;
  const ticketPrice = formatTicketPrice(show.advance_ticket_price);
  const ticketLabel = ticketPrice
    ? ` • Advance Tickets ${ticketPrice}`
    : "";

  return `Next Show: ${showDateLabel} • ${daysLabel}${ticketLabel}`;
}

function formatTicketPrice(price?: string | null) {
  if (!price) return null;
  const trimmed = price.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}
