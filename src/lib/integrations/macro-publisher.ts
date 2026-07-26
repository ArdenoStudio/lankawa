/**
 * Official macro mirrors from sri-lanka-macro-publisher.
 *
 * Primary use: DCS Colombo CCPI latest release for /economy inflation card.
 * Upstream: https://github.com/Gajarthan/sri-lanka-macro-publisher
 * See docs/EXTERNAL_REPOS_ASSESSMENT.md.
 */

import type { NcpiSnapshot } from "@/lib/ncpi";

const FETCH_TIMEOUT_MS = 12_000;

export const MACRO_PUBLISHER_CCPI_URL =
  process.env.MACRO_PUBLISHER_CCPI_URL ??
  "https://raw.githubusercontent.com/Gajarthan/sri-lanka-macro-publisher/main/data/latest/dcs_ccpi.json";

interface MacroRecord {
  indicator_code?: string;
  series_name?: string;
  value?: number;
  reference_date?: string;
  published_at?: string;
  source_url?: string;
  metadata?: {
    month_on_month_percent?: string;
    year_on_year_percent?: string;
    twelve_month_moving_average_percent?: string;
    release_page?: string;
  };
}

interface MacroCcpiPayload {
  collected_at?: string;
  family_code?: string;
  family_name?: string;
  records?: MacroRecord[];
  source_urls?: string[];
}

function parsePercent(raw: string | undefined): number | null {
  if (!raw) return null;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

function periodLabelFromReference(referenceDate: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(referenceDate);
  if (!match) {
    return referenceDate;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

function periodKey(referenceDate: string): string {
  return referenceDate.slice(0, 7);
}

export function mapMacroCcpiToInflationSnapshot(
  payload: MacroCcpiPayload,
): NcpiSnapshot | null {
  const record = payload.records?.find(
    (row) =>
      row.indicator_code === "ccpi_colombo" ||
      (typeof row.value === "number" && Number.isFinite(row.value)),
  );
  if (!record || typeof record.value !== "number" || !Number.isFinite(record.value)) {
    return null;
  }

  const yoy = parsePercent(record.metadata?.year_on_year_percent);
  const mom = parsePercent(record.metadata?.month_on_month_percent);
  if (yoy === null || mom === null) {
    return null;
  }

  const referenceDate = record.reference_date ?? payload.collected_at?.slice(0, 10);
  if (!referenceDate) {
    return null;
  }

  const releaseUrl =
    record.metadata?.release_page ??
    record.source_url ??
    payload.source_urls?.[0] ??
    "https://www.statistics.gov.lk/InflationAndPrices/StaticalInformation/MonthlyCCPI";

  const period = periodKey(referenceDate);
  const label = periodLabelFromReference(referenceDate).slice(0, 8);

  return {
    sourceId: "dcs_ccpi_macro",
    sourceName: "DCS CCPI (macro-publisher mirror)",
    base: "2021=100 (CCPI Colombo)",
    asOf: referenceDate,
    releasedAt: (record.published_at ?? payload.collected_at ?? referenceDate).slice(0, 10),
    periodLabel: periodLabelFromReference(referenceDate),
    methodologyNote:
      "Live mirror of the Department of Census and Statistics Colombo Consumer Price Index (CCPI) via sri-lanka-macro-publisher JSON. This is CCPI (Colombo), not NCPI national. Distinct from Lankawa COL composite.",
    releaseUrl,
    latest: {
      index: record.value,
      yoyPct: yoy,
      momPct: mom,
      coreYoyPct: yoy,
      foodYoyPct: yoy,
      nonFoodYoyPct: yoy,
    },
    series: [
      {
        period,
        label,
        index: record.value,
        yoyPct: yoy,
        momPct: mom,
      },
    ],
  };
}

export async function fetchMacroCcpiSnapshot(): Promise<NcpiSnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(MACRO_PUBLISHER_CCPI_URL, {
      signal: controller.signal,
      next: { revalidate: 21_600 },
      headers: {
        Accept: "application/json",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as MacroCcpiPayload;
    return mapMacroCcpiToInflationSnapshot(payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
