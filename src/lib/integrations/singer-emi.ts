import seedData from "@/data/singer-emi-seed.json";

const SINGER_BASE = "https://www.singersl.com";
const EMI_LIST_URL = `${SINGER_BASE}/json-get-emi`;
const EMI_SINGLE_URL = `${SINGER_BASE}/json-get-single-emi`;

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";

const FETCH_REVALIDATE_SECONDS = 3600;
const FETCH_TIMEOUT_MS = 8_000;
/** Cap per-bank tenor fetches — thin chip, not a full PDP crawl. */
const MAX_SINGLE_EMI_BANKS = 6;

export const SINGER_EMI_SOURCE_ID = "singer_emi";

export interface SingerEmiSampleProduct {
  productId: number;
  productPriceLkr: number;
  label: string;
  productUrl: string;
}

export interface SingerEmiBankRow {
  id: number;
  name: string;
  callConvert: boolean;
  tenorsMonths: number[];
  /** Formatted monthly installment strings from Singer (sample SKU price). */
  sampleMonthlyFormatted: string[];
}

export interface SingerEmiSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  methodologyNote: string;
  sampleProduct: SingerEmiSampleProduct;
  banks: SingerEmiBankRow[];
  defaultTenorsMonths: number[];
  callConvertCount: number;
}

type SeedFile = {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  sampleProduct: SingerEmiSampleProduct;
  banks: SingerEmiBankRow[];
  defaultTenorsMonths: number[];
};

const seed = seedData as SeedFile;

interface RawBank {
  id?: unknown;
  name?: unknown;
  call_convert?: unknown;
}

interface RawInstallment {
  installment?: unknown;
  interest?: unknown;
}

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }

  return (AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal })
    .timeout(timeoutMs);
}

