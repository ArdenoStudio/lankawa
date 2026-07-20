import irrigationGaugesSeed from "@/data/irrigation-gauges-seed.json";
import { computeFreshnessTier } from "@/lib/freshness";
import { getSource, getSourceProvenancePath } from "@/lib/sources";
import type { FloodStationLevel, FreshnessTier } from "@/lib/types";

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";

const FEATURE_SERVER_LAYER =
  process.env.IRRIGATION_GAUGES_FEATURE_SERVER ??
  "https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0";

const DASHBOARD_URL =
  "https://www.arcgis.com/apps/dashboards/2cffe83c9ff5497d97375498bdf3ff38";

const FETCH_TIMEOUT_MS = 12_000;
const CADENCE_MINUTES = 15;
/** Enough recent time-series rows to cover ~40 stations when ordered by EditDate DESC. */
const QUERY_RECORD_COUNT = 2000;

export type IrrigationAlertStatus =
  | "NORMAL"
  | "ALERT"
  | "WARNING"
  | "DANGER"
  | "UNKNOWN";

export interface IrrigationGaugeReading {
  gauge: string;
  basin: string;
  waterLevel: number | null;
  rainFall: number | null;
  alertThreshold: number | null;
  minorThreshold: number | null;
  majorThreshold: number | null;
  alertStatus: IrrigationAlertStatus;
  observedAt: string | null;
  longitude: number | null;
  latitude: number | null;
}

export interface IrrigationGaugesSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  tier: FreshnessTier;
  isSeed: boolean;
  error: string | null;
  gauges: IrrigationGaugeReading[];
  elevatedCount: number;
  summaryByStatus: Record<IrrigationAlertStatus, number>;
  honestyNote: string;
  provenancePath: string;
  dashboardUrl: string;
  featureServerUrl: string;
}

interface ArcGisFeature {
  attributes?: {
    basin?: string | null;
    gauge?: string | null;
    water_level?: number | null;
    rain_fall?: number | null;
    alertpull?: number | null;
    minorpull?: number | null;
    majorpull?: number | null;
    EditDate?: number | null;
  };
  geometry?: {
    x?: number | null;
    y?: number | null;
  };
}

interface ArcGisQueryResponse {
  features?: ArcGisFeature[];
  error?: { message?: string; code?: number };
}

const HONESTY_NOTE =
  "Irrigation Department public ArcGIS gauges (civic republish). Not an official DMC flood warning — verify local bulletins before acting.";

