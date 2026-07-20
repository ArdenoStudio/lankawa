import generationData from "@/data/pucsl-generation-mix-seed.json";
import type { TimeValue } from "@/lib/charts/mono";

export interface GenerationMixShare {
  id: string;
  label: string;
  sharePct: number;
}

export interface GenerationMixSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  unit: string;
  methodologyNote: string;
  mix: GenerationMixShare[];
  history: Array<{
    date: string;
    hydro: number;
    thermal: number;
    renewable: number;
    other: number;
  }>;
}

const seed = generationData as GenerationMixSnapshot;

export function getPucslGenerationMix(): GenerationMixSnapshot {
  return seed;
}

/** Hydro share series for the tariff-card spark. */
export function getHydroShareSeries(
  snapshot: GenerationMixSnapshot = seed,
): TimeValue[] {
  return snapshot.history.map((row) => ({
    date: row.date,
    value: row.hydro,
  }));
}

export function primaryMixLabel(
  snapshot: GenerationMixSnapshot = seed,
): GenerationMixShare | undefined {
  return [...snapshot.mix].sort((a, b) => b.sharePct - a.sharePct)[0];
}
