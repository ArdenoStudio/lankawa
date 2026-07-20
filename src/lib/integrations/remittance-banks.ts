import remittanceData from "@/data/remittance-tt-seed.json";

export interface RemittanceBankQuote {
  id: string;
  name: string;
  buyLkr: number;
  sellLkr: number;
  note: string;
  spreadLkr: number;
  /** True when this bank row fell back to curated seed. */
  isSeed: boolean;
}

export interface RemittanceTtSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  corridor: string;
  banks: RemittanceBankQuote[];
  bestBuy: RemittanceBankQuote;
  bestSell: RemittanceBankQuote;
  /** True only when every bank fetch failed (full seed board). */
  isSeed: boolean;
  /** Count of banks that returned a live parse (not seed). */
  liveCount: number;
  /** Count of banks filled from seed. */
  seedCount: number;
}

const FETCH_TIMEOUT_MS = 6_000;
const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";

type UsdBand = { buyLkr: number; sellLkr: number };

type BankSource =
  | {
      id: string;
      name: string;
      kind: "json";
      url: string;
      note: string;
      parse: (payload: unknown) => UsdBand | null;
    }
  | {
      id: string;
      name: string;
      kind: "html";
      url: string;
      note: string;
      parse: (html: string) => UsdBand | null;
    };

function isUsdBand(buyLkr: number, sellLkr: number): boolean {
  if (!Number.isFinite(buyLkr) || !Number.isFinite(sellLkr)) {
    return false;
  }
  if (buyLkr < 200 || buyLkr > 500 || sellLkr < 200 || sellLkr > 500) {
    return false;
  }
  if (sellLkr <= buyLkr || sellLkr - buyLkr > 25) {
    return false;
  }
  return true;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function bandFromPair(buyRaw: unknown, sellRaw: unknown): UsdBand | null {
  const buyLkr = toFiniteNumber(buyRaw);
  const sellLkr = toFiniteNumber(sellRaw);
  if (buyLkr == null || sellLkr == null || !isUsdBand(buyLkr, sellLkr)) {
    return null;
  }
  return { buyLkr, sellLkr };
}

/** Commercial Bank `GET /api/exchange-rates` — TT buying/selling for USD. */
export function parseCombankUsdTt(payload: unknown): UsdBand | null {
  if (!Array.isArray(payload)) {
    return null;
  }
  const usd = payload.find(
    (row) =>
      row &&
      typeof row === "object" &&
      "excode" in row &&
      String((row as { excode: unknown }).excode).toUpperCase() === "USD",
  ) as Record<string, unknown> | undefined;
  if (!usd) {
    return null;
  }
  return bandFromPair(
    usd.telegraphic_transfers_buying_rate ?? usd.telegraphic_transfers_buying,
    usd.telegraphic_transfers_selling_rate ?? usd.telegraphic_transfers_selling,
  );
}

/** HNB Venus `get_exchange_rates_contents_web` — buyingRate/sellingRate for USD. */
export function parseHnbUsdTt(payload: unknown): UsdBand | null {
  if (!Array.isArray(payload)) {
    return null;
  }
  const usd = payload.find(
    (row) =>
      row &&
      typeof row === "object" &&
      "currencyCode" in row &&
      String((row as { currencyCode: unknown }).currencyCode).toUpperCase() ===
        "USD",
  ) as Record<string, unknown> | undefined;
  if (!usd) {
    return null;
  }
  return bandFromPair(usd.buyingRate, usd.sellingRate);
}

/** Seylan `exchange-rates-get-value/USD` — Telegraphic Transfers columns. */
export function parseSeylanUsdTt(payload: unknown): UsdBand | null {
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }
  const row = payload[0];
  if (!row || typeof row !== "object") {
    return null;
  }
  const record = row as Record<string, unknown>;
  return bandFromPair(
    record["Telegraphic Transfers Buying"],
    record["Telegraphic Transfers Selling"],
  );
}

/** Sampath `GET /api/exchange-rates` — TTBUY/TTSEL for USD. */
export function parseSampathUsdTt(payload: unknown): UsdBand | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    return null;
  }
  const usd = data.find(
    (row) =>
      row &&
      typeof row === "object" &&
      "CurrCode" in row &&
      String((row as { CurrCode: unknown }).CurrCode).toUpperCase() === "USD",
  ) as Record<string, unknown> | undefined;
  if (!usd) {
    return null;
  }
  return bandFromPair(usd.TTBUY, usd.TTSEL);
}

