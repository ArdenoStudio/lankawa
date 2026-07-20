/**
 * Unofficial JavaScript (ESM) client — HNB Venus API
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "hnb-venus-api-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/hnb-venus-api-docs; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HnbVenusApiDocsClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "https://venus.hnb.lk/api").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "hnb-venus-api-docs";
  static title = "HNB Venus API";

  withQuery(url, defaults, extra) {
    const u = new URL(url, this.baseUrl || undefined);
    for (const [k, v] of Object.entries({ ...defaults, ...(extra ?? {}) })) {
      if (v === undefined || v === null) continue;
      u.searchParams.set(k, String(v));
    }
    return u.toString();
  }

  resolveUrl(url, query) {
    if (!query || Object.keys(query).length === 0) {
      if (url.startsWith("http")) return url;
      return `${this.baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
    }
    return this.withQuery(url, {}, query);
  }

  async requestJson(url, options = {}) {
    const delay = options.delayMs ?? this.defaultDelayMs;
    if (delay > 0) await sleep(delay);
    const method = (options.method ?? "GET").toUpperCase();
    const headers = {
      Accept: "application/json, text/plain, */*",
      "User-Agent": this.userAgent,
      ...(options.headers ?? {}),
    };
    let body;
    if (options.body !== undefined && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }
    const res = await this.fetchImpl(url, { method, headers, body, signal: options.signal });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${method} ${url} -> ${res.status}: ${text.slice(0, 280)}`);
    }
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  /** FX contents for web. */
  async getExchangeRatesContentsWeb(options = {}) {
    return this.requestJson(this.resolveUrl("https://venus.hnb.lk/api/get_exchange_rates_contents_web", options.query), { ...options, method: "GET" });
  }

  /** ~841 card promos paginated. */
  async getAllWebCardPromos(page = 1, limit = 50, options = {}) {
    return this.requestJson(this.withQuery("https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit", { page, limit }, options.query), { ...options, method: "GET" });
  }

  /** Nested FD/savings/loans tables in table_data_approved. */
  async getInterestRatesContents(options = {}) {
    return this.requestJson(this.resolveUrl("https://venus.hnb.lk/api/get_interest_rates_contents", options.query), { ...options, method: "GET" });
  }

  /** Single promo detail by id. */
  async getWebCardPromo(options = {}) {
    return this.requestJson(this.resolveUrl("https://venus.hnb.lk/api/get_web_card_promo?id=1", options.query), { ...options, method: "GET" });
  }

  /** FX + deposit teaser with updated_on stamp. */
  async getRatesContentsWeb(options = {}) {
    return this.requestJson(this.resolveUrl("https://venus.hnb.lk/api/get_rates_contents_web", options.query), { ...options, method: "GET" });
  }

  /** As-of stamp for FX board. */
  async getExchangeRateLastUpdateDateContents(options = {}) {
    return this.requestJson(this.resolveUrl("https://venus.hnb.lk/api/get_exchange_rate_last_update_date_contents", options.query), { ...options, method: "GET" });
  }

  /** Debit card promos (~93); includes Glomark supermarket. */
  async getAllWebCardPromosDebit(page = 1, limit = 50, options = {}) {
    return this.requestJson(this.withQuery("https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=debit", { page, limit }, options.query), { ...options, method: "GET" });
  }
}

export default HnbVenusApiDocsClient;
