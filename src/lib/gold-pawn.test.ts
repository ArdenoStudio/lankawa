import assert from "node:assert/strict";
import {
  KARAT_22_FACTOR,
  PAWN_GRAMS,
  TROY_OZ_GRAMS,
  deriveGoldPawnFromTroyOz,
  roundGoldLkr,
} from "./gold-pawn";

assert.equal(deriveGoldPawnFromTroyOz(0), null);
assert.equal(deriveGoldPawnFromTroyOz(-1), null);
assert.equal(deriveGoldPawnFromTroyOz(Number.NaN), null);

// Example: CBSL-style troy oz → 24K/22K pawn (research formula).
const troyOz = 1_235_000;
const breakdown = deriveGoldPawnFromTroyOz(troyOz);
assert.ok(breakdown);

const expected24kGram = troyOz / TROY_OZ_GRAMS;
const expected22kGram = expected24kGram * KARAT_22_FACTOR;
assert.ok(Math.abs(breakdown.pure24kPerGramLkr - expected24kGram) < 1e-6);
assert.ok(Math.abs(breakdown.karat22PerGramLkr - expected22kGram) < 1e-6);
assert.ok(
  Math.abs(breakdown.karat22PerPawnLkr - expected22kGram * PAWN_GRAMS) < 1e-6,
);
assert.match(breakdown.note, /CBSL/);

assert.equal(roundGoldLkr(317_701), 317_700);
assert.equal(roundGoldLkr(317_705), 317_710);

console.log("gold-pawn.test.ts: ok");
