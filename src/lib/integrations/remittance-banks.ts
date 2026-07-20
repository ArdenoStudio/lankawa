import remittanceData from "@/data/remittance-tt-seed.json";

export interface RemittanceBankQuote {
  id: string;
  name: string;
  buyLkr: number;
  sellLkr: number;
  note: string;
  spreadLkr: number;
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
  isSeed: boolean;
}

const FETCH_TIMEOUT_MS = 6_000;

const BANK_PAGES = [
  {
    id: "peoples",
    name: "People's Bank",
    url: "https://www.peoplesbank.lk/exchange-rates/",
  },
  {
    id: "ndb",
    name: "NDB Bank",
    url: "https://www.ndbbank.com/rates-and-charges/exchange-rates",
  },
  {
    id: "sampath",
    name: "Sampath Bank",
    url: "https://www.sampath.lk/en/exchange-rates",
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

function buildSeedSnapshot(): RemittanceTtSnapshot {
  const banks = remittanceData.banks.map((bank) => withSpread(bank));
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

function parseUsdLkrBand(html: string): { buyLkr: number; sellLkr: number } | null {
  // Look for nearby USD / LKR style buy-sell number pairs on rate pages.
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
  if (a < 200 || a > 500 || b < 200 || b > 500) {
    return null;
  }

  const buyLkr = Math.min(a, b);
  const sellLkr = Math.max(a, b);
  if (sellLkr - buyLkr > 25 || sellLkr <= buyLkr) {
    return null;
  }

  return { buyLkr, sellLkr };
}

async function fetchBankQuote(
  bank: (typeof BANK_PAGES)[number],
): Promise<Omit<RemittanceBankQuote, "spreadLkr"> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(bank.url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

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
      note: "TT / exchange-rate page scrape (indicative)",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Attempts live bank TT-style USD/LKR bands with a short timeout.
 * Falls back to the curated seed board when scrapes fail or are incomplete.
 */
export async function fetchRemittanceTtSnapshot(): Promise<RemittanceTtSnapshot> {
  const results = await Promise.all(BANK_PAGES.map(fetchBankQuote));
  const liveBanks = results
    .filter((quote): quote is Omit<RemittanceBankQuote, "spreadLkr"> => quote != null)
    .map(withSpread);

  if (liveBanks.length === 0) {
    return buildSeedSnapshot();
  }

  // Prefer a full board; if only a subset scraped, fill gaps from seed.
  const seedById = new Map(
    remittanceData.banks.map((bank) => [bank.id, withSpread(bank)]),
  );
  const banks = BANK_PAGES.map((bank) => {
    const live = liveBanks.find((quote) => quote.id === bank.id);
    return live ?? seedById.get(bank.id)!;
  });

  const allLive = liveBanks.length === BANK_PAGES.length;
  const bestBuy = [...banks].sort((a, b) => b.buyLkr - a.buyLkr)[0];
  const bestSell = [...banks].sort((a, b) => a.sellLkr - b.sellLkr)[0];

  return {
    sourceId: remittanceData.sourceId,
    sourceName: allLive
      ? "Bank TT remittance board"
      : "Bank TT remittance board (partial live)",
    asOf: new Date().toISOString().slice(0, 10),
    methodologyNote: allLive
      ? "Indicative USD/LKR bands scraped from public bank exchange-rate pages. Not CBSL official rates; fees and corridor products differ."
      : remittanceData.methodologyNote,
    corridor: remittanceData.corridor,
    banks,
    bestBuy,
    bestSell,
    isSeed: !allLive,
  };
}

export function getRemittanceTtSeedSnapshot(): RemittanceTtSnapshot {
  return buildSeedSnapshot();
}
