"use client";

import { FormEvent, useRef, useState } from "react";
import {
  MAILING_LIST_ENDPOINT,
  buildMailingListPayload,
  isValidEmailAddress,
  normalizeMailingListResult,
  trimMailingListValues,
  type MailingListFormValues,
  type MailingListResult,
} from "@/lib/mailing-list";

type ViewState = MailingListResult["status"] | "idle" | "submitting" | "resubscribing";

const initialValues: MailingListFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  website: "",
};

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-lg border border-[#d7a84f]/25 bg-[#070504]/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-[#8e7a5c] focus:border-[#f1c86e] focus:ring-2 focus:ring-[#d7a84f]/35";
const buttonClassName =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.34)] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f1c86e] focus:ring-offset-2 focus:ring-offset-[#120d08] disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto";

export function MailingListForm() {
  const [values, setValues] = useState<MailingListFormValues>(initialValues);
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const pendingValues = useRef<MailingListFormValues | null>(null);

  const isSubmitting = viewState === "submitting" || viewState === "resubscribing";

  function updateValue(key: keyof MailingListFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errorMessage) setErrorMessage("");
  }

  async function submit(valuesToSubmit: MailingListFormValues, resubscribe = false) {
    const nextState: ViewState = resubscribe ? "resubscribing" : "submitting";
    setViewState(nextState);
    setErrorMessage("");

    try {
      const response = await fetch(MAILING_LIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildMailingListPayload(valuesToSubmit, resubscribe)),
      });
      const payload = await response.json().catch(() => null);
      const result = normalizeMailingListResult(payload, resubscribe);

      if (result.status === "error" || (!response.ok && result.status !== "already_subscribed" && result.status !== "resubscribe_required")) {
        throw new Error("Subscription request failed.");
      }

      setViewState(result.status);
      if (result.status === "subscribed" || result.status === "resubscribed" || result.status === "already_subscribed") {
        setValues(initialValues);
        if (result.status !== "already_subscribed") pendingValues.current = null;
      }
    } catch {
      setViewState("idle");
      setErrorMessage("We couldn't add you to the mailing list right now. Please try again in a moment.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmed = trimMailingListValues(values);
    if (!trimmed.email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!isValidEmailAddress(trimmed.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    pendingValues.current = trimmed;
    void submit(trimmed);
  }

  function handleRejoin() {
    if (isSubmitting || !pendingValues.current) return;
    void submit(pendingValues.current, true);
  }

  if (viewState === "subscribed") {
    return <Confirmation title="You're on the list!" body="Thanks for joining the Cumberland Mountain Music Show mailing list. Keep an eye on your inbox!" />;
  }

  if (viewState === "already_subscribed") {
    return <Confirmation title="You're already on the list!" body="Thanks for staying connected with the Cumberland Mountain Music Show." />;
  }

  if (viewState === "resubscribed") {
    return <Confirmation title="Welcome back!" body="You've been added back to the Cumberland Mountain Music Show mailing list." />;
  }

  if (viewState === "resubscribe_required" || viewState === "resubscribing") {
    return (
      <div className="mt-8 rounded-lg border border-[#d7a84f]/25 bg-[#070504]/45 p-5 text-center" role="status" aria-live="polite">
        <h2 className="text-2xl font-semibold text-white">Looks like you&apos;ve been on our mailing list before.</h2>
        <p className="mt-3 text-base leading-7 text-[#e7d8c2]">Would you like to rejoin?</p>
        <button className={`${buttonClassName} mt-5`} type="button" onClick={handleRejoin} disabled={isSubmitting}>
          {viewState === "resubscribing" ? "Rejoining..." : "Rejoin the Mailing List"}
        </button>
      </div>
    );
  }

  return (
    <form className="mt-8 text-left" onSubmit={handleSubmit} noValidate>
      <div aria-live="polite" className="sr-only">
        {isSubmitting ? "Submitting mailing list signup." : errorMessage}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold uppercase tracking-[0.14em] text-[#d7a84f]">
          First Name <span className="normal-case tracking-normal text-[#bda987]">(optional)</span>
          <input
            className={fieldClassName}
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(event) => updateValue("firstName", event.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold uppercase tracking-[0.14em] text-[#d7a84f]">
          Last Name <span className="normal-case tracking-normal text-[#bda987]">(optional)</span>
          <input
            className={fieldClassName}
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(event) => updateValue("lastName", event.target.value)}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-semibold uppercase tracking-[0.14em] text-[#d7a84f]">
        Email Address <span className="text-[#f1c86e]">*</span>
        <input
          className={fieldClassName}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-describedby={errorMessage ? "mailing-list-error" : undefined}
          value={values.email}
          onChange={(event) => updateValue("email", event.target.value)}
        />
      </label>

      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => updateValue("website", event.target.value)}
          />
        </label>
      </div>

      {errorMessage ? (
        <p id="mailing-list-error" className="mt-3 rounded-lg border border-red-400/25 bg-red-950/25 px-4 py-3 text-center text-sm leading-6 text-red-100" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-6 text-center">
        <button className={buttonClassName} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join the Mailing List"}
        </button>
      </div>
    </form>
  );
}

function Confirmation({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-8 rounded-lg border border-[#d7a84f]/25 bg-[#070504]/45 p-5 text-center" role="status" aria-live="polite">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-base leading-7 text-[#e7d8c2]">{body}</p>
    </div>
  );
}
