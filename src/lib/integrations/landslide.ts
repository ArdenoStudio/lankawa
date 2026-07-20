import landslideSeed from "@/data/landslide-seed.json";
import { DISTRICTS } from "@/lib/districts";
import { computeFreshnessTier } from "@/lib/freshness";
import { getSource, getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier } from "@/lib/types";

export type LandslideRiskTier = "none" | "watch" | "warning" | "unknown";

export interface LandslideDistrictStatus {
  slug: string;
  tier: LandslideRiskTier;
  dsDivisions: string[];
}

export interface LandslideSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  summary: string;
  releaseUrl: string;
  nbroUrl: string;
  districts: LandslideDistrictStatus[];
  watchCount: number;
  warningCount: number;
  tier: FreshnessTier;
  isSeed: boolean;
  error: string | null;
  provenancePath: string;
}

export type LandslideBlock = {
  text?: string;
  bbox?: string | number[];
  page_number?: string | number;
};

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";
const SUMMARY_URL =
  "https://raw.githubusercontent.com/nuuuwan/lk_dmc/data_lk_dmc_landslide_warnings/data/lk_dmc_landslide_warnings/summary.json";
const DATA_BASE =
  "https://raw.githubusercontent.com/nuuuwan/lk_dmc/data_lk_dmc_landslide_warnings/data/lk_dmc_landslide_warnings";

/** DMC bulletin cadence is multi-hour; source registry uses 6 h. */
const CADENCE_MINUTES = 360;

const DISTRICT_BY_NAME = new Map(
  DISTRICTS.map((district) => [district.name.toLowerCase(), district.slug]),
);

const TIER_RANK: Record<LandslideRiskTier, number> = {
  none: 0,
  unknown: 1,
  watch: 2,
  warning: 3,
};

function normalizeTier(value: string): LandslideRiskTier {
  const key = value.toLowerCase();
  if (key.includes("red") || key.includes("level 3") || key === "warning") {
    return "warning";
  }
  if (
    key.includes("amber") ||
    key.includes("yellow") ||
    key.includes("level 1") ||
    key.includes("level 2") ||
    key === "watch"
  ) {
    return "watch";
  }
  if (key === "none" || key.includes("normal")) {
    return "none";
  }
  return "unknown";
}

