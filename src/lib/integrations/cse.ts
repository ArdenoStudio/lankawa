import { computeFreshnessTier } from "@/lib/freshness";
import { getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier, PulseMetric } from "@/lib/types";

const CSE_API_BASE = "https://www.cse.lk/api";
const FETCH_TIMEOUT_MS = 12_000;
const CSE_CADENCE_MINUTES = 15;

export const CSE_SOURCE_ID = "cse_lk";
export const CSE_SOURCE_NAME = "Colombo Stock Exchange";

const CSE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; Lankawa/1.0; +https://lankawa.lk)",
  Origin: "https://www.cse.lk",
  Referer: "https://www.cse.lk/",
  Accept: "application/json",
};

export interface CseIndex {
  code: string;
  name: string;
  value: number;
  change: number | null;
  changePct: number | null;
  observedAt: string;
}

export interface CseMover {
  symbol: string;
  name: string;
  price: number;
  change: number | null;
  changePct: number | null;
}

export interface CseMarketSummary {
  tradeCount: number | null;
  shareVolume: number | null;
  turnover: number | null;
  observedAt: string | null;
}

export interface CseSector {
  symbol: string;
  name: string;
  indexValue: number;
  change: number | null;
  changePct: number | null;
  turnover: number | null;
}

export interface CseActiveTrade {
  symbol: string;
  tradeVolume: number | null;
  shareVolume: number | null;
  turnover: number | null;
}

export interface CseForeignDomestic {
  domesticTrades: number | null;
  foreignTrades: number | null;
  domesticTurnover: number | null;
  foreignPurchase: number | null;
  foreignSales: number | null;
  observedAt: string | null;
}

export interface CseSnapshot {
  sourceId: string;
  sourceName: string;
  marketStatus: string | null;
  aspi: CseIndex;
  snp: CseIndex;
  topGainers: CseMover[];
  topLosers: CseMover[];
  summary: CseMarketSummary | null;
  sectors: CseSector[];
  mostActive: CseActiveTrade[];
  foreignDomestic: CseForeignDomestic | null;
  asOf: string;
  tier: FreshnessTier;
  isFallback: boolean;
}

interface CseIndexResponse {
  value?: number;
  indexValue?: number;
  change?: number;
  percentage?: number;
  percentageChange?: number;
  changePct?: number;
  timestamp?: number;
  transactionTime?: number;
}

interface CseMarketStatusResponse {
  status?: string;
}

interface CseMarketSummaryResponse {
  trades?: number;
  shareVolume?: number;
  tradeVolume?: number;
  tradeDate?: number;
}

interface CseTradeSummaryRow {
  symbol?: string;
  name?: string;
  price?: number;
  change?: number;
  percentageChange?: number;
  lastTradedTime?: number;
}

interface CseTradeSummaryResponse {
  reqTradeSummery?: CseTradeSummaryRow[];
}

interface CseSectorRow {
  symbol?: string;
  name?: string;
  indexValue?: number;
  change?: number;
  percentage?: number;
  sectorTurnoverToday?: number;
}

interface CseActiveRow {
  symbol?: string;
  tradeVolume?: number;
  shareVolume?: number;
  turnover?: number;
}

interface CseDailyMarketRow {
  tradeDate?: number;
  marketDomestic?: number;
  marketForeign?: number;
  equityDomesticPurchase?: number;
  equityForeignPurchase?: number;
  equityForeignSales?: number;
}

const SEED_AS_OF = "2026-07-18T09:30:00.000Z";

