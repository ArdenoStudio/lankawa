import {
  fetchFloodAlertSummary,
  fetchFloodLevelHistory,
  type FloodHistoryPoint,
} from "@/lib/integrations/flood";

export interface FloodRiseSignal {
  rising: boolean;
  detail: string | null;
  stationName: string | null;
  cmPerHour: number | null;
}

const LOOKBACK_HOURS = 6;
/** ~5 cm/h sustained rise on river gauges is civic-notable. */
const RISE_THRESHOLD_CM_H = 5;

export function computeStationRiseRate(
  points: FloodHistoryPoint[],
  lookbackHours = LOOKBACK_HOURS,
): number | null {
  if (points.length < 2) {
    return null;
  }

  const sorted = [...points]
    .filter((point) => point.timestamp)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

  const latest = sorted[sorted.length - 1];
  const latestMs = new Date(latest.timestamp).getTime();
  if (!Number.isFinite(latestMs)) {
    return null;
  }

  const windowStart = latestMs - lookbackHours * 3_600_000;
  const earlier =
    sorted.find((point) => new Date(point.timestamp).getTime() >= windowStart) ??
    sorted[0];

  const earlierMs = new Date(earlier.timestamp).getTime();
  const hours = (latestMs - earlierMs) / 3_600_000;
  if (hours < 0.5) {
    return null;
  }

  // Flood API levels are typically metres; convert delta to cm/h.
  const deltaM = latest.waterLevel - earlier.waterLevel;
  return (deltaM * 100) / hours;
}

export async function detectFloodRateOfRise(
  maxStations = 4,
): Promise<FloodRiseSignal> {
  try {
    const summary = await fetchFloodAlertSummary();
    const elevatedStations = summary
      .filter((level) => {
        const key = level.alertLevel.toUpperCase();
        return (
          level.count > 0 &&
          key !== "NORMAL" &&
          key !== "NONE" &&
          key !== "UNKNOWN" &&
          key !== "NO ALERT"
        );
      })
      .flatMap((level) => level.stations)
      .slice(0, maxStations);

    if (elevatedStations.length === 0) {
      return {
        rising: false,
        detail: null,
        stationName: null,
        cmPerHour: null,
      };
    }

    const rates = await Promise.all(
      elevatedStations.map(async (stationName) => {
        try {
          const { points } = await fetchFloodLevelHistory(stationName, 24);
          return {
            stationName,
            cmPerHour: computeStationRiseRate(points),
          };
        } catch {
          return { stationName, cmPerHour: null as number | null };
        }
      }),
    );

    const rising = rates
      .filter(
        (row): row is { stationName: string; cmPerHour: number } =>
          row.cmPerHour != null && row.cmPerHour >= RISE_THRESHOLD_CM_H,
      )
      .sort((a, b) => b.cmPerHour - a.cmPerHour);

    if (rising.length === 0) {
      return {
        rising: false,
        detail: null,
        stationName: null,
        cmPerHour: null,
      };
    }

    const top = rising[0];
    return {
      rising: true,
      stationName: top.stationName,
      cmPerHour: top.cmPerHour,
      detail: `${top.stationName} rising ${top.cmPerHour.toFixed(1)} cm/h (≥ ${RISE_THRESHOLD_CM_H})`,
    };
  } catch {
    return {
      rising: false,
      detail: null,
      stationName: null,
      cmPerHour: null,
    };
  }
}
