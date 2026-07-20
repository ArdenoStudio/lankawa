import assert from "node:assert/strict";
import { signWebhookBody, verifyWebhookSignature } from "./webhook-hmac";

const body = JSON.stringify({ id: "p62-test", at: "2026-07-20" });
const secret = "test-partner-secret";
const sig = signWebhookBody(body, secret);

assert.match(sig, /^sha256=[0-9a-f]{64}$/);
assert.equal(verifyWebhookSignature(body, secret, sig), true);
assert.equal(verifyWebhookSignature(body, secret, "sha256=deadbeef"), false);
assert.equal(verifyWebhookSignature(body, secret, null), false);
assert.equal(verifyWebhookSignature(body + "x", secret, sig), false);

console.log("webhook-hmac.test.ts: ok");
