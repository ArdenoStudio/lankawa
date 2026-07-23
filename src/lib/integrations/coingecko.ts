import { computeFreshnessTier } from "../freshness";
import { getSource } from "../sources";
import type { FreshnessTier } from "../types";

export const COINGECKO_BTC_LKR_SOURCE_ID = "coingecko_btc_lkr" as const;

const PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=lkr";

const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const FETCH_TIMEOUT_MS = 10_000;

export type CoinGeckoBtcLkrSnapshot = {
  asOf: string;
  btcLkr: number;
  sourceId: "coingecko_btc_lkr";
  sourceName: string;
  tier: FreshnessTier;
  isSeed: false;
};

type CoinGeckoPayload = {
  bitcoin?: { lkr?: number };
};

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }
  return (
    AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }
  ).timeout(timeoutMs);
}

export function parseCoinGeckoBtcLkr(
  payload: CoinGeckoPayload,
  asOf = new Date().toISOString(),
): CoinGeckoBtcLkrSnapshot | null {
  const source = getSource(COINGECKO_BTC_LKR_SOURCE_ID);
  if (!source) {
    return null;
  }

  const btcLkr = payload.bitcoin?.lkr;
  if (typeof btcLkr !== "number" || !Number.isFinite(btcLkr) || btcLkr <= 0) {
    return null;
  }

  return {
    asOf,
    btcLkr,
    sourceId: COINGECKO_BTC_LKR_SOURCE_ID,
    sourceName: source.name,
    tier: computeFreshnessTier(asOf, source.cadenceMinutes),
    isSeed: false,
  };
}

export async function fetchCoinGeckoBtcLkrSnapshot(): Promise<CoinGeckoBtcLkrSnapshot | null> {
  try {
    const response = await fetch(PRICE_URL, {
      signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as CoinGeckoPayload;
    return parseCoinGeckoBtcLkr(payload);
  } catch {
    return null;
  }
}
