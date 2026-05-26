import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PeopleSubmissionForm } from "@/components/PeopleSubmissionForm";
import {
  getPeopleProfileForReview,
  getPublishedPeopleProfileBySlug,
  type PeopleProfile,
} from "@/lib/supabase/people";

type BandMemberPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ review?: string | string[] }>;
};

function getReviewToken(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: BandMemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getPublishedPeopleProfileBySlug("band", slug);

  if (!member) {
    return {
      title: "Band Member | Cumberland Mountain Music",
    };
  }

  return {
    title: `${member.name} | Meet the Band | Cumberland Mountain Music`,
    description:
      member.bio ??
      `Meet ${member.name} from The Cumberland Mountain Music Show.`,
    alternates: {
      canonical: `/meet-the-band/${member.slug}`,
    },
  };
}

export const dynamic = "force-dynamic";

function ProfileImage({ member }: { member: PeopleProfile }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d7a84f]/25 bg-[linear-gradient(135deg,rgba(215,168,79,0.18),rgba(0,0,0,0.34))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="aspect-[4/5]">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#d7a84f]/35 bg-black/30 text-4xl font-semibold text-[#f4d28b]">
                {member.name.charAt(0)}
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#d7a84f]">
                Cumberland Mountain Music
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function BandMemberPage({
  params,
  searchParams,
}: BandMemberPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const reviewToken = getReviewToken(query.review);
  const publishedMember = await getPublishedPeopleProfileBySlug("band", slug);
  const reviewMember =
    publishedMember || !reviewToken
      ? null
      : await getPeopleProfileForReview("band", slug, reviewToken);
  const member = publishedMember ?? reviewMember;
  const isReviewPreview = !publishedMember && Boolean(reviewMember);

  if (!member) {
    notFound();
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      {isReviewPreview ? (
        <section className="mb-8 rounded-lg border border-[#d7a84f]/25 bg-[#d7a84f]/10 px-5 py-4 text-center text-sm font-semibold text-[#f4d28b]">
          Preview/edit link — this profile is not publicly listed yet.
        </section>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <ProfileImage member={member} />

        <article>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Meet the Band
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {member.name}
          </h1>
          {member.instruments ? (
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4d28b]">
              {member.instruments}
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
              href="/meet-the-band"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
            >
              Back to Band
            </Link>
          </div>
        </article>
      </section>

      {isReviewPreview && reviewToken ? (
        <PeopleSubmissionForm profile={member} reviewToken={reviewToken} />
      ) : null}
    </main>
  );
}
