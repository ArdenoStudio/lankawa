import { getSource, getSourceProvenancePath } from "../sources";

const MET_DEPT_BASE_URL = "https://was.meteo.gov.lk";
const ADVISORIES_URL = `${MET_DEPT_BASE_URL}/dashboard-api/advisories`;
const CAP_RSS_URL = `${MET_DEPT_BASE_URL}/cap/en/rss.xml`;
const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";
const FETCH_TIMEOUT_MS = 5000;
const MAX_SUMMARY_BULLETS = 5;

export const MET_DEPT_WARNINGS_SOURCE_ID = "met_dept_warnings";

export type MetDeptWarningLevel = "none" | "yellow" | "amber" | "red" | "unknown";

export interface MetDeptWarning {
  id: string;
  dayKey: string;
  dayLabel: string;
  name: string;
  level: MetDeptWarningLevel;
  warningLabel: string | null;
  bulletinNo: string | null;
  validFrom: string | null;
  validTo: string | null;
  summary: string | null;
  summaryBullets: string[];
  actionRequired: string | null;
  damageExpected: string | null;
  areas: string[];
  districts: string[];
  divisions: string[];
}

export interface MetDeptWarningsSnapshot {
  sourceId: typeof MET_DEPT_WARNINGS_SOURCE_ID;
  sourceName: string;
  title: string;
  agency: string;
  issuedAt: string | null;
  checkedAt: string;
  warnings: MetDeptWarning[];
  provenancePath: string;
}

interface MetDeptAdvisoryResponse {
  title?: unknown;
  agency?: unknown;
  days?: Array<{
    key?: unknown;
    label?: unknown;
    hazards?: MetDeptRawHazard[];
  }>;
}

interface MetDeptRawHazard {
  id?: unknown;
  bulletin_no?: unknown;
  name?: unknown;
  level?: unknown;
  published?: unknown;
  active?: unknown;
  warning_label?: unknown;
  valid_from?: unknown;
  valid_to?: unknown;
  summary?: unknown;
  summary_en?: unknown;
  summary_si?: unknown;
  summary_ta?: unknown;
  action_required?: unknown;
  action_required_en?: unknown;
  action_required_si?: unknown;
  action_required_ta?: unknown;
  damage_expected?: unknown;
  damage_expected_en?: unknown;
  damage_expected_si?: unknown;
  damage_expected_ta?: unknown;
  areas?: unknown;
  districts?: unknown;
  divisions?: unknown;
}

async function fetchWithTimeout(url: string, accept: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: accept,
        "User-Agent": BOT_USER_AGENT,
      },
      next: { revalidate: 900 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const stringValue = asString(value);
    if (stringValue) {
      return stringValue;
    }
  }

  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item))
    .filter((item): item is string => item != null);
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function richTextToPlainText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const text = decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || null;
}

function toSummaryBullets(value: string | null): string[] {
  if (!value) {
    return [];
  }

  const lines = value
    .split(/\n+|(?:\.\s+)/)
    .map((line) => line.replace(/^[•*\-\s]+/, "").trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0 && value.trim()) {
    return [value.trim()];
  }

  return lines.slice(0, MAX_SUMMARY_BULLETS);
}

function normalizeWarningLevel(value: unknown): MetDeptWarningLevel {
  const level = asString(value)?.toLowerCase();

  if (level === "none" || level === "yellow" || level === "amber" || level === "red") {
    return level;
  }

  return "unknown";
}

function isActiveHazard(raw: MetDeptRawHazard): boolean {
  if (typeof raw.published === "boolean") {
    return raw.published;
  }

  if (typeof raw.active === "boolean") {
    return raw.active;
  }

  return normalizeWarningLevel(raw.level) !== "none";
}

function normalizeHazard(
  raw: MetDeptRawHazard,
  dayKey: string,
  dayLabel: string,
): MetDeptWarning | null {
  if (!isActiveHazard(raw)) {
    return null;
  }

  const name = firstString(raw.name, raw.warning_label);
  if (!name) {
    return null;
  }

  const summary = richTextToPlainText(
    firstString(raw.summary_en, raw.summary, raw.summary_si, raw.summary_ta),
  );
  const actionRequired = richTextToPlainText(
    firstString(
      raw.action_required_en,
      raw.action_required,
      raw.action_required_si,
      raw.action_required_ta,
    ),
  );
  const damageExpected = richTextToPlainText(
    firstString(
      raw.damage_expected_en,
      raw.damage_expected,
      raw.damage_expected_si,
      raw.damage_expected_ta,
    ),
  );

  return {
    id: firstString(raw.id, `${dayKey}-${name}`) ?? `${dayKey}-${name}`,
    dayKey,
    dayLabel,
    name,
    level: normalizeWarningLevel(raw.level),
    warningLabel: asString(raw.warning_label),
    bulletinNo: asString(raw.bulletin_no),
    validFrom: asString(raw.valid_from),
    validTo: asString(raw.valid_to),
    summary,
    summaryBullets: toSummaryBullets(summary),
    actionRequired,
    damageExpected,
    areas: asStringArray(raw.areas),
    districts: asStringArray(raw.districts),
    divisions: asStringArray(raw.divisions),
  };
}

function parseRssPublishedAt(xml: string): string | null {
  const match = xml.match(/<pubDate>([^<]+)<\/pubDate>/i);
  if (!match?.[1]) {
    return null;
  }

  const timestamp = new Date(decodeEntities(match[1].trim())).getTime();
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

async function fetchCapRssPublishedAt(): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(CAP_RSS_URL, "application/rss+xml, text/xml");
    if (!response.ok) {
      return null;
    }

    return parseRssPublishedAt(await response.text());
  } catch {
    return null;
  }
}

export async function fetchMetDeptWarnings(): Promise<MetDeptWarningsSnapshot | null> {
  try {
    const [response, issuedAt] = await Promise.all([
      fetchWithTimeout(ADVISORIES_URL, "application/json"),
      fetchCapRssPublishedAt(),
    ]);

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as MetDeptAdvisoryResponse;
    const warnings = (payload.days ?? []).flatMap((day) => {
      const dayKey = asString(day.key) ?? "today";
      const dayLabel = asString(day.label) ?? dayKey;
      return (day.hazards ?? [])
        .map((hazard) => normalizeHazard(hazard, dayKey, dayLabel))
        .filter((hazard): hazard is MetDeptWarning => hazard != null);
    });

    const source = getSource(MET_DEPT_WARNINGS_SOURCE_ID);

    return {
      sourceId: MET_DEPT_WARNINGS_SOURCE_ID,
      sourceName: source?.name ?? "Department of Meteorology",
      title: asString(payload.title) ?? "Weather Advisory System",
      agency: asString(payload.agency) ?? "Department of Meteorology, Sri Lanka",
      issuedAt,
      checkedAt: new Date().toISOString(),
      warnings,
      provenancePath: getSourceProvenancePath(MET_DEPT_WARNINGS_SOURCE_ID),
    };
  } catch {
    return null;
  }
}
