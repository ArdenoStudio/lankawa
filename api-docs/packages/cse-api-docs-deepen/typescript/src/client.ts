/**
 * Unofficial TypeScript client — CSE (cse.lk) API — deepen pack
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

const DEFAULT_UA = "cse-api-docs-deepen-unofficial/0.1 (+https://github.com/Cookie-Cat21/cse-api-docs-deepen; educational; polite)";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CseApiDocsDeepenClient {
  readonly baseUrl: string;
  readonly userAgent: string;
  readonly defaultDelayMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "https://www.cse.lk/api").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** Catalog metadata for this package. */
  static readonly slug = "cse-api-docs-deepen";
  static readonly title = "CSE (cse.lk) API — deepen pack";

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
   * Dedicated top gainers board.
   * Catalog id: `top_gainers` · POST
   */
  async topGainers(body: unknown = undefined, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cse.lk/api/topGainers", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({} as unknown) });
  }

  /**
   * Dedicated top losers (CSE spelling).
   * Catalog id: `top_looses` · POST
   */
  async topLooses(body: unknown = undefined, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cse.lk/api/topLooses", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({} as unknown) });
  }

  /**
   * 52-week / YTD sector ranges.
   * Catalog id: `sector_52_week` · POST
   */
  async sector52Week(body: unknown = undefined, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cse.lk/api/52WeekSectors", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({} as unknown) });
  }

  /**
   * Full board — primary poller; client-side page in lab.
   * Catalog id: `trade_summary` · POST
   */
  async tradeSummary(body: unknown = undefined, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cse.lk/api/tradeSummary", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({} as unknown) });
  }

  /**
   * Company announcements by symbol.
   * Catalog id: `get_announcement_by_company` · POST
   */
  async getAnnouncementByCompany(body: unknown = undefined, options: RequestOptions = {}): Promise<unknown> {
    return this.requestJson<unknown>(this.resolveUrl("https://www.cse.lk/api/getAnnouncementByCompany", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({"symbol": "JKH.N0000"} as unknown) });
  }
}

export default CseApiDocsDeepenClient;
