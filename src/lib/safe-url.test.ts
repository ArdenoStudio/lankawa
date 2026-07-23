import assert from "node:assert/strict";
import { safeHttpUrl } from "./safe-url";

assert.equal(safeHttpUrl(null), null);
assert.equal(safeHttpUrl(undefined), null);
assert.equal(safeHttpUrl(""), null);

assert.equal(
  safeHttpUrl("https://example.com/path?q=1"),
  "https://example.com/path?q=1",
);
assert.equal(safeHttpUrl("http://example.com"), "http://example.com/");

assert.equal(safeHttpUrl("javascript:alert(1)"), null);
assert.equal(safeHttpUrl("data:text/html,hi"), null);
assert.equal(safeHttpUrl("ftp://example.com/file"), null);
assert.equal(safeHttpUrl("not a url"), null);

console.log("safe-url.test.ts: ok");
