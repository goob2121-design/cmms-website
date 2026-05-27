"use client";

import {
  CalendarDays,
  Handshake,
  Home,
  Images,
  Link2,
  Mail,
  Music,
  Newspaper,
  Users,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar({
  showNews = false,
  showMedia = false,
  showBand = false,
  showTeam = false,
  nextShowAnnouncement = null,
}: {
  showNews?: boolean;
  showMedia?: boolean;
  showBand?: boolean;
  showTeam?: boolean;
  nextShowAnnouncement?: string | null;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navItems: { label: string; href: string; Icon: LucideIcon }[] = [
    { label: "Home", href: "/", Icon: Home },
    { label: "Show Dates", href: "/show-dates", Icon: CalendarDays },
    { label: "About", href: "/about", Icon: Music },
    ...(showBand
      ? [{ label: "Meet the Band", href: "/meet-the-band", Icon: Users }]
      : []),
    ...(showTeam
      ? [{ label: "Meet the Team", href: "/meet-the-team", Icon: Users }]
      : []),
    { label: "Sponsors", href: "/sponsors", Icon: Handshake },
    { label: "Contact", href: "/contact", Icon: Mail },
    ...(showNews ? [{ label: "News", href: "/news", Icon: Newspaper }] : []),
    ...(showMedia ? [{ label: "Media", href: "/media", Icon: Images }] : []),
    {
      label: "Facebook",
      href: "https://facebook.com/cumberlandmountainmusic",
      Icon: Link2,
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`scroll-dark-navbar fixed inset-x-0 top-0 z-50 border-b transition duration-300 ${
        isScrolled
          ? "border-[#d7a84f]/20 bg-[#080604]/92 shadow-[0_16px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl"
          : "border-white/10 bg-[#080604]/24 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:gap-4 xl:gap-5">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center gap-2.5 lg:justify-start"
        >
          <Image
            src="/cmms-round-logo.png"
            alt="Cumberland Mountain Music"
            width={58}
            height={58}
            priority
            className="h-12 w-12 rounded-full object-contain shadow-[0_0_30px_rgba(215,168,79,0.22)]"
          />
          <span className="text-left text-sm font-semibold uppercase tracking-[0.2em] text-[#f4d28b]">
            Cumberland
            <span className="block text-[#fff7ea]">Mountain Music</span>
          </span>
        </Link>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm font-semibold text-[#f7ead7] lg:min-w-0 lg:flex-1 lg:flex-nowrap lg:gap-x-2.5 xl:gap-x-3"
          aria-label="Primary navigation"
        >
          {navItems.map(({ href, label, Icon }) => {
            const isExternal = href.startsWith("http");
            const className =
              "group inline-flex items-center gap-1 whitespace-nowrap transition hover:text-[#f4d28b] xl:gap-1.5";
            const content = (
              <>
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 text-[#d7a84f]/78 transition duration-200 group-hover:-translate-y-0.5 group-hover:text-[#f4d28b]"
                  strokeWidth={1.8}
                />
                <span>{label}</span>
              </>
            );

            return isExternal ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <Link key={href} href={href} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center justify-center gap-2 lg:ml-auto">
          <Link
            href="/show-dates"
            className="group inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#d7a84f] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#120d07] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            <Ticket
              aria-hidden="true"
              className="h-4 w-4 transition duration-200 group-hover:-rotate-6"
              strokeWidth={2}
            />
            <span>Tickets</span>
          </Link>
        </div>
      </div>
      {nextShowAnnouncement ? (
        <Link
          href="/show-dates"
          className="block border-y border-[#d7a84f]/18 bg-black/34 px-4 py-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#f4d28b] transition hover:bg-black/45 hover:text-[#fff7ea] sm:text-xs"
        >
          <span className="mx-auto block max-w-7xl truncate">
            {nextShowAnnouncement}
          </span>
        </Link>
      ) : null}
    </header>
  );
}
