import assert from "node:assert/strict";
import {
  isInQuietHours,
  parseWebPushPrefs,
} from "./web-push-prefs";

assert.equal(isInQuietHours(23, 22, 6), true);
assert.equal(isInQuietHours(3, 22, 6), true);
assert.equal(isInQuietHours(10, 22, 6), false);
assert.equal(isInQuietHours(22, 22, 6), true);
assert.equal(isInQuietHours(6, 22, 6), false);
assert.equal(isInQuietHours(12, 9, 17), true);
assert.equal(isInQuietHours(8, 9, 17), false);

const defaults = parseWebPushPrefs(null);
assert.equal(defaults.quietHoursEnabled, true);
assert.equal(defaults.quietStartHour, 22);

const custom = parseWebPushPrefs(
  JSON.stringify({ quietHoursEnabled: false, quietStartHour: 21 }),
);
assert.equal(custom.quietHoursEnabled, false);
assert.equal(custom.quietStartHour, 21);

console.log("web-push-prefs.test.ts: ok");
