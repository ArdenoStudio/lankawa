import { floodIsElevated, powerNeedsAttention } from "@/lib/alert-pins";
import type { AlertSignalContext } from "@/lib/alert-pins";
import { getFxSeries } from "@/lib/economy";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";
import { fetchMetDeptWarnings } from "@/lib/integrations/metdept";
import type { PulseSnapshot } from "@/lib/types";

const DEFAULT_FX_THRESHOLD_LKR = 1;

export async function buildAlertSignalContext(
  snapshot: PulseSnapshot,
): Promise<AlertSignalContext> {
  let fxAbsDeltaLkr: number | null = null;

  try {
    const fxSeries = await getFxSeries();
    if (fxSeries.length >= 2) {
      const sorted = [...fxSeries].sort((a, b) => a.date.localeCompare(b.date));
      const previous = sorted[sorted.length - 2];
      const latest = sorted[sorted.length - 1];
      fxAbsDeltaLkr = Math.abs(latest.sellRate - previous.sellRate);
    }
  } catch {
    fxAbsDeltaLkr = null;
  }

  const flood = floodIsElevated(snapshot.flood);
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

  return {
    fxAbsDeltaLkr,
    fxThresholdLkr: DEFAULT_FX_THRESHOLD_LKR,
    floodElevated: flood.elevated,
    floodDetail: flood.detail,
    powerAttention,
    powerDetail,
    metWarning,
    metDetail,
    landslideAttention,
    landslideDetail,
  };
}
