"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type SponsorInquiry = {
  id: string;
  business_name: string | null;
  contact_name: string;
  email: string;
  phone: string | null;
  sponsor_interest: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
};

const statusOptions = ["new", "contacted", "follow-up", "closed"];

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminSponsorInquiriesPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [inquiries, setInquiries] = useState<SponsorInquiry[]>([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const newInquiryCount = useMemo(
    () => inquiries.filter((inquiry) => inquiry.status === "new").length,
    [inquiries],
  );

  useEffect(() => {
    async function initialize() {
      if (!supabase) {
        setErrorMessage("Supabase is not configured yet.");
        setIsCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/admin");
        return;
      }

      setIsCheckingSession(false);
      await loadInquiries();
    }

    initialize();
  }, [router]);

  async function loadInquiries() {
    if (!supabase) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("sponsor_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setInquiries((data ?? []) as SponsorInquiry[]);
  }

  async function updateStatus(inquiry: SponsorInquiry, status: string) {
    if (!supabase) return;
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("sponsor_inquiries")
      .update({ status })
      .eq("id", inquiry.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Inquiry status updated.");
    await loadInquiries();
  }

  async function deleteInquiry(inquiry: SponsorInquiry) {
    if (!supabase) return;

    const confirmed = window.confirm(
      `Delete sponsor inquiry from ${inquiry.contact_name}?`,
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");
    const { error } = await supabase
      .from("sponsor_inquiries")
      .delete()
      .eq("id", inquiry.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Inquiry deleted.");
    await loadInquiries();
  }

  if (isCheckingSession) {
    return (
      <main className="relative z-10 mx-auto min-h-svh w-full max-w-6xl px-6 pb-14 pt-40 text-[#e7d8c2] sm:px-8">
        Checking admin session...
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto min-h-svh w-full max-w-7xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="flex flex-col gap-5 border-b border-[#d7a84f]/18 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Sponsor Inquiries
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Review Sponsor Interest
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#d9c8aa]">
            Follow up with businesses, community partners, and supporters who
            submit the sponsorship form.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
        >
          Dashboard
        </Link>
      </section>

      {message ? (
        <p className="mt-6 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-6 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-8 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Inquiries
            {newInquiryCount > 0 ? (
              <span className="ml-3 align-middle rounded-full border border-[#d7a84f]/35 bg-[#d7a84f]/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                {newInquiryCount} New
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={loadInquiries}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7a84f]/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:text-[#f4d28b]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p className="text-[#d9c8aa]">Loading inquiries...</p>
          ) : null}
          {!isLoading && inquiries.length === 0 ? (
            <p className="text-[#d9c8aa]">No sponsor inquiries yet.</p>
          ) : null}
          {inquiries.map((inquiry) => (
            <article
              key={inquiry.id}
              className="rounded-lg border border-[#d7a84f]/15 bg-black/24 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">
                      {inquiry.business_name || inquiry.contact_name}
                    </h3>
                    <span className="rounded-full border border-[#d7a84f]/25 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                      {inquiry.status ?? "new"}
                    </span>
                  </div>
                  {inquiry.business_name ? (
                    <p className="mt-1 text-sm text-[#d9c8aa]">
                      Contact: {inquiry.contact_name}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-[#bda987]">
                    Submitted {formatDate(inquiry.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="block">
                    <span className="sr-only">Status</span>
                    <select
                      value={inquiry.status ?? "new"}
                      onChange={(event) =>
                        updateStatus(inquiry, event.target.value)
                      }
                      className="min-h-10 rounded-full border border-[#d7a84f]/35 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteInquiry(inquiry)}
                    className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                    Email
                  </dt>
                  <dd className="mt-1 break-words text-[#e7d8c2]">
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="transition hover:text-[#f4d28b]"
                    >
                      {inquiry.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                    Phone
                  </dt>
                  <dd className="mt-1 text-[#e7d8c2]">
                    {inquiry.phone || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                    Interest
                  </dt>
                  <dd className="mt-1 text-[#e7d8c2]">
                    {inquiry.sponsor_interest || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                    Business
                  </dt>
                  <dd className="mt-1 text-[#e7d8c2]">
                    {inquiry.business_name || "Not provided"}
                  </dd>
                </div>
              </dl>

              {inquiry.message ? (
                <div className="mt-5 rounded-md border border-[#d7a84f]/12 bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-line leading-7 text-[#d9c8aa]">
                    {inquiry.message}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
