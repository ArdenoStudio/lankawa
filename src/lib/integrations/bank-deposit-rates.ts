import seedData from "@/data/bank-deposit-rates-seed.json";

export type InterestPaidIn =
  | "maturity"
  | "monthly"
  | "annually"
  | "quarterly"
  | "semi_annually";

export type BankDepositBankId = "combank" | "sampath" | "seylan" | "hnb";

export interface BankDepositRateQuote {
  bankId: BankDepositBankId;
  productCode: string;
  productName: string;
  currency: "LKR";
  tenorMonths: number;
  paidIn: InterestPaidIn;
  ratePa: number;
  aerPa?: number;
  effectiveFrom?: string;
  seniorCitizen?: boolean;
  sourceUrl: string;
}

export interface BankDepositRatesSnapshot {
  sourceId: string;
  asOf: string;
  methodologyNote: string;
  quotes: BankDepositRateQuote[];
  /** Per-bank live/seed coverage for honesty badges. */
  banks: { id: BankDepositBankId; name: string; isSeed: boolean }[];
  liveCount: number;
  seedCount: number;
  isSeed: boolean;
}

export interface DepositCompareRow {
  tenorMonths: number;
  /** Maturity % p.a. per bank; null when that bank has no maturity quote. */
  rates: Record<BankDepositBankId, number | null>;
  bestBankId: BankDepositBankId | null;
}

export const BANK_DEPOSIT_SOURCE_ID = "bank_deposit_rates";
export const COMPARE_TENORS_MONTHS = [3, 6, 12, 24, 36, 60] as const;

const FETCH_TIMEOUT_MS = 6_000;
const USER_AGENT = "LankawaBot/1.0 (+https://lankawa.lk)";

const BANK_META: readonly {
  id: BankDepositBankId;
  name: string;
  url: string;
  parse: (payload: unknown) => BankDepositRateQuote[];
}[] = [
  {
    id: "combank",
    name: "Commercial Bank",
    url: "https://www.combank.lk/api/interest-rates-fd",
    parse: parseCombankFd,
  },
  {
    id: "sampath",
    name: "Sampath Bank",
    url: "https://www.sampath.lk/api/rates-and-charges/external",
    parse: parseSampathFd,
  },
  {
    id: "seylan",
    name: "Seylan Bank",
    url: "https://www.seylan.lk/get-fd-data",
    parse: parseSeylanFd,
  },
  {
    id: "hnb",
    name: "Hatton National Bank",
    url: "https://venus.hnb.lk/api/get_interest_rates_contents",
    parse: parseHnbInterestRates,
  },
] as const;

type SeedFile = {
  sourceId: string;
  asOf: string;
  methodologyNote: string;
  quotes: BankDepositRateQuote[];
};

const seed = seedData as SeedFile;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseFloat(value.replace(/%/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isPlausibleFdRate(ratePa: number): boolean {
  return ratePa > 0 && ratePa < 40;
}

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePeriodMonths(period: string, periodType: string): number | null {
  const n = Number.parseInt(period, 10);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  const t = periodType.toUpperCase();
  if (t === "M") {
    return n;
  }
  if (t === "Y") {
    return n * 12;
  }
  if (t === "D") {
    return Math.round(n / 30);
  }
  return null;
}

/** Parse Sampath `withEfectFrom` e.g. "Wednesday, June 10 2026" → ISO date. */
export function parseSampathEffectiveFrom(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) {
    return undefined;
  }
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return new Date(parsed).toISOString().slice(0, 10);
}

/** Commercial Bank `GET /api/interest-rates-fd` — flat array of paidIn/period/rate. */
export function parseCombankFd(payload: unknown): BankDepositRateQuote[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  const sourceUrl = "https://www.combank.lk/api/interest-rates-fd";
  const quotes: BankDepositRateQuote[] = [];

  for (const row of payload) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const record = row as Record<string, unknown>;
    const paidRaw = String(record.paidIn ?? "").toLowerCase();
    if (
      paidRaw !== "maturity" &&
      paidRaw !== "monthly" &&
      paidRaw !== "annually"
    ) {
      continue;
    }
    const tenorMonths = toFiniteNumber(record.period);
    const ratePa = toFiniteNumber(record.rate);
    if (tenorMonths == null || ratePa == null || !isPlausibleFdRate(ratePa)) {
      continue;
    }
    quotes.push({
      bankId: "combank",
      productCode: "standard-fd",
      productName: "Fixed Deposit",
      currency: "LKR",
      tenorMonths: Math.round(tenorMonths),
      paidIn: paidRaw as InterestPaidIn,
      ratePa,
      seniorCitizen: false,
      sourceUrl,
    });
  }

  return quotes;
}

