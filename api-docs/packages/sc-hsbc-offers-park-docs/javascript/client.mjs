/**
 * Unofficial JavaScript (ESM) client — Standard Chartered + HSBC LK offers (park notes)
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "sc-hsbc-offers-park-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/sc-hsbc-offers-park-docs; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ScHsbcOffersParkDocsClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "sc-hsbc-offers-park-docs";
  static title = "Standard Chartered + HSBC LK offers (park notes)";

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

  /** PARK — TGL offers.json mostly expired on probe. — PARKED */
  async scTglOffersJsonParked(_options = {}) {
    throw new Error("Parked endpoint: sc_tgl_offers_json_parked (sc-hsbc-offers-park-docs)");
  }

  /** PARK — HSBC LK retail sold to NTB; offer URLs dead. — PARKED */
  async hsbcRetailParked(_options = {}) {
    throw new Error("Parked endpoint: hsbc_retail_parked (sc-hsbc-offers-park-docs)");
  }
}

export default ScHsbcOffersParkDocsClient;
