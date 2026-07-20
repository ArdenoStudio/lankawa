import assert from "node:assert/strict";
import {
  extractDsDivisionNames,
  parseLandslideBlocks,
  tierFromBlockMidX,
  type LandslideBlock,
} from "./landslide";

assert.equal(tierFromBlockMidX(183), "watch");
assert.equal(tierFromBlockMidX(328), "watch");
assert.equal(tierFromBlockMidX(473), "warning");

assert.deepEqual(
  extractDsDivisionNames(
    "Ayagama, Pelmadulla and Kalawana Divisional Secretariat Division(s) (DSD) and surrounding areas.",
  ),
  ["Ayagama", "Pelmadulla", "Kalawana"],
);
assert.deepEqual(
  extractDsDivisionNames(
    "* Deraniyagala, ↑ Ruwanwella and Dehiowita Divisional Secretariat Division(s) (DSD) and surrounding areas.",
  ),
  ["Deraniyagala", "Ruwanwella", "Dehiowita"],
);

/** Tip bulletin 2026-06-13 — Level 1 only for three districts. */
const tipBlocks: LandslideBlock[] = [
  {
    text: "District Level 1 (Yellow) Level 2 (Amber) Level 3 (Red)",
    bbox: "[64.94, 97.98, 542.77, 112.99]",
  },
  { text: "Kalutara", bbox: "[37.2, 157.45, 81.5, 170.73]" },
  {
    text: "Palindanuwara and Agalawatta Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[137.54, 122.89, 252.89, 205.17]",
  },
  { text: "Nuwara Eliya", bbox: "[37.2, 235.57, 106.58, 248.85]" },
  {
    text: "Ambagamuwa Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[137.54, 207.97, 252.89, 276.45]",
  },
  { text: "Ratnapura", bbox: "[37.2, 348.28, 89.54, 361.56]" },
  {
    text: "Ayagama, Pelmadulla, Godakawela, Elapatha, Kalawana, Ratnapura and Nivithigala Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[137.54, 279.25, 252.89, 420]",
  },
];

const tipParsed = parseLandslideBlocks(tipBlocks);
const tipActive = tipParsed.filter(
  (row) => row.tier === "watch" || row.tier === "warning",
);
assert.equal(tipActive.length, 3);
assert.equal(
  tipParsed.find((row) => row.slug === "kalutara")?.tier,
  "watch",
);
assert.equal(
  tipParsed.find((row) => row.slug === "nuwara-eliya")?.tier,
  "watch",
);
assert.equal(
  tipParsed.find((row) => row.slug === "ratnapura")?.tier,
  "watch",
);
assert.equal(
  tipParsed.find((row) => row.slug === "kegalle")?.tier,
  "none",
);
assert.ok(
  tipParsed
    .find((row) => row.slug === "kalutara")
    ?.dsDivisions.includes("Palindanuwara"),
);

/** Multi-level sample — Kegalle Level 3 → warning; Gampaha Level 1+2 → watch. */
const multiBlocks: LandslideBlock[] = [
  { text: "Colombo", bbox: "[37.2, 139.3, 128.7, 156.9]" },
  {
    text: "Seethawaka and Padukka Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[270.4, 109.2, 385.8, 191.4]",
  },
  { text: "Gampaha", bbox: "[37.2, 228.7, 86.2, 242.0]" },
  {
    text: "* Mirigama and * Divulapitiya Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[125.7, 194.2, 241.0, 276.4]",
  },
  {
    text: "Attanagalla Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[270.4, 201.1, 385.8, 269.6]",
  },
  { text: "Kegalle", bbox: "[37.2, 433.4, 77.5, 446.6]" },
  {
    text: "* Bulathkohupitiya Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[125.7, 405.8, 241.0, 474.3]",
  },
  {
    text: "↑ Yatiyanthota Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[270.4, 405.8, 385.8, 474.3]",
  },
  {
    text: "* Deraniyagala, ↑ Ruwanwella and Dehiowita Divisional Secretariat Division(s) (DSD) and surrounding areas.",
    bbox: "[415.0, 392.0, 530.4, 488.1]",
  },
];

const multi = parseLandslideBlocks(multiBlocks);
assert.equal(multi.find((row) => row.slug === "colombo")?.tier, "watch");
assert.equal(multi.find((row) => row.slug === "gampaha")?.tier, "watch");
assert.equal(multi.find((row) => row.slug === "kegalle")?.tier, "warning");
assert.ok(
  multi
    .find((row) => row.slug === "kegalle")
    ?.dsDivisions.includes("Deraniyagala"),
);

assert.deepEqual(parseLandslideBlocks([]), []);

console.log("landslide.test.ts: ok");