/**
 * Sampath `GET /api/rates-and-charges/external` — FDNOR maturity + monthly
 * for common tenors 3/6/12/24/36/60 months.
 */
export function parseSampathFd(payload: unknown): BankDepositRateQuote[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const local = (payload as { local?: { term_and_deposite?: unknown } }).local;
  const products = local?.term_and_deposite;
  if (!Array.isArray(products)) {
    return [];
  }

  const sourceUrl = "https://www.sampath.lk/api/rates-and-charges/external";
  const common = new Set<number>(COMPARE_TENORS_MONTHS);
  const quotes: BankDepositRateQuote[] = [];

  for (const product of products) {
    if (!product || typeof product !== "object") {
      continue;
    }
    const p = product as Record<string, unknown>;
    const rateCode = String(p.rateCode ?? "");
    if (rateCode !== "FDNOR") {
      continue;
    }
    const productName = String(p.productHead ?? "Normal Fixed Deposit");
    const effectiveFrom = parseSampathEffectiveFrom(p.withEfectFrom);
    const slabs = p.slabAmount;
    if (!Array.isArray(slabs)) {
      continue;
    }

    for (const slab of slabs) {
      if (!slab || typeof slab !== "object") {
        continue;
      }
      const s = slab as Record<string, unknown>;
      // Primary FDNOR strip uses month slabs only — skip day promo / year rows.
      if (String(s.PeriodType ?? "").toUpperCase() !== "M") {
        continue;
      }
      const tenorMonths = parsePeriodMonths(
        String(s.Period ?? ""),
        String(s.PeriodType ?? ""),
      );
      if (tenorMonths == null || !common.has(tenorMonths)) {
        continue;
      }

      const base = {
        bankId: "sampath" as const,
        productCode: rateCode,
        productName,
        currency: "LKR" as const,
        tenorMonths,
        seniorCitizen: false,
        sourceUrl,
        ...(effectiveFrom ? { effectiveFrom } : {}),
      };

      const rateMat = toFiniteNumber(s.RateMat);
      if (rateMat != null && isPlausibleFdRate(rateMat)) {
        const aerMat = toFiniteNumber(s.AerMat);
        quotes.push({
          ...base,
          paidIn: "maturity",
          ratePa: rateMat,
          ...(aerMat != null ? { aerPa: aerMat } : {}),
        });
      }

      const rateMon = toFiniteNumber(s.RateMon);
      if (rateMon != null && isPlausibleFdRate(rateMon)) {
        const aerMon = toFiniteNumber(s.AerMon);
        quotes.push({
          ...base,
          paidIn: "monthly",
          ratePa: rateMon,
          ...(aerMon != null ? { aerPa: aerMon } : {}),
        });
      }
    }
  }

  return quotes;
}

/**
 * Seylan `GET /get-fd-data` — body is JSON despite text/html Content-Type.
 * Prefer senior-below (under 60); also parse senior-above. Skip zero rates.
 */
