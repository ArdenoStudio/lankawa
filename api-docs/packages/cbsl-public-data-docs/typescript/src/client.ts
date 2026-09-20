/**
 * Unofficial TypeScript client — CBSL Public Data
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

const DEFAULT_UA = "cbsl-public-data-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/cbsl-public-data-docs; educational; polite)";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CbslPublicDataDocsClient {
  readonly baseUrl: string;
  readonly userAgent: string;
  readonly defaultDelayMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "https://www.cbsl.gov.lk").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** Catalog metadata for this package. */
  static readonly slug = "cbsl-public-data-docs";
  static readonly title = "CBSL Public Data";

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
   * Policy rates page (OPR / corridor context).
   * Catalog id: `plrates_html` · GET
   */
  async plratesHtml(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates", options.query), { ...options, method: "GET" });
  }

  /**
   * Historical SDFR/SLFR/OPR Excel tip.
   * Catalog id: `historical_policy_xlsx` · GET
   */
  async historicalPolicyXlsx(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/statistics/sheets/historical_policy_interest_rates.xlsx", options.query), { ...options, method: "GET" });
  }

  /**
   * Secondary market T-bill yields (91/182/364).
   * Catalog id: `eresearch_tbill_6169` · GET
   */
  async eresearchTbill6169(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6169", options.query), { ...options, method: "GET" });
  }

  /**
   * Weekly AWPR series.
   * Catalog id: `eresearch_awpr_6277` · GET
   */
  async eresearchAwpr6277(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6277", options.query), { ...options, method: "GET" });
  }

  /**
   * Payments bulletin PDF index.
   * Catalog id: `payments_bulletin_index` · GET
   */
  async paymentsBulletinIndex(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cbsl.gov.lk/en/payments-and-settlements/payments-bulletin", options.query), { ...options, method: "GET" });
  }

  /**
   * CBSL indicative FX HTML tables.
   * Catalog id: `fx_buying_selling_html` · GET
   */
  async fxBuyingSellingHtml(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates", options.query), { ...options, method: "GET" });
  }
}

export default CbslPublicDataDocsClient;
