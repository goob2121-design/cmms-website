import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatPublicSaleStart,
  getPublicTicketSalesStatus,
  getTicketSaleAvailability,
  type TicketSaleAvailability,
  type WebsiteShowIdentity,
} from "@/lib/ticket-sales-status";

type TicketSaleGateProps = {
  availability?: TicketSaleAvailability;
  show?: WebsiteShowIdentity;
  useSafeFailureFallback?: boolean;
  children: ReactNode;
  compact?: boolean;
  hideWhenClosed?: boolean;
  className?: string;
};

export async function TicketSaleGate({
  availability,
  show,
  useSafeFailureFallback = false,
  children,
  compact = false,
  hideWhenClosed = false,
  className = "",
}: TicketSaleGateProps) {
  const resolvedAvailability =
    availability ??
    (show
      ? getTicketSaleAvailability(await getPublicTicketSalesStatus(), show, {
          useSafeFailureFallback,
        })
      : { kind: "unmatched" as const });

  if (resolvedAvailability.kind === "public" || resolvedAvailability.kind === "unmatched") {
    return <>{children}</>;
  }

  if (hideWhenClosed) return null;

  const publicSaleStart =
    "publicSaleStartsAt" in resolvedAvailability && resolvedAvailability.publicSaleStartsAt
      ? formatPublicSaleStart(resolvedAvailability.publicSaleStartsAt)
      : null;

  const title =
    resolvedAvailability.kind === "presale"
      ? "Early Access Presale"
      : resolvedAvailability.kind === "not_on_sale"
        ? "Tickets Coming Soon"
        : "Ticket Availability Temporarily Unavailable";

  const secondaryText =
    resolvedAvailability.kind === "presale"
      ? "Available now to CMMS mailing-list subscribers"
      : resolvedAvailability.kind === "not_on_sale"
        ? publicSaleStart
          ? `Public sales open ${publicSaleStart}`
          : "Tickets are not on sale yet"
        : "Please check back shortly";

  if (compact) {
    if (resolvedAvailability.kind === "presale") {
      return (
        <span
          className={`inline-flex max-w-full flex-col items-center gap-1 text-center ${className}`}
          role="status"
        >
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
            {title}
          </span>
          <span className="text-xs leading-4 text-[#e7d8c2]">
            {secondaryText}
          </span>
          <Link
            href="/mailing-list"
            className="inline-flex min-h-8 items-center justify-center rounded-full border border-[#d7a84f]/55 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#f4d28b] transition hover:border-[#f1c86e] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f4d28b]"
          >
            Join the Mailing List
          </Link>
        </span>
      );
    }

    return (
      <span
        className={`text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b] ${className}`}
      >
        {title}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex min-h-12 max-w-full flex-col items-center justify-center rounded-full border border-[#d7a84f]/55 bg-black/25 px-6 py-2 text-center ${className}`}
      role="status"
    >
      <span className="text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
        {title}
      </span>
      <span className="mt-0.5 text-xs leading-4 text-[#e7d8c2]">
        {secondaryText}
      </span>
      {resolvedAvailability.kind === "presale" ? (
        <Link
          href="/mailing-list"
          className="mt-2 inline-flex min-h-8 items-center justify-center rounded-full border border-[#d7a84f]/55 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#f4d28b] transition hover:border-[#f1c86e] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f4d28b]"
        >
          Join the Mailing List
        </Link>
      ) : null}
    </span>
  );
}
