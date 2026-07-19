import { computeFreshnessTier } from "@/lib/freshness";
import { getSource, getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier } from "@/lib/types";

export const LPG_SOURCE_ID = "lpg_cylinder_prices";

const LITRO_PRICE_URL = "https://www.litrogas.com/price-list/";
const LAUGFS_PRICE_URL = "https://www.laugfsgas.lk/pricelist.php";
const FETCH_TIMEOUT_MS = 7000;
const SEED_OBSERVED_AT = "2026-07-04T00:00:00.000Z";

const PROVIDER_URLS = [
  {
    provider: "Litro",
    url: LITRO_PRICE_URL,
    cylinderSizesKg: [12.5, 5, 2.3],
  },
  {
    provider: "LAUGFS",
    url: LAUGFS_PRICE_URL,
    cylinderSizesKg: [12.5, 5, 2, 37.5],
  },
] as const;

export interface LpgCylinderPrice {
  provider: string;
  district: string;
  cylinderKg: number;
  priceLkr: number;
  observedAt: string;
  sourceUrl: string;
  isSeed: boolean;
}

export interface LpgPriceSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  prices: LpgCylinderPrice[];
  provenancePath: string;
  tier: FreshnessTier;
  isSeed: boolean;
  note: string | null;
}

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }

  return (AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal })
    .timeout(timeoutMs);
}

function cleanCellText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(value: string): number | null {
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const price = Number.parseFloat(match[0]);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function looksLikeDistrict(value: string): boolean {
  return /^[A-Za-z][A-Za-z\s.'-]{2,}$/.test(value) && !/district|price|refill/i.test(value);
}

function parseDistrictPriceRows({
  html,
  provider,
  sourceUrl,
  cylinderSizesKg,
  observedAt,
}: {
  html: string;
  provider: string;
  sourceUrl: string;
  cylinderSizesKg: readonly number[];
  observedAt: string;
}): LpgCylinderPrice[] {
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  const prices: LpgCylinderPrice[] = [];

  for (const rowMatch of html.matchAll(rowPattern)) {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(cellPattern)) {
      cells.push(cleanCellText(cellMatch[1]));
    }

    if (cells.length < 2 || !looksLikeDistrict(cells[0])) {
      continue;
    }

    const district = cells[0].replace(/\s+/g, " ").trim();
    const numericCells = cells.slice(1).map(parsePrice).filter(
      (price): price is number => price != null,
    );

    if (numericCells.length === 0) {
      continue;
    }

    for (const [index, priceLkr] of numericCells.entries()) {
      const cylinderKg = cylinderSizesKg[index];
      if (!cylinderKg) {
        continue;
      }

      prices.push({
        provider,
        district,
        cylinderKg,
        priceLkr,
        observedAt,
        sourceUrl,
        isSeed: false,
      });
    }
  }

  return prices;
}

async function fetchProviderPrices(
  providerConfig: (typeof PROVIDER_URLS)[number],
): Promise<LpgCylinderPrice[]> {
  const response = await fetch(providerConfig.url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
    },
    next: { revalidate: 86400 },
    signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`${providerConfig.provider} LPG page returned ${response.status}`);
  }

  const html = await response.text();
  return parseDistrictPriceRows({
    html,
    provider: providerConfig.provider,
    sourceUrl: providerConfig.url,
    cylinderSizesKg: providerConfig.cylinderSizesKg,
    observedAt: new Date().toISOString(),
  });
}

function buildSeedPrices(): LpgCylinderPrice[] {
  return [
    {
      provider: "Litro",
      district: "Colombo",
      cylinderKg: 12.5,
      priceLkr: 4465,
      observedAt: SEED_OBSERVED_AT,
      sourceUrl: LITRO_PRICE_URL,
      isSeed: true,
    },
    {
      provider: "Litro",
      district: "Colombo",
      cylinderKg: 5,
      priceLkr: 1792,
      observedAt: SEED_OBSERVED_AT,
      sourceUrl: LITRO_PRICE_URL,
      isSeed: true,
    },
    {
      provider: "Litro",
      district: "Colombo",
      cylinderKg: 2.3,
      priceLkr: 835,
      observedAt: SEED_OBSERVED_AT,
      sourceUrl: LITRO_PRICE_URL,
      isSeed: true,
    },
    {
      provider: "LAUGFS",
      district: "Colombo",
      cylinderKg: 12.5,
      priceLkr: 4965,
      observedAt: SEED_OBSERVED_AT,
      sourceUrl: LAUGFS_PRICE_URL,
      isSeed: true,
    },
    {
      provider: "LAUGFS",
      district: "Colombo",
      cylinderKg: 5,
      priceLkr: 1988,
      observedAt: SEED_OBSERVED_AT,
      sourceUrl: LAUGFS_PRICE_URL,
      isSeed: true,
    },
    {
      provider: "LAUGFS",
      district: "Colombo",
      cylinderKg: 2,
      priceLkr: 795,
      observedAt: SEED_OBSERVED_AT,
      sourceUrl: LAUGFS_PRICE_URL,
      isSeed: true,
    },
  ];
}

function buildSnapshot(
  prices: LpgCylinderPrice[],
  isSeed: boolean,
  note: string | null,
): LpgPriceSnapshot {
  const source = getSource(LPG_SOURCE_ID)!;
  const asOf = prices
    .map((price) => price.observedAt)
    .sort((a, b) => b.localeCompare(a))[0];

  return {
    sourceId: source.id,
    sourceName: source.name,
    asOf,
    prices,
    provenancePath: getSourceProvenancePath(source.id),
    tier: computeFreshnessTier(asOf, source.cadenceMinutes),
    isSeed,
    note,
  };
}

export async function fetchLpgPriceSnapshot(): Promise<LpgPriceSnapshot> {
  const results = await Promise.allSettled(PROVIDER_URLS.map(fetchProviderPrices));
  const livePrices = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (livePrices.length > 0) {
    const failedProviders = results
      .map((result, index) =>
        result.status === "rejected" ? PROVIDER_URLS[index].provider : null,
      )
      .filter(Boolean);

    return buildSnapshot(
      livePrices,
      false,
      failedProviders.length > 0
        ? `Partial scrape — ${failedProviders.join(", ")} unavailable`
        : null,
    );
  }

  return buildSnapshot(
    buildSeedPrices(),
    true,
    "Seed snapshot — official LPG price pages unavailable or changed shape",
  );
}

