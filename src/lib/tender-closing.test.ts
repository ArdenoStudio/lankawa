import assert from "node:assert/strict";
import {
  daysUntilTenderClose,
  filterTendersClosingWithin,
  summarizeTendersClosingSoon,
} from "./tender-closing";
import type { TenderNotice } from "./types";

const now = new Date("2026-07-20T12:00:00.000Z");

assert.equal(daysUntilTenderClose("2026-07-22", now), 2);
assert.equal(daysUntilTenderClose("2026-07-20", now), 0);
assert.equal(daysUntilTenderClose("2026-07-18", now), -2);

const notices: TenderNotice[] = [
  {
    id: "a",
    title: "Soon",
    reference: "R1",
    ministry: "finance",
    province: "Western",
    district: "colombo",
    category: "goods",
    estimatedValueLkr: 1,
    closingDate: "2026-07-22",
    status: "closing_soon",
  },
  {
    id: "b",
    title: "Later",
    reference: "R2",
    ministry: "finance",
    province: "Western",
    district: "colombo",
    category: "goods",
    estimatedValueLkr: 1,
    closingDate: "2026-08-20",
    status: "open",
  },
  {
    id: "c",
    title: "Closed",
    reference: "R3",
    ministry: "finance",
    province: "Western",
    district: "colombo",
    category: "goods",
    estimatedValueLkr: 1,
    closingDate: "2026-07-10",
    status: "closed",
  },
];

assert.deepEqual(
  filterTendersClosingWithin(notices, 7, now).map((item) => item.id),
  ["a"],
);

const summary = summarizeTendersClosingSoon(notices, 7, now);
assert.equal(summary.count, 1);
assert.ok(summary.detail?.includes("2026-07-22"));

console.log("tender closing test passed");
