import assert from "node:assert/strict";
import {
  getCensus2024Snapshot,
  getCensusAgeForDistrict,
  getCensusAgeStructure,
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

// --- age structure ----------------------------------------------------------

const age = getCensusAgeStructure();
assert.equal(age.isSeed, false);
assert.equal(age.districts.length, 25);
assert.equal(age.national.population, 21_781_800);

// Shares must sum to ~100 per region (one-decimal tolerance).
const nationalSum =
  age.national.childrenSharePct! +
  age.national.workingAgeSharePct! +
  age.national.ageingSharePct!;
assert.ok(Math.abs(nationalSum - 100) <= 0.2, `national shares sum ${nationalSum}`);

// Dependency ratio consistency: (children + seniors) / working age * 100.
const expectedDep =
  Math.round(
    ((age.national.childrenSharePct! + age.national.ageingSharePct!) /
      age.national.workingAgeSharePct!) *
      1000,
  ) / 10;
assert.ok(
  Math.abs(age.national.dependencyRatio! - expectedDep) <= 0.2,
  `dependency ratio ${age.national.dependencyRatio} vs derived ${expectedDep}`,
);

const colomboAge = getCensusAgeForDistrict("colombo");
assert.ok(colomboAge);
assert.equal(colomboAge.population, 2_375_415, "age table population matches Table 3.2");

const jaffnaAge = getCensusAgeForDistrict("jaffna");
assert.ok(jaffnaAge);
assert.ok(jaffnaAge.ageingSharePct! > age.national.ageingSharePct!, "Jaffna more aged than national");

assert.equal(getCensusAgeForDistrict("nope"), undefined);

console.log("census living-conditions + age-structure test passed");