export function parseSeylanFd(payload: unknown): BankDepositRateQuote[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const root = payload as Record<string, unknown>;
  const sourceUrl = "https://www.seylan.lk/get-fd-data";
  const quotes: BankDepositRateQuote[] = [];

  const blocks: { key: string; senior: boolean; name: string }[] = [
    { key: "senior-below", senior: false, name: "Fixed Deposit" },
    {
      key: "senior-above",
      senior: true,
      name: "Senior Citizen Fixed Deposit",
    },
  ];

  for (const block of blocks) {
    const groups = root[block.key];
    if (!Array.isArray(groups)) {
      continue;
    }
    for (const group of groups) {
      if (!group || typeof group !== "object") {
        continue;
      }
      const g = group as Record<string, unknown>;
      const typeRaw = String(g.type ?? "").toLowerCase();
      let paidIn: InterestPaidIn | null = null;
      if (typeRaw === "maturity") {
        paidIn = "maturity";
      } else if (typeRaw === "monthly") {
        paidIn = "monthly";
      } else if (typeRaw === "annually") {
        paidIn = "annually";
      }
      if (!paidIn) {
        continue;
      }
      const interest = g.interest;
      if (!Array.isArray(interest)) {
        continue;
      }
      for (const row of interest) {
        if (!row || typeof row !== "object") {
          continue;
        }
        const r = row as Record<string, unknown>;
        const tenorMonths = toFiniteNumber(r.month);
        const ratePa = toFiniteNumber(r.interest);
        if (
          tenorMonths == null ||
          ratePa == null ||
          ratePa === 0 ||
          !isPlausibleFdRate(ratePa)
        ) {
          continue;
        }
        quotes.push({
          bankId: "seylan",
          productCode: block.key,
          productName: block.name,
          currency: "LKR",
          tenorMonths: Math.round(tenorMonths),
          paidIn,
          ratePa,
          seniorCitizen: block.senior,
          sourceUrl,
        });
      }
    }
  }

  return quotes;
}

