import assert from "node:assert/strict";
import {
  filterVehicleModels,
  getVehicleModelDeepDive,
  uniqueVehicleMakes,
} from "./vehicle-models";

const snapshot = getVehicleModelDeepDive();
assert.equal(snapshot.isSeed, true);
assert.ok(snapshot.models.length >= 5);

const colombo = filterVehicleModels({ districtSlug: "colombo" });
assert.ok(colombo.every((row) => row.districtSlug === "colombo"));
assert.ok(colombo.length >= 2);

const suzuki = filterVehicleModels({ make: "Suzuki" });
assert.ok(suzuki.every((row) => row.make === "Suzuki"));

assert.ok(uniqueVehicleMakes().includes("Toyota"));

console.log("vehicle-models.test.ts: ok");
