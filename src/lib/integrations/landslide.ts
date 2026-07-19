import landslideSeed from "@/data/landslide-seed.json";
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

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";
const SUMMARY_URL =
  "https://raw.githubusercontent.com/nuuuwan/lk_dmc/data_lk_dmc_landslide_warnings/data/lk_dmc_landslide_warnings/summary.json";

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

function fromSeed(overrides?: {
  asOf?: string;
  summary?: string;
  releaseUrl?: string;
  isSeed?: boolean;
  tier?: FreshnessTier;
  error?: string | null;
}): LandslideSnapshot {
  const source = getSource("nbro_landslide");
  const districts = landslideSeed.districts.map((district) => ({
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
 * Best-effort: confirm a recent DMC/NBRO warning document exists via the
 * community-maintained lk_dmc index. District tiers still come from Lankawa
 * seed until we have a structured district parse — honesty via isSeed.
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
        date_str?: string;
        description?: string;
        url_pdf?: string;
      };
      time_updated?: string;
    };

    const latest = payload.latest_doc_d;
    if (!latest?.date_str) {
      return fromSeed({ error: "lk_dmc summary missing latest doc" });
    }

    return fromSeed({
      asOf: latest.date_str,
      summary: `Latest indexed DMC landslide document: ${latest.description ?? "Landslide Early Warning"} (${latest.date_str}). District risk map below is Lankawa’s curated seed overlay until structured DS-level parse lands — not an official evacuation map.`,
      releaseUrl: latest.url_pdf ?? landslideSeed.releaseUrl,
      isSeed: true,
      tier: "stale",
      error: null,
    });
  } catch (error) {
    return fromSeed({
      error: error instanceof Error ? error.message : "Landslide fetch failed",
    });
  }
}
