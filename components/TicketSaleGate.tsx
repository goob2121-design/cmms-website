import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatPublicSaleStart,
  getPresaleTimingText,
  getPublicTicketSalesStatus,
  getTicketSaleAvailability,
  shouldPromotePresale,
  type TicketSaleAvailability,
  type WebsiteShowIdentity,
} from "@/lib/ticket-sales-status";

type TicketSaleGateProps = {
  availability?: TicketSaleAvailability;
  show?: WebsiteShowIdentity;
  useSafeFailureFallback?: boolean;
  presaleHref?: string;
  children: ReactNode;
  compact?: boolean;
  hideWhenClosed?: boolean;
  className?: string;
};

export async function TicketSaleGate({
  availability,
  show,
  useSafeFailureFallback = false,
  presaleHref,
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

  const showsPresalePromotion = shouldPromotePresale(resolvedAvailability);
  const publicSaleStart =
    "publicSaleStartsAt" in resolvedAvailability && resolvedAvailability.publicSaleStartsAt
      ? formatPublicSaleStart(resolvedAvailability.publicSaleStartsAt)
      : null;

  const title =
    showsPresalePromotion
      ? "Early Access Presale"
      : resolvedAvailability.kind === "not_on_sale"
        ? "Tickets Coming Soon"
        : "Ticket Availability Temporarily Unavailable";

  const secondaryText =
    showsPresalePromotion && "presaleStartsAt" in resolvedAvailability
      ? getPresaleTimingText(resolvedAvailability.presaleStartsAt)
      : resolvedAvailability.kind === "not_on_sale"
        ? publicSaleStart
          ? `Public sales open ${publicSaleStart}`
          : "Tickets are not on sale yet"
        : "Please check back shortly";

  if (compact) {
    const compactClassName = `inline-flex max-w-full items-center rounded-full border border-[#d7a84f]/35 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#f4d28b] ${className}`;

    if (showsPresalePromotion && presaleHref) {
      return (
        <Link href={presaleHref} className={compactClassName}>
          {title}
        </Link>
      );
    }

    return (
      <span
        className={compactClassName}
        role="status"
      >
        {title}
      </span>
    );
  }

  if (showsPresalePromotion && presaleHref) {
    return (
      <Link
        href={presaleHref}
        className={`inline-flex min-h-12 max-w-full items-center justify-center rounded-full border border-[#d7a84f] bg-[#d7a84f] px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.38)] transition hover:-translate-y-0.5 hover:border-[#f1c86e] hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604] ${className}`}
      >
        {title}
      </Link>
    );
  }

  if (showsPresalePromotion) {
    return (
      <span
        className={`inline-flex max-w-full flex-col items-center text-center ${className}`}
        role="status"
      >
        <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/55 bg-black/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f4d28b]">
          {title}
        </span>
        <span className="mt-1 text-xs leading-4 text-[#e7d8c2]">
          {secondaryText}
        </span>
        <Link
          href="/mailing-list"
          className="mt-1 inline-flex min-h-8 items-center justify-center rounded-full border border-[#d7a84f]/55 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#f4d28b] transition hover:border-[#f1c86e] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f4d28b]"
        >
          Join the Mailing List
        </Link>
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
    </span>
  );
}
