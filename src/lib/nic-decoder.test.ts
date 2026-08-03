/**
 * Unit tests for nic-decoder.ts (R4)
 * Run: node --experimental-strip-types src/lib/nic-decoder.test.ts
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeNIC, isValidNIC, formatNICSummary } from "./nic-decoder.ts";

// ─── Legacy NIC Tests ─────────────────────────────────────────────────────────

test("Legacy male NIC — voter (V suffix)", () => {
  // 851234567V → born in 1985, day 123 → male, voter eligible
  const result = decodeNIC("851234567V");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.format, "legacy");
  assert.strictEqual(result.birthYear, 1985);
  assert.strictEqual(result.gender, "male");
  assert.strictEqual(result.votingEligibility, "eligible");
  assert.ok(result.birthDate?.startsWith("1985-"));
  console.log("  ✅ Legacy male voter NIC: OK", result.birthDate);
});

test("Legacy female NIC — voter (V suffix, day > 500)", () => {
  // 856234567V → 685 - 500 = 185th day → female
  const result = decodeNIC("856234567V");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.format, "legacy");
  assert.strictEqual(result.gender, "female");
  assert.strictEqual(result.birthYear, 1985);
  assert.strictEqual(result.votingEligibility, "eligible");
  console.log("  ✅ Legacy female voter NIC: OK", result.birthDate);
});

test("Legacy NIC — non-voter (X suffix)", () => {
  const result = decodeNIC("921234567X");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.votingEligibility, "non-eligible");
  console.log("  ✅ Legacy non-voter NIC: OK");
});

test("Legacy NIC — case insensitive (lowercase v)", () => {
  const result = decodeNIC("851234567v");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.votingEligibility, "eligible");
  console.log("  ✅ Legacy NIC case-insensitive: OK");
});

test("Legacy NIC — invalid pattern rejected", () => {
  const result = decodeNIC("8512345ABC");
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length > 0);
  console.log("  ✅ Legacy invalid NIC rejected: OK");
});

// ─── New 12-digit NIC Tests ───────────────────────────────────────────────────

test("New 12-digit male NIC", () => {
  // 199512301234 → born 1995, day 123 → male
  const result = decodeNIC("199512301234");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.format, "new");
  assert.strictEqual(result.birthYear, 1995);
  assert.strictEqual(result.gender, "male");
  assert.strictEqual(result.votingEligibility, null); // new format has no V/X
  assert.ok(result.birthDate?.startsWith("1995-"));
  console.log("  ✅ New 12-digit male NIC: OK", result.birthDate);
});

test("New 12-digit female NIC (day > 500)", () => {
  // 200062301234 → born 2000, day 623 - 500 = 123 → female
  const result = decodeNIC("200062301234");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.gender, "female");
  assert.strictEqual(result.birthYear, 2000);
  console.log("  ✅ New 12-digit female NIC: OK", result.birthDate);
});

test("New 12-digit NIC — invalid (letters)", () => {
  const result = decodeNIC("19951230ABCD");
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length > 0);
  console.log("  ✅ New NIC invalid format rejected: OK");
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

test("Empty string returns invalid", () => {
  const result = decodeNIC("");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.format, "invalid");
  console.log("  ✅ Empty NIC: OK");
});

test("Random string returns invalid", () => {
  const result = decodeNIC("notanic");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.format, "invalid");
  console.log("  ✅ Random string NIC: OK");
});

test("isValidNIC helper works", () => {
  assert.strictEqual(isValidNIC("851234567V"), true);
  assert.strictEqual(isValidNIC("badvalue"), false);
  console.log("  ✅ isValidNIC helper: OK");
});

test("formatNICSummary returns readable string", () => {
  const summary = formatNICSummary("851234567V");
  assert.ok(summary.includes("Legacy"));
  assert.ok(summary.includes("1985"));
  assert.ok(summary.includes("male"));
  console.log("  ✅ formatNICSummary:", summary);
});

test("Age is computed (positive integer)", () => {
  const result = decodeNIC("851234567V");
  assert.ok(result.ageYears !== null && result.ageYears > 30);
  console.log("  ✅ Age computed:", result.ageYears, "years");
});

console.log("\n=== nic-decoder.test.ts: ok ===\n");
