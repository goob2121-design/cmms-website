import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatTicketSaleDate,
  getPresalePageState,
  isActivePresaleDeliveryWindow,
} from "../lib/presale.ts";

const stageFlowShow = {
  slug: "cmms100326",
  name: "Cumberland Mountain Music Show",
  date: "2026-10-03",
};

function lookup(
  status: "presale" | "public" | "not_on_sale",
  presaleStartsAt: string | null,
  publicSaleStartsAt: string | null = null,
) {
  return {
    ok: true as const,
    data: {
      show: stageFlowShow,
      ticketSales: { status, presaleStartsAt, publicSaleStartsAt },
    },
  };
}

test("presale page state is date-aware and safely handles every API state", () => {
  const startsAt = "2026-09-01T04:00:00.000Z";
  assert.equal(
    getPresalePageState(lookup("presale", startsAt), new Date("2026-08-31T20:00:00Z")),
    "upcoming",
  );
  assert.equal(
    getPresalePageState(lookup("presale", startsAt), new Date(startsAt)),
    "active",
  );
  assert.equal(getPresalePageState(lookup("presale", null)), "active");
  assert.equal(getPresalePageState(lookup("public", startsAt)), "public");
  assert.equal(
    getPresalePageState(
      lookup("not_on_sale", startsAt),
      new Date("2026-08-23T16:00:00Z"),
    ),
    "upcoming",
  );
  assert.equal(getPresalePageState(lookup("not_on_sale", null)), "not_on_sale");
  assert.equal(getPresalePageState({ ok: false }), "unavailable");
  assert.equal(
    getPresalePageState({ ok: true, data: { show: null, ticketSales: null } }),
    "no_show",
  );
});

test("strong delivery wording is limited to the active presale window", () => {
  const sales = lookup(
    "presale",
    "2026-09-01T04:00:00.000Z",
    "2026-09-08T04:00:00.000Z",
  ).data.ticketSales;

  assert.equal(
    isActivePresaleDeliveryWindow(sales, new Date("2026-08-31T20:00:00Z")),
    false,
  );
  assert.equal(
    isActivePresaleDeliveryWindow(sales, new Date("2026-09-01T04:00:00Z")),
    true,
  );
  assert.equal(
    isActivePresaleDeliveryWindow(sales, new Date("2026-09-08T04:00:00Z")),
    false,
  );
  assert.equal(
    isActivePresaleDeliveryWindow(lookup("presale", null).data.ticketSales),
    false,
  );
  assert.equal(
    isActivePresaleDeliveryWindow(lookup("public", "2026-09-01T04:00:00Z").data.ticketSales),
    false,
  );
});

test("presale dates are friendly, dynamic New York dates", () => {
  assert.equal(formatTicketSaleDate("2026-09-01T04:00:00.000Z"), "September 1, 2026");
});

test("presale route reuses StageFlow and the existing mailing-list form", () => {
  const page = readFileSync("app/presale/page.tsx", "utf8");
  const form = readFileSync("app/mailing-list/mailing-list-form.tsx", "utf8");

  assert.match(page, /getPublicTicketSalesStatus\(\)/);
  assert.match(page, /ticketSales\.presaleStartsAt/);
  assert.match(page, /ticketSales\.publicSaleStartsAt/);
  assert.match(page, /<MailingListForm \/>/);
  assert.match(form, /MAILING_LIST_ENDPOINT/);
  assert.doesNotMatch(page, /September 1, 2026|September 8, 2026|October 3, 2026/);
  assert.doesNotMatch(page, /private.{0,20}(url|href)|presale.{0,20}(ticketUrl|href)/i);
  assert.match(page, /sm:grid-cols-3/);
});

test("page copy covers upcoming, active, public, not-on-sale, and failure states", () => {
  const page = readFileSync("app/presale/page.tsx", "utf8");

  assert.match(page, /Early Access Opens Soon/);
  assert.match(page, /Early Access Presale Is Open/);
  assert.match(page, /Public Ticket Sales Are Open/);
  assert.match(page, /Tickets Coming Soon/);
  assert.match(page, /Presale information is temporarily unavailable/);
  assert.match(page, /pageState === "public"/);
  assert.match(page, /Buy Advance Tickets/);
  assert.match(page, /Already on the mailing list\?/);
  assert.match(page, /Watch your inbox for your Early Access ticket link/);
  assert.match(page, /Spam, Promotions, or Social folders/);
  assert.match(page, /Not on the list yet\?/);
  assert.match(page, /we’ll send you the current Early Access ticket link while the presale is open/);
  assert.match(page, /activeDeliveryWindow/);
});

test("homepage presale CTA links to the dedicated page without hero explanation", () => {
  const homepage = readFileSync("app/page.tsx", "utf8");
  const gate = readFileSync("components/TicketSaleGate.tsx", "utf8");

  assert.match(homepage, /presaleHref="\/presale"/);
  assert.match(gate, /href=\{presaleHref\}/);
  assert.doesNotMatch(homepage.slice(0, homepage.indexOf("2026 CMMS Schedule")), /Join the Mailing List|Starts September|Available now to CMMS/);
  assert.match(homepage, /View Show Details/);
});
