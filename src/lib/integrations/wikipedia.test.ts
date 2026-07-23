import assert from "node:assert/strict";
import {
  firstSentenceFromExtract,
  parseWikipediaSummary,
  wikipediaTitleForDistrictSlug,
  WIKIPEDIA_LK_SOURCE_ID,
} from "./wikipedia";

assert.equal(wikipediaTitleForDistrictSlug("colombo"), "Colombo District");
assert.equal(wikipediaTitleForDistrictSlug("kandy"), "Kandy District");
assert.equal(
  wikipediaTitleForDistrictSlug("nuwara-eliya"),
  "Nuwara Eliya District",
);
assert.equal(wikipediaTitleForDistrictSlug(""), null);
assert.equal(wikipediaTitleForDistrictSlug("  "), null);

const fixture = parseWikipediaSummary({
  type: "standard",
  title: "Colombo District",
  extract:
    "Colombo District is one of the 25 districts of Sri Lanka. The district is located in the Western Province and covers an area of 699 square kilometres.",
  content_urls: {
    desktop: {
      page: "https://en.wikipedia.org/wiki/Colombo_District",
    },
  },
});

assert.ok(fixture);
assert.equal(fixture.title, "Colombo District");
assert.equal(
  fixture.url,
  "https://en.wikipedia.org/wiki/Colombo_District",
);
assert.match(fixture.extract, /Colombo District is one of the 25 districts/);

assert.equal(
  firstSentenceFromExtract(fixture.extract),
  "Colombo District is one of the 25 districts of Sri Lanka.",
);

assert.equal(parseWikipediaSummary(undefined), null);
assert.equal(parseWikipediaSummary({ type: "disambiguation", title: "X" }), null);
assert.equal(
  parseWikipediaSummary({
    title: "Broken",
    extract: "",
    content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Broken" } },
  }),
  null,
);
assert.equal(firstSentenceFromExtract(""), null);
assert.equal(firstSentenceFromExtract("Short"), null);

assert.equal(WIKIPEDIA_LK_SOURCE_ID, "wikipedia_lk");

console.log("wikipedia.test.ts: ok");