function maxTier(a: LandslideRiskTier, b: LandslideRiskTier): LandslideRiskTier {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

function parseBbox(raw: string | number[] | undefined): number[] | null {
  if (!raw) return null;
  if (Array.isArray(raw) && raw.length >= 4) {
    return raw.map(Number);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as number[];
      return Array.isArray(parsed) && parsed.length >= 4 ? parsed.map(Number) : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Column bands from NBRO/DMC landscape table x-mids (Level 1 ~180, Level 2 ~330, Level 3 ~470). */
export function tierFromBlockMidX(midX: number): LandslideRiskTier {
  if (midX < 250) return "watch"; // Level 1 Yellow
  if (midX < 400) return "watch"; // Level 2 Amber
  return "warning"; // Level 3 Red
}

export function extractDsDivisionNames(text: string): string[] {
  const cleaned = text
    .replace(/[↑↓*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const match = cleaned.match(
    /^(.+?)\s+Divisional Secretariat Division\(s\)/i,
  );
  if (!match?.[1]) return [];
  return match[1]
    .replace(/\band\b/gi, ",")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function tipAssetUrl(docId: string, file: string): string {
  const year = docId.slice(0, 4);
  const decade = `${Math.floor(Number(year) / 10) * 10}s`;
  return `${DATA_BASE}/${decade}/${year}/${docId}/${file}`;
}

function asOfIso(dateStr: string, timeStr?: string): string {
  const time = (timeStr ?? "00:00").padStart(5, "0");
  // Bulletins are Sri Lanka local time; store as offset for freshness.
  return `${dateStr}T${time}:00+05:30`;
}

/**
 * Parse nuuuwan lk_dmc `blocks.json` layout: left-column district names +
 * Level 1/2/3 DSD cells by bbox x-mid, paired by nearest district y-center.
 */
export function parseLandslideBlocks(
  blocks: LandslideBlock[],
): LandslideDistrictStatus[] {
  const districtAnchors: { slug: string; yMid: number }[] = [];
  const cells: {
    tier: LandslideRiskTier;
    yMid: number;
    dsDivisions: string[];
  }[] = [];

  for (const block of blocks) {
    const text = (block.text ?? "").trim();
    if (!text) continue;
    const bbox = parseBbox(block.bbox);
    if (!bbox) continue;
    const [x0, y0, x1, y1] = bbox;
    const midX = (x0 + x1) / 2;
    const yMid = (y0 + y1) / 2;

    const slug = DISTRICT_BY_NAME.get(text.toLowerCase());
    if (slug && x0 < 120) {
      districtAnchors.push({ slug, yMid });
      continue;
    }

    if (
      /Divisional Secretariat/i.test(text) ||
      /\(DSD\)/i.test(text)
    ) {
      cells.push({
        tier: tierFromBlockMidX(midX),
        yMid,
        dsDivisions: extractDsDivisionNames(text),
      });
    }
  }

  if (districtAnchors.length === 0 || cells.length === 0) {
    return [];
  }

  const bySlug = new Map<string, LandslideDistrictStatus>();

  for (const cell of cells) {
    let best: { slug: string; yMid: number } | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const anchor of districtAnchors) {
      const dist = Math.abs(anchor.yMid - cell.yMid);
      if (dist < bestDist) {
        bestDist = dist;
        best = anchor;
      }
    }
    if (!best || bestDist > 120) continue;

    const existing = bySlug.get(best.slug);
    if (!existing) {
      bySlug.set(best.slug, {
        slug: best.slug,
        tier: cell.tier,
        dsDivisions: [...cell.dsDivisions],
      });
      continue;
    }
    existing.tier = maxTier(existing.tier, cell.tier);
    for (const name of cell.dsDivisions) {
      if (!existing.dsDivisions.includes(name)) {
        existing.dsDivisions.push(name);
      }
    }
  }

  // Full district board: parsed tiers, others none (honest empty board).
  return DISTRICTS.map((district) => {
    const hit = bySlug.get(district.slug);
    return (
      hit ?? {
        slug: district.slug,
        tier: "none" as const,
        dsDivisions: [] as string[],
      }
    );
  });
}

function fromSeed(overrides?: {
  asOf?: string;
  summary?: string;
  releaseUrl?: string;
  isSeed?: boolean;
  tier?: FreshnessTier;
  error?: string | null;
  districts?: LandslideDistrictStatus[];
}): LandslideSnapshot {
  const source = getSource("nbro_landslide");
  const districts =
    overrides?.districts ??
    landslideSeed.districts.map((district) => ({
      slug: district.slug,
      tier: normalizeTier(district.tier),
      dsDivisions: district.dsDivisions,
    }));

  return {
    sourceId: landslideSeed.sourceId,
    sourceName: source?.name ?? landslideSeed.sourceName,
    asOf: overrides?.asOf ?? landslideSeed.asOf,
    summary: overrides?.summary ?? landslideSeed.summary,
    releaseUrl: overrides?.releaseUrl ?? landslideSeed.releaseUrl,
    nbroUrl: landslideSeed.nbroUrl,
    districts,
    watchCount: districts.filter((d) => d.tier === "watch").length,
    warningCount: districts.filter((d) => d.tier === "warning").length,
    tier: overrides?.tier ?? "stale",
    isSeed: overrides?.isSeed ?? true,
    error: overrides?.error ?? null,
    provenancePath: getSourceProvenancePath("nbro_landslide"),
  };
}

/**
 * Live path: lk_dmc summary → tip `blocks.json` district/level parse.
 * Seed fallback with isSeed honesty when index or layout parse fails.
 */
export async function fetchLandslideSnapshot(): Promise<LandslideSnapshot> {
  try {
    const response = await fetch(SUMMARY_URL, {
      headers: { "User-Agent": BOT_USER_AGENT, Accept: "application/json" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return fromSeed({
        error: `lk_dmc summary HTTP ${response.status}`,
      });
    }

    const payload = (await response.json()) as {
      latest_doc_d?: {
        doc_id?: string;
        date_str?: string;
        description?: string;
        url_pdf?: string;
        time_str?: string;
      };
      time_updated?: string;
    };

    const latest = payload.latest_doc_d;
    if (!latest?.date_str || !latest.doc_id) {
      return fromSeed({ error: "lk_dmc summary missing latest doc" });
    }

    const releaseUrl = latest.url_pdf ?? landslideSeed.releaseUrl;
    const asOf = asOfIso(latest.date_str, latest.time_str);
    const freshness = computeFreshnessTier(asOf, CADENCE_MINUTES);

    const blocksResponse = await fetch(tipAssetUrl(latest.doc_id, "blocks.json"), {
      headers: { "User-Agent": BOT_USER_AGENT, Accept: "application/json" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!blocksResponse.ok) {
      return fromSeed({
        asOf: latest.date_str,
        summary: `Latest indexed DMC landslide document: ${latest.description ?? "Landslide Early Warning"} (${latest.date_str}). District risk map below is Lankawa’s curated seed overlay — tip layout parse unavailable. Not an official evacuation map.`,
        releaseUrl,
        isSeed: true,
        tier: freshness === "fresh" ? "stale" : freshness,
        error: `lk_dmc blocks HTTP ${blocksResponse.status}`,
      });
    }

    const blocks = (await blocksResponse.json()) as LandslideBlock[];
    const districts = parseLandslideBlocks(blocks);
    const active = districts.filter(
      (row) => row.tier === "watch" || row.tier === "warning",
    );

    if (active.length === 0) {
      return fromSeed({
        asOf: latest.date_str,
        summary: `Latest indexed DMC landslide document: ${latest.description ?? "Landslide Early Warning"} (${latest.date_str}). Could not parse district/level cells from the tip layout — showing curated seed overlay. Not an official evacuation map.`,
        releaseUrl,
        isSeed: true,
        tier: freshness === "fresh" ? "stale" : freshness,
        error: "lk_dmc tip blocks produced no district rows",
      });
    }

    const source = getSource("nbro_landslide");
    return {
      sourceId: landslideSeed.sourceId,
      sourceName: source?.name ?? landslideSeed.sourceName,
      asOf: latest.date_str,
      summary: `Civic republish of DMC/NBRO tip bulletin ${latest.description ?? "Landslide Early Warning"} (${latest.date_str}${latest.time_str ? ` ${latest.time_str}` : ""}). District watch/warning tiers parsed from the public lk_dmc layout index — not an official evacuation map.`,
      releaseUrl,
      nbroUrl: landslideSeed.nbroUrl,
      districts,
      watchCount: districts.filter((d) => d.tier === "watch").length,
      warningCount: districts.filter((d) => d.tier === "warning").length,
      tier: freshness,
      isSeed: false,
      error: null,
      provenancePath: getSourceProvenancePath("nbro_landslide"),
    };
  } catch (error) {
    return fromSeed({
      error: error instanceof Error ? error.message : "Landslide fetch failed",
    });
  }
}
