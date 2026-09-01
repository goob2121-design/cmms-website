import { getPresaleAccessEndpoint } from "@/lib/presale-access";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function getValidatedTicketUrl(value: unknown) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const payload = value as { ticketUrl?: unknown; ticket_url?: unknown };
  if (typeof payload.ticketUrl === "string") {
    return payload.ticketUrl;
  }

  if (typeof payload.ticket_url === "string") {
    return payload.ticket_url;
  }

  return "";
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;
  const code = typeof body?.code === "string" ? body.code : "";

  if (!slug || !code.trim()) {
    return Response.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  try {
    const response = await fetch(getPresaleAccessEndpoint(slug), {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });

    const payload: unknown = await response.json().catch(() => null);

    const ticketUrl = getValidatedTicketUrl(payload);

    if (!response.ok || !ticketUrl) {
      return Response.json({ ok: false, reason: "invalid" }, { status: 401 });
    }

    return Response.json({ ok: true, ticketUrl });
  } catch {
    return Response.json(
      { ok: false, reason: "unavailable" },
      { status: 502 },
    );
  }
}
