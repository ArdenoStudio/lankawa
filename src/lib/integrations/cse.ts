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
  high: number | null;
  low: number | null;
  observedAt: string;
}

export interface CseNotice {
  id?: string;
  title: string;
  publishedAt: string;
  kind?: "notification" | "announcement";
  company?: string | null;
}

export interface CseCompanyQuote {
  symbol: string;
  name: string;
  price: number;
  change: number | null;
  changePct: number | null;
  marketCap: number | null;
  previousClose: number | null;
  isFallback: boolean;
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
  /** GICS valuation strip (from `GICSSectorSummery`, joined on indexCodeSp). */
  per: number | null;
  pbv: number | null;
  dy: number | null;
  companiesTraded: number | null;
  companiesListed: number | null;
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
  notices: CseNotice[];
  /** True when the notices strip is seed (live GET/POST notices missed). */
  noticesIsFallback: boolean;
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
  high?: number;
  low?: number;
  highValue?: number;
  lowValue?: number;
  highIndex?: number;
  lowIndex?: number;
  todaysHigh?: number;
  todaysLow?: number;
  timestamp?: number;
  transactionTime?: number;
}

interface CseNoticeRow {
  id?: string | number;
  title?: string;
  body?: string;
  subject?: string;
  headline?: string;
  name?: string;
  status?: string;
  company?: string;
  symbol?: string;
  announcementCategory?: string;
  announcementId?: number;
  publishedAt?: string | number;
  publishedDate?: string | number;
  date?: string | number;
  createdDate?: string | number;
  announcementDate?: string | number;
  dateOfAnnouncement?: string;
  time?: string | number;
}

interface CseCompanyInfoResponse {
  reqSymbolInfo?: {
    symbol?: string;
    name?: string;
    lastTradedPrice?: number;
    change?: number;
    changePercentage?: number;
    marketCap?: number;
    previousClose?: number;
  };
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
  indexCodeSp?: string;
  indexValue?: number;
  change?: number;
  percentage?: number;
  sectorTurnoverToday?: number;
}

interface CseGicsSectorRow {
  sectorId?: string;
  per?: number | null;
  pbv?: number | null;
  dy?: string | number | null;
  companiesTraded?: number | null;
  companiesListed?: number | null;
}

interface CseGicsSectorSummeryResponse {
  reqGICSSectorSummery?: CseGicsSectorRow[];
}

interface CseSectorValuation {
  per: number | null;
  pbv: number | null;
  dy: number | null;
  companiesTraded: number | null;
  companiesListed: number | null;
}

const EMPTY_SECTOR_VALUATION: CseSectorValuation = {
  per: null,
  pbv: null,
  dy: null,
  companiesTraded: null,
  companiesListed: null,
};

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
    high: 21_480.12,
    low: 21_360.05,
    observedAt: SEED_AS_OF,
  },
  snp: {
    code: "SNP_SL20",
    name: "S&P Sri Lanka 20",
    value: 5_999.68,
    change: -5.31,
    changePct: -0.09,
    high: 6_020.4,
    low: 5_980.1,
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
      per: 5.2,
      pbv: 0.8,
      dy: 4.2,
      companiesTraded: 17,
      companiesListed: 17,
    },
    {
      symbol: "FBT",
      name: "Food, Beverage & Tobacco",
      indexValue: 980.1,
      change: -2.1,
      changePct: -0.21,
      turnover: 95_000_000,
      per: 14.8,
      pbv: 2.1,
      dy: 4.5,
      companiesTraded: 46,
      companiesListed: 48,
    },
    {
      symbol: "CON",
      name: "Construction & Engineering",
      indexValue: 640.5,
      change: 1.1,
      changePct: 0.17,
      turnover: 42_000_000,
      per: 20.3,
      pbv: 1.1,
      dy: 2.3,
      companiesTraded: 30,
      companiesListed: 30,
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
  notices: [
    {
      id: "seed-halt",
      title: "Trading halt lifted — sample issuer (seed)",
      publishedAt: "2026-07-15T04:00:00.000Z",
      kind: "announcement",
      company: "Sample Issuer PLC",
    },
    {
      id: "seed-auction",
      title:
        "Opening Market Auction Call extended — trading to resume (seed)",
      publishedAt: "2026-07-10T09:00:00.000Z",
      kind: "notification",
      company: null,
    },
    {
      id: "seed-circular",
      title: "Circular: revised trading lot size for selected securities (seed)",
      publishedAt: "2026-07-08T06:30:00.000Z",
      kind: "announcement",
      company: null,
    },
  ],
  noticesIsFallback: true,
  asOf: SEED_AS_OF,
};

