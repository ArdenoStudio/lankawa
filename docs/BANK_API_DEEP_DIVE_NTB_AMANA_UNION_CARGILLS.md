# Nations Trust · Amana · Union · Cargills — public API / rates deep dive (Lankawa)

**Status:** Live probe (high thoroughness), 2026-07-20  
**Hosts:** `https://www.nationstrust.com` · `https://www.amanabank.lk` · `https://www.unionb.com` · `https://www.cargillsbank.com`  
**UA used:** Chrome 126 desktop (Union HTML via Jina reader proxy — Imperva Incapsula blocks bare curl)  
**Sister docs:** [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md), [`BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`](./BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md), [`NTB_SC_HSBC_OFFERS_RESEARCH.md`](./NTB_SC_HSBC_OFFERS_RESEARCH.md), [`AMANA_PABC_SDB_OFFERS_RESEARCH.md`](./AMANA_PABC_SDB_OFFERS_RESEARCH.md)

Rates below are **indicative public quotes** from probe day — not advice; banks may change without notice. Amana publishes **profit rates** (Mudharaba), not contractual interest.

---

## Verdict (cross-bank)

| Bank | Best machine feed | FD / term / savings | Loans / financing | FX | Lankawa fit |
|------|-------------------|---------------------|-------------------|-----|-------------|
| **Nations Trust** | **HTML tables** (no deposit JSON) | Dedicated SSR pages + image PDF | Product HTML + image PDF; calculator is client-side | **HTML** TT table | **Ship** HTML scrape for FD/savings; park loan PDF OCR |
| **Amana** | **HTML** profit-paid + PSR tables; calculator embeds **JSON-in-`<option>`** | Term + savings profit rates (monthly refresh) | **PDF** advance pricing (Nov 2025) | Treasury HTML (separate) | **Ship** HTML profit board (label as Islamic profit); park financing PDF |
| **Union Bank** | **HTML** under `/interest-rates/*` | FD / savings / FCY / pawning tables | Loans HTML board | HTML exchange page | **Ship** HTML scrape **if** Incapsula solvable; else seed + manual refresh |
| **Cargills Bank** | **HTML** deposit board + **PDF** lending; `pyxle-api` JSON exists but `rate_type` enum not public | Full LKR/FCY FD + savings HTML | Lending PDF w.e.f. 15.06.2026 | `pyxle-api/v1/exchange-rates` (slow/timeout in probe) | **Ship** deposit HTML scrape; lending PDF watch; finish JSON enum later |

**Bottom line:** None of the four match ComBank/Sampath’s clean deposit JSON. Best ROI: **NTB + Cargills SSR deposit HTML**, **Amana profit-paid HTML** (with Islamic disclaimer), **Union HTML** behind WAF. Cargills’ `GET /wp-json/pyxle-api/v1/interest-rates?rate_type=…` is the only true rates JSON among these four — **parameter values unknown** from public probes (common guesses → `Invalid interest rate type`).

---

## Discovery method

1. Sitemap / homepage harvest for `*rate*`, `*deposit*`, `*saving*`, `*loan*`, `*profit*`.  
2. Candidate `/api/*`, `/wp-json/*`, calculator JS probes.  
3. Live HTML table parse (NTB, Amana, Cargills); Jina reader for Union (Incapsula).  
4. PDF metadata / text extract where text layer exists (Amana advance pricing; Cargills lending via reader; NTB Interest-Rates.pdf is **image-only**).

---

# 1. Nations Trust Bank (`nationstrust.com`)

