"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  getPresaleAccessStorageKey,
  isPresaleAccessMarkerCurrent,
  parsePresaleAccessMarker,
  type PresaleAccessMarker,
  type PresaleAccessValidationResult,
} from "@/lib/presale-access";
import { formatPublicSaleStart } from "@/lib/ticket-sales-status";

type PresaleAccessGateProps = {
  showSlug: string;
  publicSaleStartsAt: string | null;
  children: ReactNode;
  compact?: boolean;
};

const invalidCodeMessage =
  "That presale code wasn't recognized. Please check the code from your CMMS email and try again.";
const verificationFailureMessage =
  "We couldn't verify the presale code right now. Please try again.";

export function ClearPresaleAccessMarker({ showSlug }: { showSlug: string }) {
  useEffect(() => {
    localStorage.removeItem(getPresaleAccessStorageKey(showSlug));
  }, [showSlug]);

  return null;
}

export function PresaleAccessGate({
  showSlug,
  publicSaleStartsAt,
  children,
  compact = false,
}: PresaleAccessGateProps) {
  const [code, setCode] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");
  const storageKey = useMemo(
    () => getPresaleAccessStorageKey(showSlug),
    [showSlug],
  );
  const publicSaleText = publicSaleStartsAt
    ? `Public ticket sales begin ${formatPublicSaleStart(publicSaleStartsAt)}.`
    : null;

  useEffect(() => {
    const marker = parsePresaleAccessMarker(localStorage.getItem(storageKey));

    if (isPresaleAccessMarkerCurrent(marker)) {
      setHasAccess(true);
    } else {
      localStorage.removeItem(storageKey);
    }

    setIsReady(true);
  }, [storageKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isChecking) {
      return;
    }

    setMessage("");
    setIsChecking(true);

    try {
      const response = await fetch(
        `/api/presale-access/${encodeURIComponent(showSlug)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code }),
        },
      );
      const result = (await response.json().catch(() => null)) as
        | PresaleAccessValidationResult
        | null;

      if (!response.ok || result?.ok !== true) {
        setMessage(
          result?.ok === false && result.reason === "unavailable"
            ? verificationFailureMessage
            : invalidCodeMessage,
        );
        return;
      }

      const marker: PresaleAccessMarker = publicSaleStartsAt
        ? { granted: true, expiresAt: publicSaleStartsAt }
        : { granted: true };
      localStorage.setItem(storageKey, JSON.stringify(marker));
      window.location.assign(result.ticketUrl);
    } catch {
      setMessage(verificationFailureMessage);
    } finally {
      setIsChecking(false);
    }
  }

  if (!isReady) {
    return (
      <span
        className={
          compact
            ? "inline-flex max-w-full items-center rounded-full border border-[#d7a84f]/35 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b]"
            : "inline-flex min-h-12 max-w-full items-center justify-center rounded-full border border-[#d7a84f]/55 bg-black/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b]"
        }
        role="status"
      >
        Early Access Presale
      </span>
    );
  }

  if (hasAccess) {
    return children;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "flex w-full max-w-sm flex-col gap-2 rounded-lg border border-[#d7a84f]/25 bg-black/25 p-3 text-left"
          : "flex w-full max-w-md flex-col gap-3 rounded-lg border border-[#d7a84f]/25 bg-black/30 p-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
      }
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f4d28b]">
          Already Have Your Presale Code?
        </p>
        <p className="mt-1 text-sm leading-6 text-[#e7d8c2]">
          Tickets are currently available to CMMS Mailing List members.
        </p>
      </div>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4d28b]">
          Presale Access Code
        </span>
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/45 px-3 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
          required
        />
      </label>
      {message ? (
        <p className="rounded-md border border-red-300/25 bg-red-950/35 px-3 py-2 text-sm leading-6 text-red-100">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isChecking}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isChecking ? "Checking..." : "Continue to Tickets"}
      </button>
      <p className="text-sm leading-6 text-[#d9c8aa]">
        Don't have a code?{" "}
        <Link
          href="/mailing-list"
          className="font-semibold text-[#f4d28b] underline-offset-4 transition hover:text-white hover:underline"
        >
          Join the CMMS Mailing List
        </Link>{" "}
        for early access.
      </p>
      {publicSaleText ? (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#bda987]">
          {publicSaleText}
        </p>
      ) : null}
    </form>
  );
}
