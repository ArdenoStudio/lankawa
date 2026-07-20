import seedData from "@/data/card-offers-seed.json";

export interface CardOffer {
  id: string;
  bank: string;
  merchant: string;
  title: string;
  discountLabel: string;
  validTo: string | null;
  weekdayHint: string | null;
  sourceUrl: string;
  asOf: string;
  isSeed?: boolean;
}

export interface CardOffersSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  methodologyNote: string;
  offers: CardOffer[];
}

const FETCH_TIMEOUT_MS = 8_000;
const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const HNB_MAX_PAGES = 12;
const HNB_PAGE_BATCH = 4;
const COLOMBO_TZ = "Asia/Colombo";

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const SAMPATH_URL =
  "https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20";
const COMBANK_URL = "https://www.combank.lk/rewards-promotions";

type SeedFile = {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  offers: CardOffer[];
};

const seed = seedData as SeedFile;

export function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function colomboDateIso(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function colomboWeekday(now: Date): string {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: COLOMBO_TZ,
    weekday: "long",
  }).format(now);
  return weekday.toLowerCase();
}

/** Match keells|cargills|glomark|spar|laugfs|supermarket; exclude lubricants / false SPAR hits. */
export function isSupermarketPromo(title: string, merchant: string): boolean {
  const hay = `${title} ${merchant}`;
  if (/lubricant/i.test(hay)) {
    return false;
  }
  if (/\b(keells|cargills|glomark|laugfs|supermarket)\b/i.test(hay)) {
    return true;
  }
  // Word-boundary spar avoids Spark / Sparkle.
  return /\bspar\b/i.test(hay);
}

export function parseWeekdayHint(text: string): string | null {
  const lower = stripHtml(text).toLowerCase();
  for (const day of WEEKDAYS) {
    const re = new RegExp(`\\b(?:every\\s+)?${day}s?\\b`);
    if (re.test(lower)) {
      return day;
    }
  }
  return null;
}