**Stack:** Laravel (CSRF / `ntb_session`), nginx + CloudFront + AWS ALB.  
**Sitemap:** `https://www.nationstrust.com/sitemap.xml` (~253 locs) — excellent discovery.  
**robots.txt:** empty `Disallow` (OK to fetch politely).  
**Note:** `/assets/js/rates.js` is a **star-rating feedback modal** (`POST /rate-me`) — **not** interest rates.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `/deposit-interest-rates` | SSR **HTML table** (LKR/USD/AUD/EUR/GBP × maturity/monthly/annually) | Yes | **Ship** |
| `/savings-rates` | SSR **HTML** tiered products | Yes | **Ship** |
| `/flexi-deposit-rates` | SSR **HTML** day-band rates | Yes | **Ship** |
| `/fcy-savings-call-rates` | SSR **HTML** FCY savings + call | Yes | **Ship** if FC board needed |
| `/exchange-rates` | SSR **HTML** notes/DD/TT | Yes — USD TT buy/sell **330.67 / 341.83** | Optional FX (remittance peers already cover majors) |
| `assets…/Interest-Rates.pdf` | **Image PDF** (5 pages) | Meta: *Updated as of 05.06.2026* | **Park** OCR; prefer HTML |
| `/api/*` rate paths | **404** | — | Skip |
| Loan product pages | Marketing HTML + KFDs | Indicative % in copy; not a rate board | **Park** |

---

## 1.1 Deposit interest rates (primary)

### `GET https://www.nationstrust.com/deposit-interest-rates`

| | |
|--|--|
| **Format** | HTML `<table>` (one wide board) |
| **Currencies** | LKR, USD, AUD, EUR, GBP |
| **Payout modes** | Maturity / Monthly / Annually (columns by tenor) |
| **Tenors** | 1, 3, 6, 12, 24, 36, 48, 60 months |
| **JSON-LD** | `Fixed Deposit Rates - Nations Trust Bank` (no numeric Dataset) |
| **Related PDF** | `https://assets.nationstrust.com/2521/Interest-Rates.pdf` (scanned; ModDate 2026-07-13) |

**Live LKR sample (2026-07-20 HTML):**

| Tenor | Maturity % (AER) | Monthly % (AER) | Annually % (AER) |
|------:|------------------|-----------------|------------------|
| 1m | 8.00 (8.30) | — | — |
| 3m | 9.00 (9.31) | — | — |
| 6m | 9.75 (9.99) | 9.55 (9.98) | — |
| 12m | 10.00 (10.00) | 9.55 (9.98) | — |
| 24m | 11.00 (10.45) | 10.00 (10.47) | 10.45 (10.45) |
| 36m | 11.00 (9.96) | 9.55 (9.98) | 10.00 (10.00) |
| 48m | 11.00 (9.54) | 9.15 (9.54) | 9.55 (9.55) |
| 60m | 11.25 (9.34) | 8.95 (9.33) | 9.35 (9.35) |

USD 12m maturity **4.50%** (AER 4.50); EUR 12m **3.00%**; GBP 12m **3.50%**; AUD 12m **4.00%**.

**Hub also links:** `/rates-tariffs` (nav to all rate pages), `/repo-rates`, `/treasury-bills-bond-rates`, `/calculator` (Loan / FD / T-bill UI — rates not a separate JSON feed).

**Lankawa:** **Ship** HTML parse → canonical FD strip (maturity + AER). Keep Personal/Private/Corporate/Business chrome as segment filters if tabs diverge later (probe showed one populated board).

---

## 1.2 Savings rates

### `GET https://www.nationstrust.com/savings-rates`

**Live sample (tiered):**

| Product | Sample rate % p.a. | AER |
|---------|-------------------:|----:|
| Call Deposit LKR | 3.00 | 3.04 |
| Nations Saver (≥5,000) | 2.00 | 2.02 |
| Nations Max Bonus (≥2,000) | 2.50 | 2.53 |
| Nations Mega Saver | 3.00–4.75 by balance | 3.04–4.85 |
| Nations Kidz (≥500) | 5.00 | 5.12 |
| Nations Prabuddha | 3.50–4.00 | 3.56–4.07 |
| Kidz Investment Plan | 8.50 | 8.84 |
| Personal Investment Plan | 8.00 | 8.30 |
| Money Market Savings (≥1,000,000) | 7.25 | 7.50 |
| Corporate Money Market | up to 7.25 | 7.50 |

