"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type PageForm = {
  title: string;
  body: string;
  image_url: string;
  email: string;
  mailing_list_url: string;
  venue_name: string;
  venue_address: string;
};

const pageKeys = ["about", "contact"] as const;

export default function AdminPagesPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Record<string, PageForm>>({
    about: {
      title: "",
      body: "",
      image_url: "",
      email: "",
      mailing_list_url: "",
      venue_name: "",
      venue_address: "",
    },
    contact: {
      title: "",
      body: "",
      image_url: "",
      email: "",
      mailing_list_url: "",
      venue_name: "",
      venue_address: "",
    },
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

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

      const { data: pages, error } = await supabase
        .from("site_pages")
        .select(
          "page_key,title,body,image_url,email,mailing_list_url,venue_name,venue_address",
        )
        .in("page_key", [...pageKeys]);

      if (error) {
        setErrorMessage(error.message);
      } else {
        setForms((current) => {
          const next = { ...current };
          (pages ?? []).forEach((page) => {
            next[page.page_key] = {
              title: page.title ?? "",
              body: page.body ?? "",
              image_url: page.image_url ?? "",
              email: page.email ?? "",
              mailing_list_url: page.mailing_list_url ?? "",
              venue_name: page.venue_name ?? "",
              venue_address: page.venue_address ?? "",
            };
          });
          return next;
        });
      }

      setIsCheckingSession(false);
    }

    initialize();
  }, [router]);

  function updateForm(
    pageKey: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForms((current) => ({
      ...current,
      [pageKey]: {
        ...current[pageKey],
        [name]: value,
      },
    }));
  }

  async function savePage(pageKey: string) {
    if (!supabase) {
      return;
    }

    setMessage("");
    setErrorMessage("");
    const form = forms[pageKey];
    const { error } = await supabase.from("site_pages").upsert(
      {
        page_key: pageKey,
        title: form.title.trim() || null,
        body: form.body.trim() || null,
        image_url: form.image_url.trim() || null,
        email: pageKey === "contact" ? form.email.trim() || null : null,
        mailing_list_url:
          pageKey === "contact" ? form.mailing_list_url.trim() || null : null,
        venue_name:
          pageKey === "contact" ? form.venue_name.trim() || null : null,
        venue_address:
          pageKey === "contact" ? form.venue_address.trim() || null : null,
      },
      { onConflict: "page_key" },
    );

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${pageKey === "about" ? "About" : "Contact"} page saved.`);
  }

  if (isCheckingSession) {
    return (
      <main className="relative z-10 mx-auto min-h-svh w-full max-w-6xl px-6 pb-14 pt-40 text-[#e7d8c2] sm:px-8">
        Checking admin session...
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto min-h-svh w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="flex flex-col gap-5 border-b border-[#d7a84f]/18 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Pages Manager
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Edit Public Pages
          </h1>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
        >
          Dashboard
        </Link>
      </section>

      {message ? <p className="mt-6 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="mt-6 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">{errorMessage}</p> : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {pageKeys.map((pageKey) => (
          <article
            key={pageKey}
            className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
          >
            <h2 className="text-2xl font-semibold capitalize text-white">
              {pageKey}
            </h2>
            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Title</span>
              <input name="title" value={forms[pageKey].title} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Image URL</span>
              <input name="image_url" value={forms[pageKey].image_url} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Body</span>
              <textarea name="body" value={forms[pageKey].body} onChange={(event) => updateForm(pageKey, event)} rows={10} className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none focus:border-[#f4d28b]" />
            </label>
            {pageKey === "contact" ? (
              <div className="mt-5 border-t border-[#d7a84f]/15 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                  Contact Details
                </p>
                <label className="mt-4 block">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Email</span>
                  <input name="email" value={forms[pageKey].email} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
                </label>
                <label className="mt-4 block">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Mailing List URL</span>
                  <input name="mailing_list_url" value={forms[pageKey].mailing_list_url} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
                </label>
                <label className="mt-4 block">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Venue Name</span>
                  <input name="venue_name" value={forms[pageKey].venue_name} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
                </label>
                <label className="mt-4 block">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Venue Address</span>
                  <input name="venue_address" value={forms[pageKey].venue_address} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
                </label>
              </div>
            ) : null}
            <button type="button" onClick={() => savePage(pageKey)} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:bg-[#f1c86e]">
              Save {pageKey}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
