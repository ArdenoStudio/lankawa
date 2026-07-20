import assert from "node:assert/strict";
import {
  districtSlugsForDsQuery,
  matchDsDivisions,
} from "./ds-divisions";

assert.equal(matchDsDivisions("").length, 0);
assert.ok(matchDsDivisions("Homagama").some((d) => d.slug === "homagama"));
assert.deepEqual(districtSlugsForDsQuery("Homagama"), ["colombo"]);
assert.ok(districtSlugsForDsQuery("யாழ்ப்பாணம்").includes("jaffna"));
assert.equal(districtSlugsForDsQuery("zzzz-none").length, 0);

console.log("ds-divisions.test.ts: ok");