### `GET https://www.nationstrust.com/flexi-deposit-rates`

| Days | Interest | Maps to | AER |
|------|----------|---------|----:|
| 30–89 | 8.00% | 1m | 8.30 |
| 90–179 | 9.00% | 3m | 9.31 |
| 180–363 | 9.75% | 6m | 9.99 |
| 364–365 | 10.00% | 12m | 10.00 |

**Lankawa:** **Ship** savings + flexi with product slug; money-market top slab is household-relevant.

---

## 1.3 Loans

| URL | Finding |
|-----|---------|
| `/personal-banking/nations-personal-loan` | Marketing; KFD PDFs; calculator asks user for rate — **no published board** |
| `/personal-banking/nations-home-loan` | Same pattern; LTV up to ~70% of property |
| Interest-Rates.pdf | Includes lending pages as **images** (title “Updated as of 05.06.2026”) |

**Lankawa:** **Park** until OCR or a future HTML lending board. Do not invent rates from calculator defaults.

---

## 1.4 NTB — Lankawa recommendation

| Priority | Action |
|----------|--------|
| **P0** | Cron scrape `/deposit-interest-rates` + `/savings-rates` |
| **P1** | `/flexi-deposit-rates`, `/fcy-savings-call-rates` |
| **P2** | Watch PDF asset id / ModDate as change canary |
| **Skip** | `rates.js` / `/rate-me`; reverse-engineering Nations Direct |

---

# 2. Amana Bank (`amanabank.lk`)

**Stack:** Classic PHP/HTML site (trilingual en/si/ta). Islamic bank → **profit sharing**, not fixed interest.  
**Sitemap:** large (~1.9k locs).  
**Canonical rates hub:** `/profit-sharing-ratios/` → PSR + “Past Profits Paid”.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `/profit-sharing-ratios/local-currency-accounts-paid.html` | **HTML tables** (June 2026 profits) | Yes | **Ship** (label profit / not interest) |
| `/profit-sharing-ratios/local-currency-accounts.html` | HTML PSR customer/bank % | Yes | Ship as methodology footnote |
| FCY paid / PSR pages | HTML | Yes | P1 |
| `/js/profit-calculator.js` + `<option value='{JSON}'>` | **Embedded rates JSON** in HTML | Yes — mirrors last-month profits | **Ship** secondary (same numbers as paid page) |
| `/pdf/tariff/advance-pricing---november-2025-eng.pdf` | Text PDF | Financing ranges Nov 2025 | **Ship** seed / quarterly refresh |
| `/tariff-services.html` | Fee PDFs | Yes | Park fees |
| REST / `wp-json` rates | **None** | — | — |

---

## 2.1 Past profit rates paid (primary)

### `GET https://www.amanabank.lk/profit-sharing-ratios/local-currency-accounts-paid.html`

**Period stamped:** **June 2026** (two TI cohorts: placed during June via App/Branch vs prior to June).

**Term investments placed during June 2026 (via App & Branch):**

| Product | Profit % p.a. | AER |
|---------|--------------:|----:|
| 3m TI (maturity) | 7.50 | 7.71 |
| 6m TI (maturity) | 9.00 | 9.20 |
| 1y TI (monthly) | 9.00 | 9.38 |
| 1y TI (maturity) | 9.50 | 9.50 |
| 24m TI monthly (App only) | 9.25 | 9.66 |
| 24m TI maturity (App only) | 9.75 | 9.32 |

**Prior-to-June 2026 placements** pay lower 6m/1y rates (e.g. 6m 8.00%, 1y maturity 8.25%).

**Savings (June 2026):**

| Product | Profit % p.a. | AER |
|---------|--------------:|----:|
| Savings Account | 3.17 | 3.21 |
| Children’s Savings | 6.34 | 6.52 |
| Teen Savings | 3.17 | 3.21 |
| Ladies Savings | 3.70 | 3.76 |
| Senior Citizen Savings | 4.22 | 4.31 |
| Amana Kid My Future TI | 7.49 | 7.75 |
| Flexi Term Investment | 7.25 | 7.49 |

