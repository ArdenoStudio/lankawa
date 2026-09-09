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
const LIVING_SEED_PATH = path.join(ROOT, "src/data/census-living-conditions.json");

// Household living-conditions tables (Census 2024 Final Report).
const LIVING_TABLES = {
  cookingFuel: "data/House-CookingFuel/data.json",
  drinkingWater: "data/House-SourceOfDrinkingWater/data.json",
  toiletFacilities: "data/House-ToiletFacilities/data.json",
  lighting: "data/House-Lighting/data.json",
};

// Person age-structure table (Census 2024 Final Report).
const AGE_TABLE = "data/Person-AgeGroup/data.json";
const AGE_SEED_PATH = path.join(ROOT, "src/data/census-age-structure.json");

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

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Upstream fetch failed: HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function pct(part, total) {
  if (!Number.isFinite(total) || total <= 0) return null;
  return Math.round((part / total) * 1000) / 10; // one decimal
}

/**
 * Reduce a living-conditions table to per-slug indicator shares.
 * Returns { bySlug, national } where shares are null when the denominator is 0.
 */
function parseLivingTable(raw, derive) {
  const bySlug = new Map();
  let national = null;
  for (const row of raw) {
    if (row.region_ent_type === "district") {
      const slug = SLUG_BY_NAME[row.region_name];
      if (!slug) {
        throw new Error(`Unmapped upstream district name: "${row.region_name}"`);
      }
      bySlug.set(slug, derive(row.values ?? {}, row.total_value));
    } else if (row.region_ent_type === "country") {
      national = derive(row.values ?? {}, row.total_value);
    }
  }
  if (bySlug.size !== 25) {
    throw new Error(`Expected 25 districts in living table, got ${bySlug.size}`);
  }
  if (national == null) {
    throw new Error("Upstream national (country) row missing in living table");
  }
  return { bySlug, national };
}

// Clean cooking (SDG 7): gas, electricity or biogas as the main cooking fuel,
// over households that cook (excludes not_relevant).
function deriveCooking(values, total) {
  const cookingTotal = total - (values.not_relevant ?? 0);
  const clean =
    (values.gas ?? 0) + (values.electricity ?? 0) + (values.bio_gas ?? 0);
  return {
    households: total,
    cleanCookingPct: pct(clean, cookingTotal),
  };
}

// Pipe-borne drinking water (NWSDB, local authority, community or private),
// over all households.
function deriveWater(values, total) {
  const pipeBorne =
    (values.pipe_borne_nwsdb ?? 0) +
    (values.pipe_borne_local_authority ?? 0) +
    (values.pipe_borne_community ?? 0) +
    (values.pipe_borne_private ?? 0);
  return { households: total, pipeBorneWaterPct: pct(pipeBorne, total) };
}

// Toilet within the housing unit or on premises, over all households.
function deriveToilet(values, total) {
  const improved =
    (values.within_unit_exclusive ?? 0) +
    (values.within_unit_shared ?? 0) +
    (values.within_premises_exclusive ?? 0) +
    (values.within_premises_shared ?? 0);
  return { households: total, improvedSanitationPct: pct(improved, total) };
}

// Main lighting source is the electricity grid, over all households.
function deriveLighting(values, total) {
  return {
    households: total,
    gridElectricityPct: pct(values.electricity_grid ?? 0, total),
  };
}

const AGE_CHILD_BUCKETS = ["00_04", "05_09", "10_14"];
const AGE_SENIOR_BUCKETS = [
  "65_69",
  "70_74",
  "75_79",
  "80_84",
  "85_89",
  "90_94",
  "95_and_above",
];

/**
 * Reduce the Person-AgeGroup table to per-region age-structure indicators.
 * Buckets are 5-year bands: 0-14 children, 15-64 working age, 65+ seniors.
 */
