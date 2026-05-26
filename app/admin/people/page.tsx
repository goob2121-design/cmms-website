"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { createStorageFileName, validateImageFile } from "@/lib/imageUploads";
import { sanitizeSlugInput, slugify, slugPattern } from "@/lib/slug";
import { supabase } from "@/lib/supabase/client";
import type {
  PeopleProfile,
  PeopleProfileSubmission,
  ProfileType,
} from "@/lib/supabase/people";

type PeopleForm = {
  id?: string;
  profile_type: ProfileType;
  name: string;
  slug: string;
  role_title: string;
  instruments: string;
  bio: string;
  hobbies_interests: string;
  photo_url: string;
  facebook_url: string;
  website_url: string;
  display_order: string;
  active: boolean;
  status: "draft" | "published";
  review_token: string;
};

type SubmissionWithProfile = PeopleProfileSubmission & {
  people_profiles?: {
    name: string;
    slug: string | null;
    profile_type: ProfileType;
  } | null;
};

const emptyForm: PeopleForm = {
  profile_type: "band",
  name: "",
  slug: "",
  role_title: "",
  instruments: "",
  bio: "",
  hobbies_interests: "",
  photo_url: "",
  facebook_url: "",
  website_url: "",
  display_order: "0",
  active: true,
  status: "draft",
  review_token: "",
};

function cleanValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toForm(profile: PeopleProfile): PeopleForm {
  return {
    id: profile.id,
    profile_type: profile.profile_type,
    name: profile.name,
    slug: profile.slug ?? "",
    role_title: profile.role_title ?? "",
    instruments: profile.instruments ?? "",
    bio: profile.bio ?? "",
    hobbies_interests: profile.hobbies_interests ?? "",
    photo_url: profile.photo_url ?? "",
    facebook_url: profile.facebook_url ?? "",
    website_url: profile.website_url ?? "",
    display_order: String(profile.display_order ?? 0),
    active: Boolean(profile.active),
    status: profile.status === "published" ? "published" : "draft",
    review_token: profile.review_token ?? "",
  };
}

function toPayload(form: PeopleForm) {
  return {
    profile_type: form.profile_type,
    name: form.name.trim(),
    slug: slugify(form.slug || form.name) || null,
    role_title: cleanValue(form.role_title),
    instruments: cleanValue(form.instruments),
    bio: cleanValue(form.bio),
    hobbies_interests: cleanValue(form.hobbies_interests),
    photo_url: cleanValue(form.photo_url),
    facebook_url: cleanValue(form.facebook_url),
    website_url: cleanValue(form.website_url),
    display_order: Number.parseInt(form.display_order, 10) || 0,
    active: form.active,
    status: form.status,
    review_token: form.review_token || crypto.randomUUID(),
  };
}

function getOrigin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

function getProfileBasePath(profileType: ProfileType) {
  return profileType === "band" ? "/meet-the-band" : "/meet-the-team";
}

function getReviewLink(profile: Pick<PeopleForm, "profile_type" | "slug" | "review_token">) {
  if (!profile.slug || !profile.review_token) return "";
  return `${getOrigin()}${getProfileBasePath(profile.profile_type)}/${profile.slug}?review=${profile.review_token}`;
}

function getPublicLink(profile: Pick<PeopleForm, "profile_type" | "slug">) {
  if (!profile.slug) return "";
  return `${getOrigin()}${getProfileBasePath(profile.profile_type)}/${profile.slug}`;
}