const SEED_SNAPSHOT: Omit<CseSnapshot, "tier" | "isFallback"> = {
  sourceId: CSE_SOURCE_ID,
  sourceName: CSE_SOURCE_NAME,
  marketStatus: "Market Closed",
  aspi: {
    code: "ASPI",
    name: "All Share Price Index",
    value: 21_405.41,
    change: -42.16,
    changePct: -0.2,
    observedAt: SEED_AS_OF,
  },
  snp: {
    code: "SNP_SL20",
    name: "S&P Sri Lanka 20",
    value: 5_999.68,
    change: -5.31,
    changePct: -0.09,
    observedAt: SEED_AS_OF,
  },
  topGainers: [
    {
      symbol: "JKH.N0000",
      name: "JOHN KEELLS HOLDINGS PLC",
      price: 24.5,
      change: 1.2,
      changePct: 5.15,
    },
    {
      symbol: "COMB.N0000",
      name: "COMMERCIAL BANK OF CEYLON PLC",
      price: 142.0,
      change: 4.5,
      changePct: 3.27,
    },
    {
      symbol: "HNB.N0000",
      name: "HATTON NATIONAL BANK PLC",
      price: 198.75,
      change: 5.25,
      changePct: 2.71,
    },
  ],
  topLosers: [
    {
      symbol: "CTC.N0000",
      name: "CEYLON TOBACCO COMPANY PLC",
      price: 1_025.0,
      change: -18.5,
      changePct: -1.77,
    },
    {
      symbol: "DIAL.N0000",
      name: "DIALOG AXIATA PLC",
      price: 12.4,
      change: -0.2,
      changePct: -1.59,
    },
    {
      symbol: "LOLC.N0000",
      name: "LOLC HOLDINGS PLC",
      price: 620.0,
      change: -8.0,
      changePct: -1.27,
    },
  ],
  summary: {
    tradeCount: 13_397,
    shareVolume: 31_937_752,
    turnover: 722_636_709.45,
    observedAt: SEED_AS_OF,
  },
  sectors: [
    {
      symbol: "BFI",
      name: "Banks, Finance & Insurance",
      indexValue: 1_120.4,
      change: 4.2,
      changePct: 0.38,
      turnover: 210_000_000,
    },
    {
      symbol: "FBT",
      name: "Food, Beverage & Tobacco",
      indexValue: 980.1,
      change: -2.1,
      changePct: -0.21,
      turnover: 95_000_000,
    },
    {
      symbol: "CON",
      name: "Construction & Engineering",
      indexValue: 640.5,
      change: 1.1,
      changePct: 0.17,
      turnover: 42_000_000,
    },
  ],
  mostActive: [
    {
      symbol: "SAMP.N0000",
      tradeVolume: 725,
      shareVolume: 642_653,
      turnover: 88_033_548,
    },
    {
      symbol: "JKH.N0000",
      tradeVolume: 328,
      shareVolume: 1_631_636,
      turnover: 32_473_972,
    },
    {
      symbol: "NDB.N0000",
      tradeVolume: 311,
      shareVolume: 175_019,
      turnover: 18_983_229,
    },
  ],
  foreignDomestic: {
    domesticTrades: 13_347,
    foreignTrades: 279,
    domesticTurnover: 707_171_900,
    foreignPurchase: 15_460_952,
    foreignSales: 123_908_672,
    observedAt: SEED_AS_OF,
  },
  asOf: SEED_AS_OF,
};

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function msToIso(ms: unknown, fallback: string): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    return fallback;
  }
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

async function postCseJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${CSE_API_BASE}${path}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        ...CSE_HEADERS,
        "Content-Type": "application/json",
      },
      body: "{}",
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseIndex(
  raw: CseIndexResponse | null,
  defaults: { code: string; name: string },
  fallback: CseIndex,
): CseIndex {
  if (!raw) {
    return fallback;
  }

  const value = finiteNumber(raw.value ?? raw.indexValue);
  if (value == null) {
    return fallback;
  }

  const observedAt = msToIso(raw.timestamp ?? raw.transactionTime, fallback.observedAt);
  const changePct = finiteNumber(
    raw.percentage ?? raw.percentageChange ?? raw.changePct,
  );

  return {
    code: defaults.code,
    name: defaults.name,
    value,
    change: finiteNumber(raw.change),
    changePct,
    observedAt,
  };
}

function parseMover(row: CseTradeSummaryRow): CseMover | null {
  if (typeof row.symbol !== "string" || !row.symbol.trim()) {
    return null;
  }

  const price = finiteNumber(row.price);
  if (price == null) {
    return null;
  }

  return {
    symbol: row.symbol.trim().toUpperCase(),
    name: typeof row.name === "string" && row.name.trim() ? row.name.trim() : row.symbol,
    price,
    change: finiteNumber(row.change),
    changePct: finiteNumber(row.percentageChange),
  };
}

