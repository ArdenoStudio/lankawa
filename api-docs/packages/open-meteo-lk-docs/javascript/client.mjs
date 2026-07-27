/**
 * Unofficial JavaScript (ESM) client — Open-Meteo Sri Lanka Recipes
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = "open-meteo-lk-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/open-meteo-lk-docs; educational; polite)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class OpenMeteoLkDocsClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? "https://api.open-meteo.com").replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  static slug = "open-meteo-lk-docs";
  static title = "Open-Meteo Sri Lanka Recipes";

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

  /** Colombo daily forecast. */
  async forecastColombo(options = {}) {
    return this.requestJson(this.resolveUrl("https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&daily=uv_index_max,precipitation_sum&timezone=Asia%2FColombo", options.query), { ...options, method: "GET" });
  }

  /** Colombo air quality. */
  async airQualityColombo(options = {}) {
    return this.requestJson(this.resolveUrl("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=6.9271&longitude=79.8612&hourly=pm2_5,us_aqi", options.query), { ...options, method: "GET" });
  }

  /** Colombo marine wave height. */
  async marineColombo(options = {}) {
    return this.requestJson(this.resolveUrl("https://marine-api.open-meteo.com/v1/marine?latitude=6.9271&longitude=79.8612&hourly=wave_height", options.query), { ...options, method: "GET" });
  }
}

export default OpenMeteoLkDocsClient;