const SEED_COMPANY_QUOTES: Record<
  string,
  Omit<CseCompanyQuote, "isFallback">
> = {
  "JKH.N0000": {
    symbol: "JKH.N0000",
    name: "JOHN KEELLS HOLDINGS PLC",
    price: 24.5,
    change: 1.2,
    changePct: 5.15,
    marketCap: null,
    previousClose: 23.3,
  },
  "COMB.N0000": {
    symbol: "COMB.N0000",
    name: "COMMERCIAL BANK OF CEYLON PLC",
    price: 142.0,
    change: 4.5,
    changePct: 3.27,
    marketCap: null,
    previousClose: 137.5,
  },
  "HNB.N0000": {
    symbol: "HNB.N0000",
    name: "HATTON NATIONAL BANK PLC",
    price: 198.75,
    change: 5.25,
    changePct: 2.71,
    marketCap: null,
    previousClose: 193.5,
  },
  "CTC.N0000": {
    symbol: "CTC.N0000",
    name: "CEYLON TOBACCO COMPANY PLC",
    price: 1_025.0,
    change: -18.5,
    changePct: -1.77,
    marketCap: null,
    previousClose: 1_043.5,
  },
  "DIAL.N0000": {
    symbol: "DIAL.N0000",
    name: "DIALOG AXIATA PLC",
    price: 12.4,
    change: -0.2,
    changePct: -1.59,
    marketCap: null,
    previousClose: 12.6,
  },
  "LOLC.N0000": {
    symbol: "LOLC.N0000",
    name: "LOLC HOLDINGS PLC",
    price: 620.0,
    change: -8.0,
    changePct: -1.27,
    marketCap: null,
    previousClose: 628.0,
  },
};

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

/** CSE returns DY as a string (e.g. `"2.9"`) on GICSSectorSummery. */
function parseDy(value: unknown): number | null {
  if (typeof value === "number") {
    return finiteNumber(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function msToIso(ms: unknown, fallback: string): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    return fallback;
  }
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

async function cseFetch<T>(
  path: string,
  init: RequestInit,
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${CSE_API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...CSE_HEADERS,
        ...(init.headers ?? {}),
      },
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

async function getCseJson<T>(path: string): Promise<T | null> {
  return cseFetch<T>(path, { method: "GET" });
}

async function postCseJson<T>(path: string): Promise<T | null> {
  return cseFetch<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
}

async function postCseForm<T>(
  path: string,
  fields: Record<string, string>,
): Promise<T | null> {
  return cseFetch<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
}

function parseHighLow(raw: CseIndexResponse): {
  high: number | null;
  low: number | null;
} {
  const high = finiteNumber(
    raw.high ?? raw.highValue ?? raw.highIndex ?? raw.todaysHigh,
  );
  const low = finiteNumber(
    raw.low ?? raw.lowValue ?? raw.lowIndex ?? raw.todaysLow,
  );
  return { high, low };
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
  const { high, low } = parseHighLow(raw);

  return {
    code: defaults.code,
    name: defaults.name,
    value,
    change: finiteNumber(raw.change),
    changePct,
    high,
    low,
    observedAt,
  };
}

function noticePublishedAt(row: CseNoticeRow, fallback: string): string {
  const raw =
    row.publishedAt ??
    row.publishedDate ??
    row.announcementDate ??
    row.createdDate ??
    row.dateOfAnnouncement ??
    row.date ??
    row.time;

  if (typeof raw === "number") {
    return msToIso(raw, fallback);
  }
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
    return raw.trim();
  }
  return fallback;
}

function truncateNoticeText(value: string, max = 140): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function isGenericNoticeTitle(title: string): boolean {
  return /^(notice|system maintenance notice|market closed|market halt)$/i.test(
    title.trim(),
  );
}

function noticeTitle(row: CseNoticeRow): string | null {
  const category =
    typeof row.announcementCategory === "string"
      ? row.announcementCategory.trim()
      : "";
  const company =
    typeof row.company === "string" ? row.company.trim() : "";
  if (category && company) {
    return `${category} — ${company}`;
  }
  if (category) {
    return category;
  }

  const titleCandidate =
    typeof row.title === "string"
      ? row.title.trim()
      : typeof row.subject === "string"
        ? row.subject.trim()
        : typeof row.headline === "string"
          ? row.headline.trim()
          : typeof row.name === "string"
            ? row.name.trim()
            : "";
  const body =
    typeof row.body === "string" ? row.body.trim() : "";

  if (body && (!titleCandidate || isGenericNoticeTitle(titleCandidate))) {
    return truncateNoticeText(body);
  }
  if (titleCandidate) {
    return titleCandidate;
  }
  if (body) {
    return truncateNoticeText(body);
  }
  return null;
}

function noticeKind(
  row: CseNoticeRow,
  sourceKey: string | null,
): CseNotice["kind"] {
  if (sourceKey === "content" || sourceKey === "notifications") {
    return "notification";
  }
  if (
    sourceKey === "approvedAnnouncements" ||
    typeof row.announcementCategory === "string" ||
    typeof row.announcementId === "number"
  ) {
    return "announcement";
  }
  return undefined;
}

function extractNoticeRows(raw: unknown): {
  rows: CseNoticeRow[];
  sourceKey: string | null;
} {
  if (Array.isArray(raw)) {
    return { rows: raw as CseNoticeRow[], sourceKey: null };
  }
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of [
      "content",
      "approvedAnnouncements",
      "notifications",
      "notices",
      "announcements",
      "data",
      "reqNotifications",
      "reqAnnouncement",
      "reqCompanyAnnouncement",
      "infoAnnouncement",
    ]) {
      if (Array.isArray(record[key])) {
        return { rows: record[key] as CseNoticeRow[], sourceKey: key };
      }
    }
  }
  return { rows: [], sourceKey: null };
}

