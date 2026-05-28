import Link from "next/link";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import type { PeopleProfile } from "@/lib/supabase/people";

type PersonCardProps = {
  member: PeopleProfile;
  profileBasePath: "/meet-the-band" | "/meet-the-team";
  variant?: "default" | "compact";
};

export function PersonCard({
  member,
  profileBasePath,
  variant = "default",
}: PersonCardProps) {
  const isCompact = variant === "compact";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 shadow-[0_18px_55px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-1 hover:border-[#d7a84f]/45 hover:shadow-[0_22px_65px_rgba(0,0,0,0.34)]">
      {member.photo_display_mode === "hide" ? null : (
        <div
          className={`person-card-media w-full overflow-hidden bg-[linear-gradient(135deg,rgba(215,168,79,0.18),rgba(0,0,0,0.34))] ${
            isCompact ? "h-44 sm:h-48 lg:h-40 xl:h-44" : "h-[260px]"
          }`}
        >
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
      )}
      <div className={`flex flex-1 flex-col ${isCompact ? "p-4" : "p-5"}`}>
        <h2
          className={`font-semibold text-white ${
            isCompact ? "text-xl" : "text-2xl"
          }`}
        >
          {member.name}
        </h2>
        {isCompact && member.instruments ? (
          <p className="mt-2 text-sm font-semibold leading-6 text-[#f4d28b]">
            {member.instruments}
          </p>
        ) : null}
        {!isCompact && (member.role_title || member.instruments) ? (
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#f4d28b]">
            {[member.role_title, member.instruments].filter(Boolean).join(" - ")}
          </p>
        ) : null}
        {!isCompact && member.bio ? (
          <p className="profile-card-bio mt-4 leading-7 text-[#d9c8aa]">
            {member.bio}
          </p>
        ) : null}
        {!isCompact && member.hobbies_interests ? (
          <p className="mt-4 text-sm leading-6 text-[#d9c8aa]">
            <span className="block font-semibold text-[#f4d28b]">
              Hobbies &amp; Interests:
            </span>
            {member.hobbies_interests}
          </p>
        ) : null}
        <div
          className={`mt-auto flex flex-wrap gap-3 ${
            isCompact ? "pt-4" : "pt-5"
          }`}
        >
          {member.slug ? (
            <Link
              href={`${profileBasePath}/${member.slug}`}
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
          {!isCompact && member.website_url ? (
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
  );
}