export default function AdminPeoplePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<PeopleProfile[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([]);
  const [form, setForm] = useState<PeopleForm>(emptyForm);
  const [filter, setFilter] = useState<"all" | ProfileType>("all");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredProfiles = useMemo(
    () =>
      profiles
        .filter((profile) => filter === "all" || profile.profile_type === filter)
        .sort(
          (a, b) =>
            (a.display_order ?? 0) - (b.display_order ?? 0) ||
            a.name.localeCompare(b.name),
        ),
    [profiles, filter],
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
      await Promise.all([loadProfiles(), loadSubmissions()]);
    }

    initialize();
  }, [router]);

  async function loadProfiles() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("people_profiles")
      .select("*")
      .order("profile_type", { ascending: true })
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) setErrorMessage(error.message);
    else setProfiles((data ?? []) as PeopleProfile[]);
  }

  async function loadSubmissions() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("people_profile_submissions")
      .select("*, people_profiles(name, slug, profile_type)")
      .order("submitted_at", { ascending: false });

    if (error) setErrorMessage(error.message);
    else setSubmissions((data ?? []) as SubmissionWithProfile[]);
  }

  function handleTextChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    if (name === "slug") setSlugManuallyEdited(true);

    setForm((current) => {
      const next = {
        ...current,
        [name]: name === "slug" ? sanitizeSlugInput(value) : value,
      };

      if (!slugManuallyEdited && name === "name" && !current.id) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleActiveChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, active: event.target.checked }));
  }

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !supabase) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsUploadingPhoto(true);
    const fileName = createStorageFileName(form.slug || form.name || "person", file);
    const { error } = await supabase.storage
      .from("people-photos")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    setIsUploadingPhoto(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const { data } = supabase.storage.from("people-photos").getPublicUrl(fileName);
    setForm((current) => ({ ...current, photo_url: data.publicUrl }));
    setMessage("Photo uploaded. Save the profile to keep this image.");
  }

  async function copyLink(link: string, label: string) {
    if (!link) {
      setErrorMessage("Save the profile with a slug before copying this link.");
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      setMessage(`${label} copied.`);
      return;
    }

    setMessage(`${label}: ${link}`);
  }

  function startNewProfile(profileType: ProfileType = "band") {
    setForm({ ...emptyForm, profile_type: profileType });
    setSlugManuallyEdited(false);
    setMessage("");
    setErrorMessage("");
  }

  function startEdit(profile: PeopleProfile) {
    setForm(toForm(profile));
    setSlugManuallyEdited(true);
    setMessage("");
    setErrorMessage("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    if (!supabase) return;

    const normalizedSlug = slugify(form.slug || form.name);
    if (!form.name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }
    if (normalizedSlug && !slugPattern.test(normalizedSlug)) {
      setErrorMessage("Slug can only use lowercase letters, numbers, and hyphens.");
      return;
    }

    setIsSaving(true);
    const payload = toPayload({ ...form, slug: normalizedSlug });
    const result = form.id
      ? await supabase.from("people_profiles").update(payload).eq("id", form.id)
      : await supabase.from("people_profiles").insert(payload);
    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setMessage(form.id ? "Profile updated." : "Profile added.");
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    await loadProfiles();
  }

  async function handleDelete(profile: PeopleProfile) {
    if (!supabase || !window.confirm(`Delete profile "${profile.name}"?`)) return;
    const { error } = await supabase.from("people_profiles").delete().eq("id", profile.id);
    if (error) setErrorMessage(error.message);
    else {
      setMessage("Profile deleted.");
      await Promise.all([loadProfiles(), loadSubmissions()]);
    }
  }

  async function toggleActive(profile: PeopleProfile) {
    if (!supabase) return;
    const { error } = await supabase
      .from("people_profiles")
      .update({ active: !profile.active })
      .eq("id", profile.id);
    if (error) setErrorMessage(error.message);
    else await loadProfiles();
  }

  async function updateSubmissionStatus(
    submission: PeopleProfileSubmission,
    status: "reviewed" | "applied" | "rejected",
  ) {
    if (!supabase) return;
    const { error } = await supabase
      .from("people_profile_submissions")
      .update({ status })
      .eq("id", submission.id);
    if (error) setErrorMessage(error.message);
    else {
      setMessage(`Submission marked ${status}.`);
      await loadSubmissions();
    }
  }

  async function applySubmission(submission: PeopleProfileSubmission) {
    if (!supabase) return;
    const { error } = await supabase
      .from("people_profiles")
      .update({
        name: submission.submitted_name?.trim() || undefined,
        role_title: submission.submitted_role_title?.trim() || null,
        instruments: submission.submitted_instruments?.trim() || null,
        bio: submission.submitted_bio?.trim() || null,
        hobbies_interests: submission.submitted_hobbies_interests?.trim() || null,
        facebook_url: submission.submitted_facebook_url?.trim() || null,
        website_url: submission.submitted_website_url?.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.profile_id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await updateSubmissionStatus(submission, "applied");
    await loadProfiles();
  }

  async function applySubmittedPhoto(submission: PeopleProfileSubmission) {
    if (!supabase || !submission.submitted_photo_url) return;
    const { error } = await supabase
      .from("people_profiles")
      .update({
        photo_url: submission.submitted_photo_url,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.profile_id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Submitted photo applied to the profile.");
    await loadProfiles();
  }

  async function deleteSubmission(submission: PeopleProfileSubmission) {
    if (!supabase || !window.confirm("Delete this submitted update?")) return;
    const { error } = await supabase
      .from("people_profile_submissions")
      .delete()
      .eq("id", submission.id);
    if (error) setErrorMessage(error.message);
    else {
      setMessage("Submission deleted.");
      await loadSubmissions();
    }
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
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">People Manager</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Manage People Profiles</h1>
        </div>
        <Link href="/admin/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]">Dashboard</Link>
      </section>

      {message ? <p className="mt-6 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="mt-6 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">{errorMessage}</p> : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">Profiles</h2>
            <div className="flex flex-wrap gap-2">
              <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | ProfileType)} className="min-h-10 rounded-full border border-[#d7a84f]/35 bg-black/35 px-3 text-sm text-white">
                <option value="all">All</option>
                <option value="band">Band</option>
                <option value="team">Team</option>
              </select>
              <button type="button" onClick={() => startNewProfile(filter === "team" ? "team" : "band")} className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#d7a84f] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:bg-[#f1c86e]">Add New</button>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {filteredProfiles.length === 0 ? <p className="text-[#d9c8aa]">No profiles found yet.</p> : null}
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4">
                <h3 className="font-semibold text-white">{profile.name}</h3>
                <p className="mt-1 text-sm text-[#d9c8aa]">{profile.profile_type} / {profile.slug ?? "no-slug"}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#f4d28b]">Order {profile.display_order ?? 0} / {profile.active ? "Active" : "Inactive"} / {profile.status === "published" ? "Published" : "Draft"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEdit(profile)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]">Edit</button>
                  <button type="button" onClick={() => copyLink(getReviewLink(toForm(profile)), "Review link")} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]">Copy Review Link</button>
                  <button type="button" onClick={() => copyLink(getPublicLink(toForm(profile)), "Public link")} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]">Copy Public Link</button>
                  <button type="button" onClick={() => toggleActive(profile)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]">{profile.active ? "Deactivate" : "Activate"}</button>
                  <button type="button" onClick={() => handleDelete(profile)} className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-200">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <form onSubmit={handleSave} className="rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.92),rgba(10,7,4,0.96))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.3)] sm:p-6">
          <h2 className="text-2xl font-semibold text-white">{form.id ? "Edit Profile" : "Add Profile"}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Type</span><select name="profile_type" value={form.profile_type} onChange={handleSelectChange} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"><option value="band">Band</option><option value="team">Team</option></select></label>
            <label className="block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Status</span><select name="status" value={form.status} onChange={handleSelectChange} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"><option value="draft">Draft</option><option value="published">Published</option></select></label>
            {["name", "slug", "role_title", "instruments", "photo_url", "facebook_url", "website_url", "display_order"].map((field) => (
              <label key={field} className="block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">{field.replace("_", " ")}</span><input name={field} type={field.includes("url") ? "url" : field === "display_order" ? "number" : "text"} value={String(form[field as keyof PeopleForm] ?? "")} onChange={handleTextChange} required={field === "name"} pattern={field === "slug" ? "[a-z0-9-]+" : undefined} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" /></label>
            ))}
          </div>
          <label className="mt-5 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Hobbies &amp; Interests</span><input name="hobbies_interests" value={form.hobbies_interests} onChange={handleTextChange} placeholder="Racing, music, family time, cooking, community events, etc." className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" /></label>
          <section className="mt-5 rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
            <h3 className="text-xl font-semibold text-white">Photo Upload</h3>
            <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">Upload an image or paste a photo URL.</p>
            <div className="mt-4 aspect-[4/3] overflow-hidden rounded-md border border-[#d7a84f]/15">
              <ProfilePhoto
                src={form.photo_url}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            </div>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoUpload} disabled={isUploadingPhoto} className="mt-4 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07]" />
          </section>
          <label className="mt-5 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Bio</span><textarea name="bio" value={form.bio} onChange={handleTextChange} rows={6} className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" /></label>
          <section className="mt-5 rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4"><h3 className="text-xl font-semibold text-white">Review Links</h3><input readOnly value={getReviewLink(form)} className="mt-4 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-[#d9c8aa] outline-none" /><input readOnly value={getPublicLink(form)} className="mt-3 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-[#d9c8aa] outline-none" /><div className="mt-3 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => copyLink(getReviewLink(form), "Review link")} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/55 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]">Copy Review Link</button><button type="button" onClick={() => copyLink(getPublicLink(form), "Public link")} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/55 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]">Copy Public Link</button></div></section>
          <label className="mt-5 inline-flex items-center gap-3 text-[#e7d8c2]"><input type="checkbox" checked={form.active} onChange={handleActiveChange} className="h-5 w-5 accent-[#d7a84f]" />Active</label>
          <button type="submit" disabled={isSaving} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0">{isSaving ? "Saving..." : form.id ? "Save Changes" : "Add Profile"}</button>
        </form>
      </section>

      <section className="mt-8 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Pending Bio Updates</h2>
        <div className="mt-5 grid gap-4">
          {submissions.length === 0 ? <p className="text-[#d9c8aa]">No submissions yet.</p> : null}
          {submissions.map((submission) => (
            <article key={submission.id} className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><h3 className="font-semibold text-white">{submission.people_profiles?.name ?? "Profile"}</h3><p className="mt-1 text-sm uppercase tracking-[0.14em] text-[#f4d28b]">{submission.status} / {submission.people_profiles?.profile_type ?? "person"}</p>{submission.submitted_photo_url ? <div className="mt-4 h-48 max-w-xs overflow-hidden rounded-md border border-[#d7a84f]/20"><ProfilePhoto src={submission.submitted_photo_url} alt={`${submission.people_profiles?.name ?? "Profile"} submitted photo`} className="h-full w-full object-cover" /></div> : null}<div className="mt-4 space-y-2 text-sm leading-6 text-[#d9c8aa]">{submission.submitted_name ? <p>Name: {submission.submitted_name}</p> : null}{submission.submitted_role_title ? <p>Role: {submission.submitted_role_title}</p> : null}{submission.submitted_instruments ? <p>Instruments: {submission.submitted_instruments}</p> : null}{submission.submitted_facebook_url ? <p>Facebook: {submission.submitted_facebook_url}</p> : null}{submission.submitted_website_url ? <p>Website: {submission.submitted_website_url}</p> : null}{submission.submitted_bio ? <p className="whitespace-pre-line">Bio: {submission.submitted_bio}</p> : null}{submission.submitted_hobbies_interests ? <p className="whitespace-pre-line">Hobbies &amp; Interests: {submission.submitted_hobbies_interests}</p> : null}{submission.submitted_photo_note ? <p className="whitespace-pre-line">Photo note: {submission.submitted_photo_note}</p> : null}</div></div>
                <div className="flex flex-wrap gap-2"><button type="button" onClick={() => applySubmission(submission)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]">Apply</button>{submission.submitted_photo_url ? <button type="button" onClick={() => applySubmittedPhoto(submission)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]">Apply Submitted Photo</button> : null}<button type="button" onClick={() => updateSubmissionStatus(submission, "reviewed")} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]">Reviewed</button><button type="button" onClick={() => updateSubmissionStatus(submission, "rejected")} className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-200">Reject</button><button type="button" onClick={() => deleteSubmission(submission)} className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-200">Delete</button></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