function parseHnbPeriodMonths(periodCell: string): number | null {
  const match = periodCell.match(/(\d+)\s*(?:Months?|M)/i);
  if (!match) {
    return null;
  }
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapHnbPaidInColumn(column: string): InterestPaidIn | null {
  const c = column.trim().toLowerCase();
  if (c === "monthly") {
    return "monthly";
  }
  if (c === "quarterly") {
    return "quarterly";
  }
  if (c === "semi annually" || c === "semi-annually") {
    return "semi_annually";
  }
  if (c === "annually") {
    return "annually";
  }
  if (c === "maturity") {
    return "maturity";
  }
  return null;
}

function isAerColumn(column: string): boolean {
  const c = column.trim().toLowerCase();
  return c.includes("annual effective") || c === "aer";
}

/**
 * HNB Venus `get_interest_rates_contents` — extract FD rows for common tenors
 * from the primary “Fixed Deposits Interest Rates” table (plus other FD
 * divisions when present).
 */
export function parseHnbInterestRates(payload: unknown): BankDepositRateQuote[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    return [];
  }

  const sourceUrl = "https://venus.hnb.lk/api/get_interest_rates_contents";
  const common = new Set<number>(COMPARE_TENORS_MONTHS);
  const quotes: BankDepositRateQuote[] = [];

  for (const category of data) {
    if (!category || typeof category !== "object") {
      continue;
    }
    const subs = (category as { interest_rate_sub_category?: unknown })
      .interest_rate_sub_category;
    if (!Array.isArray(subs)) {
      continue;
    }
    for (const sub of subs) {
      if (!sub || typeof sub !== "object") {
        continue;
      }
      const subName = String(
        (sub as { name?: unknown }).name ?? "",
      ).toLowerCase();
      if (!subName.includes("fixed deposit")) {
        continue;
      }
      const divisions = (
        sub as { sub_category_division_approved?: unknown }
      ).sub_category_division_approved;
      if (!Array.isArray(divisions)) {
        continue;
      }

      for (const division of divisions) {
        if (!division || typeof division !== "object") {
          continue;
        }
        const d = division as Record<string, unknown>;
        const title = String(d.title ?? "").trim();
        if (!title) {
          continue;
        }
        const productCode = slugify(title);
        const seniorCitizen = /senior/i.test(title);
        const effectiveFrom =
          typeof d.last_reviewed_on === "string" && d.last_reviewed_on
            ? d.last_reviewed_on
            : undefined;
        const tables = d.table_data_approved;
        if (!Array.isArray(tables)) {
          continue;
        }

        for (const tableRow of tables) {
          if (!tableRow || typeof tableRow !== "object") {
            continue;
          }
          const raw = (tableRow as { data?: unknown }).data;
          let table: { columns?: unknown; rows?: unknown } | null = null;
          if (typeof raw === "string") {
            try {
              table = JSON.parse(raw) as { columns?: unknown; rows?: unknown };
            } catch {
              continue;
            }
          } else if (raw && typeof raw === "object") {
            table = raw as { columns?: unknown; rows?: unknown };
          }
          if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) {
            continue;
          }

          const columns = table.columns.map((c) => String(c));
          const aerIdx = columns.findIndex(isAerColumn);

          for (const row of table.rows) {
            if (!Array.isArray(row) || row.length === 0) {
              continue;
            }
            const cells = row.map((c) => String(c ?? "").trim());
            const tenorMonths = parseHnbPeriodMonths(cells[0] ?? "");
            if (tenorMonths == null || !common.has(tenorMonths)) {
              continue;
            }

            const aerPa =
              aerIdx >= 0 ? toFiniteNumber(cells[aerIdx]) : null;

            for (let i = 1; i < columns.length; i++) {
              const paidIn = mapHnbPaidInColumn(columns[i]);
              if (!paidIn) {
                continue;
              }
              const cell = cells[i] ?? "";
              if (!cell || cell === "-" || cell === "- ") {
                continue;
              }
              const ratePa = toFiniteNumber(cell);
              if (ratePa == null || !isPlausibleFdRate(ratePa)) {
                continue;
              }
              quotes.push({
                bankId: "hnb",
                productCode,
                productName: title,
                currency: "LKR",
                tenorMonths,
                paidIn,
                ratePa,
                ...(aerPa != null ? { aerPa } : {}),
                ...(effectiveFrom ? { effectiveFrom } : {}),
                seniorCitizen,
                sourceUrl,
              });
            }
          }
        }
      }
    }
  }

  return quotes;
}

function seedQuotesForBank(bankId: BankDepositBankId): BankDepositRateQuote[] {
  return seed.quotes.filter((q) => q.bankId === bankId);
}

function buildSeedSnapshot(): BankDepositRatesSnapshot {
  const banks = BANK_META.map((b) => ({
    id: b.id,
    name: b.name,
    isSeed: true,
  }));
  return {
    sourceId: seed.sourceId,
    asOf: seed.asOf,
    methodologyNote: seed.methodologyNote,
    quotes: seed.quotes.map((q) => ({ ...q })),
    banks,
    liveCount: 0,
    seedCount: banks.length,
    isSeed: true,
  };
}

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
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

async function fetchBankQuotes(
  bank: (typeof BANK_META)[number],
): Promise<BankDepositRateQuote[] | null> {
  const response = await fetchWithTimeout(bank.url);
  if (!response) {
    return null;
  }
  try {
    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      return null;
    }
    const quotes = bank.parse(payload);
    return quotes.length > 0 ? quotes : null;
  } catch {
    return null;
  }
}

/**
 * Parallel fetch of ComBank / Sampath / Seylan / HNB FD surfaces with
 * per-bank seed fallback. Board isSeed only when every bank fails.
 */
