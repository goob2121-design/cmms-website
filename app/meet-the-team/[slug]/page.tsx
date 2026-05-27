import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PeopleSubmissionForm } from "@/components/PeopleSubmissionForm";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import {
  getPeopleProfileForReview,
  getPublishedPeopleProfileBySlug,
  type PeopleProfile,
} from "@/lib/supabase/people";

type TeamMemberPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ review?: string | string[] }>;
};

function getReviewToken(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: TeamMemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getPublishedPeopleProfileBySlug("team", slug);

  if (!member) {
    return {
      title: "Team Member | Cumberland Mountain Music",
    };
  }

  return {
    title: `${member.name} | Meet the Team | Cumberland Mountain Music`,
    description:
      member.bio ??
      `Meet ${member.name} from The Cumberland Mountain Music Show team.`,
    alternates: {
      canonical: `/meet-the-team/${member.slug}`,
    },
  };
}

export const dynamic = "force-dynamic";

function ProfileImage({ member }: { member: PeopleProfile }) {
  if (member.photo_display_mode === "hide") return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[#d7a84f]/25 bg-[linear-gradient(135deg,rgba(215,168,79,0.18),rgba(0,0,0,0.34))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="aspect-[4/5]">
        <ProfilePhoto
          src={member.photo_url}
          alt={member.name}
          mode={
            member.photo_display_mode === "coming_soon"
              ? "coming_soon"
              : "show"
          }
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default async function TeamMemberPage({
  params,
  searchParams,
}: TeamMemberPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const reviewToken = getReviewToken(query.review);
  const publishedMember = await getPublishedPeopleProfileBySlug("team", slug);
  const reviewMember = reviewToken
    ? await getPeopleProfileForReview("team", slug, reviewToken)
    : null;
  const member = publishedMember ?? reviewMember;
  const hasValidReviewToken = Boolean(reviewMember);
  const isReviewPreview = !publishedMember && hasValidReviewToken;

  if (!member) {
    notFound();
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      {isReviewPreview ? (
        <section className="mb-8 rounded-lg border border-[#d7a84f]/25 bg-[#d7a84f]/10 px-5 py-4 text-center text-sm font-semibold text-[#f4d28b]">
          Preview/edit link - this profile is not publicly listed yet.
        </section>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <ProfileImage member={member} />

        <article>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Meet the Team
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {member.name}
          </h1>
          {(member.role_title || member.instruments) ? (
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4d28b]">
              {[member.role_title, member.instruments]
                .filter(Boolean)
                .join(" - ")}
            </p>
          ) : null}
          {member.bio ? (
            <div className="mt-6 whitespace-pre-line text-lg leading-8 text-[#e7d8c2]">
              {member.bio}
            </div>
          ) : (
            <p className="mt-6 text-lg leading-8 text-[#e7d8c2]">
              More details will be added soon.
            </p>
          )}
          {member.hobbies_interests ? (
            <div className="mt-6 rounded-lg border border-[#d7a84f]/20 bg-black/20 p-4 text-[#e7d8c2]">
              <p className="font-semibold text-[#f4d28b]">
                Hobbies &amp; Interests:
              </p>
              <p className="mt-2 leading-7">{member.hobbies_interests}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {member.facebook_url ? (
              <a
                href={member.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
              >
                Facebook
              </a>
            ) : null}
            {member.website_url ? (
              <a
                href={member.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
              >
                Website
              </a>
            ) : null}
            <Link
              href="/meet-the-team"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Back to Team
            </Link>
          </div>
        </article>
      </section>

      {hasValidReviewToken && reviewToken ? (
        <PeopleSubmissionForm profile={member} reviewToken={reviewToken} />
      ) : null}
    </main>
  );
}
