import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MAILING_LIST_ENDPOINT,
  buildMailingListPayload,
  isValidEmailAddress,
  normalizeMailingListResult,
  trimMailingListValues,
} from "../lib/mailing-list.ts";

const pageSource = readFileSync("app/mailing-list/page.tsx", "utf8");
const formSource = readFileSync("app/mailing-list/mailing-list-form.tsx", "utf8");

test("mailing list page renders the inline form instead of the Pinnacle signup link", () => {
  assert.match(pageSource, /<MailingListForm \/>/);
  assert.match(formSource, /First Name/);
  assert.match(formSource, /Last Name/);
  assert.match(formSource, /Email Address/);
  assert.match(formSource, /Join the Mailing List/);
  assert.match(pageSource, /Occasional show announcements, ticket reminders, and CMMS news/);
  assert.doesNotMatch(pageSource, /pinnaclestudiotn\.com\/cmms-mailing-list/);
  assert.doesNotMatch(pageSource, /Pinnacle Recording\s+Studio page/);
});

test("mailing list form keeps mobile-friendly stacked fields with desktop two-column names", () => {
  assert.match(formSource, /grid gap-4 sm:grid-cols-2/);
  assert.match(formSource, /Email Address[\s\S]*name="email"/);
});

test("mailing list validation trims values and requires a basic email shape", () => {
  assert.deepEqual(
    trimMailingListValues({ firstName: " Pat ", lastName: " Smith ", email: " pat@example.com ", website: " " }),
    { firstName: "Pat", lastName: "Smith", email: "pat@example.com", website: "" },
  );
  assert.equal(isValidEmailAddress("pat@example.com"), true);
  assert.equal(isValidEmailAddress("pat"), false);
  assert.equal(isValidEmailAddress(""), false);
});

test("mailing list payload includes the honeypot and explicit resubscribe flag only for rejoin", () => {
  const values = { firstName: " Pat ", lastName: " Smith ", email: " pat@example.com ", website: "" };

  assert.deepEqual(buildMailingListPayload(values), {
    firstName: "Pat",
    lastName: "Smith",
    email: "pat@example.com",
    website: "",
  });
  assert.deepEqual(buildMailingListPayload(values, true), {
    firstName: "Pat",
    lastName: "Smith",
    email: "pat@example.com",
    website: "",
    resubscribe: true,
  });
});

test("mailing list API statuses normalize new, existing, rejoin, and failure responses", () => {
  assert.equal(MAILING_LIST_ENDPOINT, "https://stageflow.cumberlandmountainmusic.com/api/public/mailing-list/subscribe");
  assert.deepEqual(normalizeMailingListResult({ success: true }), { status: "subscribed" });
  assert.deepEqual(normalizeMailingListResult({ success: true }, true), { status: "resubscribed" });
  assert.deepEqual(normalizeMailingListResult({ code: "already_subscribed" }), { status: "already_subscribed" });
  assert.deepEqual(normalizeMailingListResult({ error: "already_subscribed" }), { status: "already_subscribed" });
  assert.deepEqual(normalizeMailingListResult({ status: "resubscribe_required" }), { status: "resubscribe_required" });
  assert.deepEqual(normalizeMailingListResult({ error: "unavailable" }), { status: "error" });
});

test("mailing list form exposes success, already-subscribed, rejoin, failure, and duplicate-submit protections", () => {
  assert.match(formSource, /You're on the list!/);
  assert.match(formSource, /You're already on the list!/);
  assert.match(formSource, /Looks like you&apos;ve been on our mailing list before\./);
  assert.match(formSource, /Welcome back!/);
  assert.match(formSource, /We couldn't add you to the mailing list right now/);
  assert.match(formSource, /if \(isSubmitting\) return/);
  assert.match(formSource, /disabled=\{isSubmitting\}/);
});
