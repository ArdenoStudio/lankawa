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

export function getTreasuryYieldSnapshot(): TreasuryYieldSnapshot {
  return snapshot;
}
