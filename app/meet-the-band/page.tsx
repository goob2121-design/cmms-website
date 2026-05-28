import type { Metadata } from "next";
import { OptionalImage } from "@/components/OptionalImage";
import { PeopleSectionPreview } from "@/components/PeopleSectionPreview";
import { PersonCard } from "@/components/PersonCard";
import { createPublicPageMetadata } from "@/lib/metadata";
import { getSiteSetting } from "@/lib/supabase/cms";
import { getPublishedPeopleProfiles } from "@/lib/supabase/people";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Meet the Band | Cumberland Mountain Music",
  description:
    "Meet the musicians who help bring The Cumberland Mountain Music Show to life in Cumberland Gap, Tennessee.",
  path: "/meet-the-band",
});

export const dynamic = "force-dynamic";

type MeetTheBandPageProps = {
  searchParams: Promise<{ preview?: string | string[] }>;
};

function getPreviewValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MeetTheBandPage({
  searchParams,
}: MeetTheBandPageProps) {
  const query = await searchParams;
  const isAdminPreview = getPreviewValue(query.preview) === "admin";
  const [
    showBandSetting,
    featureImageSetting,
    featureTitleSetting,
    featureSubtitleSetting,
  ] = await Promise.all([
    getSiteSetting("show_meet_the_band"),
    getSiteSetting("meet_the_band_feature_image"),
    getSiteSetting("meet_the_band_feature_title"),
    getSiteSetting("meet_the_band_feature_subtitle"),
  ]);
  const showBand = showBandSetting?.setting_value === "true";
  const featureImage =
    featureImageSetting?.setting_value?.trim() || "/cartoon-band.jpg";
  const featureTitle = featureTitleSetting?.setting_value?.trim();
  const featureSubtitle = featureSubtitleSetting?.setting_value?.trim();

  if (!showBand) {
    if (isAdminPreview) {
      return (
        <PeopleSectionPreview
          profileType="band"
          title="Meet the Band"
          description="Get to know the musicians who help bring The Cumberland Mountain Music Show to life."
          emptyMessage="Band member profiles will be added soon."
          profileBasePath="/meet-the-band"
          comingSoonMessage="Meet the Band section coming soon."
        />
      );
    }

    return (
      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-14 pt-40 text-center sm:px-8 lg:pb-20">
        <section className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Cumberland Mountain Music
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Meet the Band
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
            Meet the Band section coming soon.
          </p>
        </section>
      </main>
    );
  }

  const members = await getPublishedPeopleProfiles("band");

  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
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

      <section className="mx-auto mt-8 max-w-4xl">
        {featureTitle || featureSubtitle ? (
          <div className="mb-4 text-center">
            {featureTitle ? (
              <h2 className="text-2xl font-semibold text-white">
                {featureTitle}
              </h2>
            ) : null}
            {featureSubtitle ? (
              <p className="mt-2 text-[#d9c8aa]">{featureSubtitle}</p>
            ) : null}
          </div>
        ) : null}
        <OptionalImage
          src={featureImage}
          alt="Cumberland Mountain Music band illustration"
          className="h-auto w-full object-contain"
          wrapperClassName="overflow-hidden rounded-lg border border-[#d7a84f]/24 bg-black/25 shadow-[0_22px_70px_rgba(0,0,0,0.3)]"
        />
      </section>

      {members.length > 0 ? (
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {members.map((member) => (
            <PersonCard
              key={member.id}
              member={member}
              profileBasePath="/meet-the-band"
              variant="compact"
            />
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
