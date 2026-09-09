#!/usr/bin/env node
/**
 * Update Lankawa's Census 2024 datasets from the open
 * nuuuwan/lk_census_2024 dataset (DCS Census of Population and Housing 2024,
 * Final Report Table 3.2 — Distribution of Population by Province and
 * District, 2024).
 *
 * Updates:
 *   1. src/data/census-2024-seed.json — exact national + district populations
 *   2. src/data/districts.json        — exact district populations for the
 *      district atlas (cards, density, province shares, /api/v1 exports).
 *      Patched surgically (population values only) so the git diff stays
 *      limited to the numbers that actually changed.
 *
 * Provenance: the census seed records the upstream commit sha + table path.
 *
 * Usage:
 *   node scripts/update-census-2024.mjs          # fetch + write
 *   node scripts/update-census-2024.mjs --check  # exit 1 if drift, no write
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const UPSTREAM_REPO = "nuuuwan/lk_census_2024";
const UPSTREAM_TABLE_PATH =
  "data/final-report-tables/chapter-3/3.2-Distribution-of-Population-by-Province-and-District-2024/data.json";
const UPSTREAM_URL = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/main/${UPSTREAM_TABLE_PATH}`;

const ROOT = path.resolve(process.cwd());
const CENSUS_SEED_PATH = path.join(ROOT, "src/data/census-2024-seed.json");
const DISTRICTS_PATH = path.join(ROOT, "src/data/districts.json");

// Lankawa slugs (URL-safe) mapped from upstream region_name.
const SLUG_BY_NAME = {
  "Colombo": "colombo",
  "Gampaha": "gampaha",
  "Kalutara": "kalutara",
  "Kandy": "kandy",
  "Matale": "matale",
  "Nuwara Eliya": "nuwara-eliya",
  "Galle": "galle",
  "Matara": "matara",
  "Hambantota": "hambantota",
  "Jaffna": "jaffna",
  "Kilinochchi": "kilinochchi",
  "Mannar": "mannar",
  "Vavuniya": "vavuniya",
  "Mullaitivu": "mullaitivu",
  "Batticaloa": "batticaloa",
  "Ampara": "ampara",
  "Trincomalee": "trincomalee",
  "Kurunegala": "kurunegala",
  "Puttalam": "puttalam",
  "Anuradhapura": "anuradhapura",
  "Polonnaruwa": "polonnaruwa",
  "Badulla": "badulla",
  "Monaragala": "monaragala",
  "Ratnapura": "ratnapura",
  "Kegalle": "kegalle",
};

const CENSUS_NOTE_BY_SLUG = {
  colombo: "Western mega-district; densest housing stock.",
  gampaha: "Rapid peri-urban growth around Colombo.",
  kalutara: "Coastal + estate hinterland mix.",
  kandy: "Central hill-country urban core.",
  matale: "Central province inland district.",
  "nuwara-eliya": "Plantation / highland settlement pattern.",
  galle: "Southern coastal urban corridor.",
  matara: "Southern coastal mid-sized urban belt.",
  hambantota: "Southern interior growth corridor.",
  jaffna: "Northern peninsula administrative capital.",
  kilinochchi: "Northern agricultural district.",
  mannar: "Island-and-mainland coastal district.",
  vavuniya: "Northern gateway district.",
  mullaitivu: "Northeastern coastal district.",
  batticaloa: "Eastern lagoon-and-coast district.",
  ampara: "Eastern agricultural district.",
  trincomalee: "Northeastern port district.",
  kurunegala: "North Western hub district.",
  puttalam: "North Western coastal district.",
  anuradhapura: "North Central heritage capital.",
  polonnaruwa: "North Central agricultural district.",
  badulla: "Uva hill-country district.",
  monaragala: "Uva sparsely-populated interior.",
  ratnapura: "Sabaragamuwa gem-and-rain district.",
  kegalle: "Sabaragamuwa rubber smallholding belt.",
};

async function fetchUpstream() {
  const res = await fetch(UPSTREAM_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Upstream fetch failed: HTTP ${res.status} for ${UPSTREAM_URL}`);
  }
  return res.json();
}

async function fetchUpstreamCommit() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${UPSTREAM_REPO}/commits?path=${encodeURIComponent(UPSTREAM_TABLE_PATH)}&per_page=1`,
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    return row?.sha ?? null;
  } catch {
    return null; // Non-fatal: provenance record still cites the table path.
  }
}

function parseRows(raw) {
  const districts = new Map();
  let national = null;

  for (const row of raw) {
    const population = row?.values?.population;
    if (typeof population !== "number" || !Number.isFinite(population)) {
      continue;
    }
    if (row.region_ent_type === "district") {
      const slug = SLUG_BY_NAME[row.region_name];
      if (!slug) {
        throw new Error(`Unmapped upstream district name: "${row.region_name}"`);
      }
      districts.set(slug, population);
    } else if (row.region_ent_type === "country") {
      national = population;
    }
  }

  if (districts.size !== 25) {
    throw new Error(`Expected 25 districts upstream, got ${districts.size}`);
  }
  if (national == null) {
    throw new Error("Upstream national (country) population row missing");
  }
  const districtSum = [...districts.values()].reduce((a, b) => a + b, 0);
  if (districtSum !== national) {
    throw new Error(
      `District sum ${districtSum} != national ${national} — upstream table changed shape`,
    );
  }
  return { districts, national };
}

function updateCensusSeed(existing, parsed, provenance) {
  return {
    ...existing,
    asOf: "2024-12-31",
    isSeed: false,
    sourceName: "Department of Census and Statistics (Census 2024, Final Report Table 3.2)",
    methodologyNote:
      "Exact resident populations from the DCS Census of Population and Housing 2024 Final Report (Table 3.2), mirrored from the open nuuuwan/lk_census_2024 dataset. Static census reference — updated when DCS publishes revisions, not a live feed.",
    nationalPopulation: parsed.national,
    districts: existing.districts.map((footnote) => {
      const upstream = parsed.districts.get(footnote.slug);
      if (upstream == null) return footnote;
      return {
        ...footnote,
        population2024: upstream,
        note: CENSUS_NOTE_BY_SLUG[footnote.slug] ?? footnote.note,
      };
    }),
    provenance,
  };
}

/**
 * Replace only the district-level `"population": N` values in districts.json,
 * leaving every other byte of the file untouched. District population lines
 * follow their `"slug"` line closely (name/nameSi/nameTa/province/capital
 * in between); city objects carry no population field.
 */
