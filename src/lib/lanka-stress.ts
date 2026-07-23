import { powerNeedsAttention } from "@/lib/alert-pins";
import { getFxSeries } from "@/lib/economy";
import { computeFxAnomaly } from "@/lib/fx-anomaly";
import { getDengueData } from "@/lib/health";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";
import { fetchMetDeptWarnings } from "@/lib/integrations/metdept";
import { buildPulseSnapshot } from "@/lib/pulse";
import { getSource, getSourceProvenancePath } from "@/lib/sources";
import type { FloodAlertSummary, PulseSnapshot } from "@/lib/types";

export const LANKA_STRESS_SOURCE_ID = "lanka_stress_index";

export type LankaStressTier = "calm" | "watch" | "elevated" | "severe";

export interface LankaStressComponent {
  id: string;
  label: string;
  weight: number;
  score: number;
  available: boolean;
  detail: string | null;
}

export interface LankaStressIndex {
  score: number;
  tier: LankaStressTier;
  components: LankaStressComponent[];
  asOf: string;
  methodology: string[];
  isPartial: boolean;
  sourceId: typeof LANKA_STRESS_SOURCE_ID;
  provenancePath: string;
}

export interface LankaStressInputs {
  fxUnusual: boolean | null;
  fxMadZ: number | null;
  fxAbsDelta: number | null;
  floodElevatedStationCount: number | null;
  powerStatus: string | null;
  metWarningActive: boolean | null;
  landslideWarningDistricts: number | null;
  dengueHighDistricts: number | null;
  asOf?: string;
}

