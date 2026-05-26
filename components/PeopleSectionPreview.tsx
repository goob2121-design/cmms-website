"use client";

import { useEffect, useState } from "react";
import { PersonCard } from "@/components/PersonCard";
import { supabase } from "@/lib/supabase/client";
import type { PeopleProfile, ProfileType } from "@/lib/supabase/people";

type PeopleSectionPreviewProps = {
  profileType: ProfileType;
  title: "Meet the Band" | "Meet the Team";
  description: string;
  emptyMessage: string;
  profileBasePath: "/meet-the-band" | "/meet-the-team";
  comingSoonMessage: string;
};

export function PeopleSectionPreview({
  profileType,
  title,
  description,
  emptyMessage,
  profileBasePath,
  comingSoonMessage,
}: PeopleSectionPreviewProps) {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [members, setMembers] = useState<PeopleProfile[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [canPreview, setCanPreview] = useState(false);

  useEffect(() => {
    async function loadPreview() {
      if (!supabase) {
        setIsCheckingSession(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setIsCheckingSession(false);
        return;
      }

      setCanPreview(true);
      const { data, error } = await supabase
        .from("people_profiles")
        .select("*")
        .eq("profile_type", profileType)
        .eq("active", true)
        .eq("status", "published")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMembers((data ?? []) as PeopleProfile[]);
      }

      setIsCheckingSession(false);
    }

    loadPreview();
  }, [profileType]);

  if (isCheckingSession) {
    return (
      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-14 pt-40 text-center sm:px-8 lg:pb-20">
        <section className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-[#e7d8c2] shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-8">
          Checking preview access...
        </section>
      </main>
    );
  }

  if (!canPreview) {
    return (
      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-14 pt-40 text-center sm:px-8 lg:pb-20">
        <section className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Cumberland Mountain Music
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
            {comingSoonMessage}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="mb-8 rounded-lg border border-[#d7a84f]/25 bg-[#d7a84f]/10 px-5 py-4 text-center text-sm font-semibold text-[#f4d28b]">
        Admin preview - this section is currently hidden from the public nav.
      </section>

      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Cumberland Mountain Music
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">{description}</p>
      </section>

      {errorMessage ? (
        <section className="mt-10 rounded-lg border border-red-300/25 bg-red-950/35 p-6 text-center text-red-100 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          {errorMessage}
        </section>
      ) : members.length > 0 ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <PersonCard
              key={member.id}
              member={member}
              profileBasePath={profileBasePath}
            />
          ))}
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-center text-[#d9c8aa] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          {emptyMessage}
        </section>
      )}
    </main>
  );
}