export function parseValidToFromText(text: string): string | null {
  const cleaned = stripHtml(text);
  const named = [
    ...cleaned.matchAll(
      /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/gi,
    ),
  ];
  if (named.length > 0) {
    const last = named[named.length - 1];
    const day = Number(last[1]);
    const month = MONTHS[last[2].toLowerCase()];
    const year = Number(last[3]);
    if (!month || !Number.isFinite(day) || !Number.isFinite(year)) {
      return null;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const iso = cleaned.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }
  return null;
}

export function extractDiscountLabel(...parts: Array<string | null | undefined>): string {
  for (const part of parts) {
    if (!part) {
      continue;
    }
    const text = stripHtml(part);
    // Prefer grocery-style % off / % discount; skip bare "0% installment" noise.
    const matches = [
      ...text.matchAll(
        /up\s+to\s+\d+\s*%(?:\s*(?:off|discount))?|\d+\s*%(?:\s*(?:off|discount))/gi,
      ),
    ];
    for (const match of matches) {
      const label = match[0].replace(/\s+/g, " ").trim();
      if (/^0\s*%/i.test(label) && /installment/i.test(text)) {
        continue;
      }
      return label;
    }
  }
  return "See bank offer";
}

/** Grocery shopping-day discounts only — skip EMI / installment catalogues. */
export function isShoppingDayPromo(title: string): boolean {
  if (/installment/i.test(title) && !/\d+\s*%\s*(?:off|discount)/i.test(title)) {
    return false;
  }
  return true;
}

export function isOfferActiveToday(offer: CardOffer, now: Date = new Date()): boolean {
  const today = colomboDateIso(now);
  if (offer.validTo && offer.validTo < today) {
    return false;
  }

  if (offer.weekdayHint) {
    return offer.weekdayHint.toLowerCase() === colomboWeekday(now);
  }

  return Boolean(offer.validTo && offer.validTo >= today);
}

export function filterTodaysOffers(
  offers: CardOffer[],
  now: Date = new Date(),
): CardOffer[] {
  return offers.filter((offer) => isOfferActiveToday(offer, now));
}

function msToDateIso(ms: unknown): string | null {
  const n = typeof ms === "number" ? ms : Number(ms);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return new Date(n).toISOString().slice(0, 10);
}

export function normalizeSampathOffer(
  raw: Record<string, unknown>,
  asOf: string,
): CardOffer | null {
  const id = raw.id;
  const merchant = String(raw.company_name ?? "").trim();
  if (id == null || !merchant) {
    return null;
  }

  const description = String(raw.description ?? "");
  const details = String(raw.promotion_details ?? "");
  const shortDescription = String(raw.short_description ?? "");
  const blob = [description, details, shortDescription].join(" ");
  const title = stripHtml(description || shortDescription || merchant).slice(0, 180);
  if (!isShoppingDayPromo(title)) {
    return null;
  }

  return {
    id: `sampath-${id}`,
    bank: "Sampath Bank",
    merchant,
    title,
    discountLabel: extractDiscountLabel(
      String(raw.short_discount ?? ""),
      String(raw.discounts ?? ""),
      description,
    ),
    validTo: msToDateIso(raw.expire_on) ?? parseValidToFromText(blob),
    weekdayHint: parseWeekdayHint(blob),
    sourceUrl: "https://www.sampath.lk/en/card-promotions",
    asOf,
  };
}

export function normalizeHnbOffer(
  raw: Record<string, unknown>,
  asOf: string,
): CardOffer | null {
  const id = raw.id;
  const title = String(raw.title ?? "").trim();
  const merchant = String(raw.merchant ?? "").trim();
  if (
    id == null ||
    !title ||
    !isSupermarketPromo(title, merchant) ||
    !isShoppingDayPromo(title)
  ) {
    return null;
  }

  const valid = String(raw.valid ?? "");
  const blob = `${title} ${merchant} ${valid}`;

  return {
    id: `hnb-${id}`,
    bank: "HNB",
    merchant: merchant || "Supermarket",
    title,
    discountLabel: extractDiscountLabel(title),
    validTo:
      typeof raw.to === "string" && /^\d{4}-\d{2}-\d{2}/.test(raw.to)
        ? raw.to.slice(0, 10)
        : parseValidToFromText(blob),
    weekdayHint: parseWeekdayHint(blob),
    sourceUrl: "https://www.hnb.net",
    asOf,
  };
}

export function normalizeCombankReward(block: {
  href: string;
  category: string;
  title: string;
  validDate: string;
  discountLabel: string;
  asOf: string;
}): CardOffer | null {
  const { href, category, title, validDate, discountLabel, asOf } = block;
  if (!href || !title) {
    return null;
  }
  if (!isSupermarketPromo(title, category) && !/supermarket/i.test(category + href)) {
    return null;
  }

  const merchantMatch =
    title.match(/at\s+(.+?)\s+with\s+ComBank/i) ??
    title.match(/at\s+(.+)$/i);
  const merchant = merchantMatch?.[1]?.trim() || "Supermarket";
  const blob = `${title} ${validDate}`;

  return {
    id: `combank-${href.replace(/^https?:\/\/[^/]+/, "").replace(/\W+/g, "-").slice(0, 80)}`,
    bank: "Commercial Bank",
    merchant,
    title: title.trim(),
    discountLabel: discountLabel || extractDiscountLabel(title),
    validTo: parseValidToFromText(blob),
    weekdayHint: parseWeekdayHint(blob),
    sourceUrl: href.startsWith("http") ? href : `https://www.combank.lk${href}`,
    asOf,
  };
}

export function parseCombankRewardsHtml(html: string, asOf: string): CardOffer[] {
  const offers: CardOffer[] = [];
  const re =
    /<a[^>]*class="[^"]*reward[^"]*"[^>]*href="([^"]+)"([\s\S]*?)<p class="category">([^<]*)<\/p>[\s\S]*?<h3>([^<]*)<\/h3>[\s\S]*?<p class="valid-date">([^<]*)<\/p>/gi;

  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) != null) {
    const block = match[2] ?? "";
    const tag = block.match(
      /<div class="offer-tag[^"]*">([\s\S]*?)<\/div>/i,
    );
    const offer = normalizeCombankReward({
      href: match[1],
      discountLabel: stripHtml(tag?.[1] ?? ""),
      category: stripHtml(match[3] ?? ""),
      title: stripHtml(match[4] ?? ""),
      validDate: stripHtml(match[5] ?? ""),
      asOf,
    });
    if (offer) {
      offers.push(offer);
    }
  }
  return offers;
}

