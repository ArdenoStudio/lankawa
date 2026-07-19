import { floodIsElevated, powerNeedsAttention } from "@/lib/alert-pins";
import type { AlertSignalContext } from "@/lib/alert-pins";
import { getFxSeries } from "@/lib/economy";
import { computeFxAnomaly } from "@/lib/fx-anomaly";
import { detectFloodRateOfRise } from "@/lib/flood-rise";
import { fetchFirmsSnapshot } from "@/lib/integrations/firms";
import { fetchGdacsSnapshot } from "@/lib/integrations/gdacs";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";
import { fetchMetDeptWarnings } from "@/lib/integrations/metdept";
import type { PulseSnapshot } from "@/lib/types";

const DEFAULT_FX_THRESHOLD_LKR = 1;

export async function buildAlertSignalContext(
  snapshot: PulseSnapshot,
): Promise<AlertSignalContext> {
  let fxAbsDeltaLkr: number | null = null;
  let fxUnusual = false;
  let fxAnomalyDetail: string | null = null;

  try {
    const fxSeries = await getFxSeries();
    const anomaly = computeFxAnomaly(fxSeries);
    fxAbsDeltaLkr = anomaly.absDelta;
    fxUnusual = anomaly.unusual;
    if (anomaly.unusual && anomaly.absDelta != null) {
      const zPart =
        anomaly.madZ != null ? ` · z≈${anomaly.madZ.toFixed(1)}` : "";
      fxAnomalyDetail = `USD/LKR Δ ${anomaly.signedDelta != null && anomaly.signedDelta > 0 ? "+" : ""}${anomaly.signedDelta?.toFixed(2)} LKR${zPart}`;
    } else if (fxSeries.length >= 2) {
      const sorted = [...fxSeries].sort((a, b) => a.date.localeCompare(b.date));
      fxAbsDeltaLkr = Math.abs(
        sorted[sorted.length - 1].sellRate - sorted[sorted.length - 2].sellRate,
      );
    }
  } catch {
    fxAbsDeltaLkr = null;
    fxUnusual = false;
    fxAnomalyDetail = null;
  }

  const flood = floodIsElevated(snapshot.flood);
  const floodRise = await detectFloodRateOfRise();
  const powerMetric = snapshot.metrics.find(
    (metric) => metric.id === "power_status",
  );
  const powerAttention = powerNeedsAttention(powerMetric?.value);
  const powerDetail = powerMetric
    ? `${powerMetric.value}${powerMetric.note ? ` — ${powerMetric.note}` : ""}`
    : null;

  let metWarning = false;
  let metDetail: string | null = null;

  try {
    const met = await fetchMetDeptWarnings();
    const active =
      met?.warnings.filter((warning) =>
        ["yellow", "amber", "red"].includes(warning.level),
      ) ?? [];
    if (active.length > 0) {
      metWarning = true;
      metDetail = active
        .slice(0, 2)
        .map((warning) => warning.warningLabel ?? warning.name)
        .join(" · ");
    }
  } catch {
    metWarning = false;
    metDetail = null;
  }

  let landslideAttention = false;
  let landslideDetail: string | null = null;

  try {
    const landslides = await fetchLandslideSnapshot();
    if (landslides.watchCount + landslides.warningCount > 0) {
      landslideAttention = true;
      landslideDetail = `${landslides.watchCount} watch · ${landslides.warningCount} warning`;
    }
  } catch {
    landslideAttention = false;
    landslideDetail = null;
  }

  let fireAttention = false;
  let fireDetail: string | null = null;
  let gdacsAttention = false;
  let gdacsDetail: string | null = null;

  try {
    const [firms, gdacs] = await Promise.all([
      fetchFirmsSnapshot(),
      fetchGdacsSnapshot(),
    ]);
    if (firms.fires.length > 0) {
      fireAttention = true;
      fireDetail = `${firms.fires.length} fire pin${firms.fires.length === 1 ? "" : "s"} (VIIRS ${firms.dayRange}d)`;
    }
    const hot = gdacs.events.filter((event) =>
      ["Orange", "Red"].includes(event.alertLevel),
    );
    if (hot.length > 0) {
      gdacsAttention = true;
      gdacsDetail = hot
        .slice(0, 2)
        .map((event) => `${event.alertLevel} ${event.eventType}: ${event.name}`)
        .join(" · ");
    }
  } catch {
    fireAttention = false;
    fireDetail = null;
    gdacsAttention = false;
    gdacsDetail = null;
  }

  return {
    fxAbsDeltaLkr,
    fxThresholdLkr: DEFAULT_FX_THRESHOLD_LKR,
    fxUnusual,
    fxAnomalyDetail,
    floodElevated: flood.elevated,
    floodDetail: flood.detail,
    floodRising: floodRise.rising,
    floodRisingDetail: floodRise.detail,
    powerAttention,
    powerDetail,
    metWarning,
    metDetail,
    landslideAttention,
    landslideDetail,
    fireAttention,
    fireDetail,
    gdacsAttention,
    gdacsDetail,
  };
}
