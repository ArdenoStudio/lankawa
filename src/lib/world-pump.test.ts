import assert from "node:assert/strict";
import { deriveLiveWorldPump } from "./world-pump";
import type { OctaneWorldComparison } from "./integrations/octane";

const baseWorld: OctaneWorldComparison = {
  fuel_type: "petrol_95",
  fuel_category: "gasoline",
  sri_lanka: { price_lkr: 495, price_usd: 1.476, recorded_at: "2026-06-30" },
  world_average_usd: 1.673,
  delta_vs_world_pct: -11.8,
  neighbors: [
    { country: "Bangladesh", price_usd: 1.18, recorded_at: "2026-07-12" },
    { country: "India", price_usd: 1.14, recorded_at: "2026-07-12" },
    { country: "Nepal", price_usd: 1.3, recorded_at: "2026-07-12" },
  ],
  fx_rate_used: 335.4113,
};

// Live payload maps to sorted peers; SL (1.48) is priciest in this fixture, so last.
const live = deriveLiveWorldPump(baseWorld, 1.48);
assert.ok(live, "live payload should map");
assert.equal(live.peers.length, 4);
assert.equal(live.peers[3]?.id, "sri-lanka");
assert.equal(live.peers[3]?.petrolUsdPerLitre, 1.48);
assert.equal(live.peers.every((p, i, a) => i === 0 || a[i - 1]!.petrolUsdPerLitre <= p.petrolUsdPerLitre), true);
assert.equal(live.peers.every((p) => p.live === true), true);
assert.equal(live.asOf, "2026-07-12");
assert.equal(live.worldAverageUsd, 1.673);
assert.equal(live.deltaVsWorldPct, -11.8);

// No SL pulse row -> peers still map without the Sri Lanka entry.
const noSl = deriveLiveWorldPump(baseWorld, null);
assert.ok(noSl);
assert.equal(noSl.peers.length, 3);
assert.equal(noSl.peers.some((p) => p.isSriLanka), false);

// Unusable payloads -> null so the caller falls back to the curated seed.
assert.equal(deriveLiveWorldPump(null, 1.48), null);
assert.equal(deriveLiveWorldPump({ ...baseWorld, neighbors: [] }, 1.48), null);
assert.equal(
  deriveLiveWorldPump(
    {
      ...baseWorld,
      neighbors: [{ country: "", price_usd: Number.NaN, recorded_at: "x" }],
    },
    1.48,
  ),
  null,
);
assert.equal(
  deriveLiveWorldPump(
    { ...baseWorld, world_average_usd: Number.NaN, delta_vs_world_pct: Number.NaN },
    1.48,
  )?.worldAverageUsd,
  null,
);

console.log("world-pump test passed");
