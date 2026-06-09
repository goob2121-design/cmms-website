"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createStorageFileName,
  validateImageFile,
} from "@/lib/imageUploads";
import { sanitizeSlugInput, slugify, slugPattern } from "@/lib/slug";
import { getSponsorLevelRank, sponsorLevels } from "@/lib/sponsorLevels";
import { supabase } from "@/lib/supabase/client";
import type { DbSponsor } from "@/lib/supabase/sponsors";

type SponsorForm = {
  id?: string;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  description: string;
  sponsor_level: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  display_order: string;
  show_on_homepage: boolean;
  active: boolean;
};

const emptyForm: SponsorForm = {
  name: "",
  slug: "",
  logo_url: "",
  website_url: "",
  description: "",
  sponsor_level: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  notes: "",
  display_order: "0",
  show_on_homepage: false,
  active: true,
};

const textFields: Array<{
  name: keyof SponsorForm;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}> = [
  { name: "name", label: "Name", required: true },
  { name: "slug", label: "Slug", placeholder: "auto-generated if blank" },
  {
    name: "logo_url",
    label: "Logo URL or Path",
    placeholder: "/sponsors/deroyal.png",
  },
  { name: "website_url", label: "Website URL", type: "url" },
  { name: "contact_name", label: "Contact Name" },
  { name: "contact_email", label: "Contact Email", type: "email" },
  { name: "contact_phone", label: "Contact Phone" },
  {
    name: "display_order",
    label: "Display Order",
    type: "number",
    placeholder: "Lower numbers appear first.",
  },
];

function cleanValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toForm(sponsor: DbSponsor): SponsorForm {
  return {
    id: sponsor.id,
    name: sponsor.name,
    slug: sponsor.slug ?? "",
    logo_url: sponsor.logo_url ?? "",
    website_url: sponsor.website_url ?? "",
    description: sponsor.description ?? "",
    sponsor_level: sponsor.sponsor_level ?? "",
    contact_name: sponsor.contact_name ?? "",
    contact_email: sponsor.contact_email ?? "",
    contact_phone: sponsor.contact_phone ?? "",
    notes: sponsor.notes ?? "",
    display_order: String(sponsor.display_order ?? 0),
    show_on_homepage: Boolean(sponsor.show_on_homepage),
    active: Boolean(sponsor.active),
  };
}

function toPayload(form: SponsorForm) {
  const slug = slugify(form.slug);

  return {
    name: form.name.trim(),
    slug: slug || null,
    logo_url: cleanValue(form.logo_url),
    website_url: cleanValue(form.website_url),
    description: cleanValue(form.description),
    sponsor_level: cleanValue(form.sponsor_level),
    contact_name: cleanValue(form.contact_name),
    contact_email: cleanValue(form.contact_email),
    contact_phone: cleanValue(form.contact_phone),
    notes: cleanValue(form.notes),
    display_order: Number.parseInt(form.display_order, 10) || 0,
    show_on_homepage: form.show_on_homepage,
    active: form.active,
  };
}

