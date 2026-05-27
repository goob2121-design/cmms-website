"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createStorageFileName,
  validateImageFile,
} from "@/lib/imageUploads";
import { slugify } from "@/lib/slug";
import { supabase } from "@/lib/supabase/client";
import type { SnackShopSettings } from "@/lib/supabase/snackShop";

type SnackShopForm = {
  id?: string;
  menu_image_url: string;
  menu_pdf_url: string;
  hot_food_image_url: string;
  desserts_image_url: string;
  drinks_image_url: string;
  intermission_image_url: string;
  special_text: string;
  mamaw_message: string;
  active: boolean;
};

const emptyForm: SnackShopForm = {
  menu_image_url: "",
  menu_pdf_url: "",
  hot_food_image_url: "",
  desserts_image_url: "",
  drinks_image_url: "",
  intermission_image_url: "",
  special_text: "",
  mamaw_message: "",
  active: true,
};

const maxPdfUploadBytes = 10 * 1024 * 1024;
const featureImageFields: Array<{
  field: keyof Pick<
    SnackShopForm,
    | "hot_food_image_url"
    | "desserts_image_url"
    | "drinks_image_url"
    | "intermission_image_url"
  >;
  label: string;
  uploadName: string;
}> = [
  {
    field: "hot_food_image_url",
    label: "Hot Food Favorites Image",
    uploadName: "hot-food-favorites",
  },
  {
    field: "desserts_image_url",
    label: "Homemade Desserts & Treats Image",
    uploadName: "homemade-desserts-treats",
  },
  {
    field: "drinks_image_url",
    label: "Fresh Coffee & Cold Drinks Image",
    uploadName: "fresh-coffee-cold-drinks",
  },
  {
    field: "intermission_image_url",
    label: "Intermission Favorites Image",
    uploadName: "intermission-favorites",
  },
];

function cleanValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toForm(settings: SnackShopSettings): SnackShopForm {
  return {
    id: settings.id,
    menu_image_url: settings.menu_image_url ?? "",
    menu_pdf_url: settings.menu_pdf_url ?? "",
    hot_food_image_url: settings.hot_food_image_url ?? "",
    desserts_image_url: settings.desserts_image_url ?? "",
    drinks_image_url: settings.drinks_image_url ?? "",
    intermission_image_url: settings.intermission_image_url ?? "",
    special_text: settings.special_text ?? "",
    mamaw_message: settings.mamaw_message ?? "",
    active: Boolean(settings.active),
  };
}

function createPdfFileName(source: string, file: File) {
  const safeSource = slugify(source) || "snack-shop-menu";
  return `${safeSource}-${Date.now()}.pdf`;
}

function validatePdfFile(file: File) {
  if (file.type !== "application/pdf") {
    return "Please choose a PDF file.";
  }

  if (file.size > maxPdfUploadBytes) {
    return "Please choose a PDF smaller than 10MB.";
  }

  return "";
}

