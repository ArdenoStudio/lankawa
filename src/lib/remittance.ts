import remittanceData from "@/data/remittance-tt-seed.json";

export interface RemittanceBankQuote {
  id: string;
  name: string;
  buyLkr: number;
  sellLkr: number;
  note: string;
  spreadLkr: number;
}

export interface RemittanceTtSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  corridor: string;
  banks: RemittanceBankQuote[];
  bestBuy: RemittanceBankQuote;
  bestSell: RemittanceBankQuote;
  isSeed: boolean;
}

const seed = remittanceData;

export function getRemittanceTtSnapshot(): RemittanceTtSnapshot {
  const banks = seed.banks.map((bank) => ({
    ...bank,
    spreadLkr: Number((bank.sellLkr - bank.buyLkr).toFixed(2)),
  }));

  const bestBuy = [...banks].sort((a, b) => b.buyLkr - a.buyLkr)[0];
  const bestSell = [...banks].sort((a, b) => a.sellLkr - b.sellLkr)[0];

  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    methodologyNote: seed.methodologyNote,
    corridor: seed.corridor,
    banks,
    bestBuy,
    bestSell,
    isSeed: true,
  };
}
