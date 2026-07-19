import assert from "node:assert/strict";
import { daysBetween, resolveReturnEvent } from "./analytics";

const FIRST_SEEN = "2026-07-12T08:00:00.000Z";

assert.equal(daysBetween(FIRST_SEEN, Date.parse("2026-07-12T20:00:00.000Z")), 0);
assert.equal(daysBetween(FIRST_SEEN, Date.parse("2026-07-13T09:00:00.000Z")), 1);
assert.equal(daysBetween(FIRST_SEEN, Date.parse("2026-07-19T09:00:00.000Z")), 7);

assert.equal(
  resolveReturnEvent(FIRST_SEEN, Date.parse("2026-07-12T20:00:00.000Z")),
  null,
);
assert.equal(
  resolveReturnEvent(FIRST_SEEN, Date.parse("2026-07-13T09:00:00.000Z")),
  "home_return_d1",
);
assert.equal(
  resolveReturnEvent(FIRST_SEEN, Date.parse("2026-07-19T09:00:00.000Z")),
  "home_return_d7",
);

console.log("analytics retention test passed");
