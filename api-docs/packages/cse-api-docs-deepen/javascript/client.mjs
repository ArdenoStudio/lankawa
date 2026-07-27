/**
 * Unofficial JavaScript (ESM) client — CSE (cse.lk) API — deepen pack
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "cse-api-docs-deepen-unofficial/0.1 (+https://github.com/Cookie-Cat21/cse-api-docs-deepen; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CseApiDocsDeepenClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "https://www.cse.lk/api").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "cse-api-docs-deepen";
  static title = "CSE (cse.lk) API — deepen pack";

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

  /** Dedicated top gainers board. */
  async topGainers(body = undefined, options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cse.lk/api/topGainers", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({}) });
  }

  /** Dedicated top losers (CSE spelling). */
  async topLooses(body = undefined, options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cse.lk/api/topLooses", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({}) });
  }

  /** 52-week / YTD sector ranges. */
  async sector52Week(body = undefined, options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cse.lk/api/52WeekSectors", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({}) });
  }

  /** Full board — primary poller; client-side page in lab. */
  async tradeSummary(body = undefined, options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cse.lk/api/tradeSummary", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({}) });
  }

  /** Company announcements by symbol. */
  async getAnnouncementByCompany(body = undefined, options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cse.lk/api/getAnnouncementByCompany", options.query), { ...options, method: "POST", body: body !== undefined ? body : ({"symbol": "JKH.N0000"}) });
  }
}

export default CseApiDocsDeepenClient;
