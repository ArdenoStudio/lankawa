/**
 * Unofficial TypeScript client — HNB Venus API
 *
 * Not affiliated with the upstream operator. Public reads only. Polite delays.
 * Generated from catalog/endpoints.yaml — regenerate via scripts/scaffold-ts-clients.py
 */

export type QueryValue = string | number | boolean | undefined | null;

export type RequestOptions = {
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  body?: unknown;
  method?: string;
  /** Delay before the request (ms). Default 1000. */
  delayMs?: number;
  signal?: AbortSignal;
};

export type ClientOptions = {
  /** Override base host when catalog URLs are path-only. */
  baseUrl?: string;
  userAgent?: string;
  defaultDelayMs?: number;
  fetchImpl?: typeof fetch;
};

const DEFAULT_UA = "hnb-venus-api-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/hnb-venus-api-docs; educational; polite)";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HnbVenusApiDocsClient {
  readonly baseUrl: string;
  readonly userAgent: string;
  readonly defaultDelayMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "https://venus.hnb.lk/api").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** Catalog metadata for this package. */
  static readonly slug = "hnb-venus-api-docs";
  static readonly title = "HNB Venus API";

  withQuery(
    url: string,
    defaults: Record<string, QueryValue>,
    extra?: Record<string, QueryValue>,
  ): string {
    const u = new URL(url, this.baseUrl || undefined);
    for (const [k, v] of Object.entries({ ...defaults, ...(extra ?? {}) })) {
      if (v === undefined || v === null) continue;
      u.searchParams.set(k, String(v));
    }
    return u.toString();
  }

  resolveUrl(url: string, query?: Record<string, QueryValue>): string {
    if (!query || Object.keys(query).length === 0) {
      if (url.startsWith("http")) return url;
      return `${this.baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
    }
    return this.withQuery(url, {}, query);
  }

  async requestJson<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
    const delay = options.delayMs ?? this.defaultDelayMs;
    if (delay > 0) await sleep(delay);
    const method = (options.method ?? "GET").toUpperCase();
    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "User-Agent": this.userAgent,
      ...(options.headers ?? {}),
    };
    let body: string | undefined;
    if (options.body !== undefined && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }
    const res = await this.fetchImpl(url, {
      method,
      headers,
      body,
      signal: options.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${method} ${url} -> ${res.status}: ${text.slice(0, 280)}`);
    }
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  /**
   * FX contents for web.
   * Catalog id: `get_exchange_rates_contents_web` · GET
   */
  async getExchangeRatesContentsWeb(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://venus.hnb.lk/api/get_exchange_rates_contents_web", options.query), { ...options, method: "GET" });
  }

  /**
   * ~841 card promos paginated.
   * Catalog id: `get_all_web_card_promos` · GET
   */
  async getAllWebCardPromos(page = 1, limit = 50, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.withQuery("https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit", { page, limit }, options.query), { ...options, method: "GET" });
  }

  /**
   * Nested FD/savings/loans tables in table_data_approved.
   * Catalog id: `get_interest_rates_contents` · GET
   */
  async getInterestRatesContents(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://venus.hnb.lk/api/get_interest_rates_contents", options.query), { ...options, method: "GET" });
  }

  /**
   * Single promo detail by id.
   * Catalog id: `get_web_card_promo` · GET
   */
  async getWebCardPromo(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://venus.hnb.lk/api/get_web_card_promo?id=1", options.query), { ...options, method: "GET" });
  }

  /**
   * FX + deposit teaser with updated_on stamp.
   * Catalog id: `get_rates_contents_web` · GET
   */
  async getRatesContentsWeb(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://venus.hnb.lk/api/get_rates_contents_web", options.query), { ...options, method: "GET" });
  }

  /**
   * As-of stamp for FX board.
   * Catalog id: `get_exchange_rate_last_update_date_contents` · GET
   */
  async getExchangeRateLastUpdateDateContents(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://venus.hnb.lk/api/get_exchange_rate_last_update_date_contents", options.query), { ...options, method: "GET" });
  }

  /**
   * Debit card promos (~93); includes Glomark supermarket.
   * Catalog id: `get_all_web_card_promos_debit` · GET
   */
  async getAllWebCardPromosDebit(page = 1, limit = 50, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.withQuery("https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=debit", { page, limit }, options.query), { ...options, method: "GET" });
  }
}

export default HnbVenusApiDocsClient;
