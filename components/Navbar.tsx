"use client";

import {
  CalendarDays,
  Handshake,
  Home,
  Link2,
  Mail,
  Music,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Show Dates", href: "/show-dates", Icon: CalendarDays },
  { label: "About", href: "/about", Icon: Music },
  { label: "Sponsors", href: "/sponsors", Icon: Handshake },
  { label: "Contact", href: "/contact", Icon: Mail },
  {
    label: "Facebook",
    href: "https://facebook.com/cumberlandmountainmusic",
    Icon: Link2,
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

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
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 lg:justify-start"
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
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm font-semibold text-[#f7ead7] sm:gap-x-6"
          aria-label="Primary navigation"
        >
          {navItems.map(({ href, label, Icon }) => {
            const isExternal = href.startsWith("http");
            const className =
              "group inline-flex items-center gap-1.5 transition hover:text-[#f4d28b]";
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
          <a
            href="https://www.pinnaclestudiotn.com/cmms"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#d7a84f] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#120d07] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            <Ticket
              aria-hidden="true"
              className="h-4 w-4 transition duration-200 group-hover:-rotate-6"
              strokeWidth={2}
            />
            <span>Tickets</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