export function parseArcGisEditDate(editDate: number | null | undefined): string | null {
  if (editDate == null || !Number.isFinite(editDate)) {
    return null;
  }
  const ms = editDate > 1e12 ? editDate : editDate * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export function resolveGaugeAlertStatus(input: {
  waterLevel: number | null;
  alertThreshold: number | null;
  minorThreshold: number | null;
  majorThreshold: number | null;
}): IrrigationAlertStatus {
  const { waterLevel, alertThreshold, minorThreshold, majorThreshold } = input;
  if (waterLevel == null || !Number.isFinite(waterLevel)) {
    return "UNKNOWN";
  }
  if (majorThreshold != null && waterLevel >= majorThreshold) {
    return "DANGER";
  }
  if (minorThreshold != null && waterLevel >= minorThreshold) {
    return "WARNING";
  }
  if (alertThreshold != null && waterLevel >= alertThreshold) {
    return "ALERT";
  }
  return "NORMAL";
}

export function collapseLatestGauges(
  features: ArcGisFeature[],
): IrrigationGaugeReading[] {
  const latest = new Map<string, IrrigationGaugeReading>();

  for (const feature of features) {
    const attrs = feature.attributes;
    const gauge = attrs?.gauge?.trim();
    if (!gauge || latest.has(gauge)) {
      continue;
    }

    const waterLevel =
      attrs?.water_level != null && Number.isFinite(attrs.water_level)
        ? attrs.water_level
        : null;
    const rainFall =
      attrs?.rain_fall != null && Number.isFinite(attrs.rain_fall)
        ? attrs.rain_fall
        : null;
    const alertThreshold =
      attrs?.alertpull != null && Number.isFinite(attrs.alertpull)
        ? attrs.alertpull
        : null;
    const minorThreshold =
      attrs?.minorpull != null && Number.isFinite(attrs.minorpull)
        ? attrs.minorpull
        : null;
    const majorThreshold =
      attrs?.majorpull != null && Number.isFinite(attrs.majorpull)
        ? attrs.majorpull
        : null;

    latest.set(gauge, {
      gauge,
      basin: attrs?.basin?.trim() || "",
      waterLevel,
      rainFall,
      alertThreshold,
      minorThreshold,
      majorThreshold,
      alertStatus: resolveGaugeAlertStatus({
        waterLevel,
        alertThreshold,
        minorThreshold,
        majorThreshold,
      }),
      observedAt: parseArcGisEditDate(attrs?.EditDate),
      longitude:
        feature.geometry?.x != null && Number.isFinite(feature.geometry.x)
          ? feature.geometry.x
          : null,
      latitude:
        feature.geometry?.y != null && Number.isFinite(feature.geometry.y)
          ? feature.geometry.y
          : null,
    });
  }

  return [...latest.values()].sort((a, b) => {
    const rank = (status: IrrigationAlertStatus) => {
      switch (status) {
        case "DANGER":
          return 0;
        case "WARNING":
          return 1;
        case "ALERT":
          return 2;
        case "UNKNOWN":
          return 3;
        default:
          return 4;
      }
    };
    const byStatus = rank(a.alertStatus) - rank(b.alertStatus);
    if (byStatus !== 0) {
      return byStatus;
    }
    return (b.waterLevel ?? -Infinity) - (a.waterLevel ?? -Infinity);
  });
}

export function toFloodStationLevel(
  reading: IrrigationGaugeReading,
): FloodStationLevel {
  return {
    stationName: reading.gauge,
    riverName: reading.basin,
    waterLevel: reading.waterLevel ?? 0,
    alertStatus: reading.alertStatus,
    remarks:
      reading.rainFall != null ? `Rain ${reading.rainFall.toFixed(1)} mm` : "",
    timestamp: reading.observedAt ?? "",
  };
}

function emptySummary(): Record<IrrigationAlertStatus, number> {
  return {
    NORMAL: 0,
    ALERT: 0,
    WARNING: 0,
    DANGER: 0,
    UNKNOWN: 0,
  };
}

function summarize(
  gauges: IrrigationGaugeReading[],
): Record<IrrigationAlertStatus, number> {
  const summary = emptySummary();
  for (const gauge of gauges) {
    summary[gauge.alertStatus] += 1;
  }
  return summary;
}

function gaugesFromSeed(): IrrigationGaugeReading[] {
  return irrigationGaugesSeed.gauges.map((row) => {
    const waterLevel = row.waterLevel;
    const alertThreshold = row.alertThreshold;
    const minorThreshold = row.minorThreshold;
    const majorThreshold = row.majorThreshold;
    return {
      gauge: row.gauge,
      basin: row.basin,
      waterLevel,
      rainFall: row.rainFall,
      alertThreshold,
      minorThreshold,
      majorThreshold,
      alertStatus: resolveGaugeAlertStatus({
        waterLevel,
        alertThreshold,
        minorThreshold,
        majorThreshold,
      }),
      observedAt: row.observedAt,
      longitude: row.longitude,
      latitude: row.latitude,
    } satisfies IrrigationGaugeReading;
  });
}

function fromSeed(overrides?: {
  error?: string | null;
  tier?: FreshnessTier;
}): IrrigationGaugesSnapshot {
  const source = getSource("irrigation_arcgis_gauges");
  const gauges = gaugesFromSeed();
  const summaryByStatus = summarize(gauges);
  const elevatedCount =
    summaryByStatus.ALERT +
    summaryByStatus.WARNING +
    summaryByStatus.DANGER;

  return {
    sourceId: irrigationGaugesSeed.sourceId,
    sourceName: source?.name ?? irrigationGaugesSeed.sourceName,
    asOf: irrigationGaugesSeed.asOf,
    tier: overrides?.tier ?? "stale",
    isSeed: true,
    error: overrides?.error ?? null,
    gauges,
    elevatedCount,
    summaryByStatus,
    honestyNote: HONESTY_NOTE,
    provenancePath: getSourceProvenancePath("irrigation_arcgis_gauges"),
    dashboardUrl: irrigationGaugesSeed.dashboardUrl,
    featureServerUrl: irrigationGaugesSeed.featureServerUrl,
  };
}

function buildQueryUrl(): string {
  const params = new URLSearchParams({
    where: "1=1",
    outFields:
      "basin,gauge,water_level,rain_fall,alertpull,minorpull,majorpull,EditDate",
    orderByFields: "EditDate DESC",
    resultRecordCount: String(QUERY_RECORD_COUNT),
    returnGeometry: "true",
    outSR: "4326",
    f: "json",
  });
  return `${FEATURE_SERVER_LAYER}/query?${params.toString()}`;
}

/**
 * Latest-per-gauge readings from Irrigation Dept public ArcGIS FeatureServer.
 * Falls back to curated seed when the layer is unreachable or empty.
 */
export async function fetchIrrigationGaugesSnapshot(): Promise<IrrigationGaugesSnapshot> {
  try {
    const response = await fetch(buildQueryUrl(), {
      headers: {
        Accept: "application/json",
        "User-Agent": BOT_USER_AGENT,
      },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return fromSeed({
        error: `Irrigation ArcGIS HTTP ${response.status}`,
      });
    }

    const payload = (await response.json()) as ArcGisQueryResponse;
    if (payload.error?.message) {
      return fromSeed({
        error: `Irrigation ArcGIS: ${payload.error.message}`,
      });
    }

    const gauges = collapseLatestGauges(payload.features ?? []);
    if (gauges.length === 0) {
      return fromSeed({ error: "Irrigation ArcGIS returned no gauges" });
    }

    const asOf =
      gauges
        .map((gauge) => gauge.observedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1) ?? new Date().toISOString();

    const summaryByStatus = summarize(gauges);
    const elevatedCount =
      summaryByStatus.ALERT +
      summaryByStatus.WARNING +
      summaryByStatus.DANGER;
    const source = getSource("irrigation_arcgis_gauges");

    return {
      sourceId: "irrigation_arcgis_gauges",
      sourceName: source?.name ?? "Irrigation Department river gauges (ArcGIS)",
      asOf,
      tier: computeFreshnessTier(asOf, CADENCE_MINUTES),
      isSeed: false,
      error: null,
      gauges,
      elevatedCount,
      summaryByStatus,
      honestyNote: HONESTY_NOTE,
      provenancePath: getSourceProvenancePath("irrigation_arcgis_gauges"),
      dashboardUrl: DASHBOARD_URL,
      featureServerUrl: FEATURE_SERVER_LAYER,
    };
  } catch (error) {
    return fromSeed({
      error:
        error instanceof Error
          ? error.message
          : "Irrigation ArcGIS fetch failed",
    });
  }
}
