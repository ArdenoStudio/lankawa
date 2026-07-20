# CBSL rates & indicators — public series deep dive (Lankawa)

**Status:** Live probe (high thoroughness), 2026-07-20  
**Hosts:** `https://www.cbsl.gov.lk` (Drupal + `cbsl_custom` PHP) · `https://www.cbsl.lk/eResearch/` (ASP.NET “DATA LIBRARY”)  
**UA used:** `LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)`  
**Sister docs:** [`CBSL_PAYMENTS_BULLETIN.md`](./CBSL_PAYMENTS_BULLETIN.md), [`GOLD_RETAIL_RATES_RESEARCH.md`](./GOLD_RETAIL_RATES_RESEARCH.md), [`HARTI_CBSL_FOOD_PDF.md`](./HARTI_CBSL_FOOD_PDF.md)  
**Lankawa code today:** `src/lib/integrations/cbsl.ts`, `src/lib/economy.ts`, `src/lib/treasury.ts`, `src/lib/payments-bulletin.ts`, seeds under `src/data/economy-macro.json` / `cbsl-treasury-seed.json` / `cbsl-payments-bulletin-seed.json`

---

## Verdict

| Series | Machine surface | Cadence | Lankawa today | Decision |
|--------|-----------------|---------|---------------|----------|
| **USD/LKR buy–sell (TT indicative)** | HTML POST (+ **CSV** with session) | Daily | **Live** scrape | **Already-have** (optional CSV harden) |
| **Gold XAU/LKR** | HTML POST (CSV same pattern) | Daily | **Live** scrape | **Already-have** |
| **Payments bulletin** (CEFTS / JustPay / LANKAQR) | Quarterly PDF only | Quarterly | **Seed strip** | **Already-have** |
| **Macro seed** (CCPI / GDP / reserves) | Releases + DEI PDF | Monthly / irregular | **Static seed** | **Already-have** (keep curated) |
| **T-bill / WAYR strip** | Seed JSON | — | **Seed** on `/economy` | Upgrade → **Ship** live |
| **OPR + SRR** (current) | `plrates.php` HTML | Policy dates | — | **Ship** |
| **SDFR / SLFR** (corridor + history) | `historical_policy_interest_rates.xlsx` + monthly `table4.04` | Policy / monthly | — | **Ship** (with OPR; note post-2024 role) |
| **AWPR** (weekly) | eResearch `ReportId=6277` HTML · WEI / DEI PDF | Weekly | — | **Ship** |
| **AWDR / AWFDR / AWLR** (+ AWNDR / AWNFDR / AWNLR) | Monthly Excel `table4.04` · eResearch `6277` | Monthly (AWPR weekly) | — | **Ship** tip from Excel or eResearch |
| **Treasury bill/bond yields (secondary)** | eResearch `ReportId=6169` HTML | Weekly | Seed only | **Ship** (replace / backfill seed) |
| **T-bill/bond primary auctions** | Dated Excel under fiscal tables | Weekly / irregular | Seed cites auctions | **Ship** as archive; tip file can lag |
| **Commercial bank advertised ranges** | Same `table4.04` (FD / savings / loan bands) | Monthly | — | **Park** (ranges, not household quotes; banks better for FD JSON) |
| **AWCMR / call / repo money market** | eResearch `5206`, `1059` | Daily | — | **Park** (specialist) |
| **SLIBOR** | eResearch `8231` | — | — | **Park** (empty / legacy) |
| **OMO outright / term repo** | eResearch `1062`, `1064` | Auction days | — | **Park** |
| **Multi-currency FX / REER Excel** | `exrates.php` + IF_*.xlsx | Daily / monthly | USD only | **Park** unless remittance expands |
| **PDMO daily secondary quotes** | Moved to `treasury.gov.lk` | Daily | — | **Park** (off-CBSL; UUID file API) |
| **Economic Data Library UI** | Points at eResearch | — | — | **Park** as product; use ReportIds below |
| **Public JSON REST API** | **None** found | — | — | N/A — scrape / Excel / CSV only |

