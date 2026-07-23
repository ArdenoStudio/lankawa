import { computeFreshnessTier } from "../freshness";
import { getSource } from "../sources";
import type { FreshnessTier } from "../types";

export const MARKET_FX_SOURCE_ID = "market_fx_fawaz" as const;

const PRIMARY_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json";
const FALLBACK_URL =
  "https://latest.currency-api.pages.dev/v1/currencies/usd.min.json";

const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const FETCH_TIMEOUT_MS = 10_000;

export type MarketFxSnapshot = {
  asOf: string;
  usdLkr: number;
  sourceId: "market_fx_fawaz";
  sourceName: string;
  tier: FreshnessTier;
  isSeed: false;
};

export type MarketFxPayload = {
  date?: string;
  usd?: { lkr?: number };
};

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }
  return (
    AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }
  ).timeout(timeoutMs);
}

/** Parse fawazahmed0 currency-api USD→LKR payload into a snapshot. */
export function parseMarketFxPayload(
  payload: MarketFxPayload,
  now = new Date(),
): MarketFxSnapshot | null {
  const source = getSource(MARKET_FX_SOURCE_ID);
  if (!source) {
    return null;
  }

  const date = payload.date?.trim();
  const usdLkr = payload.usd?.lkr;
  if (
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    typeof usdLkr !== "number" ||
    !Number.isFinite(usdLkr) ||
    usdLkr <= 0
  ) {
    return null;
  }

  const asOf = `${date}T12:00:00.000Z`;
  return {
    asOf,
    usdLkr,
    sourceId: MARKET_FX_SOURCE_ID,
    sourceName: source.name,
    tier: computeFreshnessTier(asOf, source.cadenceMinutes, now.getTime()),
    isSeed: false,
  };
}

async function fetchJson(url: string): Promise<MarketFxPayload | null> {
  try {
    const response = await fetch(url, {
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
    return (await response.json()) as MarketFxPayload;
  } catch {
    return null;
  }
}

export async function fetchMarketFxSnapshot(): Promise<MarketFxSnapshot | null> {
  try {
    const primary = await fetchJson(PRIMARY_URL);
    const fromPrimary = primary ? parseMarketFxPayload(primary) : null;
    if (fromPrimary) {
      return fromPrimary;
    }

    const fallback = await fetchJson(FALLBACK_URL);
    return fallback ? parseMarketFxPayload(fallback) : null;
  } catch {
    return null;
  }
}
