import type { Metadata } from "next";
import Link from "next/link";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { getPublishedPeopleProfiles } from "@/lib/supabase/people";

export const metadata: Metadata = {
  title: "Meet the Band | Cumberland Mountain Music",
  description:
    "Meet the musicians who help bring The Cumberland Mountain Music Show to life in Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "/meet-the-band",
  },
};

export const dynamic = "force-dynamic";

export default async function MeetTheBandPage() {
  const members = await getPublishedPeopleProfiles("band");

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Cumberland Mountain Music
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Meet the Band
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          Get to know the musicians who help bring The Cumberland Mountain Music
          Show to life.
        </p>
      </section>

      {members.length > 0 ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <article
              key={member.id}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 shadow-[0_18px_55px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-1 hover:border-[#d7a84f]/45 hover:shadow-[0_22px_65px_rgba(0,0,0,0.34)]"
            >
              <div className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(215,168,79,0.18),rgba(0,0,0,0.34))]">
                <ProfilePhoto
                  src={member.photo_url}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-2xl font-semibold text-white">
                  {member.name}
                </h2>
                {(member.role_title || member.instruments) ? (
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#f4d28b]">
                    {[member.role_title, member.instruments]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                ) : null}
                {member.bio ? (
                  <p className="profile-card-bio mt-4 leading-7 text-[#d9c8aa]">
                    {member.bio}
                  </p>
                ) : null}
                {member.hobbies_interests ? (
                  <p className="mt-4 text-sm leading-6 text-[#d9c8aa]">
                    <span className="block font-semibold text-[#f4d28b]">
                      Hobbies &amp; Interests:
                    </span>
                    {member.hobbies_interests}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  {member.slug ? (
                    <Link
                      href={`/meet-the-band/${member.slug}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7a84f]/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                    >
                      View Profile
                    </Link>
                  ) : null}
                  {member.facebook_url ? (
                    <a
                      href={member.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7a84f]/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                    >
                      Facebook
                    </a>
                  ) : null}
                  {member.website_url ? (
                    <a
                      href={member.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7a84f]/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-center text-[#d9c8aa] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          Band member profiles will be added soon.
        </section>
      )}
    </main>
  );
}
