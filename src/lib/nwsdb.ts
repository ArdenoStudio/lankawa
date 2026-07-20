import tariffData from "@/data/nwsdb-tariff-seed.json";

export interface WaterTariffSlab {
  id: string;
  fromM3: number;
  toM3: number | null;
  usageLkrPerM3: number;
  serviceLkrPerMonth: number;
}

export interface WaterTariffTrack {
  id: string;
  label: string;
  categoryId: number;
  consumerCategoryCode: number;
  slabs: WaterTariffSlab[];
}

export interface NwsdbTariffSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  effectiveFrom: string;
  category: string;
  vatRatePct: number;
  unit: string;
  methodologyNote: string;
  decisionUrl: string;
  gazetteUrl: string;
  billCalculatorUrl: string;
  liveApiUrl: string;
  tracks: WaterTariffTrack[];
}

export interface WaterBillEstimate {
  unitsM3: number;
  trackId: string;
  usageLkr: number;
  serviceLkr: number;
  vatLkr: number;
  totalLkr: number;
  /** Seed local calc vs live BillCalculator Calculation. */
  mode: "seed" | "live";
  noOfDays: number;
}

export interface LiveBillCalculatorResponse {
  Calculation?: {
    UsageCharge?: number | null;
    ServiceCharge?: number | null;
    BillVAT?: number | null;
    TotalAmount?: number | null;
  };
  Tariff?: unknown;
  error?: unknown;
}

const seed = tariffData as NwsdbTariffSnapshot;
const FETCH_TIMEOUT_MS = 8_000;
const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const DEFAULT_BILLING_DAYS = 30;

/** Domestic (CategoryId 1) is the default household track. */
export const NWSDB_DOMESTIC_CATEGORY_ID = 1;

export function getNwsdbTariffSnapshot(): NwsdbTariffSnapshot {
  return seed;
}

function unitsInSlab(
  unitsM3: number,
  fromM3: number,
  toM3: number | null,
): number {
  if (unitsM3 < fromM3) {
    return 0;
  }

  const upper = toM3 ?? Number.POSITIVE_INFINITY;
  const start = fromM3 === 0 ? 0 : fromM3 - 1;
  const end = Math.min(unitsM3, upper);
  return Math.max(0, end - start);
}

function findTrack(trackId: string): WaterTariffTrack | undefined {
  return seed.tracks.find((item) => item.id === trackId);
}

/** Indicative monthly bill from seed slabs (progressive usage + band service + VAT). */
export function estimateWaterBill(
  unitsM3: number,
  trackId: string = "domestic",
): WaterBillEstimate | null {
  if (!Number.isFinite(unitsM3) || unitsM3 < 0) {
    return null;
  }

  const rounded = Math.floor(unitsM3);
  const track = findTrack(trackId);
  if (!track) {
    return null;
  }

  let usageLkr = 0;
  let serviceLkr = 0;

  for (const slab of track.slabs) {
    const units = unitsInSlab(rounded, slab.fromM3, slab.toM3);
    usageLkr += units * slab.usageLkrPerM3;
    if (units > 0) {
      serviceLkr = slab.serviceLkrPerMonth;
    }
  }

  const vatLkr = Number(
    (((usageLkr + serviceLkr) * seed.vatRatePct) / 100).toFixed(2),
  );

  return {
    unitsM3: rounded,
    trackId: track.id,
    usageLkr: Number(usageLkr.toFixed(2)),
    serviceLkr,
    vatLkr,
    totalLkr: Number((usageLkr + serviceLkr + vatLkr).toFixed(2)),
    mode: "seed",
    noOfDays: DEFAULT_BILLING_DAYS,
  };
}

export function parseLiveBillCalculator(
  payload: unknown,
  unitsM3: number,
  trackId: string,
  noOfDays: number,
): WaterBillEstimate | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const calc = (payload as LiveBillCalculatorResponse).Calculation;
  if (!calc || typeof calc !== "object") {
    return null;
  }

  const usage = Number(calc.UsageCharge);
  const service = Number(calc.ServiceCharge);
  const vat = Number(calc.BillVAT);
  const total = Number(calc.TotalAmount);

  if (
    !Number.isFinite(usage) ||
    !Number.isFinite(service) ||
    !Number.isFinite(vat) ||
    !Number.isFinite(total)
  ) {
    return null;
  }

  return {
    unitsM3: Math.floor(unitsM3),
    trackId,
    usageLkr: Number(usage.toFixed(2)),
    serviceLkr: Number(service.toFixed(2)),
    vatLkr: Number(vat.toFixed(2)),
    totalLkr: Number(total.toFixed(2)),
    mode: "live",
    noOfDays,
  };
}

/**
 * Optional live estimate via NWSDB DirectPay BillCalculator JSON.
 * Returns null on timeout/error — callers should keep seed estimate.
 */
export async function fetchLiveWaterBillEstimate(options: {
  unitsM3: number;
  categoryId?: number;
  trackId?: string;
  noOfDays?: number;
}): Promise<WaterBillEstimate | null> {
  const unitsM3 = options.unitsM3;
  if (!Number.isFinite(unitsM3) || unitsM3 < 0) {
    return null;
  }

  const trackId = options.trackId ?? "domestic";
  const track = findTrack(trackId);
  const categoryId =
    options.categoryId ?? track?.categoryId ?? NWSDB_DOMESTIC_CATEGORY_ID;
  const noOfDays = options.noOfDays ?? DEFAULT_BILLING_DAYS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(seed.liveApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "https://ebis.waterboard.lk",
        Referer: "https://ebis.waterboard.lk/directPay/",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        CategoryId: categoryId,
        NoOfDays: noOfDays,
        Consumption: Math.floor(unitsM3),
        NoOfHouses: 0,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return parseLiveBillCalculator(payload, unitsM3, trackId, noOfDays);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