export default function AdminSponsorsPage() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<DbSponsor[]>([]);
  const [form, setForm] = useState<SponsorForm>(emptyForm);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingSponsors, setIsLoadingSponsors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const isEditing = Boolean(form.id);

  const sortedSponsors = useMemo(
    () =>
      [...sponsors].sort(
        (a, b) =>
          (a.display_order ?? 0) - (b.display_order ?? 0) ||
          getSponsorLevelRank(a.sponsor_level) -
            getSponsorLevelRank(b.sponsor_level) ||
          a.name.localeCompare(b.name),
      ),
    [sponsors],
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
      await loadSponsors();
    }

    initialize();
  }, [router]);

  async function loadSponsors() {
    if (!supabase) {
      return;
    }

    setIsLoadingSponsors(true);
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    setIsLoadingSponsors(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSponsors((data ?? []) as DbSponsor[]);
  }

  function handleTextChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    if (name === "slug") {
      setSlugManuallyEdited(true);
    }

    setForm((current) => {
      const next = {
        ...current,
        [name]: name === "slug" ? sanitizeSlugInput(value) : value,
      };

      if (!slugManuallyEdited && name === "name" && !current.id) {
        next.slug = slugify(next.name);
      }

      return next;
    });
  }

  function handleSponsorLevelChange(event: ChangeEvent<HTMLSelectElement>) {
    setForm((current) => ({
      ...current,
      sponsor_level: event.target.value,
    }));
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    const validationError = validateImageFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsUploadingLogo(true);

    const sourceSlug = form.slug || form.name || "sponsor-logo";
    const fileName = createStorageFileName(sourceSlug, file);
    const { error } = await supabase.storage
      .from("sponsor-logos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      setIsUploadingLogo(false);
      setErrorMessage(error.message);
      return;
    }

    const { data } = supabase.storage
      .from("sponsor-logos")
      .getPublicUrl(fileName);

    setForm((current) => ({
      ...current,
      logo_url: data.publicUrl,
    }));
    setIsUploadingLogo(false);
    setMessage("Logo uploaded. Save the sponsor to keep this image.");
  }

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as "active" | "show_on_homepage";
    const { checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: checked,
    }));
  }

  function startNewSponsor() {
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    setMessage("");
    setErrorMessage("");
  }

  function startEdit(sponsor: DbSponsor) {
    setForm(toForm(sponsor));
    setSlugManuallyEdited(true);
    setMessage("");
    setErrorMessage("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    if (!form.name.trim()) {
      setErrorMessage("Sponsor name is required.");
      return;
    }

    const normalizedSlug = slugify(form.slug || form.name);

    if (normalizedSlug && !slugPattern.test(normalizedSlug)) {
      setErrorMessage(
        "Slug can only use lowercase letters, numbers, and hyphens.",
      );
      return;
    }

    setIsSaving(true);
    const payload = toPayload({ ...form, slug: normalizedSlug });
    const result = form.id
      ? await supabase.from("sponsors").update(payload).eq("id", form.id)
      : await supabase.from("sponsors").insert(payload);

    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setMessage(isEditing ? "Sponsor updated." : "Sponsor added.");
    setForm(emptyForm);
    await loadSponsors();
  }

  async function handleDelete(sponsor: DbSponsor) {
    if (!supabase) {
      return;
    }

    const confirmed = window.confirm(
      `Delete sponsor "${sponsor.name}"? This also removes show assignments.`,
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("sponsors")
      .delete()
      .eq("id", sponsor.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Sponsor deleted.");
    if (form.id === sponsor.id) {
      setForm(emptyForm);
    }
    await loadSponsors();
  }

  async function toggleActive(sponsor: DbSponsor) {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from("sponsors")
      .update({ active: !sponsor.active })
      .eq("id", sponsor.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadSponsors();
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
            Sponsors Manager
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Manage Sponsor Library
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#d9c8aa]">
            Add sponsor profiles once, then attach them to individual shows.
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Existing Sponsors
            </h2>
            <button
              type="button"
              onClick={startNewSponsor}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#d7a84f] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:bg-[#f1c86e]"
            >
              Add New
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {isLoadingSponsors ? (
              <p className="text-[#d9c8aa]">Loading sponsors...</p>
            ) : null}
            {!isLoadingSponsors && sortedSponsors.length === 0 ? (
              <p className="text-[#d9c8aa]">No sponsors found yet.</p>
            ) : null}
            {sortedSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{sponsor.name}</h3>
                    <p className="mt-1 text-sm text-[#d9c8aa]">
                      {sponsor.sponsor_level ?? "Sponsor"} /{" "}
                      {sponsor.slug ?? "no-slug"} / Order{" "}
                      {sponsor.display_order ?? 0}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#d7a84f]/20 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#f4d28b]">
                        {sponsor.active ? "Active" : "Inactive"}
                      </span>
                      {sponsor.show_on_homepage ? (
                        <span className="rounded-full border border-[#d7a84f]/20 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#f4d28b]">
                          Homepage
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(sponsor)}
                      className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(sponsor)}
                      className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                    >
                      {sponsor.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sponsor)}
                      className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <form
          onSubmit={handleSave}
          className="rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.92),rgba(10,7,4,0.96))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.3)] sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {isEditing ? "Edit Sponsor" : "Add Sponsor"}
            </h2>
            {isEditing ? (
              <button
                type="button"
                onClick={startNewSponsor}
                className="text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b] transition hover:text-white"
              >
                Clear Form
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {textFields.map((field) => (
              <label key={field.name} className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                  {field.label}
                </span>
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  value={String(form[field.name] ?? "")}
                  onChange={handleTextChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  pattern={field.name === "slug" ? "[a-z0-9-]+" : undefined}
                  className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
                />
                {field.name === "display_order" ? (
                  <span className="mt-2 block text-sm text-[#bda987]">
                    Lower numbers appear first.
                  </span>
                ) : null}
              </label>
            ))}
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Sponsor Level
              </span>
              <select
                value={form.sponsor_level}
                onChange={handleSponsorLevelChange}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
              >
                <option value="">No Level</option>
                {sponsorLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="mt-5 rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
            <h3 className="text-xl font-semibold text-white">Sponsor Logo</h3>
            <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
              Upload an image or paste an image URL.
            </p>
            {form.logo_url ? (
              <div className="mt-4 flex min-h-28 items-center justify-center rounded-md border border-[#d7a84f]/15 bg-black/25 p-4">
                <img
                  src={form.logo_url}
                  alt="Sponsor logo preview"
                  className="max-h-24 w-auto max-w-full object-contain"
                />
              </div>
            ) : null}
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Upload Logo
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                disabled={isUploadingLogo}
                className="mt-2 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07] hover:file:bg-[#f1c86e] disabled:opacity-60"
              />
            </label>
            {isUploadingLogo ? (
              <p className="mt-3 text-sm text-[#d9c8aa]">Uploading logo...</p>
            ) : null}
          </section>

          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Description
              </span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleTextChange}
                rows={4}
                className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Private Notes
              </span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleTextChange}
                rows={5}
                className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
              />
            </label>
          </div>

          <label className="mt-5 inline-flex items-center gap-3 text-[#e7d8c2]">
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleCheckboxChange}
              className="h-5 w-5 accent-[#d7a84f]"
            />
            Active
          </label>

          <label className="mt-4 flex items-start gap-3 text-[#e7d8c2]">
            <input
              name="show_on_homepage"
              type="checkbox"
              checked={form.show_on_homepage}
              onChange={handleCheckboxChange}
              className="mt-1 h-5 w-5 accent-[#d7a84f]"
            />
            <span>
              <span className="block font-semibold text-white">
                Show on homepage
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#d9c8aa]">
                Adds this sponsor to the homepage sponsor strip. Show-specific
                sponsor assignments stay separate.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
          >
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Sponsor"}
          </button>
        </form>
      </section>
    </main>
  );
}
