import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/show-dates/page.tsx", "utf8");
const gate = readFileSync("components/TicketSaleGate.tsx", "utf8");
const featuredStart = page.indexOf("{featuredEvent ? (");
const featuredEnd = page.indexOf("{featuredSponsors.length", featuredStart);
const featuredCard = page.slice(featuredStart, featuredEnd);

test("featured presale CTA links to the dedicated Presale page", () => {
  assert.match(featuredCard, /presaleHref="\/presale"/);
  assert.match(gate, /href=\{presaleHref\}/);
  assert.match(gate, /Early Access Presale/);
});

test("featured card keeps Show Details and removes inline presale explanation", () => {
  assert.match(featuredCard, /Show Details/);
  assert.doesNotMatch(featuredCard, /Starts September|Available now to CMMS|Join the Mailing List/);
});

test("public ticket CTA keeps the existing website ticket URL", () => {
  assert.match(featuredCard, /href=\{featuredEvent\.ticketUrl\}/);
  assert.match(featuredCard, /Buy Advance Tickets/);
});

test("closed states remain compact, safe, and mobile friendly", () => {
  assert.match(gate, /Tickets Coming Soon/);
  assert.doesNotMatch(`${page}\n${gate}`, /private.{0,20}(ticket|url|href)/i);
  assert.match(featuredCard, /flex flex-col gap-3 sm:flex-row sm:items-start/);
  assert.match(gate, /min-h-12 max-w-full/);
});