**Bottom line:** CBSL has **no** public JSON rates API. Lankawa already owns the two best daily scrapes (FX + gold) and the payments seed. The highest-ROI next ships are **policy rates (`plrates.php` + policy Excel)**, **weekly AWPR + secondary T-bill yields via eResearch HTML**, and **monthly AWDR/AWFDR/AWLR from `table4.04` Excel** — replacing the stale treasury seed. Park money-market minutiae, SLIBOR, and bank advertised ranges.

---

## Discovery method

1. Hub crawl: `/en/rates-and-indicators`, policy / exchange / statistical-tables / economic-indicators.  
2. Form + iframe hunt under `/cbsl_custom/` (`exratestt`, `exrates`, `param/plrates.php`).  
3. eResearch ReportIds linked from the rates hub → ASP.NET date POST (`btnShow` / `btnExport`).  
4. Monetary / fiscal Excel inventory (`table4.0x`, `Treasury_*_Auctions_*.xlsx`, `IF_*.xlsx`, `historical_policy_interest_rates.xlsx`).  
5. DEI / WEI / Monthly Bulletin of Monetary and Interest Rate Statistics PDFs as cross-checks (not preferred ingest).  
6. Confirmed: FX **CSV** export works only **after** an HTML Submit in the same cookie jar with `startDate` / `endDate` + `btnCSV=csv`.

---

## What Lankawa already has

### Exchange rates (live)

| | |
|--|--|
| **Adapter** | `src/lib/integrations/cbsl.ts` → `fetchCbslFxRates()` / `getLatestFxRate()` |
| **Ingest twin** | `ingest/sources/cbsl_fx.py` |
| **UI** | `/economy` FX band + series (`src/lib/economy.ts`) |
| **Endpoint** | `POST https://www.cbsl.gov.lk/cbsl_custom/exratestt/exrates_resultstt.php` |
| **Body** | `lookupPage=lookup_daily_exchange_rates.php`, `rangeType=dates`, `txtStart`/`txtEnd`, `chk_cur[]=USD~US Dollar`, `submit_button=Submit` |
| **UI form** | `https://www.cbsl.gov.lk/cbsl_custom/exratestt/exratestt.php` (iframe from buy/sell page) |
| **Probe tip (2026-07-20)** | USD buy **331.5003** / sell **340.9069** |

**CSV (optional harden):** same host; session Submit → then POST `startDate`, `endDate`, `btnCSV=csv` → `Content-Type: text/csv`, `filename=data.csv`. One-shot CSV without prior Submit returns `0 results`. XML button is **commented out** in HTML.

**Currencies on TT form:** AUD, CAD, CHF, CNY, EUR, GBP, JPY, SGD, USD only.  
**Full indicative form** (`exrates.php`): 50+ currencies including XAU.

### Gold (live)

| | |
|--|--|
| **Adapter** | `fetchCbslGoldRates()` in `cbsl.ts` |
| **Endpoint** | `POST https://www.cbsl.gov.lk/cbsl_custom/exrates/exrates_results.php` |
| **Body** | `chk_cur[]=XAU~Gold (per Troy oz.)` (+ same date fields) |
| **UI form** | `…/cbsl_custom/exrates/exratesgold.php` |
| **Page** | https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/daily-gold-rates |
| **Unit** | LKR per troy ounce (omit card if parse fails) |

Retail pawn conversion research: [`GOLD_RETAIL_RATES_RESEARCH.md`](./GOLD_RETAIL_RATES_RESEARCH.md).

### Macro + treasury + payments (seed)