function pickTopMovers(rows: CseTradeSummaryRow[]): {
  topGainers: CseMover[];
  topLosers: CseMover[];
} {
  const movers = rows
    .map(parseMover)
    .filter((mover): mover is CseMover => mover != null && mover.changePct != null);

  const topGainers = [...movers]
    .sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0))
    .slice(0, 5);

  const topLosers = [...movers]
    .sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0))
    .slice(0, 5);

  return { topGainers, topLosers };
}

function parseSectors(rows: CseSectorRow[] | null): CseSector[] {
  if (!rows?.length) {
    return [];
  }

  return rows
    .map((row): CseSector | null => {
      const indexValue = finiteNumber(row.indexValue);
      if (indexValue == null || typeof row.name !== "string") {
        return null;
      }
      return {
        symbol: typeof row.symbol === "string" ? row.symbol : row.name,
        name: row.name,
        indexValue,
        change: finiteNumber(row.change),
        changePct: finiteNumber(row.percentage),
        turnover: finiteNumber(row.sectorTurnoverToday),
      };
    })
    .filter((row): row is CseSector => row != null)
    .sort((a, b) => (b.turnover ?? 0) - (a.turnover ?? 0))
    .slice(0, 8);
}

function parseMostActive(rows: CseActiveRow[] | null): CseActiveTrade[] {
  if (!rows?.length) {
    return [];
  }

  return rows
    .map((row): CseActiveTrade | null => {
      if (typeof row.symbol !== "string" || !row.symbol.trim()) {
        return null;
      }
      return {
        symbol: row.symbol.trim().toUpperCase(),
        tradeVolume: finiteNumber(row.tradeVolume),
        shareVolume: finiteNumber(row.shareVolume),
        turnover: finiteNumber(row.turnover),
      };
    })
    .filter((row): row is CseActiveTrade => row != null)
    .slice(0, 8);
}

function parseForeignDomestic(
  rows: CseDailyMarketRow[] | null,
  fallbackObservedAt: string,
): CseForeignDomestic | null {
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) {
    return null;
  }

  return {
    domesticTrades: finiteNumber(row.marketDomestic),
    foreignTrades: finiteNumber(row.marketForeign),
    domesticTurnover: finiteNumber(row.equityDomesticPurchase),
    foreignPurchase: finiteNumber(row.equityForeignPurchase),
    foreignSales: finiteNumber(row.equityForeignSales),
    observedAt: msToIso(row.tradeDate, fallbackObservedAt),
  };
}

function buildSnapshotFromLive(parts: {
  aspi: CseIndexResponse | null;
  snp: CseIndexResponse | null;
  marketStatus: CseMarketStatusResponse | null;
  marketSummary: CseMarketSummaryResponse | null;
  tradeSummary: CseTradeSummaryResponse | null;
  sectors: CseSectorRow[] | null;
  mostActive: CseActiveRow[] | null;
  dailyMarket: CseDailyMarketRow[] | null;
}): CseSnapshot | null {
  const aspi = parseIndex(parts.aspi, {
    code: "ASPI",
    name: "All Share Price Index",
  }, SEED_SNAPSHOT.aspi);
  const snp = parseIndex(parts.snp, {
    code: "SNP_SL20",
    name: "S&P Sri Lanka 20",
  }, SEED_SNAPSHOT.snp);

  const hasLiveIndex =
    parts.aspi != null &&
    finiteNumber(parts.aspi.value ?? parts.aspi.indexValue) != null;

  if (!hasLiveIndex) {
    return null;
  }

  const movers = pickTopMovers(parts.tradeSummary?.reqTradeSummery ?? []);
  const summaryObservedAt = msToIso(
    parts.marketSummary?.tradeDate,
    aspi.observedAt,
  );
  const sectors = parseSectors(parts.sectors);
  const mostActive = parseMostActive(parts.mostActive);
  const foreignDomestic =
    parseForeignDomestic(parts.dailyMarket, aspi.observedAt) ??
    SEED_SNAPSHOT.foreignDomestic;

  const asOf = [aspi.observedAt, snp.observedAt, summaryObservedAt]
    .sort()
    .at(-1) ?? aspi.observedAt;

  return {
    sourceId: CSE_SOURCE_ID,
    sourceName: CSE_SOURCE_NAME,
    marketStatus:
      typeof parts.marketStatus?.status === "string"
        ? parts.marketStatus.status
        : null,
    aspi,
    snp,
    topGainers:
      movers.topGainers.length > 0 ? movers.topGainers : SEED_SNAPSHOT.topGainers,
    topLosers:
      movers.topLosers.length > 0 ? movers.topLosers : SEED_SNAPSHOT.topLosers,
    summary: parts.marketSummary
      ? {
          tradeCount: finiteNumber(parts.marketSummary.trades),
          shareVolume: finiteNumber(parts.marketSummary.shareVolume),
          turnover: finiteNumber(parts.marketSummary.tradeVolume),
          observedAt: summaryObservedAt,
        }
      : SEED_SNAPSHOT.summary,
    sectors: sectors.length > 0 ? sectors : SEED_SNAPSHOT.sectors,
    mostActive: mostActive.length > 0 ? mostActive : SEED_SNAPSHOT.mostActive,
    foreignDomestic,
    asOf,
    tier: computeFreshnessTier(asOf, CSE_CADENCE_MINUTES),
    isFallback: false,
  };
}

