import listingHistory from "@/data/property-listing-history-seed.json";
import type { TimeValue } from "@/lib/charts/mono";
import type { PropertySnapshot } from "@/lib/types";

export interface PropertyListingHistoryPoint {
  date: string;
  listingCount: number;
}

export interface PropertyListingHistorySnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  methodologyNote: string;
  series: PropertyListingHistoryPoint[];
}

const seed = listingHistory as PropertyListingHistorySnapshot;

export function getPropertyListingHistorySeed(): PropertyListingHistorySnapshot {
  return seed;
}

export function sumDistrictListingCounts(
  snapshot: PropertySnapshot,
): number {
  return snapshot.districts.reduce(
    (sum, district) => sum + (district.listingCount ?? 0),
    0,
  );
}

/** Merge live national count onto seed history for the property spark. */
export function buildListingCountSeries(
  snapshot: PropertySnapshot,
  history: PropertyListingHistorySnapshot = seed,
): { series: TimeValue[]; listingCount: number; isSeed: boolean } {
  const liveTotal = sumDistrictListingCounts(snapshot);
  const base = history.series.map((point) => ({
    date: point.date,
    value: point.listingCount,
  }));

  if (liveTotal <= 0) {
    const latest = base[base.length - 1]?.value ?? 0;
    return {
      series: base,
      listingCount: latest,
      isSeed: true,
    };
  }

  const asOf = snapshot.asOf.slice(0, 10);
  const withoutToday = base.filter((point) => point.date !== asOf);
  const series = [...withoutToday, { date: asOf, value: liveTotal }];
  return {
    series,
    listingCount: liveTotal,
    isSeed: snapshot.sourceId === "propertylk_seed",
  };
}

export function listingCountDeltaPct(series: TimeValue[]): number | null {
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
