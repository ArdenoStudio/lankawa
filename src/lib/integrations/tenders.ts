import { DISTRICTS } from "@/lib/districts";
import type { TenderCategory, TenderNotice, TenderSnapshot, TenderStatus } from "@/lib/types";

const PROMISE_SOURCE_ID = "egp_procurement";
const PROMISE_SOURCE_NAME = "PROMISe e-GP Sri Lanka procurement notices";
const PROMISE_URL = "https://promise.lk/?p=vendor_cont&a=all_procurements&type=e";
const FETCH_TIMEOUT_MS = 10_000;
const REVALIDATE_SECONDS = 3600;

const ROW_RE = /<tr\b[\s\S]*?<\/tr>/gi;
const CELL_RE = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      throw new Error(`PROMISe returned ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function districtFromText(value: string): string | null {
  const normalized = ` ${normalizeText(value)} `;
  for (const district of DISTRICTS) {
    const names = [district.name, district.capital, district.slug.replace(/-/g, " ")];
    if (names.some((name) => normalized.includes(` ${normalizeText(name)} `))) {
      return district.slug;
    }
  }
  return null;
}

function provinceForDistrict(slug: string): string {
  return DISTRICTS.find((district) => district.slug === slug)?.province ?? "National";
}

function categoryFromTitle(title: string): TenderCategory {
  const normalized = normalizeText(title);
  if (
    /\b(construction|repair|renovation|road|building|civil|works?|resurfacing)\b/.test(
      normalized,
    )
  ) {
    return "works";
  }
  if (/\b(consultancy|service|maintenance|audit|software|training|insurance)\b/.test(normalized)) {
    return "services";
  }
  return "goods";
}

function statusFromClosingDate(closingDate: string, now = new Date()): TenderStatus {
  const timestamp = Date.parse(closingDate.replace(" ", "T"));
  if (Number.isNaN(timestamp)) {
    return "open";
  }

  const daysUntilClose = (timestamp - now.getTime()) / 86_400_000;
  if (daysUntilClose < 0) {
    return "closed";
  }
  if (daysUntilClose <= 7) {
    return "closing_soon";
  }
  return "open";
}

function dateOnly(value: string): string {
  const parsed = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(parsed)) {
    return value.slice(0, 10);
  }
  return new Date(parsed).toISOString().slice(0, 10);
}

function stableId(reference: string, title: string, closingDate: string): string {
  const normalized = normalizeText(`${reference} ${title} ${closingDate}`)
    .replace(/\s+/g, "-")
    .slice(0, 96);
  return normalized ? `egp-${normalized}` : `egp-${Date.now()}`;
}

function cellsFromRow(row: string): string[] {
  return [...row.matchAll(CELL_RE)].map((match) => stripTags(match[1]));
}

function parseTenderRows(html: string): TenderNotice[] {
  const notices: TenderNotice[] = [];

  for (const row of html.match(ROW_RE) ?? []) {
    const cells = cellsFromRow(row);
    if (cells.length < 5) {
      continue;
    }

    const [closingRaw, titleRaw, , locationRaw, entityRaw, referenceRaw] = cells;
    const title = titleRaw?.trim();
    const closingDate = closingRaw?.trim();
    const reference = referenceRaw?.trim() || title;
    const ministry = entityRaw?.trim() || "government";
    const location = locationRaw?.trim() ?? "";
    const district = districtFromText(`${location} ${title} ${ministry}`);

    if (!title || !closingDate || !district) {
      continue;
    }

    notices.push({
      id: stableId(reference, title, closingDate),
      title,
      reference,
      ministry,
      province: provinceForDistrict(district),
      district,
      category: categoryFromTitle(title),
      estimatedValueLkr: 0,
      closingDate: dateOnly(closingDate),
      status: statusFromClosingDate(closingDate),
    });
  }

  const seen = new Set<string>();
  return notices.filter((notice) => {
    const key = `${notice.reference}|${notice.title}|${notice.closingDate}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function fetchLiveTenders(): Promise<TenderSnapshot | null> {
  try {
    const html = await fetchHtml(PROMISE_URL);
    const notices = parseTenderRows(html).slice(0, 30);
    if (notices.length === 0) {
      return null;
    }

    return {
      sourceId: PROMISE_SOURCE_ID,
      sourceName: PROMISE_SOURCE_NAME,
      asOf: new Date().toISOString(),
      notices,
    };
  } catch {
    return null;
  }
}
