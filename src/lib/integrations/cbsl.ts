const RESULTS_URL =
  "https://www.cbsl.gov.lk/cbsl_custom/exratestt/exrates_resultstt.php";
const GOLD_RESULTS_URL =
  "https://www.cbsl.gov.lk/cbsl_custom/exrates/exrates_results.php";

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const GOLD_LOOKBACK_DAYS = 10;
const GOLD_FETCH_TIMEOUT_MS = 7000;

export interface CbslFxRate {
  date: string;
  buyRate: number;
  sellRate: number;
  observedAt: string;
}

export interface CbslGoldRate {
  date: string;
  priceLkr: number;
  observedAt: string;
  unit: "LKR per troy ounce";
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toObservedAt(day: string): string {
  return `${day}T06:30:00.000Z`;
}

function cleanCellText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDecimal(value: string): number {
  return Number.parseFloat(value.replace(/,/g, ""));
}

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }

  return (AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal })
    .timeout(timeoutMs);
}

function parseRatesTable(html: string): CbslFxRate[] {
  const rates: CbslFxRate[] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  for (const rowMatch of html.matchAll(rowPattern)) {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(cellPattern)) {
      cells.push(cleanCellText(cellMatch[1]));
    }

    if (cells.length !== 3) {
      continue;
    }

    const [day, buy, sell] = cells;
    const buyRate = parseDecimal(buy);
    const sellRate = parseDecimal(sell);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      Number.isNaN(buyRate) ||
      Number.isNaN(sellRate)
    ) {
      continue;
    }

    rates.push({
      date: day,
      buyRate,
      sellRate,
      observedAt: toObservedAt(day),
    });
  }

  return rates;
}

function parseGoldTable(html: string): CbslGoldRate[] {
  const rates: CbslGoldRate[] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  for (const rowMatch of html.matchAll(rowPattern)) {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(cellPattern)) {
      cells.push(cleanCellText(cellMatch[1]));
    }

    if (cells.length < 2) {
      continue;
    }

    const [day, price] = cells;
    const priceLkr = parseDecimal(price);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      Number.isNaN(priceLkr) ||
      priceLkr <= 0
    ) {
      continue;
    }

    rates.push({
      date: day,
      priceLkr,
      observedAt: toObservedAt(day),
      unit: "LKR per troy ounce",
    });
  }

  return rates;
}

export async function fetchCbslFxRates(): Promise<CbslFxRate[]> {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 7);

  const body = new URLSearchParams({
    lookupPage: "lookup_daily_exchange_rates.php",
    startRange: "2006-11-11",
    rangeType: "dates",
    txtStart: formatDate(start),
    txtEnd: formatDate(today),
    "chk_cur[]": "USD~US Dollar",
    submit_button: "Submit",
  });

  const response = await fetch(RESULTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": BOT_USER_AGENT,
    },
    body: body.toString(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`CBSL responded with ${response.status}`);
  }

  const html = await response.text();
  const rates = parseRatesTable(html);

  if (rates.length === 0) {
    throw new Error("CBSL table parsed but contained no rate rows");
  }

  return rates.sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchLatestCbslFxRate(): Promise<CbslFxRate> {
  const rates = await fetchCbslFxRates();
  return rates[0];
}

export async function fetchCbslGoldRates(): Promise<CbslGoldRate[] | null> {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - GOLD_LOOKBACK_DAYS);

  const body = new URLSearchParams({
    lookupPage: "lookup_daily_exchange_rates.php",
    startRange: "2006-11-11",
    rangeType: "dates",
    txtStart: formatDate(start),
    txtEnd: formatDate(today),
    "chk_cur[]": "XAU~Gold (per Troy oz.)",
    submit_button: "Submit",
  });

  try {
    const response = await fetch(GOLD_RESULTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": BOT_USER_AGENT,
        Referer:
          "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/daily-gold-rates",
      },
      body: body.toString(),
      next: { revalidate: 3600 },
      signal: buildTimeoutSignal(GOLD_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const rates = parseGoldTable(html).sort((a, b) => b.date.localeCompare(a.date));

    return rates.length > 0 ? rates : null;
  } catch {
    return null;
  }
}

export async function fetchLatestCbslGoldRate(): Promise<CbslGoldRate | null> {
  const rates = await fetchCbslGoldRates();
  return rates?.[0] ?? null;
}
