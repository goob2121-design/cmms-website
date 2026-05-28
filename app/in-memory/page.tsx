import type { Metadata } from "next";
import Image from "next/image";
import { createPublicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "In Memory | Cumberland Mountain Music",
  description:
    "A Cumberland Mountain Music tribute honoring Steve Gulley and Larry Carter and their lasting impact on bluegrass music in the Cumberland Gap region.",
  path: "/in-memory",
  image: "/in-memory.jpg",
});

const tributeParagraphs = [
  "One thing at the Cumberland Gap Convention Center that means a great deal to me is the memorial sign honoring Steve Gulley and Larry Carter.",
  "I'm proud to have this displayed at the Cumberland Mountain Music Show because these two men meant so much to bluegrass music in our region, and to the story of this show itself. Their influence is still felt every time a note is played on that stage, and I only wish I had created this tribute sooner.",
  "Steve Gulley was a world-class singer, songwriter, musician, and one of the founding voices behind the Cumberland Mountain Music Show. His impact on bluegrass music reached far beyond our area, but to those of us who knew him personally, he was even more special as a friend, mentor, and supporter of mountain music.",
  "Larry Carter was also a huge part of the early days of CMMS. From working sound to being the longtime voice of \"Bluegrass for Breakfast\" on the LMU radio station, Larry helped keep bluegrass music alive and connected throughout our community. He was also a musician who loved bluegrass music as much as anyone, and he was always willing to help wherever needed. Larry played an important role behind the scenes and helped create the welcoming atmosphere that made the show special from the very beginning.",
  "Their love for music lives on through this show.",
];

export default function InMemoryPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          In Memory
        </p>
        <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:whitespace-nowrap lg:text-[3.25rem]">
          In Memory of Steve Gulley &amp; Larry Carter
        </h1>
      </section>

      <section className="mt-9 overflow-hidden rounded-lg border border-[#d7a84f]/24 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <Image
          src="/in-memory.jpg"
          alt="Memorial sign honoring Steve Gulley and Larry Carter"
          width={1400}
          height={900}
          priority
          className="h-auto w-full object-contain"
        />
      </section>

      <section className="mx-auto mt-9 max-w-3xl rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/82 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-8">
        <div className="space-y-6 text-lg leading-8 text-[#d9c8aa]">
          {tributeParagraphs.map((paragraph, index) => (
            <p key={paragraph} className={index === 0 ? "text-[#e7d8c2]" : ""}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 border-t border-[#d7a84f]/16 pt-5 text-right">
          <p
            className="text-3xl italic text-[#f4d28b]/90 sm:text-4xl"
            style={{
              fontFamily:
                '"Brush Script MT", "Segoe Script", "Lucida Handwriting", "Snell Roundhand", cursive',
              letterSpacing: "0.01em",
            }}
          >
            Bryan Turner
          </p>
        </div>

        <blockquote className="mt-8 rounded-lg border border-[#d7a84f]/28 bg-[linear-gradient(135deg,rgba(215,168,79,0.12),rgba(0,0,0,0.24))] p-6 text-center text-2xl font-semibold leading-9 text-[#f4d28b]">
          &ldquo;Gone from the stage, never from the song.&rdquo;
        </blockquote>
      </section>
    </main>
  );
}