const METHODOLOGY = [
  "Composite civic stress (0–100) from available pulse signals — not an official government index.",
  "FX: MAD-z / unusual day-over-day USD/LKR move (max 20).",
  "Flood: count of non-NORMAL river stations (max 25).",
  "Power: CEB scheduled or active outage status (max 20).",
  "Met: active yellow/amber/red Met Dept warning (max 15).",
  "Landslide: districts on NBRO watch/warning overlay (max 15).",
  "Dengue (optional): high-risk districts in weekly snapshot (max 10).",
  "Missing inputs contribute 0 and set isPartial; sum is capped at 100.",
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function tierFromScore(score: number): LankaStressTier {
  if (score >= 75) return "severe";
  if (score >= 50) return "elevated";
  if (score >= 25) return "watch";
  return "calm";
}

function elevatedFloodStationCount(
  flood: FloodAlertSummary[],
): number {
  return flood.reduce((sum, row) => {
    const key = row.alertLevel.toUpperCase();
    if (
      row.count <= 0 ||
      key === "NORMAL" ||
      key === "NONE" ||
      key === "UNKNOWN" ||
      key === "NO ALERT"
    ) {
      return sum;
    }
    return sum + row.count;
  }, 0);
}

/**
 * Pure scorer — unit-test with fixtures. Each component is 0–weight; sum capped 100.
 */
export function computeLankaStressIndex(
  inputs: LankaStressInputs,
): LankaStressIndex {
  const components: LankaStressComponent[] = [];

  // FX anomaly / band stress — max 20
  {
    const weight = 20;
    let score = 0;
    let available = inputs.fxUnusual != null;
    let detail: string | null = null;
    if (inputs.fxUnusual === true) {
      const zBoost =
        inputs.fxMadZ != null
          ? clamp(Math.abs(inputs.fxMadZ) / 4, 0, 1)
          : 0.6;
      score = Math.round(weight * (0.55 + 0.45 * zBoost));
      detail =
        inputs.fxAbsDelta != null
          ? `Unusual FX move · |Δ| ${inputs.fxAbsDelta.toFixed(2)} LKR`
          : "Unusual FX move";
    } else if (inputs.fxUnusual === false) {
      score = 0;
      detail = "FX within recent band";
    } else {
      available = false;
      detail = "FX series unavailable";
    }
    components.push({
      id: "fx",
      label: "FX anomaly",
      weight,
      score,
      available,
      detail,
    });
  }

  // Flood elevated stations — max 25
  {
    const weight = 25;
    const count = inputs.floodElevatedStationCount;
    const available = count != null;
    const score = available
      ? Math.round(clamp(count / 12, 0, 1) * weight)
      : 0;
    components.push({
      id: "flood",
      label: "Flood stations elevated",
      weight,
      score,
      available,
      detail: available
        ? `${count} non-NORMAL station${count === 1 ? "" : "s"}`
        : "Flood summary unavailable",
    });
  }

  // Power — max 20
  {
    const weight = 20;
    const status = inputs.powerStatus;
    const available = status != null && status.trim() !== "";
    let score = 0;
    let detail: string | null = "Power status unavailable";
    if (available) {
      const lower = status.toLowerCase();
      if (lower.includes("outage") || lower.includes("active")) {
        score = weight;
        detail = status;
      } else if (
        lower.includes("scheduled") ||
        powerNeedsAttention(status)
      ) {
        score = Math.round(weight * 0.6);
        detail = status;
      } else {
        score = 0;
        detail = status;
      }
    }
    components.push({
      id: "power",
      label: "Power interruptions",
      weight,
      score,
      available,
      detail,
    });
  }

  // Met warning — max 15
  {
    const weight = 15;
    const available = inputs.metWarningActive != null;
    const score =
      available && inputs.metWarningActive ? weight : 0;
    components.push({
      id: "met",
      label: "Met Dept warning",
      weight,
      score,
      available,
      detail: available
        ? inputs.metWarningActive
          ? "Active yellow/amber/red warning"
          : "No active Met warning"
        : "Met Dept feed unavailable",
    });
  }

  // Landslide districts — max 15
  {
    const weight = 15;
    const count = inputs.landslideWarningDistricts;
    const available = count != null;
    const score = available
      ? Math.round(clamp(count / 8, 0, 1) * weight)
      : 0;
    components.push({
      id: "landslide",
      label: "Landslide watch/warning districts",
      weight,
      score,
      available,
      detail: available
        ? `${count} district${count === 1 ? "" : "s"} on overlay`
        : "Landslide overlay unavailable",
    });
  }

  // Dengue high — max 10 (optional)
  {
    const weight = 10;
    const count = inputs.dengueHighDistricts;
    const available = count != null;
    const score = available
      ? Math.round(clamp(count / 6, 0, 1) * weight)
      : 0;
    components.push({
      id: "dengue",
      label: "Dengue high-risk districts",
      weight,
      score,
      available,
      detail: available
        ? `${count} high-risk district${count === 1 ? "" : "s"}`
        : "Dengue snapshot unavailable",
    });
  }

  const raw = components.reduce((sum, component) => sum + component.score, 0);
  const score = Math.min(100, raw);
  const isPartial = components.some((component) => !component.available);
  const source = getSource(LANKA_STRESS_SOURCE_ID);

  return {
    score,
    tier: tierFromScore(score),
    components,
    asOf: inputs.asOf ?? new Date().toISOString(),
    methodology: [...METHODOLOGY],
    isPartial,
    sourceId: LANKA_STRESS_SOURCE_ID,
    provenancePath:
      source != null
        ? getSourceProvenancePath(LANKA_STRESS_SOURCE_ID)
        : `/sources/${LANKA_STRESS_SOURCE_ID}`,
  };
}

export async function buildLankaStressIndex(
  pulse?: PulseSnapshot,
): Promise<LankaStressIndex> {
  const snapshot = pulse ?? (await buildPulseSnapshot());
  const asOf = snapshot.generatedAt;

  let fxUnusual: boolean | null = null;
  let fxMadZ: number | null = null;
  let fxAbsDelta: number | null = null;
  try {
    const fxSeries = await getFxSeries();
    if (fxSeries.length >= 2) {
      const anomaly = computeFxAnomaly(fxSeries);
      fxUnusual = anomaly.unusual;
      fxMadZ = anomaly.madZ;
      fxAbsDelta = anomaly.absDelta;
    } else {
      fxUnusual = null;
    }
  } catch {
    fxUnusual = null;
  }

  const powerMetric = snapshot.metrics.find(
    (metric) => metric.id === "power_status",
  );
  const powerStatus = powerMetric?.value ?? null;

  let metWarningActive: boolean | null = null;
  try {
    const met = await fetchMetDeptWarnings();
    if (met == null) {
      metWarningActive = null;
    } else {
      metWarningActive = met.warnings.some((warning) =>
        ["yellow", "amber", "red"].includes(warning.level),
      );
    }
  } catch {
    metWarningActive = null;
  }

  let landslideWarningDistricts: number | null = null;
  try {
    const landslides = await fetchLandslideSnapshot();
    landslideWarningDistricts = landslides.districts.filter(
      (row) => row.tier === "watch" || row.tier === "warning",
    ).length;
  } catch {
    landslideWarningDistricts = null;
  }

  let dengueHighDistricts: number | null = null;
  try {
    const dengue = await getDengueData();
    dengueHighDistricts = dengue.districts.filter(
      (row) => row.riskLevel === "high",
    ).length;
  } catch {
    dengueHighDistricts = null;
  }

  // Treat flood as unavailable when the flood source is down; otherwise use
  // elevated (non-NORMAL) station counts — including zero when all NORMAL.
  const floodSource = snapshot.sources.find(
    (source) => source.id === "lk_flood_api",
  );
  const floodElevatedStationCount =
    floodSource?.tier === "down"
      ? null
      : elevatedFloodStationCount(snapshot.flood);

  return computeLankaStressIndex({
    fxUnusual,
    fxMadZ,
    fxAbsDelta,
    floodElevatedStationCount,
    powerStatus,
    metWarningActive,
    landslideWarningDistricts,
    dengueHighDistricts,
    asOf,
  });
}