function parseAgeTable(raw) {
  const bySlug = new Map();
  let national = null;
  for (const row of raw) {
    if (row.region_ent_type !== "district" && row.region_ent_type !== "country") {
      continue;
    }
    const values = row.values ?? {};
    let population = 0;
    let children = 0;
    let seniors = 0;
    for (const [bucket, count] of Object.entries(values)) {
      const n = Number(count);
      if (!Number.isFinite(n)) continue;
      population += n;
      if (AGE_CHILD_BUCKETS.includes(bucket)) children += n;
      if (AGE_SENIOR_BUCKETS.includes(bucket)) seniors += n;
    }
    const workingAge = population - children - seniors;
    const derived = {
      population,
      childrenSharePct: pct(children, population),
      workingAgeSharePct: pct(workingAge, population),
      ageingSharePct: pct(seniors, population),
      dependencyRatio:
        workingAge > 0
          ? Math.round(((children + seniors) / workingAge) * 1000) / 10
          : null,
    };
    if (row.region_ent_type === "district") {
      const slug = SLUG_BY_NAME[row.region_name];
      if (!slug) {
        throw new Error(`Unmapped upstream district name: "${row.region_name}"`);
      }
      bySlug.set(slug, derived);
    } else {
      national = derived;
    }
  }
  if (bySlug.size !== 25) {
    throw new Error(`Expected 25 districts in age table, got ${bySlug.size}`);
  }
  if (national == null) {
    throw new Error("Upstream national (country) row missing in age table");
  }
  return { bySlug, national };
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

  const livingRaw = await Promise.all(
    Object.values(LIVING_TABLES).map((tablePath) =>
      fetchJson(`https://raw.githubusercontent.com/${UPSTREAM_REPO}/main/${tablePath}`),
    ),
  );
  const living = {
    cookingFuel: parseLivingTable(livingRaw[0], deriveCooking),
    drinkingWater: parseLivingTable(livingRaw[1], deriveWater),
    toiletFacilities: parseLivingTable(livingRaw[2], deriveToilet),
    lighting: parseLivingTable(livingRaw[3], deriveLighting),
  };

  const ageRaw = await fetchJson(
    `https://raw.githubusercontent.com/${UPSTREAM_REPO}/main/${AGE_TABLE}`,
  );
  const age = parseAgeTable(ageRaw);

  const livingSeedValue = {
    asOf: "2024-12-31",
    isSeed: false,
    sourceName:
      "Department of Census and Statistics (Census 2024, Final Report — household tables)",
    methodologyNote:
      "Shares derived from exact household counts in the DCS Census of Population and Housing 2024 Final Report (cooking fuel, source of drinking water, toilet facilities, lighting), mirrored from the open nuuuwan/lk_census_2024 dataset. Clean cooking = gas/electricity/biogas over cooking households; pipe-borne water = NWSDB/local authority/community/private; improved sanitation = toilet within unit or premises. Static census reference — updated when DCS publishes revisions.",
    national: {
      households: living.cookingFuel.national.households,
      cleanCookingPct: living.cookingFuel.national.cleanCookingPct,
      pipeBorneWaterPct: living.drinkingWater.national.pipeBorneWaterPct,
      improvedSanitationPct: living.toiletFacilities.national.improvedSanitationPct,
      gridElectricityPct: living.lighting.national.gridElectricityPct,
    },
    districts: [...living.cookingFuel.bySlug.keys()].map((slug) => ({
      slug,
      households: living.cookingFuel.bySlug.get(slug).households,
      cleanCookingPct: living.cookingFuel.bySlug.get(slug).cleanCookingPct,
      pipeBorneWaterPct: living.drinkingWater.bySlug.get(slug).pipeBorneWaterPct,
      improvedSanitationPct:
        living.toiletFacilities.bySlug.get(slug).improvedSanitationPct,
      gridElectricityPct: living.lighting.bySlug.get(slug).gridElectricityPct,
    })),
    provenance: {
      upstream: UPSTREAM_REPO,
      tables: LIVING_TABLES,
      commit: upstreamSha,
      fetchedAt: new Date().toISOString(),
      dcsSource:
        "Census of Population and Housing 2024, Final Report — housing tables",
    },
  };

  const ageSeedValue = {
    asOf: "2024-12-31",
    isSeed: false,
    sourceName:
      "Department of Census and Statistics (Census 2024, Final Report — age structure)",
    methodologyNote:
      "Age structure from exact 5-year age-band counts in the DCS Census of Population and Housing 2024 Final Report (Person-AgeGroup), mirrored from the open nuuuwan/lk_census_2024 dataset. Children 0-14, working age 15-64, seniors 65+. Dependency ratio = (children + seniors) per 100 working-age. Static census reference — updated when DCS publishes revisions.",
    national: age.national,
    districts: [...age.bySlug.entries()].map(([slug, derived]) => ({
      slug,
      ...derived,
    })),
    provenance: {
      upstream: UPSTREAM_REPO,
      table: AGE_TABLE,
      commit: upstreamSha,
      fetchedAt: new Date().toISOString(),
      dcsSource:
        "Census of Population and Housing 2024, Final Report — age structure",
    },
  };

  const provenance = {
    upstream: UPSTREAM_REPO,
    table: UPSTREAM_TABLE_PATH,
    commit: upstreamSha,
    fetchedAt: new Date().toISOString(),
    dcsSource: "Census of Population and Housing 2024, Final Report, Table 3.2",
  };

  const censusSeed = JSON.parse(fs.readFileSync(CENSUS_SEED_PATH, "utf8"));
  const districtsRaw = fs.readFileSync(DISTRICTS_PATH, "utf8");
  let livingSeedExisting = null;
  try {
    livingSeedExisting = JSON.parse(fs.readFileSync(LIVING_SEED_PATH, "utf8"));
  } catch {
    livingSeedExisting = null; // First run — file does not exist yet.
  }
  let ageSeedExisting = null;
  try {
    ageSeedExisting = JSON.parse(fs.readFileSync(AGE_SEED_PATH, "utf8"));
  } catch {
    ageSeedExisting = null; // First run — file does not exist yet.
  }

  const nextCensus = updateCensusSeed(censusSeed, parsed, provenance);
  const { text: nextDistrictsText, changed } = patchDistrictPopulations(districtsRaw, parsed);

  const censusDrift = JSON.stringify(nextCensus) !== JSON.stringify(censusSeed);
  const districtsDrift = nextDistrictsText !== districtsRaw;
  const livingDrift =
    livingSeedExisting != null &&
    JSON.stringify(livingSeedExisting) !== JSON.stringify(livingSeedValue);
  const ageDrift =
    ageSeedExisting != null &&
    JSON.stringify(ageSeedExisting) !== JSON.stringify(ageSeedValue);
  const drift = censusDrift || districtsDrift || livingDrift || ageDrift;

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
  fs.writeFileSync(
    LIVING_SEED_PATH,
    JSON.stringify(livingSeedValue, null, 2) + "\n",
  );
  fs.writeFileSync(
    AGE_SEED_PATH,
    JSON.stringify(ageSeedValue, null, 2) + "\n",
  );
  console.log(
    `Updated ${path.relative(ROOT, CENSUS_SEED_PATH)}, ${path.relative(ROOT, DISTRICTS_PATH)} (${changed} atlas rows), ${path.relative(ROOT, LIVING_SEED_PATH)} and ${path.relative(ROOT, AGE_SEED_PATH)}.`,
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
