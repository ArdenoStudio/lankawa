import assert from "node:assert/strict";
import { mapEsanaPostsToHeadlines } from "./news-esana.ts";

const fetchedAt = "2026-07-26T10:00:00.000Z";
const headlines = mapEsanaPostsToHeadlines(
  [
    {
      id: 106432,
      title: "සිංහල මාතෘකාව",
      title_en: "English headline about Parliament",
      link: "https://www.helakuru.lk/esana/news/106432",
      published: "2026-07-26 11:31:46",
    },
    {
      id: 1,
      title: "No English",
      published: "2026-07-26 10:00:00",
    },
    {
      title_en: "Missing link and id",
    },
  ],
  fetchedAt,
);

assert.equal(headlines.length, 2);
assert.equal(headlines[0].title, "English headline about Parliament");
assert.equal(headlines[0].source, "Helakuru Esana");
assert.equal(headlines[1].url, "https://www.helakuru.lk/esana/news/1");
assert.equal(headlines[1].title, "No English");

// Test Esana V3 payload shape (ThaminduDisnaZ format)
const v3Headlines = mapEsanaPostsToHeadlines(
  [
    {
      id: "998877",
      titleSi: "ශ්‍රී ලංකා පුවත්",
      titleEn: "Sri Lanka Breaking News",
      share_url: "https://www.helakuru.lk/esana/news/998877",
      published: "2026-08-01 12:00:00",
    },
  ],
  fetchedAt,
);

assert.equal(v3Headlines.length, 1);
assert.equal(v3Headlines[0].title, "Sri Lanka Breaking News");
assert.equal(v3Headlines[0].url, "https://www.helakuru.lk/esana/news/998877");

console.log("news-esana.test.ts: ok");
