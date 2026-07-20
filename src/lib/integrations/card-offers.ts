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

type Weekday = (typeof WEEKDAYS)[number];

/** Abbreviated English day tokens (Mon, Tue, …) — exclude bare "t" collisions. */
const WEEKDAY_ABBREVS: Array<{ re: RegExp; day: Weekday }> = [
  { re: /\b(?:every\s+|on\s+)?suns?(?:'?s)?\b|\bsun-/i, day: "sunday" },
  { re: /\b(?:every\s+|on\s+)?mons?(?:'?s)?\b|\bmon-/i, day: "monday" },
  { re: /\b(?:every\s+|on\s+)?(?:tue|tues)(?:'?s)?\b|\btue-/i, day: "tuesday" },
  { re: /\b(?:every\s+|on\s+)?weds?(?:'?s)?\b|\bwed-/i, day: "wednesday" },
  { re: /\b(?:every\s+|on\s+)?(?:thu|thur|thurs)(?:'?s)?\b|\bthu-/i, day: "thursday" },
  { re: /\b(?:every\s+|on\s+)?fris?(?:'?s)?\b|\bfri-/i, day: "friday" },
  { re: /\b(?:every\s+|on\s+)?sats?(?:'?s)?\b|\bsat-/i, day: "saturday" },
];

/**
 * Sinhala / Tamil weekday words (common bank promo copy).
 * Seed JSON is English-only today; keep these for bilingual titles if they appear.
 */
const LOCAL_WEEKDAYS: Array<{ re: RegExp; day: Weekday }> = [
  // Sinhala
  { re: /ඉරිදා/, day: "sunday" },
  { re: /සඳුදා/, day: "monday" },
  { re: /අඟහරුවාදා|අඟහරුවා/, day: "tuesday" },
  { re: /බදාදා/, day: "wednesday" },
  { re: /බ්‍රහස්පතින්දා|බ්රහස්පතින්දා|බ්‍රහස්පති/, day: "thursday" },
  { re: /සිකුරාදා/, day: "friday" },
  { re: /සෙනසුරාදා|සෙනසුරා/, day: "saturday" },
  // Tamil
  { re: /ஞாயிறு|ஞாயிற்று/, day: "sunday" },
  { re: /திங்கள்/, day: "monday" },
  { re: /செவ்வாய்/, day: "tuesday" },
  { re: /புதன்/, day: "wednesday" },
  { re: /வியாழன்/, day: "thursday" },
  { re: /வெள்ளி/, day: "friday" },
  { re: /சனி(?:க்கிழமை)?/, day: "saturday" },
];

const SUPERMARKET_MERCHANTS: Array<{ re: RegExp; name: string }> = [
  { re: /\bkeells\b/i, name: "Keells" },
  { re: /\bcargills\b/i, name: "Cargills Food City" },
  { re: /\bglomark\b/i, name: "Glomark" },
  { re: /\bspar\b/i, name: "SPAR Supermarket" },
  { re: /\blaugfs\b/i, name: "LAUGFS Supermarkets" },
];

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
const PEOPLES_SUPERMARKET_URL =
  "https://www.peoplesbank.lk/promotion-category/supermarkets/?cardType=credit_card";
const NTB_PROMOTIONS_URL = "https://www.nationstrust.com/promotions";
const NTB_SUPERMARKET_HUB_URL =
  "https://www.nationstrust.com/promotions/enjoy-exclusive-savings-on-supermarkets";
const PABC_URL = "https://www.pabcbank.com/card-offers/";
const DFCC_URL = "https://www.dfcc.lk/cards/supermarkets-credit";
const PABC_SUPERMARKET_CAT = "18";
/** Visa LK VMORC portal — POST body reconstructed from offers SPA (`main.*.js`). */
const VISA_PERKS_URL =
  "https://www.visa.com.lk/offers/api/portal/portal/perks/";
const VISA_SITE_ID = "www_visa_com_lk";
const VISA_LOCALE = "en_lk";
const VISA_OFFERS_PORTAL =
  "https://www.visa.com.lk/en_lk/visa-offers-and-perks/";
/** Merchant-name filter for supermarket slice only (avoids ~600+ dining/travel perks). */
const VISA_SUPERMARKET_MERCHANT_FILTER = [
  "Glomark",
  "Keells",
  "Cargills",
  "Cargills Food City",
  "SPAR",
  "SPAR Supermarket",
  "LAUGFS",
  "LAUGFS Supermarkets",
  "Softlogic Glomark",
];

type SeedFile = {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  offers: CardOffer[];
};

const seed = seedData as SeedFile;

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#(\d+);/g, (_, code: string) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCharCode(n) : _;
    })
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"');
}

export function stripHtml(input: string): string {
  return decodeHtmlEntities(input)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
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

/**
 * Extract an explicit shopping-day cadence from promo copy.
 * Prefers named weekdays (and local-language day words) over any date tokens in
 * the same string — e.g. "every Monday till 25th July 2026" → monday
 * (never inferred from the end date). Also recognises "weekdays" / "weekend".
 */
export function parseWeekdayHint(text: string): string | null {
  const cleaned = stripHtml(text);
  const lower = cleaned.toLowerCase();

  if (/\bweekends?\b/.test(lower)) {
    return "weekend";
  }
  // Prefer plural / cadence phrases — avoid matching "No weekday mentioned".
  if (
    /\bweekdays\b/.test(lower) ||
    /\b(?:every|on)\s+weekdays?\b/.test(lower) ||
    /\bweekdays?\s+only\b/.test(lower)
  ) {
    return "weekdays";
  }

  // Full English names: every Monday | on Mondays | Monday's | Mondays | Monday
  for (const day of WEEKDAYS) {
    const re = new RegExp(
      `\\b(?:every\\s+|on\\s+)?${day}(?:'?s|s)?\\b`,
      "i",
    );
    if (re.test(lower)) {
      return day;
    }
  }

  for (const { re, day } of LOCAL_WEEKDAYS) {
    if (re.test(cleaned)) {
      return day;
    }
  }

  // Abbreviated: Mon, Mon-, Mon's, every Mon, on Mons
  for (const { re, day } of WEEKDAY_ABBREVS) {
    if (re.test(lower)) {
      return day;
    }
  }

  // Do not infer cadence from valid-to dates — those are windows, not DOW.
  return null;
}

/** All named weekdays in copy (e.g. "Every Monday & Wednesday" → both). */
export function parseWeekdayHints(text: string): string[] {
  const single = parseWeekdayHint(text);
  if (single === "weekend" || single === "weekdays") {
    return [single];
  }

  const cleaned = stripHtml(text);
  const lower = cleaned.toLowerCase();
  const found: string[] = [];

  for (const day of WEEKDAYS) {
    const re = new RegExp(
      `\\b(?:every\\s+|on\\s+)?${day}(?:'?s|s)?\\b`,
      "i",
    );
    if (re.test(lower) && !found.includes(day)) {
      found.push(day);
    }
  }
  if (found.length > 0) {
    return found;
  }

  for (const { re, day } of LOCAL_WEEKDAYS) {
    if (re.test(cleaned) && !found.includes(day)) {
      found.push(day);
    }
  }
  if (found.length > 0) {
    return found;
  }

  for (const { re, day } of WEEKDAY_ABBREVS) {
    if (re.test(lower) && !found.includes(day)) {
      found.push(day);
    }
  }
  return found;
}

/**
 * Concrete calendar days listed in promo copy (not "till/until" end dates alone).
 * Used when there is no weekday cadence — prefer these over open validTo windows.
 */
export function parseSpecificOfferDates(text: string): string[] {
  const cleaned = stripHtml(text);
  // Skip pure end-date windows ("till 25th July 2026") — those are not shopping days.
  if (
    /\b(?:till|until|valid until)\b/i.test(cleaned) &&
    !/\bon\s+\d{1,2}/i.test(cleaned) &&
    !/\b\d{1,2}(?:st|nd|rd|th)?\s*[&,]/i.test(cleaned)
  ) {
    return [];
  }

  const dates = new Set<string>();

  for (const match of cleaned.matchAll(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/gi,
  )) {
    const day = Number(match[1]);
    const month = MONTHS[match[2].toLowerCase()];
    const year = Number(match[3]);
    if (month && day >= 1 && day <= 31) {
      dates.add(
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      );
    }
  }

  // "09th & 23rd July 2026" — days share one month/year
  for (const match of cleaned.matchAll(
    /\b(\d{1,2})(?:st|nd|rd|th)?(?:\s*[,&/]\s*|\s+and\s+)(\d{1,2})(?:st|nd|rd|th)?(?:\s*[,&/]\s*|\s+and\s+)?(\d{1,2})?(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/gi,
  )) {
    const month = MONTHS[match[4].toLowerCase()];
    const year = Number(match[5]);
    if (!month) {
      continue;
    }
    for (const raw of [match[1], match[2], match[3]]) {
      if (!raw) {
        continue;
      }
      const day = Number(raw);
      if (day >= 1 && day <= 31) {
        dates.add(
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        );
      }
    }
  }

  for (const match of cleaned.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) {
    dates.add(`${match[1]}-${match[2]}-${match[3]}`);
  }

  return [...dates].sort();
}

function parseYyyymmdd(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!m) {
    return null;
  }
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function dataAttr(block: string, name: string): string {
  const re = new RegExp(`data-${name}="([^"]*)"`, "i");
  return decodeHtmlEntities(re.exec(block)?.[1] ?? "").trim();
}

function expandWeekdayOffers(
  base: Omit<CardOffer, "weekdayHint" | "id"> & { id: string },
  weekdays: string[],
): CardOffer[] {
  if (weekdays.length === 0) {
    return [{ ...base, weekdayHint: null }];
  }
  return weekdays.map((day) => ({
    ...base,
    id: weekdays.length > 1 ? `${base.id}-${day.slice(0, 3)}` : base.id,
    weekdayHint: day,
  }));
}

export function matchesWeekdayHint(
  hint: string | null | undefined,
  weekday: string,
): boolean {
  if (!hint) {
    return false;
  }
  const h = hint.toLowerCase();
  const day = weekday.toLowerCase();
  if (h === day) {
    return true;
  }
  if (h === "weekend") {
    return day === "saturday" || day === "sunday";
  }
  if (h === "weekdays") {
    return (
      day === "monday" ||
      day === "tuesday" ||
      day === "wednesday" ||
      day === "thursday" ||
      day === "friday"
    );
  }
  return false;
}

export function resolveMerchantFromText(...parts: string[]): string | null {
  const hay = parts.join(" ");
  for (const { re, name } of SUPERMARKET_MERCHANTS) {
    if (re.test(hay)) {
      return name;
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
        /up\s+to\s+\d+\s*%(?:\s*(?:off|discount|savings))?|\d+\s*%(?:\s*(?:off|discount|savings))?/gi,
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

  // Explicit weekday cadence wins over any dates in the same copy.
  const hint = offer.weekdayHint ?? parseWeekdayHint(offer.title);
  if (hint) {
    return matchesWeekdayHint(hint, colomboWeekday(now));
  }

  // Date-specific promos ("09th & 23rd July") — only those Colombo calendar days.
  const specificDates = parseSpecificOfferDates(offer.title);
  if (specificDates.length > 0) {
    return specificDates.includes(today);
  }

  return Boolean(offer.validTo && offer.validTo >= today);
}

export function filterTodaysOffers(
  offers: CardOffer[],
  now: Date = new Date(),
): CardOffer[] {
  return offers
    .filter((offer) => isOfferActiveToday(offer, now))
    .map((offer) => {
      if (offer.weekdayHint) {
        return offer;
      }
      const hint = parseWeekdayHint(offer.title);
      return hint ? { ...offer, weekdayHint: hint } : offer;
    });
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

/**
 * Visa LK VMORC perk → supermarket card-day row.
 * Portal titles are often just the merchant name; prefer shortDescription for copy.
 */
export function normalizeVisaPerk(
  raw: Record<string, unknown>,
  asOf: string,
): CardOffer | null {
  const sourceId = raw.sourceId ?? raw.offerId;
  const merchantRaw = String(raw.merchantName ?? raw.title ?? "").trim();
  const shortDescription = String(raw.shortDescription ?? "").trim();
  const titleRaw = String(raw.title ?? "").trim();
  const offerCopy =
    typeof (raw.metaData as { customAttributes?: { offerCopy?: string } } | undefined)
      ?.customAttributes?.offerCopy === "string"
      ? String(
          (raw.metaData as { customAttributes: { offerCopy: string } })
            .customAttributes.offerCopy,
        )
      : "";
  const blob = [shortDescription, titleRaw, merchantRaw, offerCopy].join(" ");
  const merchant =
    resolveMerchantFromText(merchantRaw, titleRaw, shortDescription) ||
    merchantRaw;
  const title = stripHtml(shortDescription || titleRaw || merchant).slice(0, 180);

  if (
    sourceId == null ||
    !title ||
    !isSupermarketPromo(title, merchant) ||
    !isShoppingDayPromo(title)
  ) {
    return null;
  }

  const detailUrl = `https://www.visa.com.lk/en_lk/visa-offers-and-perks/offer/${sourceId}`;

  return {
    id: `visa-${sourceId}`,
    bank: "Visa",
    merchant,
    title,
    discountLabel: extractDiscountLabel(shortDescription, offerCopy, titleRaw),
    validTo: msToDateIso(raw.endDate) ?? parseValidToFromText(blob),
    weekdayHint: parseWeekdayHint(blob),
    sourceUrl: detailUrl,
    asOf,
  };
}

export function extractCombankDiscountLabel(blockHtml: string, title: string): string {
  const tag = blockHtml.match(
    /<div[^>]*class="[^"]*offer-tag[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  );
  if (tag?.[1]) {
    const fromTag = stripHtml(tag[1]);
    // "Up to 25% Off" or "25%" + surrounding Off/Discount words
    const labeled = extractDiscountLabel(fromTag, title);
    if (labeled !== "See bank offer") {
      return labeled;
    }
    const pct = fromTag.match(/\d+\s*%/);
    if (pct) {
      const upTo = /up\s*to/i.test(fromTag) ? "Up to " : "";
      const off = /\boff\b/i.test(fromTag) || /\bdiscount\b/i.test(fromTag)
        ? " Off"
        : "";
      return `${upTo}${pct[0].replace(/\s+/g, "")}${off}`.trim();
    }
  }
  return extractDiscountLabel(title);
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

  const supermarketPath = /\/rewards-promotion\/supermarket\//i.test(href);
  const supermarketCat = /supermarket/i.test(category);
  const knownMerchant = resolveMerchantFromText(title, href, category);
  // Prefer path/category/known chain — bare "supermarket" in unrelated titles is not enough.
  if (!supermarketPath && !supermarketCat && !knownMerchant) {
    return null;
  }

  const merchant =
    knownMerchant ??
    title.match(/at\s+(.+?)\s+with\s+ComBank/i)?.[1]?.trim() ??
    title.match(/at\s+(.+)$/i)?.[1]?.trim() ??
    "Supermarket";

  // Prefer title + validity line for weekday; never let end-date alone invent DOW.
  const blob = `${title} ${validDate}`;
  const weekdayHint = parseWeekdayHint(blob);

  return {
    id: `combank-${href.replace(/^https?:\/\/[^/]+/, "").replace(/\W+/g, "-").slice(0, 80)}`,
    bank: "Commercial Bank",
    merchant,
    title: title.trim(),
    discountLabel: discountLabel || extractDiscountLabel(title),
    validTo: parseValidToFromText(blob),
    weekdayHint,
    sourceUrl: href.startsWith("http") ? href : `https://www.combank.lk${href}`,
    asOf,
  };
}

/**
 * Parse ComBank `/rewards-promotions` listing HTML into supermarket card offers.
 * Tolerates href/class attribute order and looser category / valid-date markup.
 */
export function parseCombankRewardsHtml(html: string, asOf: string): CardOffer[] {
  const offers: CardOffer[] = [];
  const seen = new Set<string>();

  // Match reward anchors regardless of attribute order.
  const anchorRe =
    /<a\b([^>]*\bclass="[^"]*\breward\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = anchorRe.exec(html)) != null) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    const href = attrs.match(/\bhref="([^"]+)"/i)?.[1] ?? "";
    if (!href) {
      continue;
    }

    const category =
      stripHtml(
        body.match(
          /<p[^>]*class="[^"]*\bcategory\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
        )?.[1] ?? "",
      ) ||
      (href.match(/\/rewards-promotion\/([^/]+)\//i)?.[1] ?? "").replace(
        /-/g,
        " ",
      );

    const title = stripHtml(
      body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "",
    );
    const validDate = stripHtml(
      body.match(
        /<p[^>]*class="[^"]*\bvalid-date\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
      )?.[1] ?? "",
    );

    const offer = normalizeCombankReward({
      href,
      discountLabel: extractCombankDiscountLabel(body, title),
      category,
      title,
      validDate,
      asOf,
    });
    if (offer && !seen.has(offer.id)) {
      seen.add(offer.id);
      offers.push(offer);
    }
  }

  // Fallback: supermarket detail URLs embedded without the reward-card shell.
  if (offers.length === 0) {
    const linkRe =
      /href="((?:https?:\/\/(?:www\.)?combank\.lk)?\/rewards-promotion\/supermarket\/[^"]+)"/gi;
    let linkMatch: RegExpExecArray | null;
    while ((linkMatch = linkRe.exec(html)) != null) {
      const href = linkMatch[1];
      const windowStart = Math.max(0, (linkMatch.index ?? 0) - 200);
      const windowEnd = Math.min(html.length, (linkMatch.index ?? 0) + 800);
      const nearby = html.slice(windowStart, windowEnd);
      const title =
        stripHtml(nearby.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "") ||
        decodeURIComponent(
          href.split("/").pop()?.replace(/-/g, " ") ?? "Supermarket offer",
        );
      const validDate = stripHtml(
        nearby.match(
          /<p[^>]*class="[^"]*\bvalid-date\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
        )?.[1] ??
          nearby.match(
            /Offer valid[^.<\n]{0,120}/i,
          )?.[0] ??
          "",
      );
      const offer = normalizeCombankReward({
        href,
        discountLabel: extractCombankDiscountLabel(nearby, title),
        category: "Supermarket",
        title,
        validDate,
        asOf,
      });
      if (offer && !seen.has(offer.id)) {
        seen.add(offer.id);
        offers.push(offer);
      }
    }
  }

  return offers;
}

/** Evaluate Sucuri string-concat expressions (`"x" + 'y' + String.fromCharCode(n)`). */
export function evalSucuriStringExpr(expr: string): string {
  let out = "";
  const re = /"([^"]*)"|'([^']*)'|String\.fromCharCode\((\d+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(expr)) != null) {
    if (match[1] !== undefined) {
      out += match[1];
    } else if (match[2] !== undefined) {
      out += match[2];
    } else {
      out += String.fromCharCode(Number(match[3]));
    }
  }
  return out;
}

/**
 * Parse Sucuri CloudProxy challenge HTML into `name=value` cookie.
 * Challenge var name rotates (a/n/m/…); no arbitrary eval.
 */
export function solveSucuriCookie(html: string): string | null {
  const encoded = html.match(/S='([^']+)'/)?.[1];
  if (!encoded) {
    return null;
  }
  let decoded: string;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return null;
  }
  const parsed = decoded.match(
    /^([A-Za-z_$][\w$]*)=(.+?);document\.cookie=(.+?)\s*\+\s*\1\s*\+/,
  );
  if (!parsed) {
    return null;
  }
  const value = evalSucuriStringExpr(parsed[2]);
  const nameEq = evalSucuriStringExpr(parsed[3]);
  if (!value || !nameEq) {
    return null;
  }
  return nameEq.endsWith("=") ? `${nameEq}${value}` : `${nameEq}=${value}`;
}

/** Bracket-match a JS array literal starting at `start` (`[` index). */
export function extractJsArrayLiteral(source: string, start: number): string | null {
  if (start < 0 || source[start] !== "[") {
    return null;
  }
  let depth = 0;
  let inStr: '"' | "'" | null = null;
  let esc = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === "\\") {
        esc = true;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if (ch === "[") {
      depth += 1;
    } else if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }
  return null;
}

export function parsePabcArrOffersJs(jsArrayLiteral: string): Array<Record<string, unknown>> {
  try {
    // Trusted bank page after Sucuri; array is static object literals.
    const fn = new Function(`"use strict"; return (${jsArrayLiteral});`);
    const rows = fn() as unknown;
    return Array.isArray(rows) ? (rows as Array<Record<string, unknown>>) : [];
  } catch {
    return [];
  }
}

export function extractSupermarketMerchant(text: string): string | null {
  return resolveMerchantFromText(stripHtml(text));
}

export function normalizePabcOffer(
  raw: Record<string, unknown>,
  asOf: string,
  index: number,
): CardOffer | null {
  const cat = String(raw.cat ?? "");
  const backtext = String(raw.backtext ?? "");
  const text = String(raw.text ?? "");
  if (cat !== PABC_SUPERMARKET_CAT && !isSupermarketPromo(backtext, text)) {
    return null;
  }
  const merchant = extractSupermarketMerchant(backtext) ?? extractSupermarketMerchant(text);
  if (!merchant || !isSupermarketPromo(backtext, merchant)) {
    return null;
  }
  const title = stripHtml(backtext || text).slice(0, 180);
  if (!title || !isShoppingDayPromo(title)) {
    return null;
  }
  const slug = merchant.toLowerCase().replace(/\W+/g, "-");
  return {
    id: `pabc-${slug}-${index}`,
    bank: "Pan Asia Bank",
    merchant,
    title,
    discountLabel: extractDiscountLabel(text, backtext),
    validTo: parseValidToFromText(backtext),
    weekdayHint: parseWeekdayHint(backtext),
    sourceUrl: PABC_URL,
    asOf,
  };
}

export function parsePabcCardOffersHtml(html: string, asOf: string): CardOffer[] {
  const marker = html.search(/arr_offers\s*=\s*\[/);
  if (marker < 0) {
    return [];
  }
  const bracket = html.indexOf("[", marker);
  const literal = extractJsArrayLiteral(html, bracket);
  if (!literal) {
    return [];
  }
  return parsePabcArrOffersJs(literal)
    .map((row, index) => normalizePabcOffer(row, asOf, index))
    .filter((offer): offer is CardOffer => offer != null);
}

export function normalizeDfccOffer(block: {
  merchant: string;
  title: string;
  validText: string;
  discountLabel?: string;
  asOf: string;
}): CardOffer | null {
  const { merchant, title, validText, asOf } = block;
  if (!title || !isSupermarketPromo(title, merchant)) {
    return null;
  }
  if (!isShoppingDayPromo(title)) {
    return null;
  }
  const blob = `${title} ${validText}`;
  const slug = merchant.toLowerCase().replace(/\W+/g, "-").slice(0, 40);
  return {
    id: `dfcc-${slug}-${parseWeekdayHint(blob) ?? "open"}`,
    bank: "DFCC Bank",
    merchant: merchant || extractSupermarketMerchant(title) || "Supermarket",
    title: stripHtml(title).slice(0, 180),
    discountLabel: block.discountLabel || extractDiscountLabel(title),
    validTo: parseValidToFromText(blob),
    weekdayHint: parseWeekdayHint(blob),
    sourceUrl: DFCC_URL,
    asOf,
  };
}

/** Parse DFCC supermarket hub HTML (`cardOfferValid` blocks). */
export function parseDfccSupermarketHtml(html: string, asOf: string): CardOffer[] {
  const offers: CardOffer[] = [];
  const seen = new Set<string>();
  const re =
    /<p[^>]*>([^<]{10,500})<\/p>\s*<div class="bIRM"><p class="cardOfferValid">([^<]+)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) != null) {
    const title = stripHtml(match[1] ?? "");
    const validText = stripHtml(match[2] ?? "");
    const merchant = extractSupermarketMerchant(title) ?? "Supermarket";
    const offer = normalizeDfccOffer({ merchant, title, validText, asOf });
    if (offer && !seen.has(offer.id)) {
      seen.add(offer.id);
      offers.push(offer);
    }
  }

  if (offers.length > 0) {
    return offers;
  }

  // Fallback: Next.js RSC-embedded CMS fields (escaped JSON in flight data).
  const rscRe =
    /offer_name\\":\\"([^\\]+)\\"(?:(?!offer_name).){0,1600}?short_description\\":\{\\"en\\":\\"([^\\]+)\\"(?:(?!offer_name).){0,1200}?discription\\":\{\\"en\\":\\"([^\\"]+)/gi;
  while ((match = rscRe.exec(html)) != null) {
    const merchant = stripHtml(match[1] ?? "");
    const validText = stripHtml(match[2] ?? "");
    const title = stripHtml(match[3] ?? "");
    const offer = normalizeDfccOffer({ merchant, title, validText, asOf });
    if (offer && !seen.has(offer.id)) {
      seen.add(offer.id);
      offers.push(offer);
    }
  }
  return offers;
}

/**
 * People's Bank WP `offer-card` listing (`data-*` calendar attrs).
 * Supermarket category page only — filter with isSupermarketPromo.
 */
export function parsePeoplesBankOffersHtml(html: string, asOf: string): CardOffer[] {
  const offers: CardOffer[] = [];
  const seen = new Set<string>();
  const articleRe =
    /<article[^>]*class="[^"]*offer-card[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;

  let match: RegExpExecArray | null;
  while ((match = articleRe.exec(html)) != null) {
    const block = match[1] ?? "";
    const href =
      block.match(
        /href="(https?:\/\/www\.peoplesbank\.lk\/promotion\/[^"]+)"/i,
      )?.[1] ?? PEOPLES_SUPERMARKET_URL;
    const location = dataAttr(block, "location");
    const titleAttr = dataAttr(block, "title");
    const description = dataAttr(block, "description");
    const notes = dataAttr(block, "notes");
    const endRaw = dataAttr(block, "end");
    const badge = stripHtml(
      block.match(/<div class="discount-badge">([\s\S]*?)<\/div>/i)?.[1] ?? "",
    );
    const promoShort = stripHtml(
      block.match(/<div class="promo-short[^"]*">([\s\S]*?)<\/div>/i)?.[1] ?? "",
    );
    const merchant =
      location ||
      promoShort ||
      extractSupermarketMerchant(titleAttr) ||
      "Supermarket";
    const title = (titleAttr || description || merchant).slice(0, 180);
    if (!isSupermarketPromo(title, merchant) || !isShoppingDayPromo(title)) {
      continue;
    }

    const blob = `${title} ${description} ${notes}`;
    const validTo =
      parseYyyymmdd(endRaw) ??
      parseValidToFromText(notes) ??
      parseValidToFromText(blob);
    const weekdays = parseWeekdayHints(`${notes} ${blob}`);
    const baseId = `peoples-${href
      .replace(/^https?:\/\/[^/]+/, "")
      .replace(/\W+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 72)}`;

    const discountLabel = extractDiscountLabel(
      badge ? `${badge}${/%\s*off/i.test(badge) ? "" : " off"}` : "",
      titleAttr,
      description,
    );

    for (const offer of expandWeekdayOffers(
      {
        id: baseId,
        bank: "People's Bank",
        merchant: merchant.trim(),
        title,
        discountLabel,
        validTo,
        sourceUrl: href,
        asOf,
      },
      weekdays,
    )) {
      if (!seen.has(offer.id)) {
        seen.add(offer.id);
        offers.push(offer);
      }
    }
  }

  return offers;
}

/** NTB Mastercard `/promotions` Isotope grid — `grid-item supermarket` only. */
export function parseNtbPromotionsHtml(html: string, asOf: string): CardOffer[] {
  const offers: CardOffer[] = [];
  const seen = new Set<string>();
  const re =
    /<div[^>]*class="[^"]*grid-item[^"]*\bsupermarket\b[^"]*"[^>]*>([\s\S]*?)<div class="promo-footer">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;

  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) != null) {
    const head = match[1] ?? "";
    const footer = match[2] ?? "";
    const merchant = stripHtml(head.match(/<h6[^>]*>([\s\S]*?)<\/h6>/i)?.[1] ?? "");
    const title = stripHtml(head.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i)?.[1] ?? "");
    const validText = stripHtml(footer.match(/<small[^>]*>([\s\S]*?)<\/small>/i)?.[1] ?? "");
    const href =
      footer.match(/href="(https?:\/\/www\.nationstrust\.com\/promotions\/[^"]+)"/i)?.[1] ??
      NTB_PROMOTIONS_URL;

    if (!title || !isSupermarketPromo(title, merchant) || !isShoppingDayPromo(title)) {
      continue;
    }

    const blob = `${title} ${merchant} ${validText}`;
    const weekdays = parseWeekdayHints(blob);
    const slug = href.replace(/^https?:\/\/[^/]+/, "").replace(/\W+/g, "-").slice(0, 72);
    for (const offer of expandWeekdayOffers(
      {
        id: `ntb-${slug}`,
        bank: "Nations Trust Bank",
        merchant: merchant || extractSupermarketMerchant(title) || "Supermarket",
        title,
        discountLabel: extractDiscountLabel(title),
        validTo: parseValidToFromText(blob),
        sourceUrl: href,
        asOf,
      },
      weekdays,
    )) {
      if (!seen.has(offer.id)) {
        seen.add(offer.id);
        offers.push(offer);
      }
    }
  }

  return offers;
}

