import assert from "node:assert/strict";
import {
  escapeSvgText,
  pickMorningOgMetrics,
  renderMorningOgSvg,
} from "./morning-og";
import type { PulseSnapshot } from "./types";

assert.equal(escapeSvgText(`a<b>&"c`), "a&lt;b&gt;&amp;&quot;c");

const snapshot = {
  generatedAt: "2026-07-20T06:00:00.000Z",
  metrics: [
    {
      id: "usd_lkr",
      label: "USD/LKR",
      value: 303.5,
      unit: "LKR",
      tier: "fresh" as const,
      sourceId: "cbsl_fx",
    },
    {
      id: "fuel_petrol_92",
      label: "Petrol 92",
      value: 311,
      unit: "LKR/L",
      tier: "fresh" as const,
      sourceId: "octane_fuel",
    },
  ],
  flood: [],
  sources: [],
} as unknown as PulseSnapshot;

const metrics = pickMorningOgMetrics(snapshot, 2);
assert.equal(metrics.length, 2);
assert.equal(metrics[0].id, "usd_lkr");

const svg = renderMorningOgSvg({
  title: "Lankawa morning",
  asOf: "As of 2026-07-20",
  metrics,
});
assert.match(svg, /<svg/);
assert.match(svg, /USD\/LKR/);
assert.match(svg, /303\.5/);

console.log("morning-og test passed");
