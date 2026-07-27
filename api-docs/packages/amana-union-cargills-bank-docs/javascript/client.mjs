/**
 * Unofficial JavaScript (ESM) client — Amana / Union / Cargills Bank rates & offers
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "amana-union-cargills-bank-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/amana-union-cargills-bank-docs; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AmanaUnionCargillsBankDocsClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "amana-union-cargills-bank-docs";
  static title = "Amana / Union / Cargills Bank rates & offers";

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

  /** Amana rates pages (Islamic products). */
  async amanaRates(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.amanabank.lk/rates/", options.query), { ...options, method: "GET" });
  }

  /** Union Bank card offers HTML. */
  async unionBankOffers(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.unionb.com/personal/cards/offers", options.query), { ...options, method: "GET" });
  }

  /** Cargills Bank rates & tariffs. */
  async cargillsBankRates(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cargillsbank.com/rates-and-tariffs/", options.query), { ...options, method: "GET" });
  }
}

export default AmanaUnionCargillsBankDocsClient;
