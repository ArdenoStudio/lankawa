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

/** HTML scrape helper for People's / NDB exchange-rate pages. */
export function parseUsdLkrBand(html: string): UsdBand | null {
  const usdBlock = html.match(
    /USD[\s\S]{0,240}?(\d{2,3}(?:\.\d{1,4})?)[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,4})?)/i,
  );
  if (!usdBlock) {
    return null;
  }

  const a = Number.parseFloat(usdBlock[1]);
  const b = Number.parseFloat(usdBlock[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return null;
  }

  const buyLkr = Math.min(a, b);
  const sellLkr = Math.max(a, b);
  if (!isUsdBand(buyLkr, sellLkr)) {
    return null;
  }

  return { buyLkr, sellLkr };
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
    note: "TT / exchange-rate page scrape (indicative)",
  },
  {
    id: "ndb",
    name: "NDB Bank",
    kind: "html",
    url: "https://www.ndbbank.com/rates/exchange-rates",
    note: "TT / exchange-rate page scrape (indicative)",
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

function buildSeedSnapshot(): RemittanceTtSnapshot {
  const banks = remittanceData.banks.map((bank) =>
    withSpread({ ...bank, isSeed: true }),
  );
  const bestBuy = [...banks].sort((a, b) => b.buyLkr - a.buyLkr)[0];
  const bestSell = [...banks].sort((a, b) => a.sellLkr - b.sellLkr)[0];

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
    const band = parseUsdLkrBand(html);
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
 * for People's / NDB) with a short timeout. Per-bank seed fill on failure;
 * board isSeed only when every bank fails.
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
  const allLive = liveCount === BANK_SOURCES.length;
  const bestBuy = [...banks].sort((a, b) => b.buyLkr - a.buyLkr)[0];
  const bestSell = [...banks].sort((a, b) => a.sellLkr - b.sellLkr)[0];

  return {
    sourceId: remittanceData.sourceId,
    sourceName: allLive
      ? "Bank TT remittance board"
      : "Bank TT remittance board (partial live)",
    asOf: new Date().toISOString().slice(0, 10),
    methodologyNote: allLive
      ? "Indicative USD/LKR TT bands from bank JSON FX APIs (Commercial, HNB, Seylan, Sampath) plus People's/NDB public rate-page scrapes. Not CBSL official rates; fees and corridor products differ."
      : "Mixed live/seed board: JSON FX APIs and HTML scrapes where available; failed banks use curated seed rows (per-bank isSeed). Not CBSL official rates.",
    corridor: remittanceData.corridor,
    banks,
    bestBuy,
    bestSell,
    isSeed: false,
  };
}

export function getRemittanceTtSeedSnapshot(): RemittanceTtSnapshot {
  return buildSeedSnapshot();
}
