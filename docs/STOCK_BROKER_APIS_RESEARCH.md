# Sri Lanka stock broker public APIs / JSON (besides cse.lk)

**Status:** Medium-thoroughness research (Jul 2026)  
**Question:** Besides unofficial `https://www.cse.lk/api/*` (already in `src/lib/integrations/cse.ts`), do Asia Securities, Softlogic Stockbrokers, or Capital Alliance expose public market-data APIs or JSON Lankawa could use?

**Verdict:** None of the three publish a public CSE equity quotes/indices API. Softlogic and Capital Alliance (and most CSE member firms) route trading through **ATrad**, whose end-user market data is session-authenticated. Capital Alliance does expose one useful **unauthenticated JSON** feed for treasuries / FX / unit trusts (and two CAL-listed equity prices) — not a CSE market snapshot. For equity pulse, keep `cse.lk/api` as the primary upstream.

---

## Summary table

| Source | Public market-data API? | What exists | Lankawa fit |
|--------|-------------------------|-------------|-------------|
| **CSE** (`cse.lk/api`) | Unofficial portal JSON (already used) | ASPI, S&P SL20, movers, sectors, summary, … | **Keep / deepen** |
| **Asia Securities** | **No** | Athena (TradingView UI) + client research portal (login) + ATrad partnership | Skip for quotes |
| **Softlogic Stockbrokers** | **No** (equity) | ATrad web login; WP `research-reports` CPT (stale); marketing RSS | Skip for quotes; optional stale research list |
| **Capital Alliance** | **Partial** (non-equity) | Auth-gated AnalytiCAL / live-data SPA; open `MobileappDataService.php` JSON | Optional economy/treasuries/FX/UT card |
| **ATrad** (platform) | B2B API Suite (not public retail) | Broker-white-label `/atsweb/login`; no developer portal for third parties | Do not scrape / automate for Lankawa |
| **First Capital** (spot check) | **No** | Same ATrad pattern | Confirms industry pattern |

---

## 1. Asia Securities

| Surface | URL / host | Access |
|---------|------------|--------|
| Marketing site | `https://www.asiasecurities.lk/` | Public HTML (Laravel); no WP JSON / no open `/api/*` market routes |
| Research portal | `https://research.asiasecurities.lk/` | Redirects to WordPress login |
| Client login | `https://login.asiasecurities.lk/login` | Session auth |
| Athena trading | `https://asecathena.asiasecurities.lk/` | TradingView-integrated equity UI; marketed with **Atrad APIs** for trade execution, not a public data API |

**Findings:**
- Research publications are explicitly **client-portal** content — not a public JSON/RSS research feed.
- No reverse-engineered public quote endpoints discovered on marketing or login hosts.
- Athena did not yield usable public `datafeed` / config JSON from this environment (host slow / non-responsive to unauthenticated probes).

**Lankawa:** Not a substitute for CSE. Do not chase Athena/TradingView internals for product data.

---

## 2. Softlogic Stockbrokers

| Surface | URL | Access |
|---------|-----|--------|
| Marketing site | `https://softlogicstockbrokers.lk/` | WordPress |
| Online trading | `https://online.softlogicstockbrokers.lk/atsweb/login` | **ATrad** login (IronOne / ATrad theme assets) |
| WP JSON root | `https://softlogicstockbrokers.lk/wp-json/` | Public |

**Public JSON that exists (not live quotes):**

| Endpoint | Notes |
|----------|--------|
| `GET …/wp-json/wp/v2/research-reports` | ~30 items; oldest-style monthly/company PDFs; **latest sampled titles dated 2022** |
| `GET …/wp-json/wp/v2/news` | Corporate / event news, not market ticks |
| `GET …/feed/` | RSS of site content (sparse / marketing) |

Daily/weekly/monthly research **landing pages** exist in IA, but live report bodies are not exposed as a maintained machine feed. Trading is ATrad — same pattern as community tooling (`nimsaraakash/atrad-cli`): authenticated dashboard automation only; **no public end-user API**.

**Open Banking Tracker** listing for Softlogic Stockbrokers shows **no API products** (aggregator SEO noise, not a CSE data API).

**Lankawa:** Skip for `/economy` equity pulse. Research CPT is too stale to surface as a “today’s research” strip without editorial curation.

---

## 3. Capital Alliance (CAL)

### 3a. Client portals (auth-gated — not for Lankawa)

| Surface | Notes |
|---------|--------|
| `https://portal.cal.lk/` | Angular SPA (v~9.3.x); routes like `/live-data-lite`, AnalytiCAL |
| AnalytiCAL | Valuation ratios, sector stats, foreign flows, stock fundamentals — **client login** |
| Bundled relative APIs (observed in `main.*.js`) | e.g. `live-market-data/light-view/market-summary/*`, `…/top-gainers`, `…/top-losers`, `/analytical/market-stats/*`, `/account/aspi-graph-data` |

