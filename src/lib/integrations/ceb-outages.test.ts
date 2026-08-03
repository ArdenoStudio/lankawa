import assert from "node:assert/strict";
import {
  getLiveOutages,
  getLoadSheddingSchedule,
  SEED_FALLBACK_DISCLAIMER,
  CEB_OUTAGES_API_SOURCE_ID,
  CEB_OUTAGES_SEED_SOURCE_ID,
} from "./ceb-outages.ts";

async function runTests() {
  // Test 1: Verify constants
  assert.equal(SEED_FALLBACK_DISCLAIMER, "Seed fallback — live API unavailable");
  assert.equal(CEB_OUTAGES_API_SOURCE_ID, "ceb_outages_api");
  assert.equal(CEB_OUTAGES_SEED_SOURCE_ID, "ceb_outages_seed");

  // Test 2: getLiveOutages contract verification
  const liveOutagesResult = await getLiveOutages();
  assert.ok(Array.isArray(liveOutagesResult.outages), "Expected outages array");
  assert.ok(typeof liveOutagesResult.totalAffectedAreas === "number");
  assert.ok(typeof liveOutagesResult.totalCustomersAffected === "number");
  assert.ok(typeof liveOutagesResult.asOf === "string");
  assert.ok(
    liveOutagesResult.sourceId === CEB_OUTAGES_API_SOURCE_ID ||
      liveOutagesResult.sourceId === CEB_OUTAGES_SEED_SOURCE_ID,
    "Expected valid sourceId",
  );

  if (liveOutagesResult.isFallback) {
    assert.equal(
      liveOutagesResult.disclaimer,
      "Seed fallback — live API unavailable",
      "Expected exact fallback disclaimer",
    );
    assert.equal(
      liveOutagesResult.sourceId,
      CEB_OUTAGES_SEED_SOURCE_ID,
      "Expected seed sourceId when falling back",
    );
  }

  // Test 3: getLoadSheddingSchedule for all groups
  const fullSchedule = await getLoadSheddingSchedule();
  assert.ok(Array.isArray(fullSchedule.groups), "Expected groups array");
  assert.ok(fullSchedule.groups.length > 0, "Expected non-empty schedule groups");

  // Verify letter groups A–Y coverage in seed or schedule result
  const groupLetters = new Set(fullSchedule.groups.map((g) => g.group.toUpperCase()));
  const expectedLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"];
  
  if (fullSchedule.isFallback) {
    for (const letter of expectedLetters) {
      assert.ok(groupLetters.has(letter), `Expected group ${letter} to be present in schedule`);
    }
  }

  // Test 4: getLoadSheddingSchedule for specific group "A"
  const groupASchedule = await getLoadSheddingSchedule("A");
  assert.ok(groupASchedule.groups.length > 0, "Expected schedule for group A");
  assert.ok(
    groupASchedule.groups.every((g) => g.group.toUpperCase() === "A"),
    "All returned groups must be group A",
  );

  // Test 5: getLoadSheddingSchedule for case-insensitive group "y"
  const groupYSchedule = await getLoadSheddingSchedule("y");
  assert.ok(groupYSchedule.groups.length > 0, "Expected schedule for group Y");
  assert.ok(
    groupYSchedule.groups.every((g) => g.group.toUpperCase() === "Y"),
    "All returned groups must be group Y",
  );

  console.log("ceb-outages.test.ts: ok");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