**FCY paid** (`foreign-currency-accounts-paid.html`): e.g. USD savings 2.11%; USD 12m maturity TI 4.25%; EUR/AUD/GBP/JPY/SGD savings listed.

### Profit Sharing Ratios (not rates)

Example LKR PSR (customer / bank): Savings 30/70; Children’s 60/40; 1y maturity TI 65/35; 2y maturity 70/30.

### Calculator embed (machine-friendly)

On `/personal/investment/term-investment.html` (and `/profit-calculator.html`), `<option>` values carry JSON, e.g.:

```json
{"Monthly":"9.00","Maturity":"9.50","mcount":"12","MindepoMon":"25000","MindepoMat":"25000"}
```

`profit-calculator.js` `JSON.parse`s that string — **same source of truth as last month’s published profits**, not a separate API.

---

## 2.2 Financing (loans analogue)

### `https://www.amanabank.lk/pdf/tariff/advance-pricing---november-2025-eng.pdf`

| Product | Pricing range (p.a.) |
|---------|----------------------|
| Vehicle Financing | 13.00% – 18.00% |
| Home Financing | 13.00% |
| 3W / bikes / machinery | 20.00% – 21.50% |
| Small asset / EPP | 15.50% – 17.50% |
| Education / Travel / Solar / Women entrepreneur | ~14.50% – 16.50% |
| Investment Financing | 15.00% |
| Gold Certificate Financing | 11.50% |

Final pricing depends on credit risk, asset, security, tenure, amount. KFDs under `/key-fact-documents.html` (home/vehicle/solar/etc.) — product terms, not a live rate API.

**Lankawa:** Optional “indicative financing ranges” card with **as-of Nov 2025** + PDF URL; never call them “interest rates” without Islamic framing.

---

## 2.3 Amana — Lankawa recommendation

| Priority | Action |
|----------|--------|
| **P0** | Scrape local-currency **profits paid** monthly; store `asOfMonth`, product, rate, AER, cohort |
| **P1** | PSR table + FCY paid; calculator option JSON as checksum |
| **P2** | Advance-pricing PDF hash watch |
| **Honesty** | UI copy: “indicative profit rates (Mudharaba), not guaranteed interest” |

---

# 3. Union Bank of Colombo (`unionb.com`)

**Stack:** WordPress + Yoast sitemaps + **Imperva Incapsula** (bare GET → 212-byte challenge HTML).  
**Sitemap index:** works without JS (`page-sitemap.xml` lists all rate URLs).  
**robots.txt:** `Crawl-delay: 10`; disallows `/wp-admin/`, `/wp-content/`.  
**wp-json:** also Incapsula-blocked from this environment.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `/interest-rates/fixed-deposits/` | **HTML table** | Yes — last updated **26/06/2026** | **Ship** if fetch path works |
| `/interest-rates/savings-accounts/` | HTML | Updated **01/07/2026** | **Ship** |
| `/interest-rates/loans/` | HTML | Updated **04/06/2026** | **Ship** |
| `/interest-rates/foreign-currency-fixed-deposits/` | HTML | Updated **31/12/2025** (stale vs LKR) | P1 |
| `/interest-rates/pawning-advances/` | HTML | Updated **09/07/2026** | P1 gold-loan strip |
| `/interest-rates/credit-cards/` | HTML | Updated **02/06/2026** | Park (card APR) |
| Public JSON rates API | **None found** | — | — |
| Comment feed on FD page | Empty RSS | — | Skip |

**Fetch note:** Direct datacenter curl gets Incapsula. Probe used `https://r.jina.ai/http://www.unionb.com/…` successfully. Production adapter needs browser cookies, residential egress, or accept **manual/seed** updates.

