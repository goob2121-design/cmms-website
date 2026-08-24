import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatPublicSaleStart,
  getPresaleTimingText,
  getTicketSaleAvailability,
  shouldPromotePresale,
  TICKET_SALES_STATUS_ENDPOINT,
  TICKET_SALES_STATUS_REVALIDATE_SECONDS,
} from "../lib/ticket-sales-status.ts";

const websiteShow = {
  slug: "cmms100326",
  name: "Cumberland Mountain Music Show",
  date: "2026-10-03",
};

function success(
  status: "public" | "presale" | "not_on_sale",
  publicSaleStartsAt: string | null,
  presaleStartsAt: string | null = null,
) {
  return {
    ok: true as const,
    data: {
      show: websiteShow,
      ticketSales: { status, presaleStartsAt, publicSaleStartsAt },
    },
  };
}

test("public status keeps the existing public ticket behavior", () => {
  assert.deepEqual(getTicketSaleAvailability(success("public", null), websiteShow), { kind: "public" });
});

test("presale hides purchasing and carries only public-sale timing", () => {
  assert.deepEqual(
    getTicketSaleAvailability(success("presale", "2026-08-27T20:00:00.000Z"), websiteShow),
    { kind: "presale", presaleStartsAt: null, publicSaleStartsAt: "2026-08-27T20:00:00.000Z" },
  );
  assert.deepEqual(getTicketSaleAvailability(success("presale", null), websiteShow), {
    kind: "presale",
    presaleStartsAt: null,
    publicSaleStartsAt: null,
  });
});

test("presale timing is upcoming before its start and active afterward", () => {
  const startsAt = "2026-09-01T04:00:00.000Z";

  assert.equal(
    getPresaleTimingText(startsAt, new Date("2026-08-31T20:00:00.000Z")),
    "Starts September 1",
  );
  assert.doesNotMatch(
    getPresaleTimingText(startsAt, new Date("2026-08-31T20:00:00.000Z")),
    /Available now/,
  );
  assert.equal(
    getPresaleTimingText(startsAt, new Date("2026-09-01T04:00:00.000Z")),
    "Available now to CMMS mailing-list subscribers",
  );
  assert.equal(
    getPresaleTimingText(null, new Date("2026-08-31T20:00:00.000Z")),
    "Available now to CMMS mailing-list subscribers",
  );
});

test("public-sale timestamps use a concise CMMS-friendly date", () => {
  assert.equal(
    formatPublicSaleStart("2026-08-27T20:00:00.000Z"),
    "August 27",
  );
});

test("not-on-sale hides purchasing and preserves an optional opening time", () => {
  assert.deepEqual(getTicketSaleAvailability(success("not_on_sale", null), websiteShow), {
    kind: "not_on_sale",
    presaleStartsAt: null,
    publicSaleStartsAt: null,
  });
});

test("a future scheduled presale is promoted while a true not-on-sale state is not", () => {
  const now = new Date("2026-08-23T16:00:00.000Z");
  const scheduled = getTicketSaleAvailability(
    success("not_on_sale", "2026-09-08T04:00:00.000Z", "2026-09-01T04:00:00.000Z"),
    websiteShow,
  );
  const unscheduled = getTicketSaleAvailability(
    success("not_on_sale", null, null),
    websiteShow,
  );

  assert.equal(shouldPromotePresale(scheduled, now), true);
  assert.equal(shouldPromotePresale(unscheduled, now), false);
  assert.equal(shouldPromotePresale({ kind: "public" }, now), false);
  assert.deepEqual(scheduled, {
    kind: "not_on_sale",
    presaleStartsAt: "2026-09-01T04:00:00.000Z",
    publicSaleStartsAt: "2026-09-08T04:00:00.000Z",
  });
});

test("no StageFlow show does not apply stale status", () => {
  assert.deepEqual(
    getTicketSaleAvailability({ ok: true, data: { show: null, ticketSales: null } }, websiteShow),
    { kind: "unmatched" },
  );
});

test("unrelated archived shows are not affected", () => {
  assert.deepEqual(
    getTicketSaleAvailability(success("presale", null), {
      slug: "old-show",
      name: websiteShow.name,
      date: "2026-06-20",
    }),
    { kind: "unmatched" },
  );
});

