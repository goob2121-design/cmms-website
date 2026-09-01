import { TICKET_SALES_STATUS_ENDPOINT } from "@/lib/ticket-sales-status";

export const PRESALE_ACCESS_STORAGE_PREFIX = "cmms_presale_access_";

export type PresaleAccessMarker = {
  granted: true;
  expiresAt?: string;
};

export type PresaleAccessValidationResult =
  | { ok: true; ticketUrl: string }
  | { ok: false; reason: "invalid" | "unavailable" };

export function getPresaleAccessEndpoint(showSlug: string) {
  const baseUrl = new URL(TICKET_SALES_STATUS_ENDPOINT);
  baseUrl.pathname = `/api/public/shows/${encodeURIComponent(
    showSlug,
  )}/presale-access`;
  baseUrl.search = "";
  return baseUrl.toString();
}

export function getPresaleAccessStorageKey(showSlug: string) {
  return `${PRESALE_ACCESS_STORAGE_PREFIX}${showSlug}`;
}

export function isPresaleAccessMarkerCurrent(
  marker: PresaleAccessMarker | null,
  now = new Date(),
) {
  if (!marker?.granted) {
    return false;
  }

  if (!marker.expiresAt) {
    return true;
  }

  const expiresAt = Date.parse(marker.expiresAt);
  return Number.isFinite(expiresAt) && now.getTime() < expiresAt;
}

export function parsePresaleAccessMarker(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const marker = parsed as Partial<PresaleAccessMarker>;
    if (marker.granted !== true) {
      return null;
    }

    if (
      "expiresAt" in marker &&
      marker.expiresAt !== undefined &&
      typeof marker.expiresAt !== "string"
    ) {
      return null;
    }

    return marker as PresaleAccessMarker;
  } catch {
    return null;
  }
}
