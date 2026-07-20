import assert from "node:assert/strict";
import {
  buildCycloneWatch,
  isTropicalCycloneEvent,
} from "./cyclone-watch";
import type { GdacsSnapshot } from "./integrations/gdacs";

assert.equal(
  isTropicalCycloneEvent({
    id: "1",
    name: "Tropical Cyclone Mocha",
    eventType: "TC",
    alertLevel: "Orange",
    country: "Myanmar",
    latitude: 16,
    longitude: 92,
    fromDate: null,
    toDate: null,
    reportUrl: null,
  }),
  true,
);

assert.equal(
  isTropicalCycloneEvent({
    id: "2",
    name: "Flood event",
    eventType: "FL",
    alertLevel: "Green",
    country: "Sri Lanka",
    latitude: 7,
    longitude: 80,
    fromDate: null,
    toDate: null,
    reportUrl: null,
  }),
  false,
);

const empty: GdacsSnapshot = {
  sourceId: "gdacs",
  sourceName: "GDACS",
  events: [],
  asOf: new Date().toISOString(),
  tier: "stale",
  error: null,
  provenancePath: "/sources/gdacs",
};
const quiet = buildCycloneWatch(empty);
assert.equal(quiet.active, false);
assert.equal(quiet.events.length, 0);

const active = buildCycloneWatch({
  ...empty,
  events: [
    {
      id: "tc-1",
      name: "TC Example",
      eventType: "TC",
      alertLevel: "Red",
      country: null,
      latitude: 10,
      longitude: 85,
      fromDate: null,
      toDate: null,
      reportUrl: "https://example.com",
    },
  ],
});
assert.equal(active.active, true);
assert.equal(active.events.length, 1);

console.log("cyclone-watch test passed");