---

## 3.1 Fixed deposits (LKR)

### `https://www.unionb.com/interest-rates/fixed-deposits/`

| Months | Maturity % | AER % | Monthly % | AER % |
|-------:|-----------:|------:|----------:|------:|
| 01 | 8.00 | 8.30 | — | — |
| 03 | 8.25 | 8.51 | 7.75 | 8.03 |
| 06 | 8.50 | 8.68 | 8.00 | 8.30 |
| 12 | 9.00 | 9.00 | 8.50 | 8.84 |
| 24 | 11.50 | 10.91 | 9.25 | 9.65 |
| 36 | 11.75 | 10.57 | 9.50 | 9.92 |
| 48 | 12.00 | 10.30 | 9.75 | 10.20 |
| 60 | 13.50 | 10.87 | 10.25 | 10.75 |
| 12 Senior | 9.50 | 9.50 | 9.00 | 9.38 |

Min deposit LKR 10,000; premature penal **1.00%**. Last updated **26/06/2026**.

---

## 3.2 Savings

### `https://www.unionb.com/interest-rates/savings-accounts/`

| Product | Sample slabs % p.a. | Min deposit |
|---------|---------------------|-------------|
| Ultra Saver (digital) | 3.00 → 4.25 by balance | 15,000 |
| Regular Saver | 2.00 (≥5,000) | 5,000 |
| Kidz Saver | 4.50 / 5.25 | 1,000 |
| Salary Power | 3.00 / 3.75 | salary assignment |
| Money Market | 3.75 → **8.00** (≥10m) | 200,000 |

Interest calculated daily, credited month-end. Last updated **01/07/2026**. (Page also shows a second Ultra Saver slab set — parse carefully / take the labeled digital vs branch variant.)

---

## 3.3 Loans & pawning

**Loans** (`/interest-rates/loans/`, updated 04/06/2026):

| Product | Sample % p.a. |
|---------|----------------|
| Loan Against Property | 2y 14.50 / 3y 15.25 / 5y 16.50 fixed |
| Home Loan | 2y 13.50 / 3y 13.75 / 5y 14.50 fixed |
| Personal (salary assignment) | Variable 16.75 / Fixed 19.00 |
| Educational | Variable 13.75; fixed 14.25–15.25 |
| Leasing / Vehicle | Min 13.00 / Max 16.50 |
| Pension (govt / Ranaviru) | Fixed ~12.75–13.75 by tenor |

**Pawning** (`/interest-rates/pawning-advances/`, updated 09/07/2026): e.g. Gold Loan 1m **240,000** @ 18%; 3–6m @ 14%; Pawning Advance 12m **230,000** @ 13%.

**FCY FD** (updated 31/12/2025): USD 12m maturity **4.75%**; EUR/GBP/AUD/JPY/SGD matrix — treat as possibly stale vs LKR board.

Penal-interest PDF (overdue facilities):  
`https://www.unionb.com/wp-content/uploads/2026/03/Penal-Interest-Charged-by-Union-Bank-on-Overdue-Credit-Facilities-2.pdf`

---

## 3.4 Union — Lankawa recommendation

| Priority | Action |
|----------|--------|
| **P0** | Solve Incapsula (or scheduled human/browser fetch) → scrape FD + savings HTML |
| **P1** | Loans + pawning tables; track per-page “Last updated” |
| **P2** | FCY boards; credit-card interest page |
| **Skip** | Expecting `wp-json` without cookies; comment RSS |

---

# 4. Cargills Bank (`cargillsbank.com`)