test("API failure is conservative only where the caller identifies the current show", () => {
  assert.deepEqual(
    getTicketSaleAvailability({ ok: false }, websiteShow, { useSafeFailureFallback: true }),
    { kind: "unavailable" },
  );
  assert.deepEqual(getTicketSaleAvailability({ ok: false }, websiteShow), { kind: "unmatched" });
});

test("implementation has a 60-second server fetch and no private presale URL", () => {
  const helper = readFileSync("lib/ticket-sales-status.ts", "utf8");
  const gate = readFileSync("components/TicketSaleGate.tsx", "utf8");

  assert.equal(TICKET_SALES_STATUS_ENDPOINT, "https://stageflow.cumberlandmountainmusic.com/api/public/ticket-sales-status");
  assert.equal(TICKET_SALES_STATUS_REVALIDATE_SECONDS, 60);
  assert.doesNotMatch(`${helper}\n${gate}`, /private.{0,20}(url|link)|presale.{0,20}(url|link)/i);
  assert.match(gate, /Early Access Presale/);
  assert.match(`${helper}\n${gate}`, /Available now to CMMS mailing-list subscribers/);
  assert.match(gate, /Join the Mailing List/);
  assert.match(gate, /href="\/mailing-list"/);
  assert.match(gate, /Tickets Coming Soon/);
  assert.match(gate, /inline-flex min-h-12 items-center justify-center rounded-full/);
  assert.match(gate, /getPresaleTimingText/);
  assert.doesNotMatch(gate, /max-w-xl|rounded-lg|px-5 py-4/);
  assert.match(gate, /Public sales open/);
});

test("homepage schedule-row presale CTA uses the shared compact Presale link", () => {
  const homepage = readFileSync("app/page.tsx", "utf8");
  const gate = readFileSync("components/TicketSaleGate.tsx", "utf8");

  assert.match(homepage, /useSafeFailureFallback presaleHref="\/presale">\s*<a/);
  assert.match(
    homepage,
    /useSafeFailureFallback=\{isNextShow\} presaleHref="\/presale" compact/,
  );
  assert.match(homepage, /useSafeFailureFallback hideWhenClosed className="mt-6"/);
  assert.match(
    gate,
    /if \(compact\)[\s\S]*if \(showsPresalePromotion && presaleHref\)[\s\S]*<Link href=\{presaleHref\}/,
  );
  assert.match(gate, /const compactClassName = `inline-flex max-w-full items-center rounded-full/);
  assert.match(gate, /max-w-full items-center rounded-full/);
  assert.match(homepage, /flex flex-wrap items-center gap-3/);
});

test("scheduled and active presale schedule-row CTAs link to Presale without exposing private URLs", () => {
  const homepage = readFileSync("app/page.tsx", "utf8");
  const gate = readFileSync("components/TicketSaleGate.tsx", "utf8");

  assert.equal(
    shouldPromotePresale(
      {
        kind: "not_on_sale",
        presaleStartsAt: "2026-09-01T04:00:00.000Z",
        publicSaleStartsAt: "2026-09-08T04:00:00.000Z",
      },
      new Date("2026-08-24T12:00:00.000Z"),
    ),
    true,
  );
  assert.equal(
    shouldPromotePresale({
      kind: "presale",
      presaleStartsAt: "2026-09-01T04:00:00.000Z",
      publicSaleStartsAt: "2026-09-08T04:00:00.000Z",
    }),
    true,
  );
  assert.match(homepage, /presaleHref="\/presale" compact/);
  assert.match(gate, /<Link href=\{presaleHref\} className=\{compactClassName\}>/);
  assert.doesNotMatch(`${homepage}\n${gate}`, /private.{0,20}(url|href)|presale.{0,20}(ticketUrl|private)/i);
});

test("homepage schedule row keeps public ticket and View Details behavior", () => {
  const homepage = readFileSync("app/page.tsx", "utf8");

  assert.match(homepage, /href=\{show\.ticketUrl\}/);
  assert.match(homepage, /Buy Advance Tickets/);
  assert.match(homepage, /href=\{show\.detailsUrl\}[\s\S]*View Details/);
});

test("existing public ticket URLs remain unchanged in source data", () => {
  const showData = readFileSync("app/show-dates/showData.ts", "utf8");
  assert.match(showData, /https:\/\/square\.link\/u\/mzWHWprw/);
  assert.match(showData, /https:\/\/pinnaclestudiotn\.com\/event\/6394948\/748518307/);
});
