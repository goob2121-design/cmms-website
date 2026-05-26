import type { Metadata } from "next";
import { PersonCard } from "@/components/PersonCard";
import { createPublicPageMetadata } from "@/lib/metadata";
import { getPublishedPeopleProfiles } from "@/lib/supabase/people";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Meet the Team | Cumberland Mountain Music",
  description:
    "Meet the people working behind the scenes to help make The Cumberland Mountain Music Show possible.",
  path: "/meet-the-team",
});

export const dynamic = "force-dynamic";

export default async function MeetTheTeamPage() {
  const members = await getPublishedPeopleProfiles("team");

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Cumberland Mountain Music
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Meet the Team
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          The Cumberland Mountain Music Show would not happen without the people
          working behind the scenes. Meet some of the team who help make each
          show possible.
        </p>
      </section>

      {members.length > 0 ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <PersonCard
              key={member.id}
              member={member}
              profileBasePath="/meet-the-team"
            />
          ))}
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-center text-[#d9c8aa] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          Team profiles will be added soon.
        </section>
      )}
    </main>
  );
}
