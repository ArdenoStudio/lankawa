/**
 * Derive household gold units from official CBSL LKR / troy ounce.
 *
 * See docs/GOLD_RETAIL_RATES_RESEARCH.md — pawn display is derived, not a
 * jewellery-shop selling rate. Shops add margins and making charges.
 */

/** Exact troy ounce mass in grams (international troy). */
export const TROY_OZ_GRAMS = 31.1034768;

/** Sri Lanka market convention: 1 pawn = 8 grams. */
export const PAWN_GRAMS = 8;

/**
 * NGJA / common 22K purity factor (~91.6%).
 * Prefer 0.916 over 22/24 so we match civic gold boards that cite NGJA.
 */
export const KARAT_22_FACTOR = 0.916;

export interface GoldPawnBreakdown {
  /** Official CBSL LKR per troy ounce (input). */
  troyOzLkr: number;
  /** Derived 24K LKR per gram. */
  pure24kPerGramLkr: number;
  /** Derived 22K LKR per gram. */
  karat22PerGramLkr: number;
  /** Derived 24K LKR per pawn (8g). */
  pure24kPerPawnLkr: number;
  /** Derived 22K LKR per pawn (8g). */
  karat22PerPawnLkr: number;
  note: string;
}

export function deriveGoldPawnFromTroyOz(troyOzLkr: number): GoldPawnBreakdown | null {
  if (!Number.isFinite(troyOzLkr) || troyOzLkr <= 0) {
    return null;
  }

  const pure24kPerGramLkr = troyOzLkr / TROY_OZ_GRAMS;
  const karat22PerGramLkr = pure24kPerGramLkr * KARAT_22_FACTOR;
  const pure24kPerPawnLkr = pure24kPerGramLkr * PAWN_GRAMS;
  const karat22PerPawnLkr = karat22PerGramLkr * PAWN_GRAMS;

  return {
    troyOzLkr,
    pure24kPerGramLkr,
    karat22PerGramLkr,
    pure24kPerPawnLkr,
    karat22PerPawnLkr,
    note:
      "Derived from CBSL LKR/troy oz (24K≈oz÷31.1034768 g; 22K×0.916; 1 pawn=8g). " +
      "Indicative — jewellery shops add margins and making charges.",
  };
}

/** Round to nearest 10 LKR for household display (matches local boards). */
export function roundGoldLkr(value: number): number {
  return Math.round(value / 10) * 10;
}
