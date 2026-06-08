"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type PageForm = {
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  email: string;
  mailing_list_url: string;
  venue_name: string;
  venue_address: string;
};

type BandFeatureSettingsForm = {
  image: string;
  title: string;
  subtitle: string;
};

type HomepageHeroTextSettingsForm = {
  tagline: string;
  genres: string;
};

const pageKeys = ["about", "contact", "homepage_about"] as const;
type PageKey = (typeof pageKeys)[number];

const homepageHeroTextSettingKeys = {
  tagline: "homepage_hero_tagline",
  genres: "homepage_hero_genres",
} as const;

const bandFeatureSettingKeys = {
  image: "meet_the_band_feature_image",
  title: "meet_the_band_feature_title",
  subtitle: "meet_the_band_feature_subtitle",
} as const;

const pageLabels: Record<PageKey, string> = {
  about: "About Page",
  contact: "Contact Page",
  homepage_about: "Homepage About Section",
};

const defaultPageForms: Record<PageKey, PageForm> = {
  about: {
    title: "",
    subtitle: "",
    body: "",
    image_url: "",
    email: "",
    mailing_list_url: "",
    venue_name: "",
    venue_address: "",
  },
  contact: {
    title: "",
    subtitle: "",
    body: "",
    image_url: "",
    email: "",
    mailing_list_url: "",
    venue_name: "",
    venue_address: "",
  },
  homepage_about: {
    title: "About The Show",
    subtitle: "Built for families, stories, and real live music.",
    body:
      "The Cumberland Mountain Music Show was created by Bryan Turner as a place to celebrate the music, stories, and people that make this region special. Built around bluegrass, gospel, country, and traditional mountain music, the show brings families together for an evening of live entertainment in the heart of Cumberland Gap.",
    image_url: "",
    email: "",
    mailing_list_url: "",
    venue_name: "",
    venue_address: "",
  },
};