**Stack:** WordPress + custom **Pyxle** REST (`pyxle-api/v1`), theme `cargills`, Solid Security locking most `wp/v2/*` to 401.  
**Sitemap:** AIOSEO index → `page-sitemap.xml` / `products-sitemap.xml`.  
**Deposit page `dateModified` (JSON-LD):** **2026-06-25**.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `/deposit-interest-rates` | **SSR HTML** (6 tables) | Yes | **Ship** |
| `/rates-and-charges/lending-rates/` | **PDF embed** | Yes — w.e.f. **15.06.2026** | **Ship** PDF watch + selective parse |
| `GET /wp-json/pyxle-api/v1/interest-rates?rate_type=` | **JSON API** (required `rate_type`) | Enum **not discovered** (invalid for common strings) | **Park** until enum found in theme/plugin |
| `GET /wp-json/pyxle-api/v1/exchange-rates` | JSON (no required args) | Timed out in probe | Retry / park |
| `GET /wp-json/pyxle-api/v1/promotions` | JSON | `[]` empty | Canary |
| `wp/v2/pages` | Locked **401** Solid Security | — | Skip |

---

## 4.1 Deposit interest rates HTML (primary)

### `GET https://www.cargillsbank.com/deposit-interest-rates`

**Special Fixed Deposits (sample):**

| Period | Maturity % | AER | Monthly % |
|--------|----------:|----:|----------:|
| 60 Days | 7.00 | 7.21 | — |
| 100 Days | 9.00 | 9.30 | — |
| 200 Days | 9.50 | 9.70 | — |
| 13 Months | 11.00 | 10.95 | 10.40 |
| 500 Days | 10.50 | 10.31 | 9.85 |
| 1000 Days | 12.00 | 10.93 | 10.40 |

**Standard LKR FD:**

| Tenor | Maturity % | Monthly % | Annually % |
|------:|----------:|----------:|-----------:|
| 1m | 8.75 | — | — |
| 3m | 9.50 | — | — |
| 4m | 10.50 | — | — |
| 6m | 9.75 | 9.55 | — |
| 1y | 10.00 | 9.55 | 10.00 |
| 2y | 11.00 | 9.95 | 10.45 |
| 3y | 11.60 | 10.00 | 10.47 |
| 5y | 13.50 | 10.35 | 10.87 |
| 26m special | 13.00 | 11.60 | — |

**Savings account types:** Cash 3.00%; Senior 5.00%; Abhimani 3.00%; Children’s up to 7.50%; Salary up to 5.00%; High return saver up to 6.00%.

**Senior citizen FD** table mirrors standard tenors (same headline %). **Call:** 7 days **4.00%**. **FCY:** USD savings 1.75%; USD FD 1–12m 4.00–5.00% maturity.

Also: `/si/deposit-interest-rates/`, `/ta/deposit-interest-rates/`.

---

## 4.2 Lending rates PDF

### Page: `https://www.cargillsbank.com/rates-and-charges/lending-rates/`  
### File: `https://www.cargillsbank.com/wp-content/uploads/2026/06/4.2-LENDING-RATES-Table-11-Jun-2026_-CAD-WEB.pdf`

| | |
|--|--|
| **Title (reader)** | Lending rates table 11 Jun 2026 |
| **Effective** | **New loans w.e.f. 15.06.2026** |
| **Style** | AWPLR + spread and/or Base Rate + spread by customer segment |

Examples (indicative from PDF text extract): personal loans for large-corporate salary assignees **AWPLR+3.50%** to **+5.00%** by salary band; housing base rates ~**12.25%–14.75%**; loan against property ~**16.25%**; Wishrama pension fixed ~**12.50%–16.00%** by tenure/LTV; vehicle loans Base Rate + 0.50%–1.25% grids.

**Lankawa:** Prefer **filename / upload date canary** + store PDF URL; full grid parse is brittle (multi-axis tables). Optional household chips: personal / housing / vehicle / pension headline only.

---

## 4.3 Pyxle JSON API (partial)

### Namespace `https://www.cargillsbank.com/wp-json/pyxle-api/v1`

| Route | Method | Notes |
|-------|--------|-------|
| `/interest-rates` | GET | **Required** `rate_type` (string); optional `rel_rate_type`, `group_by` |
| `/exchange-rates` | GET | Optional `since`; slow/timeout observed |
| `/promotions` | GET | `limit` / `offset` → `[]` on probe |
| `/news-ticker` | GET | Optional `since` |
| `/page-lets` | POST | Auth/nonce for CMS fragments — not a rates dump |