function dedupeNotices(notices: CseNotice[]): CseNotice[] {
  const seen = new Set<string>();
  const out: CseNotice[] = [];
  for (const notice of notices) {
    const key = `${notice.title.toLowerCase()}|${notice.publishedAt}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(notice);
  }
  return out;
}

/** Parse CSE notification / announcement payloads into a short strip. */
export function parseCseNotices(
  raw: unknown,
  fallbackAsOf: string,
): CseNotice[] {
  const { rows, sourceKey } = extractNoticeRows(raw);

  return rows
    .map((row): CseNotice | null => {
      const title = noticeTitle(row);
      if (!title) {
        return null;
      }
      const id =
        row.id != null
          ? String(row.id)
          : row.announcementId != null
            ? String(row.announcementId)
            : undefined;
      const company =
        typeof row.company === "string" && row.company.trim()
          ? row.company.trim()
          : null;
      return {
        id,
        title,
        publishedAt: noticePublishedAt(row, fallbackAsOf),
        kind: noticeKind(row, sourceKey),
        company,
      };
    })
    .filter((notice): notice is CseNotice => notice != null)
    .slice(0, 8);
}

export function parseCseCompanyInfo(raw: unknown): CseCompanyQuote | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const info = (raw as CseCompanyInfoResponse).reqSymbolInfo;
  if (!info || typeof info.symbol !== "string" || !info.symbol.trim()) {
    return null;
  }
  const price = finiteNumber(info.lastTradedPrice);
  if (price == null) {
    return null;
  }
  return {
    symbol: info.symbol.trim().toUpperCase(),
    name:
      typeof info.name === "string" && info.name.trim()
        ? info.name.trim()
        : info.symbol.trim().toUpperCase(),
    price,
    change: finiteNumber(info.change),
    changePct: finiteNumber(info.changePercentage),
    marketCap: finiteNumber(info.marketCap),
    previousClose: finiteNumber(info.previousClose),
    isFallback: false,
  };
}

function seedCompanyQuote(symbol: string): CseCompanyQuote {
  const normalized = symbol.trim().toUpperCase();
  const seed = SEED_COMPANY_QUOTES[normalized];
  if (seed) {
    return { ...seed, isFallback: true };
  }
  return {
    symbol: normalized,
    name: normalized,
    price: 0,
    change: null,
    changePct: null,
    marketCap: null,
    previousClose: null,
    isFallback: true,
  };
}

export async function fetchCseCompanyQuote(
  symbol: string,
): Promise<CseCompanyQuote> {
  const normalized = symbol.trim().toUpperCase();
  if (!normalized) {
    return seedCompanyQuote("UNKNOWN");
  }

  const raw = await postCseForm<CseCompanyInfoResponse>(
    "/companyInfoSummery",
    { symbol: normalized },
  );
  const parsed = parseCseCompanyInfo(raw);
  if (parsed) {
    return parsed;
  }
  return seedCompanyQuote(normalized);
}

export async function fetchCseCompanyQuotes(
  symbols: string[],
): Promise<CseCompanyQuote[]> {
  const unique = [
    ...new Set(
      symbols
        .map((symbol) => symbol.trim().toUpperCase())
        .filter((symbol) => symbol.length > 0),
    ),
  ].slice(0, 8);

  return Promise.all(unique.map((symbol) => fetchCseCompanyQuote(symbol)));
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

/**
 * Parse `POST /GICSSectorSummery` into a map keyed by S&P sector code
 * (`sectorId` == `allSectors.indexCodeSp`).
 */
export function parseGicsSectorValuationMap(
  raw: unknown,
): Map<string, CseSectorValuation> {
  const map = new Map<string, CseSectorValuation>();
  if (!raw || typeof raw !== "object") {
    return map;
  }

  const rows = (raw as CseGicsSectorSummeryResponse).reqGICSSectorSummery;
  if (!Array.isArray(rows)) {
    return map;
  }

  for (const row of rows) {
    if (typeof row?.sectorId !== "string" || !row.sectorId.trim()) {
      continue;
    }
    map.set(row.sectorId.trim(), {
      per: finiteNumber(row.per),
      pbv: finiteNumber(row.pbv),
      dy: parseDy(row.dy),
      companiesTraded: finiteNumber(row.companiesTraded),
      companiesListed: finiteNumber(row.companiesListed),
    });
  }

  return map;
}

function parseSectors(
  rows: CseSectorRow[] | null,
  gicsByCode: Map<string, CseSectorValuation> = new Map(),
): CseSector[] {
  if (!rows?.length) {
    return [];
  }

  return rows
    .map((row): CseSector | null => {
      const indexValue = finiteNumber(row.indexValue);
      if (indexValue == null || typeof row.name !== "string") {
        return null;
      }
      const joinKey =
        typeof row.indexCodeSp === "string" ? row.indexCodeSp.trim() : "";
      const valuation =
        (joinKey ? gicsByCode.get(joinKey) : undefined) ??
        EMPTY_SECTOR_VALUATION;
      return {
        symbol: typeof row.symbol === "string" ? row.symbol : row.name,
        name: row.name,
        indexValue,
        change: finiteNumber(row.change),
        changePct: finiteNumber(row.percentage),
        turnover: finiteNumber(row.sectorTurnoverToday),
        ...valuation,
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
  gicsSummery: unknown;
  mostActive: CseActiveRow[] | null;
  dailyMarket: CseDailyMarketRow[] | null;
  notices: CseNotice[];
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
  const gicsByCode = parseGicsSectorValuationMap(parts.gicsSummery);
  const sectors = parseSectors(parts.sectors, gicsByCode);
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
    notices:
      parts.notices.length > 0 ? parts.notices : SEED_SNAPSHOT.notices,
    noticesIsFallback: parts.notices.length === 0,
    asOf,
    tier: computeFreshnessTier(asOf, CSE_CADENCE_MINUTES),
    isFallback: false,
  };
}

function buildFallbackSnapshot(notices?: CseNotice[]): CseSnapshot {
  const hasLiveNotices = Boolean(notices && notices.length > 0);
  return {
    ...SEED_SNAPSHOT,
    notices: hasLiveNotices ? notices! : SEED_SNAPSHOT.notices,
    noticesIsFallback: !hasLiveNotices,
    tier: "stale",
    isFallback: true,
  };
}

/**
 * Live notices: GET `/notifications` (halt/auction banners) then
 * POST `/approvedAnnouncement` (corporate disclosures). Seed if both miss.
 */
async function fetchCseNotices(fallbackAsOf: string): Promise<CseNotice[]> {
  const [notificationsRaw, approvedRaw] = await Promise.all([
    getCseJson<unknown>("/notifications"),
    postCseJson<unknown>("/approvedAnnouncement"),
  ]);

  const fromNotifications = parseCseNotices(notificationsRaw, fallbackAsOf);
  const fromApproved = parseCseNotices(approvedRaw, fallbackAsOf);

  return dedupeNotices([...fromNotifications, ...fromApproved]).slice(0, 8);
}

export async function buildCseSnapshot(): Promise<CseSnapshot> {
  const [
    aspi,
    snp,
    marketStatus,
    marketSummary,
    tradeSummary,
    sectors,
    gicsSummery,
    mostActive,
    dailyMarket,
    notices,
  ] = await Promise.all([
    postCseJson<CseIndexResponse>("/aspiData"),
    postCseJson<CseIndexResponse>("/snpData"),
    postCseJson<CseMarketStatusResponse>("/marketStatus"),
    postCseJson<CseMarketSummaryResponse>("/marketSummery"),
    postCseJson<CseTradeSummaryResponse>("/tradeSummary"),
    postCseJson<CseSectorRow[]>("/allSectors"),
    postCseJson<CseGicsSectorSummeryResponse>("/GICSSectorSummery"),
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
    fetchCseNotices(SEED_AS_OF),
  ]);

  const live = buildSnapshotFromLive({
    aspi,
    snp,
    marketStatus,
    marketSummary,
    tradeSummary,
    sectors,
    gicsSummery,
    mostActive,
    dailyMarket,
    notices,
  });

  return live ?? buildFallbackSnapshot(notices);
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
