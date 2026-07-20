import seedData from "@/data/cbsl-policy-rates-seed.json";

export const CBSL_POLICY_RATES_SOURCE_ID = "cbsl_policy_rates";

export const PLRATES_URL =
  "https://www.cbsl.gov.lk/cbsl_custom/param/plrates.php";

export const POLICY_RATES_PAGE_URL =
  "https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates";

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const FETCH_TIMEOUT_MS = 7_000;
const MAX_ATTEMPTS = 2;

export interface CbslPolicyRatesSeed {
  sourceId: string;
  sourceName: string;
  asOf: string;
  effectiveDate: string;
  unit: "%";
  opr: number;
  sdfr: number;
  slfr: number;
  srr: number;
  isSeed: boolean;
  boardUrl: string;
  policyPageUrl: string;
  historyExcelUrl: string;
  note: string;
}

export interface CbslPolicyRatesSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  effectiveDate: string | null;
  unit: "%";
  opr: number;
  sdfr: number;
  slfr: number;
  srr: number | null;
  isSeed: boolean;
  /** True when OPR came from plrates.php HTML. */
  oprIsLive: boolean;
  /** True when SDFR/SLFR came from the curated Excel tip seed. */
  corridorIsSeed: boolean;
  boardUrl: string;
  policyPageUrl: string;
  note: string;
}

export interface PlratesBoard {
  opr: number;
  srr: number | null;
}

const seed = seedData as CbslPolicyRatesSeed;

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

function parseDecimal(value: string): number | null {
  const n = Number.parseFloat(value.replace(/,/g, "").replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function isPlausibleRate(value: number): boolean {
  return value >= 0 && value <= 50;
}

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }

  return (AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal })
    .timeout(timeoutMs);
}

/**
 * Parse the tiny plrates.php HTML table for OPR (+ optional SRR).
 * SDFR/SLFR are usually absent from this iframe — corridor comes from seed.
 */
export function parsePlratesHtml(html: string): PlratesBoard | null {
  if (!html || !/Overnight\s+Policy\s+Rate|\bOPR\b/i.test(html)) {
    return null;
  }

  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  let opr: number | null = null;
  let srr: number | null = null;

  for (const rowMatch of html.matchAll(rowPattern)) {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(cellPattern)) {
      cells.push(cleanCellText(cellMatch[1]));
    }

    if (cells.length < 2) {
      continue;
    }

    const label = cells[0];
    const value = parseDecimal(cells[1]);
    if (value == null || !isPlausibleRate(value)) {
      continue;
    }

    if (/Overnight\s+Policy\s+Rate|\bOPR\b/i.test(label)) {
      opr = value;
    } else if (/Statutory\s+Reserve\s+Ratio|\bSRR\b/i.test(label)) {
      srr = value;
    }
  }

  // Fallback: plain-text scrape when tags are odd but numbers sit after labels.
  if (opr == null) {
    const text = cleanCellText(html);
    const oprMatch = text.match(
      /Overnight\s+Policy\s+Rate\s*\(?\s*OPR\s*\)?\s*([0-9]+(?:\.[0-9]+)?)/i,
    );
    if (oprMatch) {
      const n = parseDecimal(oprMatch[1]);
      if (n != null && isPlausibleRate(n)) {
        opr = n;
      }
    }
    if (srr == null) {
      const srrMatch = text.match(
        /Statutory\s+Reserve\s+Ratio\s*\(?\s*SRR\s*\)?\s*([0-9]+(?:\.[0-9]+)?)/i,
      );
      if (srrMatch) {
        const n = parseDecimal(srrMatch[1]);
        if (n != null && isPlausibleRate(n)) {
          srr = n;
        }
      }
    }
  }

  if (opr == null) {
    return null;
  }

  return { opr, srr };
}

export function getCbslPolicyRatesSeedSnapshot(): CbslPolicyRatesSnapshot {
  return {
    sourceId: seed.sourceId || CBSL_POLICY_RATES_SOURCE_ID,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    effectiveDate: seed.effectiveDate,
    unit: "%",
    opr: seed.opr,
    sdfr: seed.sdfr,
    slfr: seed.slfr,
    srr: seed.srr,
    isSeed: true,
    oprIsLive: false,
    corridorIsSeed: true,
    boardUrl: seed.boardUrl || PLRATES_URL,
    policyPageUrl: seed.policyPageUrl || POLICY_RATES_PAGE_URL,
    note: seed.note,
  };
}

async function fetchPlratesOnce(): Promise<PlratesBoard | null> {
  const response = await fetch(PLRATES_URL, {
    method: "GET",
    headers: {
      "User-Agent": BOT_USER_AGENT,
      Accept: "text/html,*/*",
      Referer: POLICY_RATES_PAGE_URL,
    },
    next: { revalidate: 3600 },
    signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
  });

  // CBSL intermittently returns HTTP 500 with a still-usable HTML body.
  const html = await response.text();
  return parsePlratesHtml(html);
}

/**
 * Live OPR (+ SRR) from plrates.php, with SDFR/SLFR corridor from seed tip.
 * Falls back to full seed when the board is empty or the host errors out.
 */
export async function fetchCbslPolicyRatesSnapshot(): Promise<CbslPolicyRatesSnapshot> {
  const fallback = getCbslPolicyRatesSeedSnapshot();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const board = await fetchPlratesOnce();
      if (!board) {
        continue;
      }

      const today = new Date().toISOString().slice(0, 10);

      return {
        sourceId: CBSL_POLICY_RATES_SOURCE_ID,
        sourceName: fallback.sourceName,
        asOf: today,
        effectiveDate: fallback.effectiveDate,
        unit: "%",
        opr: board.opr,
        sdfr: fallback.sdfr,
        slfr: fallback.slfr,
        srr: board.srr ?? fallback.srr,
        isSeed: false,
        oprIsLive: true,
        corridorIsSeed: true,
        boardUrl: PLRATES_URL,
        policyPageUrl: POLICY_RATES_PAGE_URL,
        note:
          "OPR (+ SRR when present) from CBSL plrates.php. SDFR/SLFR corridor from historical_policy_interest_rates.xlsx tip — not primary instruments after 27 Nov 2024.",
      };
    } catch {
      // Retry, then seed.
    }
  }

  return fallback;
}
