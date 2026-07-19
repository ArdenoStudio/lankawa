import assert from "node:assert/strict";
import { computeFreshnessTier } from "./freshness";

const CADENCE_MINUTES = 60;
const NOW = Date.parse("2026-07-19T12:00:00.000Z");

function observedMinutesAgo(minutes: number): string {
  return new Date(NOW - minutes * 60_000).toISOString();
}

assert.equal(computeFreshnessTier(null, CADENCE_MINUTES, NOW), "unknown");
assert.equal(
  computeFreshnessTier("not-a-date", CADENCE_MINUTES, NOW),
  "unknown",
);

assert.equal(
  computeFreshnessTier(observedMinutesAgo(0), CADENCE_MINUTES, NOW),
  "fresh",
);
assert.equal(
  computeFreshnessTier(observedMinutesAgo(CADENCE_MINUTES), CADENCE_MINUTES, NOW),
  "fresh",
);

assert.equal(
  computeFreshnessTier(
    observedMinutesAgo(CADENCE_MINUTES + 1),
    CADENCE_MINUTES,
    NOW,
  ),
  "stale",
);
assert.equal(
  computeFreshnessTier(
    observedMinutesAgo(CADENCE_MINUTES * 3),
    CADENCE_MINUTES,
    NOW,
  ),
  "stale",
);

assert.equal(
  computeFreshnessTier(
    observedMinutesAgo(CADENCE_MINUTES * 3 + 1),
    CADENCE_MINUTES,
    NOW,
  ),
  "down",
);

console.log("freshness walk test passed");
