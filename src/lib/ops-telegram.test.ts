import assert from "node:assert/strict";
import {
  formatAdapterFailureAlert,
  shouldAlertFailureStreak,
} from "./ops-telegram";

assert.equal(shouldAlertFailureStreak(3), false);
assert.equal(shouldAlertFailureStreak(4), true);
assert.equal(shouldAlertFailureStreak(0), false);

const text = formatAdapterFailureAlert({
  sourceId: "cbsl_fx",
  consecutiveFailures: 4,
  error: "timeout",
  checkedAt: "2026-07-20T00:00:00.000Z",
});
assert.match(text, /cbsl_fx/);
assert.match(text, /consecutive_failures: 4/);
assert.match(text, /timeout/);

console.log("ops-telegram test passed");