function buildFallbackSnapshot(): CseSnapshot {
  return {
    ...SEED_SNAPSHOT,
    tier: "stale",
    isFallback: true,
  };
}

export async function buildCseSnapshot(): Promise<CseSnapshot> {
  const [
    aspi,
    snp,
    marketStatus,
    marketSummary,
    tradeSummary,
    sectors,
    mostActive,
    dailyMarket,
  ] = await Promise.all([
    postCseJson<CseIndexResponse>("/aspiData"),
    postCseJson<CseIndexResponse>("/snpData"),
    postCseJson<CseMarketStatusResponse>("/marketStatus"),
    postCseJson<CseMarketSummaryResponse>("/marketSummery"),
    postCseJson<CseTradeSummaryResponse>("/tradeSummary"),
    postCseJson<CseSectorRow[]>("/allSectors"),
    postCseJson<CseActiveRow[]>("/mostActiveTrades"),
    postCseJson<unknown>("/dailyMarketSummery").then((raw) => {
      if (!Array.isArray(raw) || raw.length === 0) {
        return null;
      }
      // Endpoint returns [[row]] or [row].
      if (Array.isArray(raw[0])) {
        return (raw[0] as CseDailyMarketRow[]) ?? null;
      }
      return raw as CseDailyMarketRow[];
    }),
  ]);

  const live = buildSnapshotFromLive({
    aspi,
    snp,
    marketStatus,
    marketSummary,
    tradeSummary,
    sectors,
    mostActive,
    dailyMarket,
  });

  return live ?? buildFallbackSnapshot();
}

export async function buildCsePulseMetric(checkedAt: string): Promise<PulseMetric> {
  const snapshot = await buildCseSnapshot();
  return buildCsePulseMetricFromSnapshot(checkedAt, snapshot);
}

export function buildCsePulseMetricFromSnapshot(
  checkedAt: string,
  snapshot: CseSnapshot,
): PulseMetric {
  const tier = computeFreshnessTier(
    snapshot.asOf,
    CSE_CADENCE_MINUTES,
    new Date(checkedAt).getTime(),
  );
  const changeNote =
    snapshot.aspi.changePct == null
      ? undefined
      : `${snapshot.aspi.changePct >= 0 ? "+" : ""}${snapshot.aspi.changePct.toFixed(2)}%`;

  return {
    id: "cse_aspi",
    label: "ASPI",
    value: snapshot.aspi.value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    }),
    unit: "pts",
    observedAt: snapshot.asOf,
    tier,
    sourceId: CSE_SOURCE_ID,
    provenancePath: getSourceProvenancePath(CSE_SOURCE_ID),
    note: changeNote,
  };
}
