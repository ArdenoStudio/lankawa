import { computeFreshnessTier } from "../freshness";
import { getSource } from "../sources";
import type { FreshnessTier } from "../types";

const LECO_BASE = "https://www.leco.lk";
const LECO_INDEX_URL = `${LECO_BASE}/powerIntrup_e.php`;
const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";
const FETCH_REVALIDATE_SECONDS = 900;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_AFFECTED_AREAS = 12;

/** LECO service branches — Western Province coastal belt plus Galle. */
const LECO_BRANCHES = [
  { areaId: 1, name: "Galle" },
  { areaId: 3, name: "Kalutara" },
  { areaId: 11, name: "Moratuwa" },
  { areaId: 5, name: "Nugegoda" },
  { areaId: 7, name: "Kotte" },
  { areaId: 9, name: "Kelaniya" },
  { areaId: 13, name: "Negombo" },
] as const;

export type LecoSupplyStatus = "normal" | "scheduled" | "outage" | "unknown";

export interface LecoOutageStatus {
  status: LecoSupplyStatus;
  summary: string;
  affectedAreas: string[];
  observedAt: string;
  isSeed: boolean;
  tier: FreshnessTier;
  sourceId: "leco_power";
  provenancePath: "/disaster";
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": BOT_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`LECO returned ${response.status} for ${url}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Extract the LECO "Current Month" cell from a branch interruption page.
 * The HTML uses nested tables with LECO / CEB rows under Next / Current / Previous.
 */
function extractCurrentMonthLecoCell(html: string): string | null {
  const currentIdx = html.search(/Current\s+Month/i);
  if (currentIdx < 0) {
    return null;
  }

  const afterCurrent = html.slice(currentIdx);
  const lecoRow = afterCurrent.match(
    /<tr[^>]*>\s*<td[^>]*>\s*LECO\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/i,
  );
  return lecoRow?.[1] ?? null;
}

function parseBranchInterruptions(
  branchName: string,
  cellHtml: string,
): { hasSchedule: boolean; labels: string[] } {
  const text = stripTags(cellHtml);
  if (!text || /no\s+scheduled\s+interruptions/i.test(text)) {
    return { hasSchedule: false, labels: [] };
  }

  const labels: string[] = [];
  const placeMatches = [
    ...cellHtml.matchAll(/<p>\s*<b>\s*([^<]+?)\s*<\/b>\s*<\/p>/gi),
  ];
  for (const match of placeMatches) {
    const place = stripTags(match[1] ?? "").replace(/\s+/g, " ").trim();
    if (place && place.length < 80) {
      labels.push(`${branchName}: ${place}`);
    }
  }

  if (labels.length === 0) {
    labels.push(branchName);
  }

  return { hasSchedule: true, labels };
}

function uniqueLimited(values: string[], limit: number): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    output.push(trimmed);
    if (output.length >= limit) {
      break;
    }
  }

  return output;
}

function seedUnknown(observedAt: string, summary: string): LecoOutageStatus {
  return {
    status: "unknown",
    summary,
    affectedAreas: [],
    observedAt,
    isSeed: true,
    tier: "unknown",
    sourceId: "leco_power",
    provenancePath: "/disaster",
  };
}

/**
 * Best-effort scrape of LECO Western / coastal scheduled interruption notices.
 * Falls back to seed/unknown when the public pages cannot be parsed.
 */
export async function fetchLECOOutages(): Promise<LecoOutageStatus> {
  const observedAt = new Date().toISOString();
  const source = getSource("leco_power");

  try {
    await fetchText(LECO_INDEX_URL);

    const branchResults = await Promise.all(
      LECO_BRANCHES.map(async (branch) => {
        const html = await fetchText(
          `${LECO_INDEX_URL}?areaId=${branch.areaId}`,
        );
        const cell = extractCurrentMonthLecoCell(html);
        if (cell == null) {
          return { branch: branch.name, hasSchedule: false, labels: [] as string[] };
        }
        const parsed = parseBranchInterruptions(branch.name, cell);
        return { branch: branch.name, ...parsed };
      }),
    );

    const scheduled = branchResults.filter((row) => row.hasSchedule);
    const affectedAreas = uniqueLimited(
      scheduled.flatMap((row) => row.labels),
      MAX_AFFECTED_AREAS,
    );

    if (scheduled.length === 0) {
      return {
        status: "normal",
        summary:
          "No current-month LECO scheduled interruptions published across sampled Western/coastal branches",
        affectedAreas: [],
        observedAt,
        isSeed: false,
        tier: computeFreshnessTier(observedAt, source?.cadenceMinutes ?? 30),
        sourceId: "leco_power",
        provenancePath: "/disaster",
      };
    }

    return {
      status: "scheduled",
      summary: `${scheduled.length} LECO branch(es) list current-month scheduled interruptions`,
      affectedAreas,
      observedAt,
      isSeed: false,
      tier: computeFreshnessTier(observedAt, source?.cadenceMinutes ?? 30),
      sourceId: "leco_power",
      provenancePath: "/disaster",
    };
  } catch {
    return seedUnknown(
      observedAt,
      "LECO interruption notices unavailable — scrape failed; showing unknown seed state",
    );
  }
}
