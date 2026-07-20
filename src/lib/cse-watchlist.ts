export const CSE_WATCHLIST_KEY = "lankawa_cse_watchlist";
export const CSE_WATCHLIST_MAX = 5;

/** Common CSE symbols offered as watchlist picks (seed board). */
export const CSE_WATCHLIST_OPTIONS = [
  "JKH.N0000",
  "COMB.N0000",
  "HNB.N0000",
  "CTC.N0000",
  "DIAL.N0000",
  "LOLC.N0000",
] as const;

export function normalizeCseSymbol(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidCseSymbol(value: string): boolean {
  const symbol = normalizeCseSymbol(value);
  return /^[A-Z0-9]{2,12}(?:\.[A-Z0-9]{1,8})?$/.test(symbol);
}

export function sanitizeCseWatchlist(symbols: unknown): string[] {
  if (!Array.isArray(symbols)) {
    return [];
  }

  const unique: string[] = [];
  for (const item of symbols) {
    if (typeof item !== "string") {
      continue;
    }
    const symbol = normalizeCseSymbol(item);
    if (!isValidCseSymbol(symbol) || unique.includes(symbol)) {
      continue;
    }
    unique.push(symbol);
    if (unique.length >= CSE_WATCHLIST_MAX) {
      break;
    }
  }
  return unique;
}

export function readCseWatchlist(storage: Storage): string[] {
  const raw = storage.getItem(CSE_WATCHLIST_KEY);
  if (!raw) {
    return [];
  }
  try {
    return sanitizeCseWatchlist(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function writeCseWatchlist(storage: Storage, symbols: string[]) {
  storage.setItem(
    CSE_WATCHLIST_KEY,
    JSON.stringify(sanitizeCseWatchlist(symbols)),
  );
}

export function toggleCseWatchlistSymbol(
  current: string[],
  symbol: string,
): string[] {
  const normalized = normalizeCseSymbol(symbol);
  if (!isValidCseSymbol(normalized)) {
    return sanitizeCseWatchlist(current);
  }
  if (current.map(normalizeCseSymbol).includes(normalized)) {
    return sanitizeCseWatchlist(
      current.filter((item) => normalizeCseSymbol(item) !== normalized),
    );
  }
  return sanitizeCseWatchlist([...current, normalized]);
}
