import treasuryData from "@/data/cbsl-treasury-seed.json";

export interface TreasuryYieldSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  wayr: number;
  tbill91: number;
  tbill182: number;
  tbill364: number;
  unit: string;
  note: string;
}

const snapshot = treasuryData as TreasuryYieldSnapshot;

/**
 * CBSL T-bill / WAYR snapshot.
 *
 * Live path (not wired yet): scrape or parse CBSL auction / secondary-market
 * tables from https://www.cbsl.gov.lk (rates & indicators → Treasury bills /
 * government securities). No stable public JSON was found for a quick adapter;
 * FoodLK’s CBSL daily *price report* PDF is commodity prices, not T-bill yields.
 * Until a canary scrape lands, return the curated seed with honest labelling.
 */
export function getTreasuryYieldSnapshot(): TreasuryYieldSnapshot {
  return {
    ...snapshot,
    note:
      snapshot.note ||
      "Seed WAYR / T-bill yields — curated from public CBSL auction summaries. Live scrape path documented in treasury.ts; not yet wired.",
  };
}
