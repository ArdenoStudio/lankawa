import assert from "node:assert/strict";
import {
  checkRateLimit,
  resolveRateBucket,
  rateLimitHeaders,
} from "./rate-limit";

assert.equal(resolveRateBucket("/api/v1/pulse"), "default");
assert.equal(resolveRateBucket("/api/v1/export/fuel-history"), "export");
assert.equal(resolveRateBucket("/api/v1/subscribe"), "subscribe");
assert.equal(resolveRateBucket("/api/v1/assistant"), "assistant");

const key = `test-${Date.now()}-${Math.random()}`;
const first = checkRateLimit(key, "subscribe");
assert.equal(first.allowed, true);
assert.equal(first.limit, 10);
assert.equal(first.remaining, 9);
assert.equal(first.bucket, "subscribe");

const headers = rateLimitHeaders(first);
assert.equal(headers["X-RateLimit-Bucket"], "subscribe");
assert.equal(headers["X-RateLimit-Limit"], "10");

for (let i = 0; i < 9; i += 1) {
  const result = checkRateLimit(key, "subscribe");
  assert.equal(result.allowed, true);
}

const blocked = checkRateLimit(key, "subscribe");
assert.equal(blocked.allowed, false);
assert.equal(blocked.remaining, 0);

// Separate buckets do not share counters.
const exportResult = checkRateLimit(key, "export");
assert.equal(exportResult.allowed, true);
assert.equal(exportResult.limit, 20);

console.log("rate-limit.test.ts: ok");