export default function AdminPagesPage() {
  const router = useRouter();
  const [forms, setForms] =
    useState<Record<PageKey, PageForm>>(defaultPageForms);
  const [bandFeatureSettings, setBandFeatureSettings] =
    useState<BandFeatureSettingsForm>({
      image: "/cartoon-band.jpg",
      title: "",
      subtitle: "",
    });
  const [homepageHeroTextSettings, setHomepageHeroTextSettings] =
    useState<HomepageHeroTextSettingsForm>({
      tagline: "The #1 Live Music Show in the Tri-State Area",
      genres: "Bluegrass • Gospel • Country • Traditional Mountain Music",
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
          "page_key,title,subtitle,body,image_url,email,mailing_list_url,venue_name,venue_address",
        )
        .in("page_key", [...pageKeys]);

      if (error) {
        setErrorMessage(error.message);
      } else {
        setForms((current) => {
          const next = { ...current };
          (pages ?? []).forEach((page) => {
            const pageKey = page.page_key as PageKey;
            if (!pageKeys.includes(pageKey)) return;

            next[pageKey] = {
              title: page.title ?? "",
              subtitle: page.subtitle ?? "",
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

      const { data: settings, error: settingsError } = await supabase
        .from("site_settings")
        .select("setting_key,setting_value")
        .in("setting_key", [
          ...Object.values(bandFeatureSettingKeys),
          ...Object.values(homepageHeroTextSettingKeys),
        ]);

      if (settingsError) {
        setErrorMessage(settingsError.message);
      } else {
        const settingsMap = new Map(
          (settings ?? []).map((setting) => [
            setting.setting_key,
            setting.setting_value ?? "",
          ]),
        );

        setBandFeatureSettings({
          image:
            settingsMap.get(bandFeatureSettingKeys.image) || "/cartoon-band.jpg",
          title: settingsMap.get(bandFeatureSettingKeys.title) || "",
          subtitle: settingsMap.get(bandFeatureSettingKeys.subtitle) || "",
        });
        setHomepageHeroTextSettings({
          tagline:
            settingsMap.get(homepageHeroTextSettingKeys.tagline) ||
            "The #1 Live Music Show in the Tri-State Area",
          genres:
            settingsMap.get(homepageHeroTextSettingKeys.genres) ||
            "Bluegrass • Gospel • Country • Traditional Mountain Music",
        });
      }

      setIsCheckingSession(false);
    }

    initialize();
  }, [router]);

  function updateForm(
    pageKey: PageKey,
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

  function updateBandFeatureSetting(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;
    setBandFeatureSettings((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateHomepageHeroTextSetting(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;
    setHomepageHeroTextSettings((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function savePage(pageKey: PageKey) {
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
        subtitle:
          pageKey === "homepage_about" ? form.subtitle.trim() || null : null,
        body: form.body.trim() || null,
        image_url:
          pageKey === "homepage_about" ? null : form.image_url.trim() || null,
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

    setMessage(`${pageLabels[pageKey]} saved.`);
  }

  async function saveBandFeatureSettings() {
    if (!supabase) {
      return;
    }

    setMessage("");
    setErrorMessage("");
    const rows = [
      {
        setting_key: bandFeatureSettingKeys.image,
        setting_value:
          bandFeatureSettings.image.trim() || "/cartoon-band.jpg",
      },
      {
        setting_key: bandFeatureSettingKeys.title,
        setting_value: bandFeatureSettings.title.trim() || null,
      },
      {
        setting_key: bandFeatureSettingKeys.subtitle,
        setting_value: bandFeatureSettings.subtitle.trim() || null,
      },
    ];

    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "setting_key" });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Meet the Band feature settings saved.");
  }

  async function saveHomepageHeroTextSettings() {
    if (!supabase) {
      return;
    }

    setMessage("");
    setErrorMessage("");
    const rows = [
      {
        setting_key: homepageHeroTextSettingKeys.tagline,
        setting_value:
          homepageHeroTextSettings.tagline.trim() ||
          "The #1 Live Music Show in the Tri-State Area",
      },
      {
        setting_key: homepageHeroTextSettingKeys.genres,
        setting_value:
          homepageHeroTextSettings.genres.trim() ||
          "Bluegrass • Gospel • Country • Traditional Mountain Music",
      },
    ];

    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "setting_key" });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Homepage hero text saved.");
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
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] lg:col-span-2">
          <h2 className="text-2xl font-semibold text-white">
            Homepage Hero Text
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#d9c8aa]">
            Edit the two text lines shown under the main logo on the homepage.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Main Line
              </span>
              <input
                name="tagline"
                value={homepageHeroTextSettings.tagline}
                onChange={updateHomepageHeroTextSetting}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Music Styles Line
              </span>
              <input
                name="genres"
                value={homepageHeroTextSettings.genres}
                onChange={updateHomepageHeroTextSetting}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={saveHomepageHeroTextSettings}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:bg-[#f1c86e]"
          >
            Save Homepage Hero Text
          </button>
        </article>

        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] lg:col-span-2">
          <h2 className="text-2xl font-semibold text-white">
            Meet the Band Feature
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#d9c8aa]">
            Set the feature image and optional text shown above the Band member
            cards. Use a public path like /cartoon-band.jpg or a full image URL.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Meet the Band Feature Image
              </span>
              <input
                name="image"
                value={bandFeatureSettings.image}
                onChange={updateBandFeatureSetting}
                placeholder="/cartoon-band.jpg"
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Band Feature Title
              </span>
              <input
                name="title"
                value={bandFeatureSettings.title}
                onChange={updateBandFeatureSetting}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Band Feature Subtitle
              </span>
              <input
                name="subtitle"
                value={bandFeatureSettings.subtitle}
                onChange={updateBandFeatureSetting}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={saveBandFeatureSettings}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:bg-[#f1c86e]"
          >
            Save Meet the Band Feature
          </button>
        </article>

        {pageKeys.map((pageKey) => (
          <article
            key={pageKey}
            className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
          >
            <h2 className="text-2xl font-semibold text-white">
              {pageLabels[pageKey]}
            </h2>
            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">{pageKey === "homepage_about" ? "Section Heading" : "Title"}</span>
              <input name="title" value={forms[pageKey].title} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
            </label>
            {pageKey === "homepage_about" ? (
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Subtitle</span>
                <input name="subtitle" value={forms[pageKey].subtitle} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
              </label>
            ) : (
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Image URL</span>
                <input name="image_url" value={forms[pageKey].image_url} onChange={(event) => updateForm(pageKey, event)} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
              </label>
            )}
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
              Save {pageLabels[pageKey]}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
