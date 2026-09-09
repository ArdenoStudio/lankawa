import assert from "node:assert/strict";
import {
  getCensus2024Snapshot,
  getCensusFootnoteForDistrict,
  getCensusLivingConditions,
  getCensusLivingForDistrict,
} from "./census";

const census = getCensus2024Snapshot();
assert.equal(census.isSeed, false);
assert.equal(census.nationalPopulation, 21_781_800);
assert.equal(census.districts.length, 25);

const colombo = getCensusFootnoteForDistrict("colombo");
assert.ok(colombo);
assert.equal(colombo.population2024, 2_375_415);

const living = getCensusLivingConditions();
assert.equal(living.isSeed, false);
assert.equal(living.districts.length, 25);
assert.equal(living.national.households, 6_111_315);

// National shares must sit within plausible bounds derived from exact counts.
for (const [key, value] of Object.entries(living.national)) {
  if (key === "households") continue;
  const pct = value as number;
  assert.ok(pct > 0 && pct <= 100, `national ${key} out of range: ${pct}`);
}

// Every district row present with sane shares; district shares average near
// the national value weighted by households is not asserted exactly, but each
// district must have at most one decimal of rounding.
for (const row of living.districts) {
  for (const key of [
    "cleanCookingPct",
    "pipeBorneWaterPct",
    "improvedSanitationPct",
    "gridElectricityPct",
  ] as const) {
    const value = row[key];
    if (value != null) {
      assert.ok(value >= 0 && value <= 100, `${row.slug}.${key} out of range`);
      assert.equal(
        Math.round(value * 10),
        value * 10,
        `${row.slug}.${key} not one-decimal`,
      );
    }
  }
}

// Known anchors from the upstream tables (one-decimal rounding tolerance).
const colomboLiving = getCensusLivingForDistrict("colombo");
assert.ok(colomboLiving);
assert.ok(Math.abs(colomboLiving.cleanCookingPct! - 88.4) < 0.15);
assert.ok(Math.abs(colomboLiving.pipeBorneWaterPct! - 86.6) < 0.15);

const nuwaraEliya = getCensusLivingForDistrict("nuwara-eliya");
assert.ok(nuwaraEliya);
assert.ok(Math.abs(nuwaraEliya.cleanCookingPct! - 27.2) < 0.15);

assert.equal(getCensusLivingForDistrict("nope"), undefined);

console.log("census living-conditions test passed");