| Artifact | Role |
|----------|------|
| `economy-macro.json` | CCPI / GDP / reserves + FX fallback series (`cbsl_macro`) |
| `cbsl-treasury-seed.json` + `TreasuryYieldStrip` | WAYR + 91/182/364 — **stale-OK seed**, live path not wired (`treasury.ts`) |
| `cbsl-payments-bulletin-seed.json` | Quarterly CEFTS / JustPay / LANKAQR — **shipped** |

---

## 1. Policy rates — OPR / SDFR / SLFR / SRR

### Institutional note (important for copy)

From 27 Nov 2024 CBSL uses a **single Overnight Policy Rate (OPR)**. SDFR and SLFR are **no longer the primary policy instruments**; they remain published as a corridor linked to OPR. Do not label SDFR/SLFR alone as “the” policy rate.

### Current levels — `plrates.php` (**Ship**)

| | |
|--|--|
| **URL** | `https://www.cbsl.gov.lk/cbsl_custom/param/plrates.php` |
| **Embedded from** | https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates (iframe) |
| **Format** | Tiny HTML table (not JSON) |
| **Probe (2026-07-20)** | **OPR 8.75%**, **SRR 2.00%** |
| **Reliability** | Occasional HTTP 500 observed; retry + fall back to Excel tip |

Parse: strip tags; read OPR / SRR rows. SDFR/SLFR are **not** always on this iframe (page prose still mentions them; history Excel has corridor).

### History Excel — `historical_policy_interest_rates.xlsx` (**Ship**)

| | |
|--|--|
| **URL** | https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/about/historical_policy_interest_rates.xlsx |
| **Sheets** | `OPR`, `SRR`, `Historical Policy Rates` (SDF / SLF columns) |
| **Tip OPR** | 27.11.2024 → 8.00; 22.05.2025 → 7.75; **26.05.2026 → 8.75** |
| **Tip SDF/SLF** | **26.05.2026 → 8.25 / 9.25** |

Stable filename (good canary). Prefer for history charts; `plrates.php` for “today’s board”.

### Monthly pack — `table4.04` Interest Rates

See §3. Tip May 2026: OPR 8.75 · SDFR 8.25 · SLFR 9.25 (matches Excel history).

---

## 2. AWPR, AWDR, AWFDR, AWLR (+ siblings)

### Definitions (from CBSL footnotes in `table4.04`)

| Code | Name | Cadence | Scope |
|------|------|---------|-------|
| **AWPR** | Average Weighted Prime Lending Rate | **Weekly** (monthly = average of weeks) | Short-term rupee loans to prime LCB customers |
| **AWDR** | Average Weighted Deposit Rate | Monthly | All outstanding interest-bearing LCB rupee deposits |
| **AWFDR** | Average Weighted Fixed Deposit Rate | Monthly | Outstanding LCB rupee time deposits |
| **AWLR** | Average Weighted Lending Rate | Monthly | All outstanding LCB rupee loans/advances |
| AWNDR / AWNFDR | New deposit / new FD | Monthly | New mobilisations in month |
| AWNLR | New lending | Monthly | New loans in month |
| AWSR / AWNSR | SME outstanding / new | Monthly | LCBs+LSBs MSME (from Jul 2020) |

### Best live path — eResearch Report **6277** (**Ship**)

| | |
|--|--|
| **URL** | `https://www.cbsl.lk/eResearch/MoneyMarketRatesDefault.aspx?ReportId=6277` |
| **Title** | Commercial Bank Lending and Deposit Rates |
| **Method** | GET page → ASP.NET POST `__VIEWSTATE*` + `txtFrom`/`txtTo` (ISO dates) + `btnShow=Show` |
| **Columns** | End week · AWLR · AWPR (weekly/monthly) · AWDR · AWFDR · AWSR |
| **Probe tip** | Week ending **2026-07-17**: weekly **AWPR 10.38%** (matches WEI: “decreased by 09 bps to 10.38”) |
| **Export** | `btnExport=Export To Excel` returns **HTML page**, not a real `.xlsx` — scrape the Show grid, don’t trust Export |
| **Host** | `www.cbsl.lk` only (`www.cbsl.gov.lk/eResearch/…` → **404**) |

