import type { FxSeriesPoint } from "@/lib/types";

export interface FxAnomalyResult {
  absDelta: number | null;
  signedDelta: number | null;
  madZ: number | null;
  unusual: boolean;
  sampleSize: number;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Day-over-day FX move scored against median absolute deviation of recent Δs.
 * Unusual when |z| ≥ 2.5 (or absolute move ≥ 1.5 LKR with thin history).
 */
export function computeFxAnomaly(
  series: FxSeriesPoint[],
  options?: { zThreshold?: number; absFloorLkr?: number },
): FxAnomalyResult {
  const zThreshold = options?.zThreshold ?? 2.5;
  const absFloorLkr = options?.absFloorLkr ?? 1.5;
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 2) {
    return {
      absDelta: null,
      signedDelta: null,
      madZ: null,
      unusual: false,
      sampleSize: 0,
    };
  }

  const deltas: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    deltas.push(sorted[i].sellRate - sorted[i - 1].sellRate);
  }

  const signedDelta = deltas[deltas.length - 1];
  const absDelta = Math.abs(signedDelta);
  const med = median(deltas);
  const absDevs = deltas.map((d) => Math.abs(d - med));
  const mad = median(absDevs);
  const madZ =
    mad > 1e-9 ? (signedDelta - med) / (1.4826 * mad) : absDelta > 0 ? 3 : 0;

  const unusual =
    deltas.length >= 5
      ? Math.abs(madZ) >= zThreshold
      : absDelta >= absFloorLkr;

  return {
    absDelta,
    signedDelta,
    madZ: Number.isFinite(madZ) ? madZ : null,
    unusual,
    sampleSize: deltas.length,
  };
}