function patchDistrictPopulations(rawText, parsed) {
  let text = rawText;
  let changed = 0;

  for (const [slug, population] of parsed.districts) {
    const pattern = new RegExp(
      `("slug":\\s*"${slug}"[\\s\\S]{0,400}?"population": )\\d+`,
    );
    const next = text.replace(pattern, `$1${population}`);
    if (next === text) {
      // Either already up to date or the block shape changed — verify which.
      const match = text.match(pattern);
      if (!match) {
        throw new Error(`District block for "${slug}" not found in districts.json`);
      }
      if (Number(match[0].split('"population": ')[1]) !== population) {
        throw new Error(`Failed to patch population for "${slug}"`);
      }
      continue;
    }
    changed += 1;
    text = next;
  }
  return { text, changed };
}

async function run() {
  const checkOnly = process.argv.includes("--check");

  const [upstreamRaw, upstreamSha] = await Promise.all([
    fetchUpstream(),
    fetchUpstreamCommit(),
  ]);
  const parsed = parseRows(upstreamRaw);

  const provenance = {
    upstream: UPSTREAM_REPO,
    table: UPSTREAM_TABLE_PATH,
    commit: upstreamSha,
    fetchedAt: new Date().toISOString(),
    dcsSource: "Census of Population and Housing 2024, Final Report, Table 3.2",
  };

  const censusSeed = JSON.parse(fs.readFileSync(CENSUS_SEED_PATH, "utf8"));
  const districtsRaw = fs.readFileSync(DISTRICTS_PATH, "utf8");

  const nextCensus = updateCensusSeed(censusSeed, parsed, provenance);
  const { text: nextDistrictsText, changed } = patchDistrictPopulations(districtsRaw, parsed);

  const censusDrift = JSON.stringify(nextCensus) !== JSON.stringify(censusSeed);
  const districtsDrift = nextDistrictsText !== districtsRaw;
  const drift = censusDrift || districtsDrift;

  console.log(
    `Census 2024 check: national=${parsed.national.toLocaleString()} districts=${parsed.districts.size} atlasRowsChanged=${changed}`,
  );
  console.log(`Upstream commit: ${upstreamSha ?? "unknown (API unavailable)"}`);

  if (!drift) {
    console.log("No drift — datasets already match upstream.");
    return;
  }

  if (checkOnly) {
    console.error("DRIFT DETECTED — rerun without --check to update.");
    process.exit(1);
  }

  fs.writeFileSync(CENSUS_SEED_PATH, JSON.stringify(nextCensus, null, 2) + "\n");
  fs.writeFileSync(DISTRICTS_PATH, nextDistrictsText);
  console.log(
    `Updated ${path.relative(ROOT, CENSUS_SEED_PATH)} and ${path.relative(ROOT, DISTRICTS_PATH)} (${changed} atlas rows).`,
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
