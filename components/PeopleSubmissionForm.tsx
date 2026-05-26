"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { createStorageFileName, validateImageFile } from "@/lib/imageUploads";
import { supabase } from "@/lib/supabase/client";
import type { PeopleProfile } from "@/lib/supabase/people";

export function PeopleSubmissionForm({
  profile,
  reviewToken,
}: {
  profile: PeopleProfile;
  reviewToken: string;
}) {
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage("");
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setPhotoFile(null);
      setPhotoPreviewUrl("");
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      event.target.value = "";
      setPhotoFile(null);
      setPhotoPreviewUrl("");
      setErrorMessage(validationError);
      return;
    }

    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage("Submissions are not available right now.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    let submittedPhotoUrl: string | null = null;

    if (photoFile) {
      const filePath = `${profile.id}/${createStorageFileName(
        profile.slug ?? profile.name,
        photoFile,
      )}`;
      const { error: uploadError } = await supabase.storage
        .from("people-submissions")
        .upload(filePath, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setIsSubmitting(false);
        setErrorMessage(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("people-submissions")
        .getPublicUrl(filePath);
      submittedPhotoUrl = data.publicUrl;
    }

    const { error } = await supabase.from("people_profile_submissions").insert({
      profile_id: profile.id,
      review_token: reviewToken,
      submitted_name: String(formData.get("submitted_name") ?? "").trim() || null,
      submitted_role_title:
        String(formData.get("submitted_role_title") ?? "").trim() || null,
      submitted_instruments:
        String(formData.get("submitted_instruments") ?? "").trim() || null,
      submitted_bio: String(formData.get("submitted_bio") ?? "").trim() || null,
      submitted_hobbies_interests:
        String(formData.get("submitted_hobbies_interests") ?? "").trim() || null,
      submitted_facebook_url:
        String(formData.get("submitted_facebook_url") ?? "").trim() || null,
      submitted_website_url:
        String(formData.get("submitted_website_url") ?? "").trim() || null,
      submitted_photo_note:
        String(formData.get("submitted_photo_note") ?? "").trim() || null,
      submitted_photo_url: submittedPhotoUrl,
      status: "pending",
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    event.currentTarget.reset();
    setPhotoFile(null);
    setPhotoPreviewUrl("");
    setMessage("Thanks. Your suggested changes were sent for review.");
  }

  return (
    <section className="mt-10 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
      <h2 className="text-2xl font-semibold text-white">Request Bio Update</h2>
      <p className="mt-3 leading-7 text-[#d9c8aa]">
        Share edits you would like the CMMS team to review. These suggestions do
        not update the public profile until an admin applies them.
      </p>

      {message ? (
        <p className="mt-5 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-5 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Name</span>
            <input name="submitted_name" defaultValue={profile.name} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Role Title</span>
            <input name="submitted_role_title" defaultValue={profile.role_title ?? ""} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Instruments</span>
            <input name="submitted_instruments" defaultValue={profile.instruments ?? ""} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Facebook URL</span>
            <input name="submitted_facebook_url" type="url" defaultValue={profile.facebook_url ?? ""} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Website URL</span>
            <input name="submitted_website_url" type="url" defaultValue={profile.website_url ?? ""} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Bio</span>
          <textarea name="submitted_bio" defaultValue={profile.bio ?? ""} rows={6} className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Hobbies &amp; Interests</span>
          <textarea name="submitted_hobbies_interests" defaultValue={profile.hobbies_interests ?? ""} rows={3} placeholder="Racing, music, family time, cooking, community events, etc." className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Photo Note</span>
          <textarea name="submitted_photo_note" rows={3} placeholder="Tell us if you want a different photo used." className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25" />
        </label>
        <section className="rounded-lg border border-[#d7a84f]/18 bg-black/20 p-4">
          <h3 className="text-xl font-semibold text-white">Profile Photo</h3>
          <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
            Optional: upload a photo you&apos;d like us to use for your profile.
          </p>
          {photoPreviewUrl ? (
            <div className="mt-4 h-64 overflow-hidden rounded-md border border-[#d7a84f]/15">
              <ProfilePhoto
                src={photoPreviewUrl}
                alt="Selected profile photo preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          {photoFile ? (
            <p className="mt-3 text-sm text-[#d9c8aa]">{photoFile.name}</p>
          ) : null}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            disabled={isSubmitting}
            className="mt-4 block w-full text-sm text-[#d9c8aa] file:mr-4 file:rounded-full file:border-0 file:bg-[#d7a84f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-[#120d07]"
          />
        </section>
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0">
          {isSubmitting ? "Sending..." : "Submit Suggested Changes"}
        </button>
      </form>
    </section>
  );
}