async function fetchJson(
  url: string,
): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 21_600 },
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 21_600 },
    });
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSampathOffers(asOf: string): Promise<CardOffer[]> {
  const payload = (await fetchJson(SAMPATH_URL)) as {
    data?: Record<string, unknown>[];
  } | null;
  if (!payload?.data?.length) {
    return [];
  }
  return payload.data
    .map((row) => normalizeSampathOffer(row, asOf))
    .filter((offer): offer is CardOffer => offer != null);
}

async function fetchHnbOffers(asOf: string): Promise<CardOffer[]> {
  const offers: CardOffer[] = [];
  const seen = new Set<string>();

  // Venus lists ~800+ promos; supermarket rows are mid-catalog.
  // Probe `page=1&limit=50&cardType=credit` then batch further pages.
  for (let start = 1; start <= HNB_MAX_PAGES; start += HNB_PAGE_BATCH) {
    const pages = Array.from(
      { length: HNB_PAGE_BATCH },
      (_, i) => start + i,
    ).filter((page) => page <= HNB_MAX_PAGES);

    const batches = await Promise.all(
      pages.map(async (page) => {
        const url = `https://venus.hnb.lk/api/get_all_web_card_promos?page=${page}&limit=50&cardType=credit`;
        const payload = (await fetchJson(url)) as {
          data?: Record<string, unknown>[];
        } | null;
        return payload?.data ?? [];
      }),
    );

    let empty = 0;
    for (const rows of batches) {
      if (rows.length === 0) {
        empty += 1;
        continue;
      }
      for (const row of rows) {
        const offer = normalizeHnbOffer(row, asOf);
        if (offer && !seen.has(offer.id)) {
          seen.add(offer.id);
          offers.push(offer);
        }
      }
    }

    if (empty === batches.length || offers.length >= 10) {
      break;
    }
  }

  return offers;
}

async function fetchCombankOffers(asOf: string): Promise<CardOffer[]> {
  const html = await fetchText(COMBANK_URL);
  if (!html) {
    return [];
  }
  return parseCombankRewardsHtml(html, asOf);
}

function dedupeOffers(offers: CardOffer[]): CardOffer[] {
  const seen = new Set<string>();
  const out: CardOffer[] = [];
  for (const offer of offers) {
    const key = `${offer.bank}|${offer.merchant}|${offer.weekdayHint ?? ""}|${offer.discountLabel}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(offer);
  }
  return out;
}

function buildSeedSnapshot(now: Date): CardOffersSnapshot {
  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    isSeed: true,
    methodologyNote: seed.methodologyNote,
    offers: filterTodaysOffers(seed.offers, now),
  };
}

/**
 * Live Sampath + HNB JSON (+ optional ComBank HTML), filtered to offers active today.
 * Falls back to weekday-matched seed when live feeds are empty.
 */
export async function getTodaysCardOffers(
  now: Date = new Date(),
): Promise<CardOffersSnapshot> {
  const asOf = colomboDateIso(now);

  const [sampath, hnb, combank] = await Promise.all([
    fetchSampathOffers(asOf),
    fetchHnbOffers(asOf),
    fetchCombankOffers(asOf),
  ]);

  const live = dedupeOffers([...sampath, ...hnb, ...combank]);
  const todays = filterTodaysOffers(live, now);

  if (todays.length === 0) {
    return buildSeedSnapshot(now);
  }

  return {
    sourceId: "bank_card_offers",
    sourceName: "Bank supermarket card days",
    asOf,
    isSeed: false,
    methodologyNote:
      "Public bank supermarket card promotions from Sampath JSON, HNB Venus JSON, and ComBank rewards HTML. Weekday cadence parsed from offer copy when present; otherwise validTo gates inclusion. Confirm at checkout — not affiliated.",
    offers: todays,
  };
}

export function getCardOffersSeedSnapshot(now: Date = new Date()): CardOffersSnapshot {
  return buildSeedSnapshot(now);
}