**Probe result:** omitting `rate_type` → `400 rest_missing_callback_param`. Values tried (`deposit`, `fd`, `savings`, `lending`, `LoanRates`, …) → `400 Invalid interest rate type`. Deposit page HTML is **server-rendered tables**, not hydrated from this endpoint in the visible markup — enum may live only in unpublished CMS/admin or obfuscated plugin PHP.

**Lankawa:** Document as **P1 research follow-up** (theme/plugin string hunt or browser DevTools on an authenticated CMS preview). Do **not** block deposit HTML scrape on this.

---

## 4.4 Cargills — Lankawa recommendation

| Priority | Action |
|----------|--------|
| **P0** | HTML scrape `/deposit-interest-rates` (special + standard + savings + FCY) |
| **P1** | Watch lending PDF URL / `Last-Modified`; optional headline loan chips |
| **P2** | Crack `rate_type` enum → prefer JSON if it mirrors HTML |
| **Skip** | Locked `wp/v2`; empty promotions list as “live offers” |

---

## Cross-bank comparison (probe day, LKR 12-month FD maturity)

| Bank | 12m maturity % | Notes |
|------|---------------:|-------|
| Nations Trust | **10.00** | AER 10.00; monthly 9.55 |
| Amana (1y TI maturity, June cohort) | **9.50** | Profit rate, not interest |
| Union Bank | **9.00** | Senior 12m 9.50; updated 26/06/2026 |
| Cargills Bank | **10.00** | Special 13m 11.00; 5y 13.50 |

*(Indicative only — payout mode, senior status, and special tenors dominate household choice.)*

---

## Adapter sketch (if shipped)

```ts
type BankRateRow = {
  bank: "ntb" | "amana" | "union" | "cargills";
  product: string;
  kind: "fd" | "savings" | "flexi" | "profit_ti" | "loan" | "pawning";
  currency: "LKR" | string;
  tenorLabel: string;       // "12m" | "100d" | "savings"
  ratePa: number;
  aer?: number;
  payout?: "maturity" | "monthly" | "annually";
  asOf: string;             // ISO date or "2026-06" for Amana month
  sourceUrl: string;
  disclaimer?: "islamic_profit" | "indicative";
};
```

**Fetch order suggestion:** NTB HTML → Cargills HTML → Amana paid HTML → Union (only if WAF path green) → never claim live on Incapsula/empty/PDF OCR failure.

---

## Related Lankawa surfaces

| Existing | Overlap |
|----------|---------|
| NTB card offers (`card-offers.ts`, `NTB_SC_HSBC_OFFERS_RESEARCH.md`) | Promotions ≠ deposit rates |
| Amana debit Glomark Wed | Offers only |
| Union / Cargills card offer notes in `CONSUMER_OFFERS_AND_DATA_SURVEY.md` | WAF / EDM galleries — same Incapsula lesson for Union |
| `fdrateslk.com` (`CARD_OFFER_AGGREGATORS_RESEARCH.md`) | Optional gap-finder; verify on bank |
| CBSL AWPLR (`CBSL_RATES_API_DEEP_DIVE.md`) | Needed to interpret Cargills “AWPLR + x%” lending |

---

## Open questions

1. **Cargills `rate_type` enum** — find valid strings (plugin PHP, authenticated preview, or HAR from staff browser).  
2. **NTB Interest-Rates.pdf** — whether a text/HTML lending board will replace image PDF.  
3. **Union Incapsula** — stable server-side cookie jar vs drop Union from automated cadence.  
4. **Amana profit month lag** — confirm publish calendar (page showed June 2026 on 20 Jul probe).  

Researched 2026-07-20 against public bank sites only; no authenticated mobile/API reverse-engineering.
