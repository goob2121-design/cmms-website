export const MAILING_LIST_ENDPOINT = "https://stageflow.cumberlandmountainmusic.com/api/public/mailing-list/subscribe";

export type MailingListFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  website: string;
};

export type MailingListSubmitPayload = MailingListFormValues & {
  resubscribe?: true;
};

export type MailingListResult =
  | { status: "subscribed" }
  | { status: "already_subscribed" }
  | { status: "resubscribe_required" }
  | { status: "resubscribed" }
  | { status: "error" };

export function trimMailingListValues(values: MailingListFormValues): MailingListFormValues {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    website: values.website.trim(),
  };
}

export function isValidEmailAddress(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function buildMailingListPayload(values: MailingListFormValues, resubscribe = false): MailingListSubmitPayload {
  const trimmed = trimMailingListValues(values);
  return resubscribe ? { ...trimmed, resubscribe: true } : trimmed;
}

export function normalizeMailingListResult(payload: unknown, resubscribe = false): MailingListResult {
  if (!payload || typeof payload !== "object") return { status: "error" };

  const status = "status" in payload ? payload.status : undefined;
  const code = "code" in payload ? payload.code : undefined;
  const error = "error" in payload ? payload.error : undefined;
  const value = typeof status === "string" ? status : typeof code === "string" ? code : typeof error === "string" ? error : "";

  if (value === "already_subscribed") return { status: "already_subscribed" };
  if (value === "resubscribe_required") return { status: "resubscribe_required" };
  if (value === "subscribed" || value === "success" || value === "ok") {
    return { status: resubscribe ? "resubscribed" : "subscribed" };
  }
  if ("success" in payload && payload.success === true) {
    return { status: resubscribe ? "resubscribed" : "subscribed" };
  }

  return { status: "error" };
}
