import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Cumberland Mountain Music",
  description:
    "Learn about The Cumberland Mountain Music Show in Cumberland Gap, Tennessee, founded and hosted by Bryan Turner.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="overflow-hidden rounded-lg border border-[#d7a84f]/25 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <Image
            src="/cmms-people-saying.png"
            alt="Audience comments about Cumberland Mountain Music"
            width={1200}
            height={900}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            About
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            The Cumberland Mountain Music Show
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#e7d8c2]">
            The Cumberland Mountain Music Show grew out of a desire to create a
            family-friendly stage show that celebrates the musical heritage of
            the Cumberland Gap region. Founded and hosted by Bryan Turner, the
            show brings together bluegrass, gospel, country, and traditional
            mountain music in a format that feels welcoming, local, and rooted
            in the stories of the people who live here.
          </p>
          <p className="mt-5 text-lg leading-8 text-[#d9c8aa]">
            Each show is built to highlight talented musicians, special guests,
            and the kind of songs that have been passed down through families,
            churches, jam sessions, front porches, and stages across Appalachia.
            The goal is simple: give people a place to gather, laugh, remember,
            sing along, and enjoy real live music together.
          </p>
          <p className="mt-5 text-lg leading-8 text-[#d9c8aa]">
            The Cumberland Mountain Music Show is held at the Cumberland Gap
            Convention Center in Cumberland Gap, Tennessee.
          </p>
        </div>
      </section>
    </main>
  );
}
