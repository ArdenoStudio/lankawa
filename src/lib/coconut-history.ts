import coconutHistory from "@/data/coconut-index-history-seed.json";
import type { TimeValue } from "@/lib/charts/mono";

export interface CoconutHistoryPoint {
  date: string;
  priceLkr: number;
}

export interface CoconutHistorySnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  unit: string;
  itemUnit: string;
  methodologyNote: string;
  series: CoconutHistoryPoint[];
}

const seed = coconutHistory as CoconutHistorySnapshot;

export function getCoconutHistorySnapshot(): CoconutHistorySnapshot {
  return seed;
}

export function getCoconutSparkSeries(
  days = 30,
  snapshot: CoconutHistorySnapshot = seed,
): TimeValue[] {
  const cutoff = Date.now() - days * 86_400_000;
  return snapshot.series
    .filter((point) => Date.parse(point.date) >= cutoff)
    .map((point) => ({ date: point.date, value: point.priceLkr }));
}

export function coconutDeltaPct(series: TimeValue[]): number | null {
  if (series.length < 2) {
    return null;
  }
  const first = series[0].value;
  const last = series[series.length - 1].value;
  if (first === 0) {
    return null;
  }
  return ((last - first) / first) * 100;
}
