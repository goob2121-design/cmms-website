"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

const sponsorInterestOptions = [
  "Platinum",
  "Gold",
  "Silver",
  "Community Partner",
  "In-Kind Sponsor",
  "Not Sure Yet",
];

type SponsorInterestFormState = {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  sponsor_interest: string;
  message: string;
};

const emptyForm: SponsorInterestFormState = {
  business_name: "",
  contact_name: "",
  email: "",
  phone: "",
  sponsor_interest: "Not Sure Yet",
  message: "",
};

const fieldClass = "block";
const labelClass =
  "flex min-h-8 items-end text-xs font-bold uppercase leading-4 tracking-[0.16em] text-[#f4d28b]";
const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25";
const textareaClass =
  "mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25";

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function SponsorInterestForm() {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage(
        "The sponsorship form is not available right now. Please email us directly.",
      );
      return;
    }

    if (!form.contact_name.trim() || !form.email.trim()) {
      setErrorMessage("Please enter your name and email address.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("sponsor_inquiries").insert({
      business_name: cleanOptional(form.business_name),
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      phone: cleanOptional(form.phone),
      sponsor_interest: cleanOptional(form.sponsor_interest),
      message: cleanOptional(form.message),
      status: "new",
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        "We could not send your sponsorship interest right now. Please try again or email us directly.",
      );
      return;
    }

    setForm(emptyForm);
    setSuccessMessage(
      "Thank you. Your sponsorship interest has been sent, and we'll be in touch soon.",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.92),rgba(10,7,4,0.96))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.28)] sm:p-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d7a84f]">
          Sponsor Interest
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Tell Us About Your Interest
        </h2>
        <p className="mt-3 leading-7 text-[#d9c8aa]">
          Send a quick note and someone from Cumberland Mountain Music will
          follow up with you.
        </p>
      </div>

      {successMessage ? (
        <p className="mt-5 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-5 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-6 grid items-start gap-4 sm:grid-cols-2">
        <label className={fieldClass}>
          <span className={labelClass}>
            Business / Organization
          </span>
          <input
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>
            Contact Name
          </span>
          <input
            name="contact_name"
            value={form.contact_name}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>
            Email
          </span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>
            Phone
          </span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className={labelClass}>
          Sponsorship Interest
        </span>
        <select
          name="sponsor_interest"
          value={form.sponsor_interest}
          onChange={handleChange}
          className={inputClass}
        >
          {sponsorInterestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className={labelClass}>
          Message
        </span>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          className={textareaClass}
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isSubmitting ? "Sending..." : "Send Sponsorship Interest"}
      </button>
    </form>
  );
}
