import { cache } from "react";

export const TICKET_SALES_STATUS_ENDPOINT =
  "https://stageflow.cumberlandmountainmusic.com/api/public/ticket-sales-status";
export const TICKET_SALES_STATUS_REVALIDATE_SECONDS = 60;

export type TicketSalesStatus = "not_on_sale" | "presale" | "public";

export type PublicTicketSalesResponse = {
  show: {
    slug: string;
    name: string;
    date: string;
  } | null;
  ticketSales: {
    status: TicketSalesStatus;
    presaleStartsAt: string | null;
    publicSaleStartsAt: string | null;
  } | null;
};

export type TicketSaleAvailability =
  | { kind: "public" }
  | { kind: "presale"; presaleStartsAt: string | null; publicSaleStartsAt: string | null }
  | { kind: "not_on_sale"; presaleStartsAt: string | null; publicSaleStartsAt: string | null }
  | { kind: "unavailable" }
  | { kind: "unmatched" };

export type WebsiteShowIdentity = {
  slug?: string | null;
  name?: string | null;
  date: string;
};

export type TicketSalesLookup =
  | { ok: true; data: PublicTicketSalesResponse }
  | { ok: false };

function isTicketSalesStatus(value: unknown): value is TicketSalesStatus {
  return value === "not_on_sale" || value === "presale" || value === "public";
}

function isPublicTicketSalesResponse(value: unknown): value is PublicTicketSalesResponse {
  if (!value || typeof value !== "object") return false;

  const response = value as Partial<PublicTicketSalesResponse>;
  if (response.show === null && response.ticketSales === null) return true;
  if (!response.show || !response.ticketSales) return false;

  return (
    typeof response.show.slug === "string" &&
    typeof response.show.name === "string" &&
    typeof response.show.date === "string" &&
    isTicketSalesStatus(response.ticketSales.status) &&
    (response.ticketSales.presaleStartsAt === null ||
      typeof response.ticketSales.presaleStartsAt === "string") &&
    (response.ticketSales.publicSaleStartsAt === null ||
      typeof response.ticketSales.publicSaleStartsAt === "string")
  );
}

export const getPublicTicketSalesStatus = cache(
  async (): Promise<TicketSalesLookup> => {
    try {
      const response = await fetch(TICKET_SALES_STATUS_ENDPOINT, {
        headers: { accept: "application/json" },
        next: { revalidate: TICKET_SALES_STATUS_REVALIDATE_SECONDS },
      });

      if (!response.ok) {
        console.warn(
          `Unable to load StageFlow ticket-sale status: HTTP ${response.status}`,
        );
        return { ok: false };
      }

      const data: unknown = await response.json();
      if (!isPublicTicketSalesResponse(data)) {
        console.warn("Unable to load StageFlow ticket-sale status: invalid response");
        return { ok: false };
      }

      return { ok: true, data };
    } catch (error) {
      console.warn(
        "Unable to load StageFlow ticket-sale status:",
        error instanceof Error ? error.message : "unknown error",
      );
      return { ok: false };
    }
  },
);

function calendarDate(value: string) {
  return value.split("T")[0];
}

export function getTicketSaleAvailability(
  lookup: TicketSalesLookup,
  websiteShow: WebsiteShowIdentity,
  options: { useSafeFailureFallback?: boolean } = {},
): TicketSaleAvailability {
  if (!lookup.ok) {
    return options.useSafeFailureFallback
      ? { kind: "unavailable" }
      : { kind: "unmatched" };
  }

  const { show, ticketSales } = lookup.data;
  if (!show || !ticketSales) return { kind: "unmatched" };

  const slugMatches =
    Boolean(websiteShow.slug) && websiteShow.slug === show.slug;
  const dateMatches = calendarDate(websiteShow.date) === calendarDate(show.date);

  if (!slugMatches && !dateMatches) return { kind: "unmatched" };

  if (ticketSales.status === "public") return { kind: "public" };
  if (ticketSales.status === "presale") {
    return {
      kind: "presale",
      presaleStartsAt: ticketSales.presaleStartsAt,
      publicSaleStartsAt: ticketSales.publicSaleStartsAt,
    };
  }

  return {
    kind: "not_on_sale",
    presaleStartsAt: ticketSales.presaleStartsAt,
    publicSaleStartsAt: ticketSales.publicSaleStartsAt,
  };
}

export function shouldPromotePresale(
  availability: TicketSaleAvailability,
  now = new Date(),
) {
  if (availability.kind === "presale") return true;
  if (availability.kind !== "not_on_sale" || !availability.presaleStartsAt) {
    return false;
  }

  const presaleStart = Date.parse(availability.presaleStartsAt);
  return Number.isFinite(presaleStart) && presaleStart > now.getTime();
}

export function getPresaleTimingText(
  presaleStartsAt: string | null,
  now = new Date(),
) {
  const startTime = presaleStartsAt ? Date.parse(presaleStartsAt) : Number.NaN;

  if (!Number.isFinite(startTime) || now.getTime() >= startTime) {
    return "Available now to CMMS mailing-list subscribers";
  }

  return `Starts ${formatPublicSaleStart(presaleStartsAt!)}`;
}

export function formatPublicSaleStart(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
