/**
 * Unofficial JavaScript (ESM) client — Bank of Ceylon Rates
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "boc-rates-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/boc-rates-docs; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class BocRatesDocsClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "https://www.boc.lk").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "boc-rates-docs";
  static title = "Bank of Ceylon Rates";

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

  /** Canonical FX + FD HTML — prefer over stale JSON. */
  async ratesTariffHtml(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.boc.lk/rates-tariff", options.query), { ...options, method: "GET" });
  }

  /** PARK — live JSON but wrong vs rates-tariff HTML. — PARKED */
  async interestRatesFdJsonParked(_options = {}) {
    throw new Error("Parked endpoint: interest_rates_fd_json_parked (boc-rates-docs)");
  }
}

export default BocRatesDocsClient;
