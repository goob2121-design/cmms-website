import assert from "node:assert/strict";
import test from "node:test";
import {
  formatNewYorkShowDate,
  getCalendarDaysUntil,
  getInclusiveCountdownLabel,
  getNewYorkDateValue,
  isCalendarDateOnOrAfterToday,
} from "../lib/countdown";

test("July 26, 2026 to August 15, 2026 is 20 calendar days", () => {
  const now = new Date("2026-07-26T16:00:00Z");

  assert.equal(getCalendarDaysUntil("2026-08-15", now), 20);
  assert.equal(getInclusiveCountdownLabel("2026-08-15", now), "20 Days Away");
});

test("August 14, 2026 to August 15, 2026 is tomorrow", () => {
  const now = new Date("2026-08-14T16:00:00Z");

  assert.equal(getCalendarDaysUntil("2026-08-15", now), 1);
  assert.equal(getInclusiveCountdownLabel("2026-08-15", now), "Tomorrow");
});

test("August 15, 2026 show date renders Today on August 15", () => {
  const now = new Date("2026-08-15T16:00:00Z");

  assert.equal(getCalendarDaysUntil("2026-08-15", now), 0);
  assert.equal(getInclusiveCountdownLabel("2026-08-15", now), "Today");
});

test("New York calendar dates do not flip early around UTC midnight", () => {
  const lateAugust14InNewYork = new Date("2026-08-15T03:30:00Z");

  assert.equal(getNewYorkDateValue(lateAugust14InNewYork), "2026-08-14");
  assert.equal(getInclusiveCountdownLabel("2026-08-15", lateAugust14InNewYork), "Tomorrow");
});

test("date-only show dates format as their intended New York calendar date", () => {
  assert.equal(formatNewYorkShowDate("2026-08-15"), "August 15, 2026");
  assert.equal(formatNewYorkShowDate("2026-08-15T00:00:00"), "August 15, 2026");
});

test("future-show selection keeps today and future shows but excludes past shows", () => {
  const now = new Date("2026-08-15T16:00:00Z");

  assert.equal(isCalendarDateOnOrAfterToday("2026-08-14", now), false);
  assert.equal(isCalendarDateOnOrAfterToday("2026-08-15", now), true);
  assert.equal(isCalendarDateOnOrAfterToday("2026-08-16", now), true);
});