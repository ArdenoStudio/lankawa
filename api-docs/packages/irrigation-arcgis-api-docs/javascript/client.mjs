/**
 * Unofficial JavaScript (ESM) client — Irrigation ArcGIS Gauges
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "irrigation-arcgis-api-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/irrigation-arcgis-api-docs; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class IrrigationArcgisApiDocsClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "https://services3.arcgis.com").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "irrigation-arcgis-api-docs";
  static title = "Irrigation ArcGIS Gauges";

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

  /** Latest river gauge readings. */
  async gauges2ViewQuery(resultOffset = 0, resultRecordCount = 50, options = {}) {
    return this.requestJson(this.withQuery("https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0/query?where=1%3D1&outFields=*&orderByFields=EditDate%20DESC&resultRecordCount=50&f=json", { resultOffset, resultRecordCount }, options.query), { ...options, method: "GET" });
  }

  /** 24-hour rainfall FeatureServer. */
  async rainfall24hr(resultOffset = 0, resultRecordCount = 50, options = {}) {
    return this.requestJson(this.withQuery("https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/24hr_rainfall/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=50&f=json", { resultOffset, resultRecordCount }, options.query), { ...options, method: "GET" });
  }
}

export default IrrigationArcgisApiDocsClient;
