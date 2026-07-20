import assert from "node:assert/strict";
import {
  filterDistrictPressHeadlines,
  filterMarketsPressHeadlines,
  headlineMentionsDistrict,
} from "./news-press";

const colombo = {
  slug: "colombo",
  name: "Colombo",
  nameSi: "කොළඹ",
  nameTa: "கொழும்பு",
  capital: "Colombo",
};

assert.equal(
  headlineMentionsDistrict("Flood warning issued for Colombo suburbs", colombo),
  true,
);
assert.equal(
  headlineMentionsDistrict("Parliament debates budget", colombo),
  false,
);

const headlines = [
  {
    title: "CSE gains as Colombo traders return",
    url: "https://example.com/1",
    publishedAt: "2026-07-20T08:00:00.000Z",
    source: "lbo",
  },
  {
    title: "Tea auction steady",
    url: "https://example.com/2",
    publishedAt: "2026-07-20T07:00:00.000Z",
    source: "ada_derana_biz",
  },
  {
    title: "Sports roundup",
    url: "https://example.com/3",
    publishedAt: "2026-07-20T06:00:00.000Z",
    source: "daily_mirror",
  },
];

assert.equal(filterMarketsPressHeadlines(headlines).length, 2);
assert.equal(filterDistrictPressHeadlines(headlines, colombo).length, 1);

console.log("news press test passed");
