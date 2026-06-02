"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createStorageFileName, validateImageFile } from "@/lib/imageUploads";
import { supabase } from "@/lib/supabase/client";
import type { MediaItem } from "@/lib/supabase/cms";
import type { DbShow } from "@/lib/supabase/shows";

type MediaForm = {
  id?: string;
  show_id: string;
  manual_show_title: string;
  manual_show_date: string;
  title: string;
  media_type: "photo" | "video";
  image_url: string;
  video_url: string;
  caption: string;
  display_order: string;
  published: boolean;
};

const emptyForm: MediaForm = {
  show_id: "",
  manual_show_title: "",
  manual_show_date: "",
  title: "",
  media_type: "photo",
  image_url: "",
  video_url: "",
  caption: "",
  display_order: "0",
  published: true,
};

function getManualShowKey(item: MediaItem) {
  return `${item.manual_show_date ?? ""}|${item.manual_show_title ?? ""}`;
}

export default function AdminMediaPage() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [shows, setShows] = useState<DbShow[]>([]);
  const [form, setForm] = useState<MediaForm>(emptyForm);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [items],
  );
  const showsById = useMemo(
    () => new Map(shows.map((show) => [show.id, show])),
    [shows],
  );
  const manualShowGroups = useMemo(() => {
    const groups = new Map<
      string,
      { title: string; date: string | null; count: number }
    >();

    items.forEach((item) => {
      if (!item.manual_show_title) {
        return;
      }

      const key = getManualShowKey(item);
      const group = groups.get(key) ?? {
        title: item.manual_show_title,
        date: item.manual_show_date,
        count: 0,
      };

      group.count += 1;
      groups.set(key, group);
    });

    return [...groups.entries()].sort(
      ([, a], [, b]) =>
        (b.date ?? "").localeCompare(a.date ?? "") ||
        a.title.localeCompare(b.title),
    );
  }, [items]);

  useEffect(() => {
    async function initialize() {
      if (!supabase) {
        setErrorMessage("Supabase is not configured yet.");
        setChecking(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin");
        return;
      }
      setChecking(false);
      await Promise.all([loadItems(), loadShows()]);
    }
    initialize();
  }, [router]);

  async function loadItems() {
    if (!supabase) return;
    const { data, error } = await supabase.from("media_items").select("*").order("display_order");
    if (error) setErrorMessage(error.message);
    else setItems((data ?? []) as MediaItem[]);
  }

  async function loadShows() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("shows")
      .select("*")
      .order("show_date", { ascending: false });
    if (error) setErrorMessage(error.message);
    else setShows((data ?? []) as DbShow[]);
  }

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    const checked = event.target instanceof HTMLInputElement && event.target.type === "checkbox" ? event.target.checked : false;
    setForm((current) => ({ ...current, [name]: event.target instanceof HTMLInputElement && event.target.type === "checkbox" ? checked : value }));
  }

  function selectManualShow(event: ChangeEvent<HTMLSelectElement>) {
    const [date, title] = event.target.value.split("|");
    setForm((current) => ({
      ...current,
      show_id: "",
      manual_show_title: title ?? "",
      manual_show_date: date ?? "",
    }));
  }

  function editItem(item: MediaItem) {
    setForm({
      id: item.id,
      show_id: item.show_id ?? "",
      manual_show_title: item.manual_show_title ?? "",
      manual_show_date: item.manual_show_date ?? "",
      title: item.title,
      media_type: item.media_type,
      image_url: item.image_url ?? "",
      video_url: item.video_url ?? "",
      caption: item.caption ?? "",
      display_order: String(item.display_order ?? 0),
      published: Boolean(item.published),
    });
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !supabase) return;
    const validation = validateImageFile(file);
    if (validation) {
      setErrorMessage(validation);
      return;
    }
    setUploading(true);
    const fileName = createStorageFileName(form.title || "media-photo", file);
    const { error } = await supabase.storage.from("media-images").upload(fileName, file, { cacheControl: "3600" });
    if (error) {
      setErrorMessage(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("media-images").getPublicUrl(fileName);
    setForm((current) => ({ ...current, image_url: data.publicUrl }));
    setMessage("Photo uploaded. Save the media item to keep it.");
    setUploading(false);
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      title: form.title.trim(),
      media_type: form.media_type,
      image_url: form.image_url.trim() || null,
      video_url: form.video_url.trim() || null,
      caption: form.caption.trim() || null,
      display_order: Number.parseInt(form.display_order, 10) || 0,
      published: form.published,
      show_id: form.show_id || null,
      manual_show_title: form.show_id
        ? null
        : form.manual_show_title.trim() || null,
      manual_show_date: form.show_id ? null : form.manual_show_date || null,
    };
    const result = form.id
      ? await supabase.from("media_items").update(payload).eq("id", form.id)
      : await supabase.from("media_items").insert(payload);
    if (result.error) setErrorMessage(result.error.message);
    else {
      setMessage(form.id ? "Media item updated." : "Media item added.");
      setForm(emptyForm);
      await loadItems();
    }
  }

  async function deleteItem(item: MediaItem) {
    if (!supabase || !window.confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from("media_items").delete().eq("id", item.id);
    if (error) setErrorMessage(error.message);
    else {
      setMessage("Media item deleted.");
      await loadItems();
    }
  }

  async function toggleItem(item: MediaItem) {
    if (!supabase) return;
    const { error } = await supabase.from("media_items").update({ published: !item.published }).eq("id", item.id);
    if (error) setErrorMessage(error.message);
    else await loadItems();
  }

  if (checking) return <main className="relative z-10 mx-auto min-h-svh max-w-6xl px-6 pt-40 text-[#e7d8c2]">Checking admin session...</main>;

  return (
    <main className="relative z-10 mx-auto min-h-svh w-full max-w-7xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="flex flex-col gap-5 border-b border-[#d7a84f]/18 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">Media Manager</p><h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Manage Media</h1></div>
        <Link href="/admin/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2]">Dashboard</Link>
      </section>
      {message ? <p className="mt-6 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="mt-6 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">{errorMessage}</p> : null}
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5">
          <h2 className="text-2xl font-semibold text-white">Media Items</h2>
          <div className="mt-5 space-y-4">{sortedItems.map((item) => <div key={item.id} className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4"><h3 className="font-semibold text-white">{item.title}</h3><p className="mt-1 text-sm text-[#d9c8aa]">{item.media_type} / {item.published ? "Published" : "Draft"}</p><p className="mt-1 text-sm text-[#bda987]">{item.show_id ? showsById.get(item.show_id)?.title ?? "Show not found" : item.manual_show_title ? `${item.manual_show_title}${item.manual_show_date ? ` / ${item.manual_show_date}` : ""}` : "General / No Specific Show"}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => editItem(item)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2]">Edit</button><button onClick={() => toggleItem(item)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2]">{item.published ? "Unpublish" : "Publish"}</button><button onClick={() => deleteItem(item)} className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100">Delete</button></div></div>)}</div>
        </article>
        <form onSubmit={saveItem} className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5">
          <h2 className="text-2xl font-semibold text-white">{form.id ? "Edit Media" : "Add Media"}</h2>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Title</span><input name="title" value={form.title} onChange={updateField} required className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" /></label>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Show</span><select name="show_id" value={form.show_id} onChange={updateField} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"><option value="">General / No Specific Show</option>{shows.map((show) => <option key={show.id} value={show.id}>{show.show_date} - {show.title}</option>)}</select></label>
          {!form.show_id && manualShowGroups.length > 0 ? <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Existing Manual Show</span><select value={`${form.manual_show_date}|${form.manual_show_title}`} onChange={selectManualShow} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"><option value="|">Choose an existing manual show</option>{manualShowGroups.map(([key, group]) => <option key={key} value={key}>{group.date ? `${group.date} - ` : ""}{group.title} ({group.count})</option>)}</select></label> : null}
          {!form.show_id ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Manual Show Title</span><input name="manual_show_title" value={form.manual_show_title} onChange={updateField} placeholder="Example: Fall 2024 Show" className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none placeholder:text-[#8b7a60] focus:border-[#f4d28b]" /></label><label className="block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Manual Show Date</span><input name="manual_show_date" type="date" value={form.manual_show_date} onChange={updateField} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" /></label></div> : null}
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Type</span><select name="media_type" value={form.media_type} onChange={updateField} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"><option value="photo">Photo</option><option value="video">Video</option></select></label>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Image URL</span><input name="image_url" value={form.image_url} onChange={updateField} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" /></label>
          {form.media_type === "photo" ? <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Upload Photo</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} disabled={uploading} className="mt-2 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07]" /></label> : null}
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Video URL</span><input name="video_url" value={form.video_url} onChange={updateField} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" /></label>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Display Order</span><input name="display_order" type="number" value={form.display_order} onChange={updateField} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" /></label>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Caption</span><textarea name="caption" value={form.caption} onChange={updateField} rows={4} className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none focus:border-[#f4d28b]" /></label>
          <label className="mt-5 inline-flex items-center gap-3 text-[#e7d8c2]"><input type="checkbox" name="published" checked={form.published} onChange={updateField} className="h-5 w-5 accent-[#d7a84f]" />Published</label>
          <button className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07]">Save Media</button>
        </form>
      </section>
    </main>
  );
}
