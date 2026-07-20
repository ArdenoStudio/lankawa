import assert from "node:assert/strict";
import { resolveDistrictSlug } from "./assistant";

assert.equal(resolveDistrictSlug("tell me about colombo"), "colombo");
assert.equal(resolveDistrictSlug("කොළඹ"), "colombo");
assert.equal(resolveDistrictSlug("random", "kandy"), "kandy");
assert.equal(resolveDistrictSlug("nuwara eliya flood"), "nuwara-eliya");
assert.equal(resolveDistrictSlug("no district here"), null);
assert.equal(resolveDistrictSlug("x", "not-a-district"), null);

console.log("assistant-district test passed");