### Best monthly archive — Excel `table4.04` (**Ship**)

| | |
|--|--|
| **Listing** | https://www.cbsl.gov.lk/en/statistics/statistical-tables/monetary-sector |
| **Tip file (probe)** | `…/statistics/sheets/table4.04_20260717.xlsx` (**filename date changes**) |
| **Annual twin** | `table4.03_*.xlsx` |
| **May 2026 tip** | AWDR **6.95** · AWFDR **8.66** · AWNDR **6.96** · AWNFDR **7.35** · AWPR (monthly avg) **9.75** · AWLR **11.97** · AWNLR **11.59** · AWSR **11.91** · AWNSR **11.95** |

**Ingest pattern:** scrape monetary-sector HTML for latest `table4.04_*.xlsx` href → openpyxl → last month row. Do not hardcode the dated filename.

### PDF cross-checks (not primary)

| Source | Use |
|--------|-----|
| Weekly Economic Indicators (`WEI_YYYYMMDD_e.pdf`) | AWPR sentence + narrative |
| Daily Economic Indicators | “Weekly AWPR” callout + T-bill secondary yields |
| Monthly Bulletin of Monetary and Interest Rate Statistics | Dashboard PDF (AWCMR, OPR, SDFR/SLFR, AWDR…) — https://www.cbsl.gov.lk/economic-and-statistical-charts/monetary-and-interest-rate-statistics |

---

## 3. Treasury bill / bond yields

### Secondary market weekly — eResearch **6169** (**Ship** — preferred for strip)

| | |
|--|--|
| **URL** | `https://www.cbsl.lk/eResearch/MoneyMarketRatesDefault.aspx?ReportId=6169` |
| **Title** | Rates on Government Securities |
| **Tenors** | T-bill **91 / 182 / 364**; T-bond **2y–30y** |
| **Probe tip** | End-week **2026-07-09**: 91d **10.21** · 182d **10.30** · 364d **10.21** |
| **vs Lankawa seed** | Seed `asOf` 2026-07-10 with ~8.4–8.9% — **stale relative to market**; replace with 6169 |

Same ASP.NET Show pattern as §2. Export button is HTML, not Excel.

### Primary auction Excel (**Ship** as history / WAYR source)

| Series | Tip URL (probe; **dated**) |
|--------|----------------------------|
| Treasury Bill Auctions — Weekly (1996–) | `…/Treasury_Bill_Auctions_20251224_e.xlsx` |
| Treasury Bond Auctions (1997–) | `…/Treasury_Bond_Auctions_20251224_e.xlsx` |
| Listing | https://www.cbsl.gov.lk/en/statistics/statistical-tables/fiscal-sector |

T-bill sheet: issue date + offered/received/accepted + **weighted average yield** columns for 91/182/364. Tip file on probe stopped around **late Nov 2025** — listing refresh lags; bad sole live source for a morning strip.

### Daily secondary quotes — moved off CBSL (**Park**)

https://www.cbsl.gov.lk/en/pd-daily-report redirects readers to  
https://www.treasury.gov.lk/web/report-daily-report (PDMO). File links are UUID `treasury.gov.lk/api/file/…` — fragile; out of CBSL scope unless a separate MoF deep dive.

### DEI PDF (**Park** as parser; OK as canary)

`daily_economic_indicators_YYYYMMDD_e.pdf` under `/sites/default/files/` — includes primary/secondary T-bill yields, OPR, weekly AWPR, USD TT. Layout is chart-heavy; eResearch + Excel are cleaner.

---

## 4. Interest rates of commercial banks

Two different products:

| Product | Where | Lankawa |
|---------|-------|---------|
| **CBSL weighted averages** (AW*) | eResearch 6277 + `table4.04` | **Ship** (economy macro strip) |
| **Advertised FD / savings / loan ranges** | Same Excel (wide min–max bands) | **Park** — not actionable quotes |
| **Per-bank boards** | Bank sites / JSON (ComBank FD API, etc.) | Outside this CBSL doc — see bank deep dives |

