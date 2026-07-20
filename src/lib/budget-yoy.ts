import type { BudgetFiscalYear, BudgetSnapshot } from "@/lib/types";

export interface BudgetYoyRow {
  id: string;
  label: string;
  prior: number;
  current: number;
  deltaPct: number | null;
}

export interface BudgetYoyCompare {
  prior: BudgetFiscalYear;
  current: BudgetFiscalYear;
  totals: BudgetYoyRow[];
  sectors: BudgetYoyRow[];
  ministries: BudgetYoyRow[];
}

function deltaPct(prior: number, current: number): number | null {
  if (prior === 0) {
    return null;
  }
  return ((current - prior) / prior) * 100;
}

export function compareBudgetYears(
  prior: BudgetFiscalYear,
  current: BudgetFiscalYear,
): BudgetYoyCompare {
  const totals: BudgetYoyRow[] = [
    {
      id: "revenue",
      label: "revenue",
      prior: prior.revenue,
      current: current.revenue,
      deltaPct: deltaPct(prior.revenue, current.revenue),
    },
    {
      id: "expenditure",
      label: "expenditure",
      prior: prior.expenditure,
      current: current.expenditure,
      deltaPct: deltaPct(prior.expenditure, current.expenditure),
    },
    {
      id: "deficit",
      label: "deficit",
      prior: prior.deficit,
      current: current.deficit,
      deltaPct: deltaPct(prior.deficit, current.deficit),
    },
    {
      id: "capitalExpenditure",
      label: "capitalExpenditure",
      prior: prior.capitalExpenditure,
      current: current.capitalExpenditure,
      deltaPct: deltaPct(prior.capitalExpenditure, current.capitalExpenditure),
    },
  ];

  const sectorIds = new Set([
    ...prior.sectors.map((sector) => sector.id),
    ...current.sectors.map((sector) => sector.id),
  ]);
  const sectors: BudgetYoyRow[] = [...sectorIds].map((id) => {
    const priorAmt =
      prior.sectors.find((sector) => sector.id === id)?.amount ?? 0;
    const currentAmt =
      current.sectors.find((sector) => sector.id === id)?.amount ?? 0;
    return {
      id,
      label: id,
      prior: priorAmt,
      current: currentAmt,
      deltaPct: deltaPct(priorAmt, currentAmt),
    };
  });

  const ministryIds = new Set([
    ...prior.ministries.map((ministry) => ministry.id),
    ...current.ministries.map((ministry) => ministry.id),
  ]);
  const ministries: BudgetYoyRow[] = [...ministryIds].map((id) => {
    const priorAmt =
      prior.ministries.find((ministry) => ministry.id === id)?.amount ?? 0;
    const currentAmt =
      current.ministries.find((ministry) => ministry.id === id)?.amount ?? 0;
    return {
      id,
      label: id,
      prior: priorAmt,
      current: currentAmt,
      deltaPct: deltaPct(priorAmt, currentAmt),
    };
  });

  return { prior, current, totals, sectors, ministries };
}

export function getBudgetYoyCompare(
  snapshot: BudgetSnapshot,
): BudgetYoyCompare | null {
  if (snapshot.fiscalYears.length < 2) {
    return null;
  }
  const prior = snapshot.fiscalYears[snapshot.fiscalYears.length - 2];
  const current = snapshot.fiscalYears[snapshot.fiscalYears.length - 1];
  return compareBudgetYears(prior, current);
}
