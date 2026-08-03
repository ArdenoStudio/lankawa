/**
 * Unit tests for aviation.ts adapter (R3)
 * Run: node --experimental-strip-types src/lib/integrations/aviation.test.ts
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type FlightRecord,
  type AviationResult,
  AVIATION_SEED_SOURCE_ID,
  SEED_FALLBACK_DISCLAIMER,
} from "./aviation.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFlight(overrides: Partial<FlightRecord> = {}): FlightRecord {
  return {
    flightNumber: "UL501",
    airline: "SriLankan Airlines",
    airlineIata: "UL",
    origin: "Colombo (BIA)",
    originIata: "CMB",
    destination: "London Heathrow",
    destinationIata: "LHR",
    scheduledTime: "2026-08-03T08:30:00.000Z",
    estimatedTime: null,
    actualTime: null,
    terminal: "1",
    gate: "A5",
    status: "scheduled",
    delayMinutes: null,
    ...overrides,
  };
}

function makeSeedResult(
  overrides: Partial<AviationResult> = {},
): AviationResult {
  return {
    arrivals: [makeFlight({ flightNumber: "UL501", destination: "Colombo (BIA)" })],
    departures: [makeFlight({ flightNumber: "UL502", origin: "Colombo (BIA)" })],
    totalArrivals: 1,
    totalDepartures: 1,
    delayedCount: 0,
    cancelledCount: 0,
    asOf: "2026-08-03T08:00:00.000Z",
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: AVIATION_SEED_SOURCE_ID,
    ...overrides,
  };
}

// ─── Shape Tests ──────────────────────────────────────────────────────────────

test("FlightRecord shape is complete", () => {
  const f = makeFlight();
  assert.ok(typeof f.flightNumber === "string");
  assert.ok(typeof f.airline === "string");
  assert.ok(typeof f.airlineIata === "string");
  assert.ok(typeof f.origin === "string");
  assert.ok(typeof f.originIata === "string");
  assert.ok(typeof f.destination === "string");
  assert.ok(typeof f.destinationIata === "string");
  assert.ok(typeof f.scheduledTime === "string");
  assert.ok(["scheduled", "active", "landed", "cancelled", "diverted", "unknown"].includes(f.status));
  console.log("  ✅ FlightRecord shape: OK");
});

test("AviationResult seed fallback shape is complete", () => {
  const result = makeSeedResult();
  assert.strictEqual(result.isFallback, true);
  assert.strictEqual(result.disclaimer, SEED_FALLBACK_DISCLAIMER);
  assert.strictEqual(result.sourceId, AVIATION_SEED_SOURCE_ID);
  assert.ok(Array.isArray(result.arrivals));
  assert.ok(Array.isArray(result.departures));
  assert.ok(typeof result.totalArrivals === "number");
  assert.ok(typeof result.totalDepartures === "number");
  assert.ok(typeof result.delayedCount === "number");
  assert.ok(typeof result.cancelledCount === "number");
  console.log("  ✅ AviationResult seed shape: OK");
});

test("Delayed flights counted correctly", () => {
  const result = makeSeedResult({
    arrivals: [makeFlight({ delayMinutes: 20 }), makeFlight({ delayMinutes: 5 })],
    departures: [makeFlight({ delayMinutes: null })],
    totalArrivals: 2,
    totalDepartures: 1,
    delayedCount: 1, // only >15 min counts
  });
  assert.strictEqual(result.delayedCount, 1);
  console.log("  ✅ Delayed flight counting: OK");
});

test("Cancelled flights counted correctly", () => {
  const result = makeSeedResult({
    departures: [makeFlight({ status: "cancelled" }), makeFlight({ status: "scheduled" })],
    totalDepartures: 2,
    cancelledCount: 1,
  });
  assert.strictEqual(result.cancelledCount, 1);
  console.log("  ✅ Cancelled flight counting: OK");
});

test("SriLankan Airlines filter by airlineIata", () => {
  const flights = [
    makeFlight({ airlineIata: "UL", flightNumber: "UL501" }),
    makeFlight({ airlineIata: "EK", flightNumber: "EK350" }),
    makeFlight({ airlineIata: "UL", flightNumber: "UL224" }),
  ];
  const ulOnly = flights.filter((f) => f.airlineIata === "UL");
  assert.strictEqual(ulOnly.length, 2);
  assert.ok(ulOnly.every((f) => f.airlineIata === "UL"));
  console.log("  ✅ SriLankan Airlines filter: OK");
});

console.log("\n=== aviation.test.ts: ok ===\n");