There is **no** dedicated “current market interest rates” HTML page under `/en/rates-and-indicators/interest-rates` (404). Hub points to eResearch + statistical tables.

---

## 5. Exchange rates — inventory beyond what we use

| Surface | Endpoint / file | Notes |
|---------|-----------------|-------|
| Daily buy & sell (TT) | `exratestt.php` → `exrates_resultstt.php` | **Wired** (USD) |
| Daily indicative (all ccy) | `exrates.php` → `exrates_results.php` | Mid/indicative; includes XAU |
| Daily gold | `exratesgold.php` | **Wired** |
| USD/GBP/EUR/JPY/CNH/AUD charts | `cbsl_custom/charts/{ccy}/indexsmall.php` | Chart widgets only |
| Buying & selling Excel | `IF_Buying_Selling_Exchange_Rates.xlsx` (~0.9 MB, 2005–2026) | Monthly archive of bank TT |
| Monthly average / EOM / REER | `IF_Monthly_Average_…`, `IF_End_of_the_Month_…`, `IF_REER.xlsx` | Macro research |
| CSV export | Session + `btnCSV` | Prefer for ingest robustness |

---

## 6. Payments bulletin

**Already shipped** — see [`CBSL_PAYMENTS_BULLETIN.md`](./CBSL_PAYMENTS_BULLETIN.md).  
Index: https://www.cbsl.gov.lk/en/publications/other-publications/statistical-publications/payments-bulletin  
No HTML/JSON table; quarterly English PDF → curated seed.

---

## 7. Gold

**Already shipped** live troy-oz scrape. No separate gold JSON API. CSV export available with same session pattern as FX (`Exchange Rate` column, not buy/sell).

---

## 8. Endpoint catalogue (JSON / API / CSV / Excel)

### Quasi-API / scrape targets

| Kind | URL | Auth | Notes |
|------|-----|------|-------|
| HTML POST | `…/exratestt/exrates_resultstt.php` | None | FX buy/sell table |
| HTML POST | `…/exrates/exrates_results.php` | None | Indicative + gold |
| CSV POST | same results URLs + `btnCSV=csv` | Cookie session after Submit | `text/csv` attachment |
| HTML GET | `…/cbsl_custom/param/plrates.php` | None | OPR + SRR |
| ASP.NET HTML | `https://www.cbsl.lk/eResearch/MoneyMarketRatesDefault.aspx?ReportId={id}` | None | Date-filter grids |
| — | Public REST `/api/rates` | — | **Does not exist** |

### eResearch ReportId map (from rates hub)

| ReportId | Series | Ship? |
|----------|--------|-------|
| **1059** | Daily OMO operations (incl. SDF/SLF volumes & rates) | Park |
| **1062** | Outright sales/purchases of gov securities | Park |
| **1064** | OMO term repo / reverse repo | Park |
| **5206** | Money market summary (call + repo WA yields) | Park |
| **8231** | SLIBOR | Park (empty tip) |
| **6169** | Gov securities yields (T-bill + T-bond) | **Ship** |
| **6277** | Commercial bank AWLR / AWPR / AWDR / AWFDR / AWSR | **Ship** |

Entry: https://www.cbsl.gov.lk/en/statistics/data/economic-data-library → `https://www.cbsl.lk/eresearch`.

### Excel / PDF downloads (rates-relevant)

