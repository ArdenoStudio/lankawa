import { floodIsElevated, powerNeedsAttention } from "@/lib/alert-pins";
import type { AlertSignalContext } from "@/lib/alert-pins";
import { getFxSeries } from "@/lib/economy";
import { computeFxAnomaly } from "@/lib/fx-anomaly";
import { detectFloodRateOfRise } from "@/lib/flood-rise";
import { getFuelHistorySeries, getFuelRevisionSteps } from "@/lib/fuel";
import { isInFuelRevisionWindow } from "@/lib/fuel-revision-window";
import { getDengueData } from "@/lib/health";
import { buildCseSnapshot } from "@/lib/integrations/cse";
import { fetchFirmsSnapshot } from "@/lib/integrations/firms";
import { fetchGdacsSnapshot } from "@/lib/integrations/gdacs";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";
import { fetchMetDeptWarnings } from "@/lib/integrations/metdept";
import { fetchNewsPulse } from "@/lib/integrations/news";
import { clusterHeadlines } from "@/lib/integrations/news-cluster";
import { getTendersData } from "@/lib/tenders";
import { summarizeTendersClosingSoon } from "@/lib/tender-closing";
import type { PulseSnapshot } from "@/lib/types";

const DEFAULT_FX_THRESHOLD_LKR = 1;
const DENGUE_SPIKE_PCT = 20;
const CSE_MOVE_PCT = 1;
const COL_FUEL_DELTA_LKR = 5;
const NEWS_CLUSTER_OUTLET_MIN = 3;

function fuelDayAbsDelta(
  series: Awaited<ReturnType<typeof getFuelHistorySeries>>,
): { absDelta: number | null; detail: string | null } {
  let maxAbs: number | null = null;
  let detail: string | null = null;

  for (const item of series) {
    if (item.points.length < 2) {
      continue;
    }
    const sorted = [...item.points].sort((a, b) =>
      a.recorded_at.localeCompare(b.recorded_at),
    );
    const previous = sorted[sorted.length - 2];
    const latest = sorted[sorted.length - 1];
    const delta = latest.price_lkr - previous.price_lkr;
    const abs = Math.abs(delta);
    if (maxAbs == null || abs > maxAbs) {
      maxAbs = abs;
      const sign = delta > 0 ? "+" : "";
      detail = `${item.label} ${sign}${delta.toFixed(0)} LKR/L`;
    }
  }

  return { absDelta: maxAbs, detail };
}

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

  let fuelRevisionAttention = false;
  let fuelRevisionDetail: string | null = null;
  let dengueSpikeAttention = false;
  let dengueSpikeDetail: string | null = null;
  let cseMoveAttention = false;
  let cseMoveDetail: string | null = null;
  let colBasketAttention = false;
  let colBasketDetail: string | null = null;
  let newsClusterAttention = false;
  let newsClusterDetail: string | null = null;
  let tenderClosingAttention = false;
  let tenderClosingDetail: string | null = null;

  const [
    fuelStepsResult,
    fuelSeriesResult,
    dengueResult,
    cseResult,
    newsResult,
    tendersResult,
  ] = await Promise.allSettled([
      getFuelRevisionSteps(8),
      getFuelHistorySeries(10),
      getDengueData(),
      buildCseSnapshot(),
      fetchNewsPulse(),
      getTendersData(),
    ]);

  if (fuelStepsResult.status === "fulfilled") {
    const fuelSteps = fuelStepsResult.value;
    if (isInFuelRevisionWindow(fuelSteps)) {
      fuelRevisionAttention = true;
      const latest = [...fuelSteps].sort((a, b) =>
        b.recordedAt.localeCompare(a.recordedAt),
      )[0];
      fuelRevisionDetail = latest
        ? `${latest.label} revised ${latest.recordedAt} (${latest.deltaLkr >= 0 ? "+" : ""}${latest.deltaLkr} LKR)`
        : "CPC fuel revision within last 10 days";
    }
  }

  if (dengueResult.status === "fulfilled") {
    const dengue = dengueResult.value;
    const districtSpike = dengue.districts.find(
      (district) => Math.abs(district.changePct) >= DENGUE_SPIKE_PCT,
    );
    const nationalWow = Math.abs(dengue.nationalChangePct) >= DENGUE_SPIKE_PCT;
    if (districtSpike || nationalWow) {
      dengueSpikeAttention = true;
      if (districtSpike) {
        dengueSpikeDetail = `${districtSpike.slug} ${districtSpike.changePct >= 0 ? "+" : ""}${districtSpike.changePct.toFixed(0)}% WoW`;
      } else {
        dengueSpikeDetail = `National ${dengue.nationalChangePct >= 0 ? "+" : ""}${dengue.nationalChangePct.toFixed(0)}% WoW`;
      }
    }
  }

  if (cseResult.status === "fulfilled") {
    const aspiPct = cseResult.value.aspi.changePct;
    if (aspiPct != null && Math.abs(aspiPct) >= CSE_MOVE_PCT) {
      cseMoveAttention = true;
      cseMoveDetail = `ASPI ${aspiPct >= 0 ? "+" : ""}${aspiPct.toFixed(2)}%`;
    }
  }

  if (fuelSeriesResult.status === "fulfilled") {
    const fuelDelta = fuelDayAbsDelta(fuelSeriesResult.value);
    if (
      fuelDelta.absDelta != null &&
      fuelDelta.absDelta >= COL_FUEL_DELTA_LKR
    ) {
      colBasketAttention = true;
      colBasketDetail = fuelDelta.detail;
    }
  }

  if (newsResult.status === "fulfilled") {
    const clusters = clusterHeadlines(newsResult.value.headlines, 0.35);
    const multiOutlet = clusters.find((cluster) => {
      const outletCount = new Set(
        cluster.headlines.map((item) => item.source),
      ).size;
      return outletCount >= NEWS_CLUSTER_OUTLET_MIN;
    });
    if (multiOutlet) {
      newsClusterAttention = true;
      const outletCount = new Set(
        multiOutlet.headlines.map((item) => item.source),
      ).size;
      newsClusterDetail = `${multiOutlet.topic} · ${outletCount} outlets`;
    }
  }

  if (tendersResult.status === "fulfilled") {
    const closing = summarizeTendersClosingSoon(tendersResult.value.notices);
    if (closing.count > 0) {
      tenderClosingAttention = true;
      tenderClosingDetail = closing.detail;
    }
  }

  const metFloodAttention =
    metWarning && (flood.elevated || floodRise.rising);
  const metFloodDetail = metFloodAttention
    ? [metDetail, floodRise.rising ? floodRise.detail : flood.detail]
        .filter(Boolean)
        .join(" · ") || null
    : null;

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
    fuelRevisionAttention,
    fuelRevisionDetail,
    metFloodAttention,
    metFloodDetail,
    dengueSpikeAttention,
    dengueSpikeDetail,
    cseMoveAttention,
    cseMoveDetail,
    colBasketAttention,
    colBasketDetail,
    newsClusterAttention,
    newsClusterDetail,
    tenderClosingAttention,
    tenderClosingDetail,
  };
}
