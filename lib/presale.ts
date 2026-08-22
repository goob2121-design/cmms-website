import type {
  PublicTicketSalesResponse,
  TicketSalesLookup,
} from "@/lib/ticket-sales-status";

export type PresalePageState =
  | "unavailable"
  | "no_show"
  | "upcoming"
  | "active"
  | "public"
  | "not_on_sale";

export function getPresalePageState(
  lookup: TicketSalesLookup,
  now = new Date(),
): PresalePageState {
  if (!lookup.ok) return "unavailable";

  const { show, ticketSales } = lookup.data;
  if (!show || !ticketSales) return "no_show";

  if (ticketSales.status === "public") return "public";
  if (ticketSales.status === "not_on_sale") return "not_on_sale";

  const presaleStart = ticketSales.presaleStartsAt
    ? Date.parse(ticketSales.presaleStartsAt)
    : Number.NaN;

  return Number.isFinite(presaleStart) && now.getTime() < presaleStart
    ? "upcoming"
    : "active";
}

export function isActivePresaleDeliveryWindow(
  ticketSales: PublicTicketSalesResponse["ticketSales"],
  now = new Date(),
) {
  if (ticketSales?.status !== "presale" || !ticketSales.presaleStartsAt) {
    return false;
  }

  const presaleStart = Date.parse(ticketSales.presaleStartsAt);
  const publicSaleStart = ticketSales.publicSaleStartsAt
    ? Date.parse(ticketSales.publicSaleStartsAt)
    : null;

  if (!Number.isFinite(presaleStart) || now.getTime() < presaleStart) {
    return false;
  }

  return publicSaleStart === null ||
    (Number.isFinite(publicSaleStart) && now.getTime() < publicSaleStart);
}

export function formatTicketSaleDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