/** Numbers from `<td>` / plain cells inside a table row snippet. */
function numbersFromRowHtml(rowHtml: string): number[] {
  const fromTd = [
    ...rowHtml.matchAll(/<td[^>]*>\s*([0-9]{2,3}(?:\.[0-9]{1,4})?)\s*<\/td>/gi),
  ].map((m) => Number.parseFloat(m[1]));
  if (fromTd.length >= 2) {
    return fromTd.filter((n) => Number.isFinite(n));
  }
  return [...rowHtml.matchAll(/\b([0-9]{2,3}(?:\.[0-9]{1,4})?)\b/g)]
    .map((m) => Number.parseFloat(m[1]))
    .filter((n) => Number.isFinite(n));
}

/**
 * Locate a USD / US Dollar table row. Prefer currency-name forms used on
 * People's / NSB pages (literal "USD" often only appears in meta or a code cell).
 */
function findUsdRateRow(html: string): string | null {
  const patterns = [
    /(?:United\s+States\s+Dollar|US\s+Dollars?)(?:\s*\(\s*USD\s*\))?[\s\S]{0,1200}?<\/tr>/i,
    /<td[^>]*>\s*USD\s*<\/td>[\s\S]{0,900}?<\/tr>/i,
    /(?:>|\b)USD(?:<|\b)[\s\S]{0,240}?(?:\d{2,3}(?:\.\d{1,4})?)[\s\S]{0,400}?<\/tr>/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

/**
 * People's Bank exchange-rates table: Currency | TC's Drafts | Telegraphic Transfers
 * (buy/sell each). TT is the last pair.
 */
export function parsePeoplesUsdTt(html: string): UsdBand | null {
  const row = html.match(
    /US\s+Dollars[\s\S]{0,900}?<\/tr>/i,
  );
  if (!row) {
    return null;
  }
  const nums = numbersFromRowHtml(row[0]);
  if (nums.length >= 6) {
    return bandFromPair(nums[4], nums[5]);
  }
  if (nums.length >= 2) {
    return bandFromPair(nums[nums.length - 2], nums[nums.length - 1]);
  }
  return null;
}

/**
 * NDB `rates/exchange-rates`: Currency | DD | TT (buy/sell each).
 * TT is the last pair after the USD code cell.
 */
export function parseNdbUsdTt(html: string): UsdBand | null {
  const row = html.match(
    /(?:US\s+Dollar|United\s+States\s+Dollar)[\s\S]{0,200}?USD[\s\S]{0,700}?<\/tr>/i,
  );
  if (!row) {
    return null;
  }
  const nums = numbersFromRowHtml(row[0]);
  if (nums.length >= 6) {
    return bandFromPair(nums[4], nums[5]);
  }
  if (nums.length >= 2) {
    return bandFromPair(nums[nums.length - 2], nums[nums.length - 1]);
  }
  return null;
}

/**
 * NSB `rates-tarriffs/nsb-exchange-rates`: Telegraphic Transfers | Currency.
 * TT buying/selling are the first pair.
 */
export function parseNsbUsdTt(html: string): UsdBand | null {
  const row = html.match(
    /United\s+States\s+Dollar\s*\(\s*USD\s*\)[\s\S]{0,700}?<\/tr>/i,
  );
  if (!row) {
    return null;
  }
  const nums = numbersFromRowHtml(row[0]);
  if (nums.length >= 2) {
    return bandFromPair(nums[0], nums[1]);
  }
  return null;
}

/**
 * BOC `rates-tariff` exchange table: Currency notes | Drafts |
 * Telegraphic/PFCA/BFCA Transfers (buy/sell each). TT is the last pair.
 * Anchors on the US DOLLAR flag alt — a bare `\bUSD\b` row match is too greedy
 * across earlier currency rows. POST `/api/exchange-rates` still 500s; HTML only.
 */
export function parseBocUsdTt(html: string): UsdBand | null {
  const row = html.match(
    /alt="US\s+DOLLAR[^"]*"[\s\S]{0,120}?\bUSD\b[\s\S]{0,500}?<\/tr>/i,
  );
  if (!row) {
    return null;
  }
  const nums = numbersFromRowHtml(row[0]);
  if (nums.length >= 6) {
    return bandFromPair(nums[4], nums[5]);
  }
  if (nums.length >= 2) {
    return bandFromPair(nums[nums.length - 2], nums[nums.length - 1]);
  }
  return null;
}

/**
 * DFCC `rates-and-tariff/exchange-rates`: DD Buying | Note Encashment |
 * TT Buying | DD/TT Selling | Note Selling. Prefer TT Buying + DD/TT Selling.
 */
export function parseDfccUsdTt(html: string): UsdBand | null {
  const row = html.match(
    /alt="USD"[^>]*>\s*USD\s*<\/td>[\s\S]{0,700}?<\/tr>/i,
  );
  if (!row) {
    return null;
  }
  const nums = numbersFromRowHtml(row[0]);
  if (nums.length >= 5) {
    return bandFromPair(nums[2], nums[3]);
  }
  if (nums.length >= 2) {
    return bandFromPair(nums[0], nums[1]);
  }
  return null;
}

/**
 * Generic HTML scrape helper — prefers TT when a 6-column People's/NDB-style
 * row is present; otherwise first buy/sell pair in the USD row.
 */
export function parseUsdLkrBand(html: string): UsdBand | null {
  const peoples = parsePeoplesUsdTt(html);
  if (peoples) {
    return peoples;
  }
  const ndb = parseNdbUsdTt(html);
  if (ndb) {
    return ndb;
  }
  const nsb = parseNsbUsdTt(html);
  if (nsb) {
    return nsb;
  }
  const boc = parseBocUsdTt(html);
  if (boc) {
    return boc;
  }
  const dfcc = parseDfccUsdTt(html);
  if (dfcc) {
    return dfcc;
  }

  const row = findUsdRateRow(html);
  if (!row) {
    const usdBlock = html.match(
      /USD[\s\S]{0,240}?(\d{2,3}(?:\.\d{1,4})?)[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,4})?)/i,
    );
    if (!usdBlock) {
      return null;
    }
    const a = Number.parseFloat(usdBlock[1]);
    const b = Number.parseFloat(usdBlock[2]);
    const buyLkr = Math.min(a, b);
    const sellLkr = Math.max(a, b);
    return isUsdBand(buyLkr, sellLkr) ? { buyLkr, sellLkr } : null;
  }

  const nums = numbersFromRowHtml(row);
  if (nums.length >= 6) {
    return bandFromPair(nums[4], nums[5]);
  }
  if (nums.length >= 2) {
    return bandFromPair(nums[0], nums[1]);
  }
  return null;
}

