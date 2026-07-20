/**
 * Unofficial JavaScript (ESM) client — CBSL Public Data
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "cbsl-public-data-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/cbsl-public-data-docs; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CbslPublicDataDocsClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "https://www.cbsl.gov.lk").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "cbsl-public-data-docs";
  static title = "CBSL Public Data";

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

  /** Policy rates page (OPR / corridor context). */
  async plratesHtml(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates", options.query), { ...options, method: "GET" });
  }

  /** Historical SDFR/SLFR/OPR Excel tip. */
  async historicalPolicyXlsx(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/statistics/sheets/historical_policy_interest_rates.xlsx", options.query), { ...options, method: "GET" });
  }

  /** Secondary market T-bill yields (91/182/364). */
  async eresearchTbill6169(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6169", options.query), { ...options, method: "GET" });
  }

  /** Weekly AWPR series. */
  async eresearchAwpr6277(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6277", options.query), { ...options, method: "GET" });
  }

  /** Payments bulletin PDF index. */
  async paymentsBulletinIndex(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cbsl.gov.lk/en/payments-and-settlements/payments-bulletin", options.query), { ...options, method: "GET" });
  }

  /** CBSL indicative FX HTML tables. */
  async fxBuyingSellingHtml(options = {}) {
    return this.requestJson(this.resolveUrl("https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates", options.query), { ...options, method: "GET" });
  }
}

export default CbslPublicDataDocsClient;
