"use client";

import {
  CalendarDays,
  ChevronDown,
  X,
  Handshake,
  Home,
  Images,
  Mail,
  Menu,
  Music,
  Newspaper,
  Users,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const navItems: { label: string; href: string; Icon: LucideIcon }[] = [
    { label: "Home", href: "/", Icon: Home },
    { label: "Shows", href: "/show-dates", Icon: CalendarDays },
    { label: "Sponsors", href: "/sponsors", Icon: Handshake },
    { label: "Merch", href: "/merch", Icon: Images },
    { label: "Contact", href: "/contact", Icon: Mail },
    ...(showNews ? [{ label: "News", href: "/news", Icon: Newspaper }] : []),
    ...(showMedia ? [{ label: "Media", href: "/media", Icon: Images }] : []),
  ];
  const navItemsBeforeAbout = navItems.slice(0, 2);
  const navItemsAfterAbout = navItems.slice(2);
  const aboutItems: { label: string; href: string; Icon: LucideIcon }[] = [
    { label: "About CMMS", href: "/about", Icon: Music },
    ...(showBand
      ? [{ label: "Meet the Band", href: "/meet-the-band", Icon: Users }]
      : []),
    ...(showTeam
      ? [{ label: "Meet the Team", href: "/meet-the-team", Icon: Users }]
      : []),
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

  useEffect(() => {
    if (!isAboutOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        aboutDropdownRef.current &&
        !aboutDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAboutOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAboutOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAboutOpen]);

  return (
    <header
      className={`scroll-dark-navbar fixed inset-x-0 top-0 z-50 border-b transition duration-300 ${
        isScrolled
          ? "border-[#d7a84f]/20 bg-[#080604]/92 shadow-[0_16px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl"
          : "border-white/10 bg-[#080604]/24 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-nowrap items-center gap-3 px-4 py-3 sm:px-8 lg:gap-4 lg:py-4 xl:gap-5">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/cmms-round-logo.png"
            alt="Cumberland Mountain Music"
            width={58}
            height={58}
            priority
            className="h-10 w-10 rounded-full object-contain shadow-[0_0_30px_rgba(215,168,79,0.22)] sm:h-12 sm:w-12"
          />
          <span className="hidden min-w-[10.5rem] text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#f4d28b] sm:block">
            Cumberland
            <span className="block text-[#fff7ea]">Mountain Music</span>
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
          <Link
            href="/show-dates"
            onClick={() => setIsMenuOpen(false)}
            className="group inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#d7a84f] px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#120d07] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:bg-[#f1c86e] sm:px-4 sm:text-xs"
          >
            <Ticket
              aria-hidden="true"
              className="h-3.5 w-3.5 transition duration-200 group-hover:-rotate-6 sm:h-4 sm:w-4"
              strokeWidth={2}
            />
            <span>Tickets</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-primary-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7a84f]/35 bg-black/24 text-[#f4d28b] transition hover:border-[#d7a84f]/65 hover:text-white"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
            )}
            <span className="sr-only">
              {isMenuOpen ? "Close navigation" : "Open navigation"}
            </span>
          </button>
        </div>

        <nav
          id="mobile-primary-navigation"
          className={`w-full flex-col gap-3 border-t border-[#d7a84f]/14 pt-3 text-sm font-semibold text-[#f7ead7] lg:flex lg:w-auto lg:min-w-0 lg:flex-1 lg:flex-row lg:flex-nowrap lg:items-center lg:justify-center lg:gap-x-2.5 lg:border-0 lg:pt-0 xl:gap-x-3 ${
            isMenuOpen ? "flex" : "hidden"
          }`}
          aria-label="Primary navigation"
        >
          {navItemsBeforeAbout.map(({ href, label, Icon }) => {
            const className =
              "group inline-flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 transition hover:text-[#f4d28b] lg:gap-1 lg:px-0 lg:py-0 xl:gap-1.5";
            return (
              <Link
                key={href}
                href={href}
                className={className}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 text-[#d7a84f]/78 transition duration-200 group-hover:-translate-y-0.5 group-hover:text-[#f4d28b]"
                  strokeWidth={1.8}
                />
                <span>{label}</span>
              </Link>
            );
          })}
          <div
            className="nav-dropdown group relative"
            ref={aboutDropdownRef}
            onMouseEnter={() => setIsAboutOpen(true)}
            onMouseLeave={() => setIsAboutOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsAboutOpen((current) => !current)}
              className="group inline-flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 transition hover:text-[#f4d28b] lg:gap-1 lg:px-0 lg:py-0 xl:gap-1.5"
              aria-expanded={isAboutOpen}
            >
              <Music
                aria-hidden="true"
                className="h-4 w-4 text-[#d7a84f]/78 transition duration-200 group-hover:-translate-y-0.5 group-hover:text-[#f4d28b]"
                strokeWidth={1.8}
              />
              <span>About</span>
              <ChevronDown
                aria-hidden="true"
                className={`h-3.5 w-3.5 text-[#d7a84f]/78 transition ${
                  isAboutOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>
            <div
              className={`dropdown-menu mt-2 gap-1 rounded-md border border-[#d7a84f]/15 bg-black/20 p-2 lg:absolute lg:left-1/2 lg:top-full lg:z-50 lg:mt-0 lg:min-w-48 lg:-translate-x-1/2 lg:bg-[#080604]/96 lg:shadow-[0_18px_42px_rgba(0,0,0,0.38)] lg:backdrop-blur-xl ${
                isAboutOpen ? "grid" : "hidden"
              }`}
            >
              {aboutItems.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-[#d7a84f]/10 hover:text-[#f4d28b]"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAboutOpen(false);
                  }}
                >
                  <Icon
                    aria-hidden="true"
                    className="h-4 w-4 text-[#d7a84f]/78"
                    strokeWidth={1.8}
                  />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
          {navItemsAfterAbout.map(({ href, label, Icon }) => {
            const isExternal = href.startsWith("http");
            const className =
              "group inline-flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 transition hover:text-[#f4d28b] lg:gap-1 lg:px-0 lg:py-0 xl:gap-1.5";
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
                onClick={() => setIsMenuOpen(false)}
              >
                {content}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={className}
                onClick={() => setIsMenuOpen(false)}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center justify-center gap-2 lg:ml-auto lg:flex">
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