| File / pattern | Series |
|----------------|--------|
| `historical_policy_interest_rates.xlsx` | OPR, SRR, SDF/SLF history |
| `table4.03_*.xlsx` / `table4.04_*.xlsx` | Interest rates annual / monthly (full AW* + ranges) |
| `Treasury_Bill_Auctions_*.xlsx` / `Treasury_Bond_Auctions_*.xlsx` | Primary auction WAYR |
| `IF_Buying_Selling_Exchange_Rates.xlsx` (+ monthly / EOM / REER) | FX archives |
| `monthly_bulletin_monetary_and_interest_rate_statistics_*.pdf` | Monthly interest dashboard |
| `daily_economic_indicators_*.pdf` / `WEI_*.pdf` | Daily / weekly packs |
| `Payments_Bulletin_{n}Q{YYYY}_e.pdf` | Payments (shipped seed) |

Filenames with embedded dates **rotate** — resolve from listing pages.

---

## Recommended Lankawa wiring

### Already-have — keep

1. FX HTML scrape (+ optional CSV session path).  
2. Gold HTML scrape.  
3. Payments bulletin seed + honesty strip.  
4. Macro seed for inflation / GDP / reserves until a dedicated DEI/press adapter exists.

### Ship next (economy rates strip)

| Priority | Work | Upstream |
|----------|------|----------|
| **P0** | Live **OPR (+ SRR)** card; show SDFR/SLFR as corridor from policy Excel tip | `plrates.php` + `historical_policy_interest_rates.xlsx` |
| **P0** | Replace treasury seed with **secondary T-bill 91/182/364** (+ optional WAYR label) | eResearch **6169** |
| **P1** | **Weekly AWPR** on `/economy` | eResearch **6277** (cross-check WEI) |
| **P1** | Monthly **AWDR / AWFDR / AWLR** trio | `table4.04` tip Excel or 6277 monthly cells |
| **P2** | FX/gold CSV path in `cbsl.ts` for stabler parsing | Session CSV |

Honesty: eResearch is a public data library UI, not a SLA’d API — cache, timeout, seed fallback (same pattern as FX).

### Park

- SLIBOR, OMO detail reports, call/repo market.  
- Advertised commercial-bank rate **ranges** from CBSL tables.  
- PDMO/treasury.gov.lk daily report UUID files.  
- Multi-currency CBSL FX / REER unless product needs them.  
- PDF-first parsers for DEI/WEI/monthly bulletin when Excel/eResearch exist.  
- Waiting for a JSON API that is not there.

---

## Probe appendix (2026-07-20)

| Check | Result |
|-------|--------|
| FX HTML POST | 200; USD rows through 2026-07-20 |
| FX CSV after Submit | 200 `text/csv`; buy/sell rows |
| Gold form currencies | XAU only on gold page |
| `plrates.php` | OPR 8.75 · SRR 2.00 (500 intermittent) |
| Policy xlsx | OPR/SDFR/SLFR tip 26.05.2026 = 8.75 / 8.25 / 9.25 |
| eResearch 6277 | AWPR 10.38 week ending 2026-07-17 |
| eResearch 6169 | T-bill tip week 2026-07-09 ≈ 10.21 / 10.30 / 10.21 |
| `table4.04_20260717.xlsx` | Monthly tip through **May 2026** |
| T-bill auction xlsx tip | Filename `20251224`; data ~Nov 2025 |
| gov.lk `/eResearch/` | 404 — use **cbsl.lk** |
| Payments / gold / FX adapters | Already in repo |

---

## Sources (hub URLs)

- Rates & indicators: https://www.cbsl.gov.lk/en/rates-and-indicators  
- Policy rates: https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates  
- Exchange rates: https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates  
- Monetary statistical tables: https://www.cbsl.gov.lk/en/statistics/statistical-tables/monetary-sector  
- Fiscal statistical tables: https://www.cbsl.gov.lk/en/statistics/statistical-tables/fiscal-sector  
- Economic Data Library: https://www.cbsl.gov.lk/en/statistics/data/economic-data-library  
- eResearch: https://www.cbsl.lk/eResearch/  
- Daily / weekly indicators: https://www.cbsl.gov.lk/en/statistics/economic-indicators/daily-indicators · `/weekly-indicators`
