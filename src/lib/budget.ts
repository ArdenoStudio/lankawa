import budgetData from "@/data/budget-seed.json";
import type { BudgetSnapshot } from "./types";

const snapshot = budgetData as BudgetSnapshot;

export function getBudgetSnapshot(): BudgetSnapshot {
  return snapshot;
}

export function getBudgetFiscalYear(id: string) {
  return snapshot.fiscalYears.find((year) => year.id === id);
}

export function getDefaultBudgetFiscalYear() {
  return snapshot.fiscalYears[snapshot.fiscalYears.length - 1];
}

export function getSectorLabel(
  sectorId: string,
  labels: Record<string, string>,
): string {
  return labels[sectorId] ?? sectorId;
}

export function getMinistryLabel(
  ministryId: string,
  labels: Record<string, string>,
): string {
  return labels[ministryId] ?? ministryId;
}
