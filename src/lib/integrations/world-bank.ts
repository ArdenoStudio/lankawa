import { computeFreshnessTier } from "../freshness";
import { getSource } from "../sources";
import type { FreshnessTier } from "../types";

export const WORLD_BANK_SOURCE_ID = "world_bank_lka" as const;

const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const FETCH_TIMEOUT_MS = 25_000;
const BASE =
  "https://api.worldbank.org/v2/country/LKA/indicator";

const INDICATORS = [
  {
    id: "gdp_growth",
    code: "NY.GDP.MKTP.KD.ZG",
    label: "GDP growth",
    unit: "%",
  },
  {
    id: "cpi_inflation",
    code: "FP.CPI.TOTL.ZG",
    label: "Inflation (CPI)",
    unit: "%",
  },
  {
    id: "population",
    code: "SP.POP.TOTL",
    label: "Population",
    unit: "people",
  },
] as const;

export type WorldBankIndicator = {
  id: string;
  code: string;
  label: string;
  value: number;
  year: string;
  unit: string;
};

export type WorldBankSnapshot = {
  asOf: string;
  country: "LKA";
  indicators: WorldBankIndicator[];
  sourceId: "world_bank_lka";
  sourceName: string;
  tier: FreshnessTier;
  isSeed: boolean;
};

type WorldBankRow = {
  date?: string;
  value?: number | null;
  indicator?: { id?: string; value?: string };
};

type WorldBankResponse = [unknown, WorldBankRow[] | undefined] | WorldBankRow[];

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }
  return (
    AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }
  ).timeout(timeoutMs);
}

function indicatorUrl(code: string): string {
  return `${BASE}/${code}?format=json&per_page=5&mrnev=1`;
}

function indicatorFallbackUrl(code: string): string {
  return `${BASE}/${code}?format=json&per_page=5&date=2018:2025`;
}

/** Parse one World Bank indicator API response into a typed row. */
export function parseWorldBankIndicatorResponse(
  meta: (typeof INDICATORS)[number],
  payload: WorldBankResponse,
): WorldBankIndicator | null {
  const rows = Array.isArray(payload)
    ? Array.isArray(payload[1])
      ? payload[1]
      : (payload as WorldBankRow[])
    : null;
  if (!rows || rows.length === 0) {
    return null;
  }

  for (const row of rows) {
    const value = row.value;
    const year = row.date?.trim();
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      !year ||
      !/^\d{4}$/.test(year)
    ) {
      continue;
    }
    return {
      id: meta.id,
      code: meta.code,
      label: meta.label,
      value,
      year,
      unit: meta.unit,
    };
  }
  return null;
}

async function fetchIndicatorOnce(
  meta: (typeof INDICATORS)[number],
  url: string,
): Promise<WorldBankIndicator | null> {
  try {
    const response = await fetch(url, {
      signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
      next: { revalidate: 86400 },
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) {
      // World Bank intermittently returns XHTML "Request Error" pages.
      return null;
    }
    const payload = (await response.json()) as WorldBankResponse;
    return parseWorldBankIndicatorResponse(meta, payload);
  } catch {
    return null;
  }
}

async function fetchIndicator(
  meta: (typeof INDICATORS)[number],
): Promise<WorldBankIndicator | null> {
  const first = await fetchIndicatorOnce(meta, indicatorUrl(meta.code));
  if (first) {
    return first;
  }
  // Sequential retry — WB rate-limits / flaky XML errors under parallel load.
  await new Promise((resolve) => setTimeout(resolve, 250));
  const retry = await fetchIndicatorOnce(meta, indicatorUrl(meta.code));
  if (retry) {
    return retry;
  }
  // Population (and rare others) sometimes fail on mrnev=1 — date window works.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return fetchIndicatorOnce(meta, indicatorFallbackUrl(meta.code));
}

export async function fetchWorldBankLkaSnapshot(): Promise<WorldBankSnapshot | null> {
  try {
    const source = getSource(WORLD_BANK_SOURCE_ID);
    if (!source) {
      return null;
    }

    // Sequential fetches avoid World Bank intermittent Request Error pages.
    const indicators: WorldBankIndicator[] = [];
    for (const meta of INDICATORS) {
      const row = await fetchIndicator(meta);
      if (row) {
        indicators.push(row);
      }
    }

    if (indicators.length === 0) {
      return null;
    }

    // Freshness = adapter fetch success, not the annual series year.
    // Each indicator still exposes its WDI `year` as the data vintage.
    const asOf = new Date().toISOString();

    return {
      asOf,
      country: "LKA",
      indicators,
      sourceId: WORLD_BANK_SOURCE_ID,
      sourceName: source.name,
      tier: computeFreshnessTier(asOf, source.cadenceMinutes),
      isSeed: false,
    };
  } catch {
    return null;
  }
}