const BANK_SOURCES: readonly BankSource[] = [
  {
    id: "commercial",
    name: "Commercial Bank",
    kind: "json",
    url: "https://www.combank.lk/api/exchange-rates",
    note: "TT from combank.lk JSON API",
    parse: parseCombankUsdTt,
  },
  {
    id: "hnb",
    name: "Hatton National Bank",
    kind: "json",
    url: "https://venus.hnb.lk/api/get_exchange_rates_contents_web",
    note: "TT from HNB Venus JSON API",
    parse: parseHnbUsdTt,
  },
  {
    id: "seylan",
    name: "Seylan Bank",
    kind: "json",
    url: "https://www.seylan.lk/api/exchange-rates-get-value/USD",
    note: "TT from Seylan JSON API",
    parse: parseSeylanUsdTt,
  },
  {
    id: "sampath",
    name: "Sampath Bank",
    kind: "json",
    url: "https://www.sampath.lk/api/exchange-rates",
    note: "TTBUY/TTSEL from sampath.lk JSON API",
    parse: parseSampathUsdTt,
  },
  {
    id: "peoples",
    name: "People's Bank",
    kind: "html",
    url: "https://www.peoplesbank.lk/exchange-rates/",
    note: "TT columns from peoplesbank.lk rate table",
    parse: parsePeoplesUsdTt,
  },
  {
    id: "ndb",
    name: "NDB Bank",
    kind: "html",
    url: "https://www.ndbbank.com/rates/exchange-rates",
    note: "TT columns from ndbbank.com rate table",
    parse: parseNdbUsdTt,
  },
  {
    id: "nsb",
    name: "National Savings Bank",
    kind: "html",
    url: "https://www.nsb.lk/rates-tarriffs/nsb-exchange-rates/",
    note: "TT columns from nsb.lk exchange-rates page",
    parse: parseNsbUsdTt,
  },
  {
    id: "boc",
    name: "Bank of Ceylon",
    kind: "html",
    url: "https://www.boc.lk/rates-tariff",
    note: "TT columns from boc.lk rates-tariff table",
    parse: parseBocUsdTt,
  },
  {
    id: "dfcc",
    name: "DFCC Bank",
    kind: "html",
    url: "https://www.dfcc.lk/rates-and-tariff/exchange-rates",
    note: "TT Buying / DD·TT Selling from dfcc.lk exchange-rates table",
    parse: parseDfccUsdTt,
  },
] as const;

function withSpread(
  bank: Omit<RemittanceBankQuote, "spreadLkr">,
): RemittanceBankQuote {
  return {
    ...bank,
    spreadLkr: Number((bank.sellLkr - bank.buyLkr).toFixed(2)),
  };
}

function seedQuote(id: string): RemittanceBankQuote | undefined {
  const seed = remittanceData.banks.find((bank) => bank.id === id);
  if (!seed) {
    return undefined;
  }
  return withSpread({ ...seed, isSeed: true });
}

/** Prefer live banks for "best" highlights; fall back to full board if all seed. */
export function pickBestBuy(banks: RemittanceBankQuote[]): RemittanceBankQuote {
  const live = banks.filter((bank) => !bank.isSeed);
  const pool = live.length > 0 ? live : banks;
  return [...pool].sort((a, b) => b.buyLkr - a.buyLkr)[0];
}