/** NTB supermarket hub table (merchant / offer / eligibility with DOW). */
export function parseNtbSupermarketHubHtml(html: string, asOf: string): CardOffer[] {
  const offers: CardOffer[] = [];
  const seen = new Set<string>();
  const table = html.match(/<table[\s\S]*?<\/table>/i)?.[0] ?? "";
  if (!table) {
    return offers;
  }

  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  let headerSkipped = false;
  while ((rowMatch = rowRe.exec(table)) != null) {
    const cells = [...rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
      stripHtml(c[1] ?? ""),
    );
    if (cells.length < 3) {
      continue;
    }
    if (!headerSkipped) {
      headerSkipped = true;
      if (/merchant/i.test(cells[0] ?? "")) {
        continue;
      }
    }

    const merchant = (cells[0] ?? "").replace(/\u00a0/g, " ").trim();
    const title = cells[1] ?? "";
    const eligibility = cells[2] ?? "";
    if (!merchant || !isSupermarketPromo(title, merchant) || !isShoppingDayPromo(title)) {
      continue;
    }

    const blob = `${title} ${merchant} ${eligibility}`;
    const weekdays = parseWeekdayHints(blob);
    const slug = `${merchant}-${title}`
      .toLowerCase()
      .replace(/\W+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

    for (const offer of expandWeekdayOffers(
      {
        id: `ntb-hub-${slug}`,
        bank: "Nations Trust Bank",
        merchant,
        title: title.slice(0, 180),
        discountLabel: extractDiscountLabel(title, eligibility),
        validTo: parseValidToFromText(blob),
        sourceUrl: NTB_SUPERMARKET_HUB_URL,
        asOf,
      },
      weekdays,
    )) {
      if (!seen.has(offer.id)) {
        seen.add(offer.id);
        offers.push(offer);
      }
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

async function fetchJsonPost(
  url: string,
  body: unknown,
  options?: { userAgent?: string; origin?: string; referer?: string },
): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": options?.userAgent ?? USER_AGENT,
    };
    if (options?.origin) {
      headers.Origin = options.origin;
    }
    if (options?.referer) {
      headers.Referer = options.referer;
    }
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify(body),
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

async function fetchText(
  url: string,
  options?: {
    cookie?: string;
    redirect?: RequestRedirect;
    userAgent?: string;
    acceptLanguage?: string;
  },
): Promise<{ ok: boolean; status: number; text: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": options?.userAgent ?? USER_AGENT,
    };
    if (options?.acceptLanguage) {
      headers["Accept-Language"] = options.acceptLanguage;
    }
    if (options?.cookie) {
      headers.Cookie = options.cookie;
    }
    const response = await fetch(url, {
      signal: controller.signal,
      headers,
      redirect: options?.redirect ?? "follow",
      next: { revalidate: 21_600 },
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
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
  const result = await fetchText(COMBANK_URL);
  if (!result?.ok) {
    return [];
  }
  return parseCombankRewardsHtml(result.text, asOf);
}

/** Browser-like UA — Sucuri often rejects short bot UAs. */
const PABC_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchPabcOffers(asOf: string): Promise<CardOffer[]> {
  // Sucuri CloudProxy: solve JS cookie challenge, then re-fetch (up to 3 tries).
  // Datacenter IPs are often re-challenged; empty result → seed fallback.
  let cookie: string | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await fetchText(PABC_URL, {
      redirect: "manual",
      userAgent: PABC_UA,
      acceptLanguage: "en-US,en;q=0.9",
      cookie,
    });
    if (!result) {
      return [];
    }
    if (result.text.includes("arr_offers")) {
      return parsePabcCardOffersHtml(result.text, asOf);
    }
    const next = solveSucuriCookie(result.text);
    if (!next) {
      return [];
    }
    cookie = next;
  }
  return [];
}

async function fetchDfccOffers(asOf: string): Promise<CardOffer[]> {
  const result = await fetchText(DFCC_URL, { userAgent: PABC_UA });
  if (!result?.ok) {
    return [];
  }
  return parseDfccSupermarketHtml(result.text, asOf);
}

async function fetchPeoplesOffers(asOf: string): Promise<CardOffer[]> {
  const result = await fetchText(PEOPLES_SUPERMARKET_URL, { userAgent: PABC_UA });
  if (!result?.ok) {
    return [];
  }
  return parsePeoplesBankOffersHtml(result.text, asOf);
}

async function fetchNtbOffers(asOf: string): Promise<CardOffer[]> {
  const [listing, hub] = await Promise.all([
    fetchText(NTB_PROMOTIONS_URL, { userAgent: PABC_UA }),
    fetchText(NTB_SUPERMARKET_HUB_URL, { userAgent: PABC_UA }),
  ]);
  const fromListing =
    listing?.ok ? parseNtbPromotionsHtml(listing.text, asOf) : [];
  const fromHub = hub?.ok ? parseNtbSupermarketHubHtml(hub.text, asOf) : [];
  // Hub rows carry DOW cadence; listing fills Cargills Online / Glomark etc.
  return dedupeOffers([...fromHub, ...fromListing]);
}

/**
 * Visa LK perks JSON — supermarket/Glomark slice only.
 * Body shape from the public offers SPA (`siteId` + `perkTypeRequests`); empty/`{}`
 * POST returns 400 validation failure. Server-side Origin/Referer is enough (no auth).
 * If this ever stops returning supermarket rows, seed includes a Visa Glomark fallback.
 */
async function fetchVisaSupermarketOffers(asOf: string): Promise<CardOffer[]> {
  const body = {
    siteId: VISA_SITE_ID,
    perkTypeRequests: [
      {
        perkType: "OFFERS",
        locale: VISA_LOCALE,
        pageRequest: { index: 0, limit: 50 },
        perkArguments: { offerType: "U" },
        perkFilterCriteria: {
          andCriteria: [
            {
              key: "merchantName",
              op: "in",
              val: VISA_SUPERMARKET_MERCHANT_FILTER,
            },
          ],
        },
      },
    ],
  };

  const payload = (await fetchJsonPost(VISA_PERKS_URL, body, {
    userAgent: PABC_UA,
    origin: "https://www.visa.com.lk",
    referer: VISA_OFFERS_PORTAL,
  })) as {
    perksGroups?: Array<{ perks?: Record<string, unknown>[] }>;
  } | null;

  const perks =
    payload?.perksGroups?.flatMap((group) => group.perks ?? []) ?? [];
  if (perks.length === 0) {
    return [];
  }

  return perks
    .map((row) => normalizeVisaPerk(row, asOf))
    .filter((offer): offer is CardOffer => offer != null);
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

/** Canonical merchant token for gap coverage (keeps Cargills Online distinct). */
export function merchantCoverageToken(merchant: string): string {
  const raw = merchant.trim().toLowerCase().replace(/\s+/g, " ");
  if (/cargills\s*online/.test(raw)) {
    return "cargills online";
  }
  const resolved = resolveMerchantFromText(merchant);
  return (resolved ?? raw).toLowerCase();
}

/** Merchant + weekday slot used when filling seed gaps around live rows. */
export function offerCoverageKey(offer: CardOffer): string {
  const merchant = merchantCoverageToken(offer.merchant);
  const weekday = (offer.weekdayHint ?? "").toLowerCase();
  return `${merchant}|${weekday}`;
}

/**
 * Prefer live offers active today; fill uncovered merchant/weekday slots from seed.
 * Live rows are marked `isSeed: false`; gap rows `isSeed: true`.
 */
export function mergeTodaysLiveWithSeed(
  liveTodays: CardOffer[],
  seedTodays: CardOffer[],
): CardOffer[] {
  const live = liveTodays.map((offer) => ({ ...offer, isSeed: false }));
  const covered = new Set(live.map(offerCoverageKey));
  const gaps = seedTodays
    .filter((offer) => !covered.has(offerCoverageKey(offer)))
    .map((offer) => ({ ...offer, isSeed: true }));
  return dedupeOffers([...live, ...gaps]);
}

function buildSeedSnapshot(now: Date): CardOffersSnapshot {
  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    isSeed: true,
    methodologyNote: seed.methodologyNote,
    offers: filterTodaysOffers(seed.offers, now).map((offer) => ({
      ...offer,
      isSeed: true,
    })),
  };
}

/**
 * Live Sampath + HNB + Visa LK JSON + ComBank/Pan Asia/DFCC/People's/NTB HTML,
 * filtered to offers active today. Keeps today's live rows and fills missing
 * merchant/weekday slots from seed (per-offer isSeed). Full seed only when no
 * live offer matches today.
 */
export async function getTodaysCardOffers(
  now: Date = new Date(),
): Promise<CardOffersSnapshot> {
  const asOf = colomboDateIso(now);

  const [sampath, hnb, combank, pabc, dfcc, peoples, ntb, visa] =
    await Promise.all([
      fetchSampathOffers(asOf),
      fetchHnbOffers(asOf),
      fetchCombankOffers(asOf),
      fetchPabcOffers(asOf),
      fetchDfccOffers(asOf),
      fetchPeoplesOffers(asOf),
      fetchNtbOffers(asOf),
      fetchVisaSupermarketOffers(asOf),
    ]);

  const live = dedupeOffers([
    ...sampath,
    ...hnb,
    ...combank,
    ...pabc,
    ...dfcc,
    ...peoples,
    ...ntb,
    ...visa,
  ]);
  const todaysLive = filterTodaysOffers(live, now);
  const todaysSeed = filterTodaysOffers(seed.offers, now);
  const offers = mergeTodaysLiveWithSeed(todaysLive, todaysSeed);

  if (todaysLive.length === 0) {
    return {
      ...buildSeedSnapshot(now),
      offers,
    };
  }

  const usedSeedGaps = offers.some((offer) => offer.isSeed);
  return {
    sourceId: "bank_card_offers",
    sourceName: usedSeedGaps
      ? "Bank supermarket card days (partial live)"
      : "Bank supermarket card days",
    asOf,
    isSeed: false,
    methodologyNote: usedSeedGaps
      ? "Mixed live/seed supermarket card days: live rows from Sampath JSON, HNB Venus JSON, Visa LK VMORC perks JSON, ComBank rewards HTML, Pan Asia arr_offers JS (after Sucuri cookie), DFCC supermarket hub HTML/RSC, People's Bank supermarket offer-card HTML, and NTB Mastercard promotions/hub HTML. Missing merchant/weekday slots filled from curated seed (per-offer isSeed). Weekday cadence parsed from offer copy when present; otherwise validTo gates inclusion. Lankawa is not affiliated with the banks or merchants — confirm at checkout and on the bank site."
      : "Public indicative supermarket card promotions from Sampath JSON, HNB Venus JSON, Visa LK VMORC perks JSON (Glomark/supermarket merchantName filter), ComBank rewards HTML, Pan Asia arr_offers JS (after Sucuri cookie), DFCC supermarket hub HTML/RSC, People's Bank supermarket offer-card HTML, and NTB Mastercard promotions/hub HTML. Weekday cadence parsed from offer copy when present; otherwise validTo gates inclusion. Lankawa is not affiliated with the banks or merchants — confirm at checkout and on the bank site.",
    offers,
  };
}

export function getCardOffersSeedSnapshot(now: Date = new Date()): CardOffersSnapshot {
  return buildSeedSnapshot(now);
}
