import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailsPage = readFileSync("app/show-dates/[slug]/page.tsx", "utf8");
const homepage = readFileSync("app/page.tsx", "utf8");
const showDatesPage = readFileSync("app/show-dates/page.tsx", "utf8");
const gate = readFileSync("components/TicketSaleGate.tsx", "utf8");
const ctaStart = detailsPage.indexOf('<div className="mt-6 flex flex-col');
const ctaEnd = detailsPage.indexOf("</div>", ctaStart) + 6;
const ctaArea = detailsPage.slice(ctaStart, ctaEnd);

test("Show Details presale CTA uses the shared linked Presale mode", () => {
  assert.match(ctaArea, /presaleHref="\/presale"/);
  assert.match(gate, /Early Access Presale/);
  assert.match(gate, /href=\{presaleHref\}/);
});

test("Show Details CTA removes inline presale details and keeps navigation", () => {
  assert.doesNotMatch(ctaArea, /Starts September|Available now to CMMS|Join the Mailing List/);
  assert.match(detailsPage, /Back to Show Dates/);
  assert.match(ctaArea, /flex flex-col gap-3 sm:flex-row sm:items-start/);
});

test("public and not-on-sale behavior remain safe", () => {
  assert.match(ctaArea, /href=\{show\.ticket_url\}/);
  assert.match(ctaArea, /Buy Advance Tickets/);
  assert.match(detailsPage, /getSoldOutMessage\(show\.sold_out_message\)/);
  assert.match(gate, /Tickets Coming Soon/);
  assert.doesNotMatch(`${detailsPage}\n${gate}`, /private.{0,20}(ticket|url|href)/i);
});

test("homepage and featured Show Dates retain the shared Presale link mode", () => {
  assert.match(homepage, /useSafeFailureFallback presaleHref="\/presale"/);
  assert.match(showDatesPage, /useSafeFailureFallback presaleHref="\/presale"/);
});
