"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createStorageFileName,
  validateImageFile,
} from "@/lib/imageUploads";
import { createShowSlug, sanitizeSlugInput, slugify, slugPattern } from "@/lib/slug";
import { supabase } from "@/lib/supabase/client";
import type { DbShow } from "@/lib/supabase/shows";
import type { DbSponsor } from "@/lib/supabase/sponsors";

type ShowForm = {
  id?: string;
  title: string;
  slug: string;
  show_date: string;
  doors_time: string;
  show_time: string;
  end_time: string;
  venue: string;
  address: string;
  advance_ticket_price: string;
  door_ticket_price: string;
  ticket_url: string;
  details_url: string;
  promo_image_url: string;
  short_description: string;
  full_details: string;
  special_guests: string;
  featured_text: string;
  published: boolean;
  is_featured: boolean;
};

type SponsorAssignment = {
  selected: boolean;
  display_order: string;
  featured: boolean;
};

type ShowSponsorRow = {
  sponsor_id: string;
  display_order: number | null;
  featured: boolean | null;
};

const emptyForm: ShowForm = {
  title: "",
  slug: "",
  show_date: "",
  doors_time: "6:00 PM",
  show_time: "7:00 PM",
  end_time: "9:00 PM",
  venue: "Cumberland Gap Convention Center",
  address: "Cumberland Gap, TN 37724",
  advance_ticket_price: "$8",
  door_ticket_price: "$10",
  ticket_url: "",
  details_url: "",
  promo_image_url: "",
  short_description:
    "Family-friendly bluegrass, country, gospel, and traditional mountain music in Cumberland Gap.",
  full_details: "",
  special_guests: "",
  featured_text: "",
  published: true,
  is_featured: false,
};

const textFields: Array<{
  name: keyof ShowForm;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}> = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", placeholder: "auto-generated if blank" },
  { name: "show_date", label: "Show Date", type: "date", required: true },
  { name: "doors_time", label: "Doors Time" },
  { name: "show_time", label: "Show Time" },
  { name: "end_time", label: "End Time" },
  { name: "venue", label: "Venue" },
  { name: "address", label: "Address" },
  { name: "advance_ticket_price", label: "Advance Ticket Price" },
  { name: "door_ticket_price", label: "Door Ticket Price" },
  { name: "ticket_url", label: "Ticket URL", type: "url" },
  { name: "details_url", label: "Details URL" },
  {
    name: "promo_image_url",
    label: "Promo Image URL or Path",
    placeholder: "/june-20-promo.png",
  },
];

const textareaFields: Array<{ name: keyof ShowForm; label: string; rows: number }> =
  [
    { name: "short_description", label: "Short Description", rows: 3 },
    { name: "featured_text", label: "Featured Text", rows: 3 },
    { name: "special_guests", label: "Special Guests", rows: 3 },
    { name: "full_details", label: "Full Details", rows: 7 },
  ];

function toForm(show: DbShow): ShowForm {
  return {
    id: show.id,
    title: show.title,
    slug: show.slug,
    show_date: show.show_date,
    doors_time: show.doors_time ?? "",
    show_time: show.show_time ?? "",
    end_time: show.end_time ?? "",
    venue: show.venue ?? "",
    address: show.address ?? "",
    advance_ticket_price: show.advance_ticket_price ?? "",
    door_ticket_price: show.door_ticket_price ?? "",
    ticket_url: show.ticket_url ?? "",
    details_url: show.details_url ?? "",
    promo_image_url: show.promo_image_url ?? "",
    short_description: show.short_description ?? "",
    full_details: show.full_details ?? "",
    special_guests: show.special_guests ?? "",
    featured_text: show.featured_text ?? "",
    published: Boolean(show.published),
    is_featured: Boolean(show.is_featured),
  };
}

function cleanValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toPayload(form: ShowForm) {
  return {
    title: form.title.trim(),
    slug: slugify(form.slug),
    show_date: form.show_date,
    doors_time: cleanValue(form.doors_time),
    show_time: cleanValue(form.show_time),
    end_time: cleanValue(form.end_time),
    venue: cleanValue(form.venue),
    address: cleanValue(form.address),
    advance_ticket_price: cleanValue(form.advance_ticket_price),
    door_ticket_price: cleanValue(form.door_ticket_price),
    ticket_url: cleanValue(form.ticket_url),
    details_url: cleanValue(form.details_url),
    promo_image_url: cleanValue(form.promo_image_url),
    short_description: cleanValue(form.short_description),
    full_details: cleanValue(form.full_details),
    special_guests: cleanValue(form.special_guests),
    featured_text: cleanValue(form.featured_text),
    published: form.published,
    is_featured: form.is_featured,
  };
}

export default function AdminShowsPage() {
  const router = useRouter();
  const [shows, setShows] = useState<DbShow[]>([]);
  const [sponsors, setSponsors] = useState<DbSponsor[]>([]);
  const [sponsorAssignments, setSponsorAssignments] = useState<
    Record<string, SponsorAssignment>
  >({});
  const [form, setForm] = useState<ShowForm>(emptyForm);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingShows, setIsLoadingShows] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const isEditing = Boolean(form.id);

  const sortedShows = useMemo(
    () =>
      [...shows].sort((a, b) => a.show_date.localeCompare(b.show_date)),
    [shows],
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
      await Promise.all([loadShows(), loadSponsors()]);
    }

    initialize();
  }, [router]);

  async function loadShows() {
    if (!supabase) {
      return;
    }

    setIsLoadingShows(true);
    const { data, error } = await supabase
      .from("shows")
      .select("*")
      .order("show_date", { ascending: true });

    setIsLoadingShows(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setShows((data ?? []) as DbShow[]);
  }

  async function loadSponsors() {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSponsors((data ?? []) as DbSponsor[]);
  }

  async function loadSponsorAssignments(showId: string) {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase
      .from("show_sponsors")
      .select("sponsor_id,display_order,featured")
      .eq("show_id", showId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const nextAssignments: Record<string, SponsorAssignment> = {};

    ((data ?? []) as ShowSponsorRow[]).forEach((assignment) => {
      nextAssignments[assignment.sponsor_id] = {
        selected: true,
        display_order: String(assignment.display_order ?? 0),
        featured: Boolean(assignment.featured),
      };
    });

    setSponsorAssignments(nextAssignments);
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

      if (
        !slugManuallyEdited &&
        (name === "title" || name === "show_date") &&
        !current.id
      ) {
        next.slug = createShowSlug(next.title, next.show_date);
      }

      return next;
    });
  }

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: checked,
    }));
  }

  async function handlePromoUpload(event: ChangeEvent<HTMLInputElement>) {
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

    setIsUploadingPromo(true);

    const sourceSlug =
      form.slug || createShowSlug(form.title, form.show_date) || "show-promo";
    const fileName = createStorageFileName(sourceSlug, file);
    const { error } = await supabase.storage
      .from("show-promos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      setIsUploadingPromo(false);
      setErrorMessage(error.message);
      return;
    }

    const { data } = supabase.storage
      .from("show-promos")
      .getPublicUrl(fileName);

    setForm((current) => ({
      ...current,
      promo_image_url: data.publicUrl,
    }));
    setIsUploadingPromo(false);
    setMessage("Promo image uploaded. Save the show to keep this image.");
  }

  function startNewShow() {
    setForm(emptyForm);
    setSponsorAssignments({});
    setSlugManuallyEdited(false);
    setMessage("");
    setErrorMessage("");
  }

  function startEdit(show: DbShow) {
    setForm(toForm(show));
    setSlugManuallyEdited(true);
    loadSponsorAssignments(show.id);
    setMessage("");
    setErrorMessage("");
  }

  function toggleSponsorAssignment(sponsorId: string, selected: boolean) {
    setSponsorAssignments((current) => ({
      ...current,
      [sponsorId]: {
        selected,
        display_order: current[sponsorId]?.display_order ?? "0",
        featured: current[sponsorId]?.featured ?? false,
      },
    }));
  }

  function updateSponsorDisplayOrder(sponsorId: string, displayOrder: string) {
    setSponsorAssignments((current) => ({
      ...current,
      [sponsorId]: {
        selected: current[sponsorId]?.selected ?? true,
        display_order: displayOrder,
        featured: current[sponsorId]?.featured ?? false,
      },
    }));
  }

  async function saveSponsorAssignments(showId: string) {
    if (!supabase) {
      return;
    }

    const selectedAssignments = Object.entries(sponsorAssignments)
      .filter(([, assignment]) => assignment.selected)
      .map(([sponsorId, assignment]) => ({
        show_id: showId,
        sponsor_id: sponsorId,
        display_order: Number.parseInt(assignment.display_order, 10) || 0,
        featured: assignment.featured,
      }));

    const { error: deleteError } = await supabase
      .from("show_sponsors")
      .delete()
      .eq("show_id", showId);

    if (deleteError) {
      throw deleteError;
    }

    if (selectedAssignments.length === 0) {
      return;
    }

    const { error: insertError } = await supabase
      .from("show_sponsors")
      .insert(selectedAssignments);

    if (insertError) {
      throw insertError;
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    const normalizedSlug = slugify(
      form.slug || createShowSlug(form.title, form.show_date),
    );

    if (!form.title.trim() || !normalizedSlug || !form.show_date) {
      setErrorMessage("Title, slug, and show date are required.");
      return;
    }

    if (!slugPattern.test(normalizedSlug)) {
      setErrorMessage(
        "Slug can only use lowercase letters, numbers, and hyphens.",
      );
      return;
    }

    setIsSaving(true);
    const payload = toPayload({ ...form, slug: normalizedSlug });
    const result = form.id
      ? await supabase.from("shows").update(payload).eq("id", form.id).select("id").single()
      : await supabase.from("shows").insert(payload).select("id").single();

    if (result.error) {
      setIsSaving(false);
      setErrorMessage(result.error.message);
      return;
    }

    try {
      await saveSponsorAssignments(result.data.id);
    } catch (error) {
      setIsSaving(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Show saved, but sponsor assignments could not be saved.",
      );
      return;
    }

    setIsSaving(false);
    setMessage(isEditing ? "Show updated." : "Show added.");
    setForm(emptyForm);
    setSponsorAssignments({});
    await loadShows();
  }

  async function handleDelete(show: DbShow) {
    if (!supabase) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${show.title}" on ${show.show_date}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("shows").delete().eq("id", show.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Show deleted.");
    if (form.id === show.id) {
      setForm(emptyForm);
    }
    await loadShows();
  }

  async function toggleShow(show: DbShow, field: "published" | "is_featured") {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from("shows")
      .update({ [field]: !show[field] })
      .eq("id", show.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadShows();
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
            Shows Manager
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Manage CMMS Shows
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#d9c8aa]">
            Add, edit, publish, feature, and remove public show listings.
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
              Existing Shows
            </h2>
            <button
              type="button"
              onClick={startNewShow}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#d7a84f] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:bg-[#f1c86e]"
            >
              Add New
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {isLoadingShows ? (
              <p className="text-[#d9c8aa]">Loading shows...</p>
            ) : null}
            {!isLoadingShows && sortedShows.length === 0 ? (
              <p className="text-[#d9c8aa]">No shows found yet.</p>
            ) : null}
            {sortedShows.map((show) => (
              <div
                key={show.id}
                className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{show.title}</h3>
                    <p className="mt-1 text-sm text-[#d9c8aa]">
                      {show.show_date} / {show.slug}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#d7a84f]/20 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#f4d28b]">
                        {show.published ? "Published" : "Draft"}
                      </span>
                      {show.is_featured ? (
                        <span className="rounded-full bg-[#d7a84f] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#120d07]">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(show)}
                      className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleShow(show, "published")}
                      className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                    >
                      {show.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleShow(show, "is_featured")}
                      className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                    >
                      {show.is_featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(show)}
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
              {isEditing ? "Edit Show" : "Add Show"}
            </h2>
            {isEditing ? (
              <button
                type="button"
                onClick={startNewShow}
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
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4">
            {textareaFields.map((field) => (
              <label key={field.name} className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                  {field.label}
                </span>
                <textarea
                  name={field.name}
                  value={String(form[field.name] ?? "")}
                  onChange={handleTextChange}
                  rows={field.rows}
                  className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
                />
              </label>
            ))}
          </div>

          <section className="mt-6 rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
            <h3 className="text-xl font-semibold text-white">
              Show Promo Image
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
              Upload an image or paste an image URL.
            </p>
            {form.promo_image_url ? (
              <div className="mt-4 overflow-hidden rounded-md border border-[#d7a84f]/15 bg-black/25">
                <img
                  src={form.promo_image_url}
                  alt="Show promo preview"
                  className="h-auto w-full object-contain"
                />
              </div>
            ) : null}
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Upload Promo Image
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePromoUpload}
                disabled={isUploadingPromo}
                className="mt-2 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07] hover:file:bg-[#f1c86e] disabled:opacity-60"
              />
            </label>
            {isUploadingPromo ? (
              <p className="mt-3 text-sm text-[#d9c8aa]">
                Uploading promo image...
              </p>
            ) : null}
          </section>

          <div className="mt-5 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-3 text-[#e7d8c2]">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleCheckboxChange}
                className="h-5 w-5 accent-[#d7a84f]"
              />
              Published
            </label>
            <label className="inline-flex items-center gap-3 text-[#e7d8c2]">
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleCheckboxChange}
                className="h-5 w-5 accent-[#d7a84f]"
              />
              Featured
            </label>
          </div>

          <section className="mt-6 rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
            <h3 className="text-xl font-semibold text-white">
              Sponsors for this Show
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
              Select active sponsors from the sponsor library. Save the show to
              update assignments.
            </p>

            {sponsors.length === 0 ? (
              <p className="mt-4 text-[#d9c8aa]">
                No active sponsors found yet. Add sponsors in the Sponsors
                Manager first.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {sponsors.map((sponsor) => {
                  const assignment = sponsorAssignments[sponsor.id];
                  const selected = Boolean(assignment?.selected);

                  return (
                    <div
                      key={sponsor.id}
                      className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex items-center gap-3 text-[#e7d8c2]">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) =>
                              toggleSponsorAssignment(
                                sponsor.id,
                                event.target.checked,
                              )
                            }
                            className="h-5 w-5 accent-[#d7a84f]"
                          />
                          <span>
                            <span className="font-semibold text-white">
                              {sponsor.name}
                            </span>
                            {sponsor.sponsor_level ? (
                              <span className="ml-2 text-sm text-[#d9c8aa]">
                                {sponsor.sponsor_level}
                              </span>
                            ) : null}
                          </span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-[#d9c8aa]">
                          Order
                          <input
                            type="number"
                            value={assignment?.display_order ?? "0"}
                            onChange={(event) =>
                              updateSponsorDisplayOrder(
                                sponsor.id,
                                event.target.value,
                              )
                            }
                            disabled={!selected}
                            className="h-10 w-20 rounded-md border border-[#d7a84f]/25 bg-black/35 px-2 text-white outline-none transition focus:border-[#f4d28b] disabled:opacity-45"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
          >
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Show"}
          </button>
        </form>
      </section>
    </main>
  );
}
