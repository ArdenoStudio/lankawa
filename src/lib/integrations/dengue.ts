import { DISTRICTS } from "@/lib/districts";
import type { DengueDistrictStat, DengueRiskLevel, DengueSnapshot } from "@/lib/types";

const EPIDEMIOLOGY_SOURCE_ID = "epidemiology_unit";
const EPIDEMIOLOGY_SOURCE_NAME = "Epidemiology Unit — Weekly Dengue Report";
const WER_INDEX_URL =
  "https://www.epid.gov.lk/weekly-epidemiological-report/weekly-epidemiological-report";
const LEGACY_TRENDS_URL =
  "http://old.epid.gov.lk/web/index.php?Itemid=448&lang=en&option=com_casesanddeaths";
const FETCH_TIMEOUT_MS = 10_000;
const REVALIDATE_SECONDS = 21600;

const ROW_RE = /<tr\b[\s\S]*?<\/tr>/gi;
const CELL_RE = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json,text/html,application/xhtml+xml",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      throw new Error(`Epidemiology Unit returned ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function districtSlugFromText(value: string): string | null {
  const normalized = ` ${normalizeText(value)} `;
  for (const district of DISTRICTS) {
    const names = [district.name, district.capital, district.slug.replace(/-/g, " ")];
    if (names.some((name) => normalized.includes(` ${normalizeText(name)} `))) {
      return district.slug;
    }
  }
  if (normalized.includes(" kalmun")) {
    return "ampara";
  }
  return null;
}

function cellsFromRow(row: string): string[] {
  return [...row.matchAll(CELL_RE)].map((match) => stripTags(match[1]));
}

function numberFromText(value: string): number | null {
  const match = value.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function riskLevelFromCases(cases: number): DengueRiskLevel {
  if (cases >= 250) {
    return "high";
  }
  if (cases >= 75) {
    return "moderate";
  }
  return "low";
}

function epidemiologicalWeekFromText(value: string): number {
  const weekMatch = value.match(/(?:week|no\.?)\s*0?(\d{1,2})/i);
  if (weekMatch) {
    return Number(weekMatch[1]);
  }

  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  return Math.max(1, Math.ceil((now.getTime() - start) / 604_800_000));
}

function yearFromText(value: string): number {
  const yearMatch = value.match(/\b(20\d{2})\b/);
  return yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
}

function parseDistrictRows(html: string): DengueDistrictStat[] {
  const stats: DengueDistrictStat[] = [];

  for (const row of html.match(ROW_RE) ?? []) {
    const cells = cellsFromRow(row);
    if (cells.length < 2) {
      continue;
    }

    const slug = districtSlugFromText(cells[0]);
    const cases = cells
      .slice(1)
      .map(numberFromText)
      .find((value): value is number => value != null);

    if (!slug || cases == null) {
      continue;
    }

    stats.push({
      slug,
      cases,
      changePct: 0,
      riskLevel: riskLevelFromCases(cases),
    });
  }

  const byDistrict = new Map<string, DengueDistrictStat>();
  for (const stat of stats) {
    if (!byDistrict.has(stat.slug)) {
      byDistrict.set(stat.slug, stat);
    }
  }
  return [...byDistrict.values()];
}

function buildSnapshotFromHtml(html: string): DengueSnapshot | null {
  if (/no records found/i.test(html)) {
    return null;
  }

  const districts = parseDistrictRows(html);
  if (districts.length < 10) {
    return null;
  }

  const nationalTotal = districts.reduce((total, district) => total + district.cases, 0);
  return {
    sourceId: EPIDEMIOLOGY_SOURCE_ID,
    sourceName: EPIDEMIOLOGY_SOURCE_NAME,
    asOf: new Date().toISOString().slice(0, 10),
    epidemiologicalWeek: epidemiologicalWeekFromText(html),
    year: yearFromText(html),
    nationalTotal,
    nationalChangePct: 0,
    districts,
  };
}

async function fetchWeeklyReportIndex(): Promise<void> {
  const html = await fetchText(WER_INDEX_URL);
  if (!/dengue|weekly epidemiological report/i.test(html)) {
    throw new Error("Weekly Epidemiological Report index missing expected content");
  }
}

export async function fetchLiveDengueSnapshot(): Promise<DengueSnapshot | null> {
  try {
    const legacyHtml = await fetchText(LEGACY_TRENDS_URL);
    const legacySnapshot = buildSnapshotFromHtml(legacyHtml);
    if (legacySnapshot) {
      return legacySnapshot;
    }
  } catch {
    // Continue to the current WER index probe below.
  }

  try {
    await fetchWeeklyReportIndex();
  } catch {
    return null;
  }

  return null;
}
