import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatPublicSaleStart,
  getTicketSaleAvailability,
  TICKET_SALES_STATUS_ENDPOINT,
  TICKET_SALES_STATUS_REVALIDATE_SECONDS,
} from "../lib/ticket-sales-status.ts";

const websiteShow = {
  slug: "cmms100326",
  name: "Cumberland Mountain Music Show",
  date: "2026-10-03",
};

function success(status: "public" | "presale" | "not_on_sale", publicSaleStartsAt: string | null) {
  return {
    ok: true as const,
    data: {
      show: websiteShow,
      ticketSales: { status, presaleStartsAt: null, publicSaleStartsAt },
    },
  };
}

test("public status keeps the existing public ticket behavior", () => {
  assert.deepEqual(getTicketSaleAvailability(success("public", null), websiteShow), { kind: "public" });
});

test("presale hides purchasing and carries only public-sale timing", () => {
  assert.deepEqual(
    getTicketSaleAvailability(success("presale", "2026-08-27T20:00:00.000Z"), websiteShow),
    { kind: "presale", publicSaleStartsAt: "2026-08-27T20:00:00.000Z" },
  );
  assert.deepEqual(getTicketSaleAvailability(success("presale", null), websiteShow), {
    kind: "presale",
    publicSaleStartsAt: null,
  });
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
    publicSaleStartsAt: null,
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
  assert.match(gate, /Available now to CMMS mailing-list subscribers/);
  assert.match(gate, /Join the Mailing List/);
  assert.match(gate, /href="\/mailing-list"/);
  assert.match(gate, /Tickets Coming Soon/);
  assert.match(gate, /inline-flex min-h-12 max-w-full flex-col/);
  assert.doesNotMatch(gate, /max-w-xl|rounded-lg|px-5 py-4/);
  assert.match(gate, /Public sales open/);
});

test("existing public ticket URLs remain unchanged in source data", () => {
  const showData = readFileSync("app/show-dates/showData.ts", "utf8");
  assert.match(showData, /https:\/\/square\.link\/u\/mzWHWprw/);
  assert.match(showData, /https:\/\/pinnaclestudiotn\.com\/event\/6394948\/748518307/);
});
