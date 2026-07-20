/**
 * Unofficial TypeScript client — NWSDB Bill Calculator API
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

const DEFAULT_UA = "nwsdb-bill-api-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/nwsdb-bill-api-docs; educational; polite)";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class NwsdbBillApiDocsClient {
  readonly baseUrl: string;
  readonly userAgent: string;
  readonly defaultDelayMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "https://ebis.waterboard.lk").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** Catalog metadata for this package. */
  static readonly slug = "nwsdb-bill-api-docs";
  static readonly title = "NWSDB Bill Calculator API";

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
   * Domestic bill estimate.
   * Catalog id: `bill_calculator` · POST
   */
  async billCalculator(body: unknown = undefined, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://ebis.waterboard.lk/api_nwsdb/bill/BillCalculator", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({"CategoryId": 1, "NoOfDays": 30, "Consumption": 20, "NoOfHouses": 1} as unknown) });
  }

  /**
   * Tariff adjustment metadata.
   * Catalog id: `get_tariff_adjustment` · GET
   */
  async getTariffAdjustment(options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://ebis.waterboard.lk/api_nwsdb/bill/getTariffAdjustment", options.query), { ...options, method: "GET" });
  }
}

export default NwsdbBillApiDocsClient;