export async function fetchBankDepositRatesSnapshot(): Promise<BankDepositRatesSnapshot> {
  const results = await Promise.all(BANK_META.map(fetchBankQuotes));

  const quotes: BankDepositRateQuote[] = [];
  const banks: BankDepositRatesSnapshot["banks"] = [];
  let liveCount = 0;
  let seedCount = 0;

  for (let i = 0; i < BANK_META.length; i++) {
    const meta = BANK_META[i];
    const live = results[i];
    if (live) {
      quotes.push(...live);
      banks.push({ id: meta.id, name: meta.name, isSeed: false });
      liveCount += 1;
    } else {
      quotes.push(...seedQuotesForBank(meta.id));
      banks.push({ id: meta.id, name: meta.name, isSeed: true });
      seedCount += 1;
    }
  }

  if (liveCount === 0) {
    return buildSeedSnapshot();
  }

  const allLive = seedCount === 0;
  return {
    sourceId: BANK_DEPOSIT_SOURCE_ID,
    asOf: new Date().toISOString().slice(0, 10),
    methodologyNote: allLive
      ? "Public indicative LKR FD maturity rates from bank JSON APIs (Commercial interest-rates-fd, Sampath FDNOR, Seylan get-fd-data, HNB Venus get_interest_rates_contents). Lankawa is not affiliated with these banks. Not advice — confirm on the bank site."
      : "Mixed live/seed FD board: live JSON where available; failed banks use curated seed quotes (per-bank isSeed). Lankawa is not affiliated with these banks. Public indicative only — not advice.",
    quotes,
    banks,
    liveCount,
    seedCount,
    isSeed: false,
  };
}

export function getBankDepositRatesSeedSnapshot(): BankDepositRatesSnapshot {
  return buildSeedSnapshot();
}

/**
 * Comparison matrix: maturity rates at 3/6/12/24/36/60 months per bank.
 * Prefers primary products (ComBank standard, Sampath FDNOR, Seylan
 * senior-below, HNB fixed-deposits-interest-rates).
 */
export function getCompareMatrix(
  snapshot: BankDepositRatesSnapshot,
): DepositCompareRow[] {
  const primaryProduct: Record<BankDepositBankId, (q: BankDepositRateQuote) => boolean> =
    {
      combank: (q) => q.productCode === "standard-fd",
      sampath: (q) => q.productCode === "FDNOR",
      seylan: (q) => q.productCode === "senior-below",
      hnb: (q) => q.productCode === "fixed-deposits-interest-rates",
    };

  const maturity = snapshot.quotes.filter((q) => q.paidIn === "maturity");

  return COMPARE_TENORS_MONTHS.map((tenorMonths) => {
    const rates: Record<BankDepositBankId, number | null> = {
      combank: null,
      sampath: null,
      seylan: null,
      hnb: null,
    };

    for (const bankId of Object.keys(rates) as BankDepositBankId[]) {
      const match = maturity.find(
        (q) =>
          q.bankId === bankId &&
          q.tenorMonths === tenorMonths &&
          primaryProduct[bankId](q),
      );
      rates[bankId] = match ? match.ratePa : null;
    }

    const seedIds = new Set(
      snapshot.banks.filter((b) => b.isSeed).map((b) => b.id),
    );
    const ordered = Object.keys(rates) as BankDepositBankId[];
    const liveWithRate = ordered.filter(
      (id) => rates[id] != null && !seedIds.has(id),
    );
    const pool = liveWithRate.length > 0 ? liveWithRate : ordered;

    let bestBankId: BankDepositBankId | null = null;
    let bestRate = -Infinity;
    for (const bankId of pool) {
      const rate = rates[bankId];
      if (rate != null && rate > bestRate) {
        bestRate = rate;
        bestBankId = bankId;
      }
    }

    return { tenorMonths, rates, bestBankId };
  });
}

export function bankDisplayName(bankId: BankDepositBankId): string {
  return BANK_META.find((b) => b.id === bankId)?.name ?? bankId;
}
