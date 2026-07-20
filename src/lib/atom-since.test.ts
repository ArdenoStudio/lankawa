import assert from "node:assert/strict";
import { filterHeadlinesSince, parseSinceParam } from "./atom-since";

const now = Date.parse("2026-07-20T12:00:00.000Z");

assert.equal(parseSinceParam(null, now), null);
assert.equal(
  parseSinceParam("2026-07-20T06:00:00.000Z", now),
  Date.parse("2026-07-20T06:00:00.000Z"),
);
assert.equal(parseSinceParam("PT6H", now), now - 6 * 60 * 60 * 1000);
assert.equal(parseSinceParam("P1D", now), now - 24 * 60 * 60 * 1000);
assert.equal(parseSinceParam("not-a-date", now), null);

const headlines = [
  { publishedAt: "2026-07-20T10:00:00.000Z", id: "a" },
  { publishedAt: "2026-07-19T10:00:00.000Z", id: "b" },
];
assert.deepEqual(
  filterHeadlinesSince(headlines, parseSinceParam("PT6H", now)).map(
    (item) => item.id,
  ),
  ["a"],
);

console.log("atom since test passed");