export default function AdminSnackShopPage() {
  const router = useRouter();
  const [form, setForm] = useState<SnackShopForm>(emptyForm);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadingFeatureImage, setUploadingFeatureImage] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      await loadSettings();
    }

    initialize();
  }, [router]);

  async function loadSettings() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("snack_shop_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data) {
      setForm(toForm(data as SnackShopSettings));
    }
  }

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name } = event.target;
    const value =
      event.target instanceof HTMLInputElement && event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function uploadMenuImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !supabase) return;

    setMessage("");
    setErrorMessage("");
    const validation = validateImageFile(file);
    if (validation) {
      setErrorMessage(validation);
      return;
    }

    setIsUploadingImage(true);
    const fileName = createStorageFileName("mamaw-gerald-snack-shop-menu", file);
    const { error } = await supabase.storage
      .from("snack-shop")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      setErrorMessage(error.message);
      setIsUploadingImage(false);
      return;
    }

    const { data } = supabase.storage.from("snack-shop").getPublicUrl(fileName);
    setForm((current) => ({ ...current, menu_image_url: data.publicUrl }));
    setMessage("Menu image uploaded. Save settings to keep it.");
    setIsUploadingImage(false);
  }

  async function uploadMenuPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !supabase) return;

    setMessage("");
    setErrorMessage("");
    const validation = validatePdfFile(file);
    if (validation) {
      setErrorMessage(validation);
      return;
    }

    setIsUploadingPdf(true);
    const fileName = createPdfFileName("mamaw-gerald-snack-shop-menu", file);
    const { error } = await supabase.storage
      .from("snack-shop")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      setErrorMessage(error.message);
      setIsUploadingPdf(false);
      return;
    }

    const { data } = supabase.storage.from("snack-shop").getPublicUrl(fileName);
    setForm((current) => ({ ...current, menu_pdf_url: data.publicUrl }));
    setMessage("PDF menu uploaded. Save settings to keep it.");
    setIsUploadingPdf(false);
  }

  async function uploadFeatureImage(
    event: ChangeEvent<HTMLInputElement>,
    field: (typeof featureImageFields)[number]["field"],
    uploadName: string,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !supabase) return;

    setMessage("");
    setErrorMessage("");
    const validation = validateImageFile(file);
    if (validation) {
      setErrorMessage(validation);
      return;
    }

    setUploadingFeatureImage(field);
    const fileName = createStorageFileName(`snack-shop-${uploadName}`, file);
    const { error } = await supabase.storage
      .from("snack-shop")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      setErrorMessage(error.message);
      setUploadingFeatureImage("");
      return;
    }

    const { data } = supabase.storage.from("snack-shop").getPublicUrl(fileName);
    setForm((current) => ({ ...current, [field]: data.publicUrl }));
    setMessage("Feature card image uploaded. Save settings to keep it.");
    setUploadingFeatureImage("");
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!supabase) return;

    const payload = {
      menu_image_url: cleanValue(form.menu_image_url),
      menu_pdf_url: cleanValue(form.menu_pdf_url),
      hot_food_image_url: cleanValue(form.hot_food_image_url),
      desserts_image_url: cleanValue(form.desserts_image_url),
      drinks_image_url: cleanValue(form.drinks_image_url),
      intermission_image_url: cleanValue(form.intermission_image_url),
      special_text: cleanValue(form.special_text),
      mamaw_message: cleanValue(form.mamaw_message),
      active: form.active,
    };

    setIsSaving(true);
    const result = form.id
      ? await supabase
          .from("snack_shop_settings")
          .update(payload)
          .eq("id", form.id)
          .select("*")
          .single()
      : await supabase
          .from("snack_shop_settings")
          .insert(payload)
          .select("*")
          .single();
    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setForm(toForm(result.data as SnackShopSettings));
    setMessage("Snack shop settings saved.");
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
            Snack Shop
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Mamaw Gerald&apos;s Snack Shop
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#d9c8aa]">
            Manage the concessions flyer, PDF menu, and monthly messages.
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

      <form
        onSubmit={saveSettings}
        className="mt-8 rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.92),rgba(10,7,4,0.96))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.3)] sm:p-6"
      >
        <label className="inline-flex items-center gap-3 text-[#e7d8c2]">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={updateField}
            className="h-5 w-5 accent-[#d7a84f]"
          />
          Active
        </label>
        <p className="mt-2 text-sm text-[#bda987]">
          Turn this off to hide uploaded menu and monthly messages while keeping
          the public Snack Shop page available.
        </p>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
            <h2 className="text-xl font-semibold text-white">Menu Image</h2>
            <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
              Upload a PNG, JPG, JPEG, or WEBP flyer image, or paste a URL.
            </p>
            {form.menu_image_url ? (
              <div className="mt-4 overflow-hidden rounded-md border border-[#d7a84f]/15 bg-black/25">
                <img
                  src={form.menu_image_url}
                  alt="Snack shop menu preview"
                  className="h-auto w-full object-contain"
                />
              </div>
            ) : null}
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Image URL
              </span>
              <input
                name="menu_image_url"
                value={form.menu_image_url}
                onChange={updateField}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b]"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Upload Image
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadMenuImage}
                disabled={isUploadingImage}
                className="mt-2 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07] hover:file:bg-[#f1c86e] disabled:opacity-60"
              />
            </label>
            {isUploadingImage ? (
              <p className="mt-3 text-sm text-[#d9c8aa]">Uploading image...</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
            <h2 className="text-xl font-semibold text-white">PDF Menu</h2>
            <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
              Upload a PDF menu, or paste a URL for a downloadable menu.
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                PDF URL
              </span>
              <input
                name="menu_pdf_url"
                value={form.menu_pdf_url}
                onChange={updateField}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b]"
              />
            </label>
            {form.menu_pdf_url ? (
              <a
                href={form.menu_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7a84f]/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:text-[#f4d28b]"
              >
                Open PDF
              </a>
            ) : null}
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Upload PDF
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={uploadMenuPdf}
                disabled={isUploadingPdf}
                className="mt-2 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07] hover:file:bg-[#f1c86e] disabled:opacity-60"
              />
            </label>
            {isUploadingPdf ? (
              <p className="mt-3 text-sm text-[#d9c8aa]">Uploading PDF...</p>
            ) : null}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
          <h2 className="text-xl font-semibold text-white">
            Feature Card Images
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
            Optional images for the four public Snack Shop feature cards. Leave
            any field blank to keep that card text-only.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {featureImageFields.map((item) => (
              <div
                key={item.field}
                className="rounded-md border border-[#d7a84f]/14 bg-black/20 p-4"
              >
                <h3 className="font-semibold text-white">{item.label}</h3>
                {form[item.field] ? (
                  <div className="mt-3 h-44 overflow-hidden rounded-md border border-[#d7a84f]/15 bg-black/25">
                    <img
                      src={form[item.field]}
                      alt={`${item.label} preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <label className="mt-4 block">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                    Image URL
                  </span>
                  <input
                    name={item.field}
                    value={form[item.field]}
                    onChange={updateField}
                    className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b]"
                  />
                </label>
                <label className="mt-4 block">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                    Upload Image
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      uploadFeatureImage(event, item.field, item.uploadName)
                    }
                    disabled={uploadingFeatureImage === item.field}
                    className="mt-2 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07] hover:file:bg-[#f1c86e] disabled:opacity-60"
                  />
                </label>
                {uploadingFeatureImage === item.field ? (
                  <p className="mt-3 text-sm text-[#d9c8aa]">
                    Uploading image...
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <label className="mt-5 block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
            Special This Month
          </span>
          <textarea
            name="special_text"
            value={form.special_text}
            onChange={updateField}
            rows={4}
            className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition focus:border-[#f4d28b]"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
            Funny Message From Mamaw Gerald
          </span>
          <textarea
            name="mamaw_message"
            value={form.mamaw_message}
            onChange={updateField}
            rows={3}
            placeholder="Nobody leaves hungry if Mamaw Gerald can help it."
            className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b]"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
        >
          {isSaving ? "Saving..." : "Save Snack Shop Settings"}
        </button>
      </form>
    </main>
  );
}
