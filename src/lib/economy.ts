import macroData from "@/data/economy-macro.json";
import { fetchCbslFxRates } from "./integrations/cbsl";
import type { EconomyMacroSnapshot, FxRateBand, FxSeriesPoint } from "./types";

const macro = macroData as EconomyMacroSnapshot;

export function getEconomyMacroSnapshot(): EconomyMacroSnapshot {
  return macro;
}

export async function getFxSeries(): Promise<FxSeriesPoint[]> {
  try {
    const rates = await fetchCbslFxRates();
    if (rates.length >= 5) {
      return rates
        .slice(0, 30)
        .reverse()
        .map((rate) => ({
          date: rate.date,
          sellRate: rate.sellRate,
        }));
    }
  } catch {
    // Fall back to static seed below.
  }

  return macro.fxSeries;
}

export async function getLatestFxRate(): Promise<FxRateBand> {
  try {
    const rates = await fetchCbslFxRates();
    const latest = rates[0];
    if (latest) {
      return latest;
    }
  } catch {
    // Fall back to static seed below.
  }

  if (macro.fxBand) {
    return macro.fxBand;
  }

  const latestSeed = macro.fxSeries[macro.fxSeries.length - 1];
  return {
    date: latestSeed.date,
    buyRate: latestSeed.sellRate,
    sellRate: latestSeed.sellRate,
    isFallback: true,
  };
}

export function getMacroIndicator(id: string) {
  return macro.indicators.find((indicator) => indicator.id === id);
}