export function pickBestSell(banks: RemittanceBankQuote[]): RemittanceBankQuote {
  const live = banks.filter((bank) => !bank.isSeed);
  const pool = live.length > 0 ? live : banks;
  return [...pool].sort((a, b) => a.sellLkr - b.sellLkr)[0];
}

function buildSeedSnapshot(): RemittanceTtSnapshot {
  const banks = remittanceData.banks.map((bank) =>
    withSpread({ ...bank, isSeed: true }),
  );
  const bestBuy = pickBestBuy(banks);
  const bestSell = pickBestSell(banks);

  return {
    sourceId: remittanceData.sourceId,
    sourceName: remittanceData.sourceName,
    asOf: remittanceData.asOf,
    methodologyNote: remittanceData.methodologyNote,
    corridor: remittanceData.corridor,
    banks,
    bestBuy,
    bestSell,
    isSeed: true,
    liveCount: 0,
    seedCount: banks.length,
  };
}

async function fetchWithTimeout(
  url: string,
  accept: string,
): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return null;
    }
    return response;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBankQuote(
  bank: BankSource,
): Promise<Omit<RemittanceBankQuote, "spreadLkr"> | null> {
  if (bank.kind === "json") {
    const response = await fetchWithTimeout(bank.url, "application/json");
    if (!response) {
      return null;
    }
    try {
      const payload: unknown = await response.json();
      const band = bank.parse(payload);
      if (!band) {
        return null;
      }
      return {
        id: bank.id,
        name: bank.name,
        buyLkr: band.buyLkr,
        sellLkr: band.sellLkr,
        note: bank.note,
        isSeed: false,
      };
    } catch {
      return null;
    }
  }

  const response = await fetchWithTimeout(
    bank.url,
    "text/html,application/xhtml+xml",
  );
  if (!response) {
    return null;
  }

  try {
    const html = await response.text();
    const band = bank.parse(html);
    if (!band) {
      return null;
    }
    return {
      id: bank.id,
      name: bank.name,
      buyLkr: band.buyLkr,
      sellLkr: band.sellLkr,
      note: bank.note,
      isSeed: false,
    };
  } catch {
    return null;
  }
}

/**
 * Attempts live bank TT USD/LKR bands (JSON APIs where available, HTML scrape
 * for People's / NDB / NSB / BOC / DFCC) with a short timeout. Per-bank seed
 * fill on failure; board isSeed only when every bank fails.
 *
 * BOC's `POST /api/exchange-rates` still returns 500 — use `rates-tariff` HTML
 * instead. Prefer banks with parseable TT numbers only; never invent rates.
 */
export async function fetchRemittanceTtSnapshot(): Promise<RemittanceTtSnapshot> {
  const results = await Promise.all(BANK_SOURCES.map(fetchBankQuote));

  const banks: RemittanceBankQuote[] = [];
  for (let i = 0; i < BANK_SOURCES.length; i++) {
    const source = BANK_SOURCES[i];
    const live = results[i];
    if (live) {
      banks.push(withSpread(live));
      continue;
    }
    const seed = seedQuote(source.id);
    if (seed) {
      banks.push(seed);
    }
  }

  if (banks.length === 0 || banks.every((bank) => bank.isSeed)) {
    return buildSeedSnapshot();
  }

  const liveCount = banks.filter((bank) => !bank.isSeed).length;
  const seedCount = banks.filter((bank) => bank.isSeed).length;
  const allLive = liveCount === BANK_SOURCES.length;
  const bestBuy = pickBestBuy(banks);
  const bestSell = pickBestSell(banks);

  return {
    sourceId: remittanceData.sourceId,
    sourceName: allLive
      ? "Bank TT remittance board"
      : "Bank TT remittance board (partial live)",
    asOf: new Date().toISOString().slice(0, 10),
    methodologyNote: allLive
      ? "Public indicative USD/LKR TT bands from bank JSON FX APIs (Commercial, HNB, Seylan, Sampath) plus People's/NDB/NSB/BOC/DFCC public rate-page scrapes. Lankawa is not affiliated with these banks. Not CBSL official rates; fees and corridor products differ."
      : "Mixed live/seed board: JSON FX APIs and HTML scrapes where available; failed banks use curated seed rows (per-bank isSeed). Lankawa is not affiliated with these banks. Public indicative only — not CBSL official rates.",
    corridor: remittanceData.corridor,
    banks,
    bestBuy,
    bestSell,
    isSeed: false,
    liveCount,
    seedCount,
  };
}

export function getRemittanceTtSeedSnapshot(): RemittanceTtSnapshot {
  return buildSeedSnapshot();
}
