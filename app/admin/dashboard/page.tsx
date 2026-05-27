"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const adminAreas = [
  {
    name: "Pages",
    href: "/admin/pages",
    description: "Edit About and Contact page content.",
  },
  {
    name: "Shows",
    href: "/admin/shows",
    description: "Manage show dates, tickets, descriptions, and visibility.",
  },
  {
    name: "Sponsors",
    href: "/admin/sponsors",
    description: "Manage sponsor profiles, logos, levels, and public visibility.",
  },
  {
    name: "Sponsor Inquiries",
    href: "/admin/sponsor-inquiries",
    description: "Review sponsorship interest form submissions.",
  },
  {
    name: "People",
    href: "/admin/people",
    description: "Manage Meet the Band and Meet the Team profiles.",
  },
  {
    name: "News",
    href: "/admin/news",
    description: "Manage public news posts and announcements.",
  },
  {
    name: "Media",
    href: "/admin/media",
    description: "Manage public photos and video links.",
  },
  {
    name: "Ticker Messages",
    href: "/admin/ticker",
    description: "Manage homepage ticker announcements and ordering.",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [pendingPeopleSubmissionsCount, setPendingPeopleSubmissionsCount] =
    useState(0);
  const [newSponsorInquiriesCount, setNewSponsorInquiriesCount] = useState(0);

  useEffect(() => {
    async function checkSession() {
      if (!supabase) {
        setConfigError(true);
        setIsCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/admin");
        return;
      }

      const { count } = await supabase
        .from("people_profile_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      setPendingPeopleSubmissionsCount(count ?? 0);

      const { count: sponsorInquiryCount } = await supabase
        .from("sponsor_inquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");

      setNewSponsorInquiriesCount(sponsorInquiryCount ?? 0);
      setIsCheckingSession(false);
    }

    checkSession();
  }, [router]);

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    router.replace("/admin");
  }

  if (isCheckingSession) {
    return (
      <main className="relative z-10 mx-auto min-h-svh w-full max-w-6xl px-6 pb-14 pt-40 text-[#e7d8c2] sm:px-8">
        Checking admin session...
      </main>
    );
  }

  if (configError) {
    return (
      <main className="relative z-10 mx-auto min-h-svh w-full max-w-3xl px-6 pb-14 pt-40 sm:px-8">
        <section className="rounded-lg border border-[#d7a84f]/25 bg-[#120d08]/85 p-6 text-[#e7d8c2]">
          Supabase is not configured yet. Check the public Supabase environment
          variables before using the admin area.
        </section>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto min-h-svh w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="flex flex-col gap-5 border-b border-[#d7a84f]/18 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Cumberland Mountain Music Admin
          </h1>
          <p className="mt-4 text-lg text-[#d9c8aa]">
            Content management foundation
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
        >
          Sign Out
        </button>
      </section>

      {pendingPeopleSubmissionsCount > 0 ? (
        <section className="mt-8 rounded-lg border border-[#d7a84f]/35 bg-[linear-gradient(135deg,rgba(215,168,79,0.16),rgba(18,13,8,0.92))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f4d28b]">
            Needs Review
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {pendingPeopleSubmissionsCount} pending people profile{" "}
              {pendingPeopleSubmissionsCount === 1
                ? "submission"
                : "submissions"}
            </h2>
            <Link
              href="/admin/people?filter=pending"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              Review Submissions
            </Link>
          </div>
        </section>
      ) : null}

      {newSponsorInquiriesCount > 0 ? (
        <section className="mt-8 rounded-lg border border-[#d7a84f]/35 bg-[linear-gradient(135deg,rgba(215,168,79,0.14),rgba(18,13,8,0.92))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f4d28b]">
            New Sponsor Interest
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {newSponsorInquiriesCount} new sponsor{" "}
              {newSponsorInquiriesCount === 1 ? "inquiry" : "inquiries"}
            </h2>
            <Link
              href="/admin/sponsor-inquiries"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
            >
              Review Inquiries
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {adminAreas.map((area) => (
          <article
            key={area.name}
            className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
          >
            <h2 className="text-2xl font-semibold text-white">{area.name}</h2>
            {area.name === "Sponsor Inquiries" &&
            newSponsorInquiriesCount > 0 ? (
              <span className="mt-3 inline-flex rounded-full border border-[#d7a84f]/35 bg-[#d7a84f]/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                {newSponsorInquiriesCount} New
              </span>
            ) : null}
            <p className="mt-3 text-[#d9c8aa]">
              {area.description}
            </p>
            {area.href ? (
              <Link
                href={area.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
              >
                Open Manager
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/30 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#a9946e] opacity-70"
              >
                Coming Soon
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
