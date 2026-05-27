"use client";

import { useEffect, useState } from "react";

const quoteIntervalMs = 5000;

export function SnackShopQuoteRotator({ lines }: { lines: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || lines.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setIsVisible(false);

      window.setTimeout(() => {
        setCurrentIndex((current) => (current + 1) % lines.length);
        setIsVisible(true);
      }, 420);
    }, quoteIntervalMs);

    return () => window.clearInterval(interval);
  }, [lines.length]);

  return (
    <section className="mt-6 rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.82),rgba(10,7,4,0.94))] p-5 text-center shadow-[0_18px_55px_rgba(0,0,0,0.2)]">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d7a84f]">
        Heard Around the Snack Shop
      </p>
      <blockquote
        className={`mx-auto mt-4 max-w-4xl text-xl font-semibold leading-8 text-[#f8efe2] transition-opacity duration-500 sm:whitespace-nowrap sm:text-2xl ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-[#f4d28b]">&ldquo;</span>
        {lines[currentIndex]}
        <span className="text-[#f4d28b]">&rdquo;</span>
      </blockquote>
    </section>
  );
}