export function parseMonthlyAmount(value: string): number | null {
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }
  const n = Number.parseFloat(match[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatTenorsLabel(tenors: number[]): string {
  if (tenors.length === 0) {
    return "—";
  }
  return tenors.join("/");
}

export function summarizeCallConvert(banks: SingerEmiBankRow[]): number {
  return banks.filter((bank) => bank.callConvert).length;
}

function withCounts(
  partial: Omit<SingerEmiSnapshot, "callConvertCount">,
): SingerEmiSnapshot {
  return {
    ...partial,
    callConvertCount: summarizeCallConvert(partial.banks),
  };
}

function buildSeedSnapshot(): SingerEmiSnapshot {
  return withCounts({
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    isSeed: true,
    methodologyNote: seed.methodologyNote,
    sampleProduct: { ...seed.sampleProduct },
    banks: seed.banks.map((bank) => ({
      ...bank,
      tenorsMonths: [...bank.tenorsMonths],
      sampleMonthlyFormatted: [...bank.sampleMonthlyFormatted],
    })),
    defaultTenorsMonths: [...seed.defaultTenorsMonths],
  });
}

function asPositiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Math.trunc(n);
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Parse `json-get-emi` body: `[banks[], defaultInstallments[]]`. */
export function parseEmiListPayload(payload: unknown): {
  banks: Array<{ id: number; name: string; callConvert: boolean }>;
  defaultTenorsMonths: number[];
} | null {
  if (!Array.isArray(payload) || payload.length < 1) {
    return null;
  }

  const banksRaw = payload[0];
  if (!Array.isArray(banksRaw) || banksRaw.length === 0) {
    return null;
  }

  const banks: Array<{ id: number; name: string; callConvert: boolean }> = [];
  for (const row of banksRaw as RawBank[]) {
    const id = asPositiveInt(row.id);
    const name = asNonEmptyString(row.name);
    if (id == null || name == null) {
      continue;
    }
    banks.push({
      id,
      name,
      callConvert: Number(row.call_convert) === 1 || row.call_convert === true,
    });
  }

  if (banks.length === 0) {
    return null;
  }

  const defaultsRaw = Array.isArray(payload[1]) ? (payload[1] as RawInstallment[]) : [];
  const defaultTenorsMonths: number[] = [];
  for (const row of defaultsRaw) {
    const months = asPositiveInt(row.installment);
    if (months != null) {
      defaultTenorsMonths.push(months);
    }
  }

  return { banks, defaultTenorsMonths };
}

/** Parse `json-get-single-emi` body: `[installmentRows[], bankInfo]`. */
export function parseSingleEmiPayload(payload: unknown): {
  tenorsMonths: number[];
  sampleMonthlyFormatted: string[];
} | null {
  if (!Array.isArray(payload) || payload.length < 1) {
    return null;
  }

  const rows = payload[0];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const tenorsMonths: number[] = [];
  const sampleMonthlyFormatted: string[] = [];
  for (const row of rows as RawInstallment[]) {
    const months = asPositiveInt(row.installment);
    const monthly = asNonEmptyString(row.interest);
    if (months == null || monthly == null) {
      continue;
    }
    tenorsMonths.push(months);
    sampleMonthlyFormatted.push(monthly);
  }

  if (tenorsMonths.length === 0) {
    return null;
  }

  return { tenorsMonths, sampleMonthlyFormatted };
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": BOT_USER_AGENT,
      },
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

async function enrichBankTenors(
  bank: { id: number; name: string; callConvert: boolean },
  productId: number,
  productPriceLkr: number,
  defaultTenorsMonths: number[],
): Promise<SingerEmiBankRow> {
  const url = `${EMI_SINGLE_URL}?bank_id=${bank.id}&product_id=${productId}&product_price=${productPriceLkr}`;
  const payload = await fetchJson(url);
  const parsed = payload != null ? parseSingleEmiPayload(payload) : null;
  if (parsed) {
    return {
      id: bank.id,
      name: bank.name,
      callConvert: bank.callConvert,
      tenorsMonths: parsed.tenorsMonths,
      sampleMonthlyFormatted: parsed.sampleMonthlyFormatted,
    };
  }

  return {
    id: bank.id,
    name: bank.name,
    callConvert: bank.callConvert,
    tenorsMonths: [...defaultTenorsMonths],
    sampleMonthlyFormatted: [],
  };
}

/**
 * Thin household EMI snapshot from Singer public JSON.
 * Softlogic per-SKU `variation-detail` crawl is intentionally skipped (too heavy).
 * Abans / Arpico: no merchant EMI JSON — parked for bank IPP ingest.
 */
export async function fetchSingerEmiSnapshot(): Promise<SingerEmiSnapshot> {
  const sample = seed.sampleProduct;
  const listUrl = `${EMI_LIST_URL}?product_id=${sample.productId}&product_price=${sample.productPriceLkr}`;
  const listPayload = await fetchJson(listUrl);
  const parsed = listPayload != null ? parseEmiListPayload(listPayload) : null;

  if (!parsed) {
    return buildSeedSnapshot();
  }

  const defaultTenorsMonths =
    parsed.defaultTenorsMonths.length > 0
      ? parsed.defaultTenorsMonths
      : [...seed.defaultTenorsMonths];

  const toEnrich = parsed.banks.slice(0, MAX_SINGLE_EMI_BANKS);
  const remainder = parsed.banks.slice(MAX_SINGLE_EMI_BANKS);

  const enriched = await Promise.all(
    toEnrich.map((bank) =>
      enrichBankTenors(
        bank,
        sample.productId,
        sample.productPriceLkr,
        defaultTenorsMonths,
      ),
    ),
  );

  const banks: SingerEmiBankRow[] = [
    ...enriched,
    ...remainder.map((bank) => ({
      id: bank.id,
      name: bank.name,
      callConvert: bank.callConvert,
      tenorsMonths: [...defaultTenorsMonths],
      sampleMonthlyFormatted: [] as string[],
    })),
  ];

  return withCounts({
    sourceId: SINGER_EMI_SOURCE_ID,
    sourceName: "Singer Sri Lanka — household EMI",
    asOf: new Date().toISOString().slice(0, 10),
    isSeed: false,
    methodologyNote:
      "Live probe of singersl.com `json-get-emi` + capped `json-get-single-emi` for a featured sample appliance SKU. Monthly LKR figures are indicative for that sample price only — confirm on the Singer PDP. Softlogic per-SKU crawl skipped (too heavy). Abans/Arpico EMI parked (no public merchant EMI JSON).",
    sampleProduct: { ...sample },
    banks,
    defaultTenorsMonths,
  });
}

export function getSingerEmiSeedSnapshot(): SingerEmiSnapshot {
  return buildSeedSnapshot();
}