Unauthenticated HTTP GETs to those paths return the SPA shell HTML (same 5 KB `index.html`), not JSON. Treat as **private CRM/research APIs**. Vstock is a virtual trading simulator for clients, not a public API.

### 3b. Public JSON — `MobileappDataService` (useful adjacent data)

**Endpoint (live as of research):**

```
http://analytics.cal.lk:8081/MobileappDataService/MobileappDataService.php
```

- Returns `Content-Type: application/json`
- Sends `Access-Control-Allow-Origin: *`
- Also referenced from the CAL portal bundle (legacy mobile service)

**Top-level keys observed:**

| Key | Content |
|-----|---------|
| `dailyMarketOperationList` | Overnight repurchase rate (today / previous / bps) |
| `treasurybills` | 91 / 182 / 364 day weekly yields |
| `secondaryTBillTBonds` | Bid/ask for TBOND tenors |
| `forexRatesList` | Buy/sell for major currencies (AUD, …) |
| `UTMS_FUND` | Unit trust fund BUY/SELL/yield/`lastUpdate` |
| `CALT_Price` / `CALH_Price` | Single last prices for CALT / CALH only |
| `FundDisplay` / `Tabs` | UI flags |

Related: `ut_fundsRates.php?odate=YYYY-MM-DD` (date-required; empty/`[]` when no rows).

**Caveats for production use:**
- Hosted on **HTTP :8081** (XAMPP/Apache fingerprint) — fragile SLA, TLS gap, likely not a documented public contract.
- Equity coverage is **two tickers**, not market-wide.
- Good as a **treasury / UT / FX** satellite for `/economy`, not as CSE ASPI/movers backup.
- Prefer attributing “Capital Alliance public mobile feed (unofficial)” and cache aggressively; fall back to CBSL / other sources if it dies.

### 3c. Marketing WordPress JSON

`https://cal.lk/wp-json/wp/v2/posts?categories=312` (Research) — macro/blog articles. Fine for a curated “insights” link-out; not quotes.

---

## 4. Industry pattern (ATrad)

- **ATrad** (`atrad.lk` / `atradsolutions.com`) powers online trading for many CSE brokers (Softlogic, CAL equities, First Capital, …).
- Marketing claims an **ATrad API Suite** (market data + orders) for **broker / institutional integration** — no public developer docs, keys, or sandbox for third-party apps like Lankawa.
- Softlogic’s ATS login HTML is ATrad-branded; Asia Securities marketing cites the same ATrad partnership for Athena execution.

**Implication:** Broker-specific “public APIs” for live CSE books are unlikely to appear; exchange portal + licensed vendor feeds remain the real options.

---

## 5. Recommendations for Lankawa

1. **Equity / ASPI pulse:** Stay on `cse.lk/api` (`src/lib/integrations/cse.ts`). Sectors / most-active / foreign / notices / GICS valuation already shipped — [`CSE_API_DOCS.md`](./CSE_API_DOCS.md).
2. **Do not** integrate ATrad `/atsweb` or AnalytiCAL session APIs (ToS, auth, fragility, compliance).
3. **Optional P2:** Thin adapter for CAL `MobileappDataService.php` → overnight repo, T-bill curve, secondary bond bids, FX strip, UT NAVs — label freshness honestly; HTTP-only host.
4. **Skip** Softlogic / Asia Securities for machine market data; optional human-curated research links only.
5. If CSE portal breaks, plan B is **licensed delayed feed** or partnership — not another broker’s login wall.

---

## Probe log (Jul 2026)

| Probe | Result |
|-------|--------|
| Softlogic `wp-json` types | Includes `research-reports`, `news` |
| Softlogic `atsweb/login` | ATrad login page |
| CAL portal SPA paths without session | HTML shell only |
| CAL `MobileappDataService.php` | Live JSON (keys above) |
| Asia `research.*` | Login redirect |
| Asia Athena unauthenticated assets | No usable public JSON |
| First Capital digital/stock pages | ATrad client login only |

---

## Sources

- Live probes of broker hosts (Jul 2026)
- [ATrad Solutions — stockbrokers / API Suite](https://atradsolutions.com/stockbrokers/)
- [ATrad Sri Lanka](https://atrad.lk/) (broker list includes Softlogic)
- [Asia Securities Athena launch](https://www.asiasecurities.lk/event/asia-securities-launches-athena-a-pioneering-platform-for-cses-online-investors)
- [CAL AnalytiCAL](https://cal.lk/analytical/) / [CAL Digital](https://cal.lk/digital/)
- Community: `nimsaraakash/atrad-cli` (auth automation; confirms no public ATrad API)
- Existing Lankawa: `src/lib/integrations/cse.ts`, [`DATA_EXPANSION_RESEARCH.md`](./DATA_EXPANSION_RESEARCH.md)
