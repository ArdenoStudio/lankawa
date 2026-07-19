import tariffData from "@/data/pucsl-tariff-seed.json";

export interface TariffSlab {
  id: string;
  fromKwh: number;
  toKwh: number | null;
  energyLkrPerKwh: number;
  fixedLkrPerMonth: number | null;
}

export interface TariffTrack {
  id: string;
  label: string;
  slabs: TariffSlab[];
}

export interface PucslTariffSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  effectiveFrom: string;
  category: string;
  methodologyNote: string;
  decisionUrl: string;
  tracks: TariffTrack[];
}

export interface TariffEstimate {
  unitsKwh: number;
  trackId: string;
  energyLkr: number;
  fixedLkr: number;
  totalLkr: number;
}

const seed = tariffData as PucslTariffSnapshot;

export function getPucslTariffSnapshot(): PucslTariffSnapshot {
  return seed;
}

function unitsInSlab(
  unitsKwh: number,
  fromKwh: number,
  toKwh: number | null,
): number {
  if (unitsKwh < fromKwh) {
    return 0;
  }

  const upper = toKwh ?? Number.POSITIVE_INFINITY;
  const start = fromKwh === 0 ? 0 : fromKwh - 1;
  const end = Math.min(unitsKwh, upper);
  return Math.max(0, end - start);
}

/** Indicative domestic bill estimate using progressive slabs for the matching track. */
export function estimateDomesticBill(unitsKwh: number): TariffEstimate | null {
  if (!Number.isFinite(unitsKwh) || unitsKwh < 0) {
    return null;
  }

  const rounded = Math.floor(unitsKwh);
  const track =
    rounded <= 60
      ? seed.tracks.find((item) => item.id === "upto_60")
      : seed.tracks.find((item) => item.id === "above_60");

  if (!track) {
    return null;
  }

  let energyLkr = 0;
  let fixedLkr = 0;

  for (const slab of track.slabs) {
    const units = unitsInSlab(rounded, slab.fromKwh, slab.toKwh);
    energyLkr += units * slab.energyLkrPerKwh;
    if (units > 0 && slab.fixedLkrPerMonth != null) {
      fixedLkr = slab.fixedLkrPerMonth;
    }
  }

  return {
    unitsKwh: rounded,
    trackId: track.id,
    energyLkr: Number(energyLkr.toFixed(2)),
    fixedLkr,
    totalLkr: Number((energyLkr + fixedLkr).toFixed(2)),
  };
}
