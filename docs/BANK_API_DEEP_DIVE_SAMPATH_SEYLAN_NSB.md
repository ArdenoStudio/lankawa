# Sampath · Seylan · NSB — public API / rates deep dive (Lankawa)

**Status:** Live probe (high thoroughness), 2026-07-20  
**Hosts:** `https://www.sampath.lk` · `https://www.seylan.lk` · `https://www.nsb.lk`  
**UA used:** `LankawaBot/1.0 (+https://lankawa.lk)` (also Chrome-class where noted)  
**Sister docs:** [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md), remittance wiring in `src/lib/integrations/remittance-banks.ts`, card offers in `src/lib/integrations/card-offers.ts`

Rates below are **indicative public quotes** scraped/fetched on probe day — not advice; banks may change without notice.

---

## Verdict (cross-bank)

| Bank | Best machine feed | FD / savings | Loans | FX | Lankawa fit |
|------|-------------------|--------------|-------|-----|-------------|
| **Sampath** | JSON `/api/rates-and-charges/external` + `/foreignRates` + `/api/exchange-rates` | **JSON** (structured slabs) | No clean loan JSON (CMS page chrome only) | **JSON** TTBUY/TTSEL | **Ship** FD/savings JSON + keep FX; card-promotions already wired |
| **Seylan** | JSON `/get-fd-data` + `/api/exchange-rates-get-value/{CCY}` | FD calculator JSON; full savings/loan board is **HTML** `/interest-rates` | HTML only | **JSON** per currency | **Ship** FD JSON + keep FX; scrape interest page for savings/loans |
| **NSB** | HTML only under `/rates-tarriffs/*` | HTML tables (good structure) | HTML lending tables | HTML TT table | **Ship** HTML scrape (FX already); no usable rate JSON (`wp-json` pages 500) |

**Bottom line:** Sampath is the richest JSON surface of the three (deposit + FX + promotions). Seylan has a small but clean FD calculator JSON plus per-CCY FX. NSB is WordPress HTML tables — scrapeable, no stable rates API.

---

## Discovery method

1. Homepage + rates/interest page harvest; NSB `robots.txt` → `sitemap.xml`.  
2. JS bundle mining: Sampath Nuxt `/_nuxt/*.js` (`$axios.$get("…")`); Seylan homepage + `modules/newcalculators/js/FDCalculator.js`.  
3. Candidate `/api/*` and calculator path probes (GET).  
4. Live JSON/HTML sample capture for FD, savings, loans, FX.

---

# 1. Sampath Bank (`sampath.lk`)

**Stack:** Nuxt SSR + Strapi-style CMS under `/api/*` (JSON UTF-8).  
**robots.txt / sitemap.xml:** empty / SPA HTML fallback (no useful sitemap).  
**Rates UI:** `/rates-and-charges` (HTML shell; data from JSON below).

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `GET /api/exchange-rates` | **JSON** (17 CCYs) | Yes — USD TT **331.75 / 340.75** | **Ship** (already remittance) |
| `GET /api/currency-rates` | **JSON** (29 rows, CURRT) | Yes | **Park** / secondary FX |
| `GET /api/rates-and-charges/external` | **JSON** LKR savings + term + T-bill/REPO | Yes — FD w.e.f. **2026-06-10** | **Ship** deposit rates |
| `GET /api/rates-and-charges/foreignRates` | **JSON** FCY savings + term | Yes | **Ship** if FC board needed |
| `GET /api/rates-and-charges` | **JSON** CMS page (stale tables + tabs) | Yes but **stale** vs `/external` | Prefer `/external` |
| `GET /api/card-promotions` | **JSON** | Yes (~827 KB full list) | **Ship** (already card-offers) |
| Loan rates JSON | **No** dedicated endpoint | — | **Park** / product HTML |
| AWPLR / AWPR API | **Not found** | — | **Park** |

---

## 1.1 Exchange rates JSON

### `GET https://www.sampath.lk/api/exchange-rates`

| | |
|--|--|
| **Method** | `GET` |
| **Content-Type** | `application/json; charset=utf-8` |
| **Size** | ~3.7 KB / **17** currencies |
| **Wrapper** | `{ success, description, data: [...] }` |

**USD sample (2026-07-20, `RateWEF` = Monday, July 20 2026, 08:27:22 AM):**

| Field | Value |
|-------|------:|
| `CurrCode` | `USD` |
| `CurrName` | U.S. Dollar |
| `TTBUY` | **331.75** |
| `TTSEL` | **340.75** |
| `ODBUY` | 329.9018 |
| `RateType` | `EXRT` |

**Other rows include** EUR, GBP, AUD, JPY, etc. with same field shape.

**Lankawa:** already `parseSampathUsdTt` → remittance board (`TTBUY`/`TTSEL`).

### `GET https://www.sampath.lk/api/currency-rates`

| | |
|--|--|
| **Rows** | **29** (`RateType`: `CURRT`) |
| **Fields** | `CurrCode`, `CurName`, `ByOVC`, `RateWEF`, … |
| **Note** | Encashment-style board; not the TT remittance feed |

---

## 1.2 Deposit / savings rates JSON (primary)

### `GET https://www.sampath.lk/api/rates-and-charges/external`

Structured **live core-banking** dump (not the stale CMS copy on `/api/rates-and-charges`).

**Shape:**

```json
{
  "local": {
    "savings_rate": [ /* productHead, withEfectFrom, rateCode, slabAmount[] */ ],
    "term_and_deposite": [ /* same slab schema */ ],
    "treasury_bills_and_repo_rates": [ /* headers + rows */ ]
  },
  "foreign": {}
}
```

**Slab fields (useful):** `Rate`, `RateMat` / `AerMat`, `RateMon` / `AerMon`, `NominalRate` / `EffectiveRate`, `Period` + `PeriodType` (`M`/`D`/`Y`), `BeginSlbAmount` / `EndSlbAmount` / `SlabPicture`, `InterestType`.

### Live LKR savings (sample, 2026-07-20)

| Product | Code | w.e.f. | Sample rate % p.a. |
|---------|------|--------|-------------------:|
| Ladies 1st | `LADSA` | 2020-11-20 | 2.50 |
| Double S (base) | `NORSV` | 2026-03-20 | 2.00 (+ bonus slabs) |
| Sanhinda Saver | `SANSV` | 2026-03-20 | 2.50–3.00 by balance |
| Money Market | `MMSAV` | **2026-07-20** | 2.00 / **7.25** / **7.50** by balance |
| Hit Saver | `HITSV` | 2026-03-20 | 2.00–5.00 by balance |
| Sapiri Children’s | `SAPI` | 2020-11-20 | 5.00 |
| Pubudu Children’s | `PUBU` | 2020-07-20 | 4.00 |
| X Set Teen | `XSET` | 2020-11-20 | 2.00 |

### Live LKR fixed deposits — Normal FD (`FDNOR`, w.e.f. 2026-06-10)

| Tenor | Maturity % | AER mat | Monthly % | AER mon |
|------:|----------:|--------:|----------:|--------:|
| 1M | 8.00 | 8.30 | — | — |
| 2M | 8.50 | 8.81 | — | — |
| 3M | 8.50 | 8.77 | — | — |
| 6M | 9.50 | 9.73 | — | — |
| 7M | 10.50 | 10.73 | — | — |
| 12M | 9.50 | 9.50 | 9.10 | 9.49 |
| 24M | 11.25 | 10.68 | 10.10 | 10.60 |
| 36M | 11.00 | 9.97 | 9.50 | 9.95 |
| 48M | 12.00 | 10.30 | 9.75 | 10.23 |
| 60M | 12.50 | 10.20 | 9.50 | 9.96 |

Also present: **Sampath Kalin Cash** (`FDKC`, prepaid-interest style `NominalRate`/`EffectiveRate`), **Certificate of Deposits** (`FDCD`), **Sanhinda senior FD** (`FDSAN`, w.e.f. 2026-07-01).

### Treasury bills (same endpoint)

`treasury_bills_and_repo_rates` — e.g. **Treasury Bill Rates** w.e.f. Friday, July 17 2026; sample 3/6/12M rates **9.3–9.5%** across amount headers `50000` / `100000` / `1000000`. REPO section present (headers null on probe).

**Lankawa:** **Ship** `/external` for LKR deposit strip; map `RateMat`/`RateMon` + tenor.

---

## 1.3 Foreign currency deposit rates JSON

### `GET https://www.sampath.lk/api/rates-and-charges/foreignRates`

```json
{ "data": [ { "SubCategory": "Savings"|"Term Deposits", "ProductHead": [ { "ProductName", "Comment", "IntRatesFC": [...] } ] } ] }
```

**FCY FD USD sample** (`RateType` `FCFD`, w.e.f. 2026-03-05): 1M **3.25%**, 3M **3.75%** (`FixedRate` field; min amount often 1000).

**FCY savings:** FC Prime / PFCA-BFCA slabs with `Rate` + optional `BonusIntRate` (bonus integers look like **basis-point style** — validate against UI before publishing).

---

## 1.4 CMS rates page (secondary)

### `GET https://www.sampath.lk/api/rates-and-charges`

~82 KB page document: `interest_rates_local`, `interest_rates_foreign`, `exchange_rates` (misnamed — includes loan/T-bill **CMS** tabs), `other_charge` (card/e-banking HTML fees).

**Do not prefer for live %** — many `sub_title` strings still say **2020**; live numbers are in `/external` + `/foreignRates`.

HTML shell: `https://www.sampath.lk/rates-and-charges`.

---

## 1.5 Other useful Sampath JSON

| Endpoint | Notes |
|----------|-------|
| `/api/card-promotions?category=…&page_number=&size=` | Offers JSON (wired) |
| `/api/offer-catergories` | 13 categories (`hotels`, `super_markets`, …) |
| `/api/products` | Huge CMS product catalog (~1.7 MB) |
| `/api/branches` | Branch locator JSON |
| `/api/bank-holidays` | HTML holiday tables by year |
| `/api/daily-market-reports` | PDF links (stock/market updates), not deposit rates |
| `/api/financial-calculator` | Calculator **page SEO/CMS**, not rate table |
| `/api/personal-treasuries` etc. | Marketing copy HTML |

Nuxt mines **~100+** `$axios.$get` CMS paths under `/api/*`; most are content chrome, not rates.

---

# 2. Seylan Bank (`seylan.lk`)

**Stack:** Classic PHP site + jQuery calculators; minimal public JSON.  
**robots.txt:** `Disallow: /salaryadvance` only.  
**sitemap.xml:** 404 HTML.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `GET /api/exchange-rates-get-value/{CCY}` | **JSON** array[1] | Yes — USD TT **332.5 / 339.5** | **Ship** (already remittance) |
| `GET /api/exchange-rates-sign-feed` | **JSON** CCY list | Yes (16 codes) | Helper for FX picker |
| `GET /get-fd-data` | **JSON** FD calculator | Yes — matches interest page FD | **Ship** |
| `GET /get-fd-tax` | **JSON** | Yes — `{taxOne:0,taxTwo:0}` | Calculator only |
| `GET /interest-rates` | **HTML** full deposit + lending board | Yes | **Ship** scrape for savings/loans |
| `GET /exchange-rates` | HTML + client JSON | Yes | Prefer API |
| Other `/api/*` probes | 404 HTML | — | Dead |

---

## 2.1 FX JSON

### `GET https://www.seylan.lk/api/exchange-rates-get-value/USD`

**Live sample (Effective Date `2026-07-20 11:15:37`):**

| Field | Value |
|-------|------:|
| Currency Notes Buying / Selling | 331.75 / 341 |
| Travellers Cheques/Drafts Buying / Selling | 331.224… / 339.5 |
| **Telegraphic Transfers Buying / Selling** | **332.5 / 339.5** |
| Import Bills Selling | 340 |

Same path works for `GBP`, `EUR`, … (list from sign-feed).

### `GET https://www.seylan.lk/api/exchange-rates-sign-feed`

Returns `[{"Currency Code":"USD"}, …]` (16 currencies). Content-Type may advertise `text/html` but body is JSON.

**Lankawa:** already `parseSeylanUsdTt` on TT fields.

---

## 2.2 Fixed deposit calculator JSON

### `GET https://www.seylan.lk/get-fd-data`

Loaded by `FDCalculator.js` (`$.ajax({ url: "/get-fd-data", dataType: "json" })`).

**Shape:**

```json
{
  "senior-below": [ { "type": "Maturity"|"Monthly"|"Annually", "stValue", "endValue", "interest": [{ "month", "interest" }] } ],
  "senior-above": [ /* senior citizens */ ]
}
```

**Live sample — under 60, maturity (2026-07-20):**

| month | interest % |
|------:|----------:|
| 1 | 7.5 |
| 2 | 7.5 |
| 3 | 8.5 |
| 5 | 10.0 |
| 6 | 8.75 |
| 7 | 10.5 |
| 12 | 9.0 |
| 24 | 11.0 |
| 36 | 11.0 |
| 48 | 11.0 |
| 60 | 12.5 |

**Under 60, monthly:** 12m 8.5 · 24m 9.5 · 36m 9.0 · 48/60m 8.75.  
**Senior-above maturity** bumps longer tenors (e.g. 12m **9.5**, 60m **13.0**).

Aligns with HTML section **Fixed Deposits - Interest Paid At Maturity** on `/interest-rates` (w.e.f. dates on page around **04.06.2026** for several FD blocks).

### `GET https://www.seylan.lk/get-fd-tax`

`{"taxOne":0,"taxTwo":0}` — withholding flags for calculator UI.

---

## 2.3 Interest rates HTML (savings + loans)

### `GET https://www.seylan.lk/interest-rates`

~548 KB HTML · **~1000** table cells · no deposit JSON beyond calculator.

**Live savings samples:**

| Product | Sample |
|---------|--------|
| Normal Savings | &lt;1k: 0% · 1–10k: **2.00** (AER 2.02) · ≥10k: **2.50** (2.53) |
| Minor / Teen | **4.00** (AER 4.07) |
| Money Market | up to **7.00** (AER 7.23) for ≥10m |
| Accelerate / Ihalin Ihalata | 2.00–3.00 by slab |

**Live FD (maturity) samples** — see calculator table above; also Flexi, Shakthi 4y, 5 STAR 5y, FCY USD FD (1y maturity **4.50%**).

**Live lending samples (`Interest Rates on Advances` / loan sections):**

| Product | Sample % p.a. |
|---------|--------------:|
| Overdrafts | 13.00 |
| Export Bill Finance (LKR) | 14.00 |
| Personal loan 1y (professionals, w/ card+IB) | 12.00 |
| Housing 1y (salary ≥700k, w/ card+IB) | 11.25 |
| Pensioner loan 1y | 11.50 |
| Pawning advances | LKR per karat (not %) |

Many sections stamped **w.e.f. 17.02.2026**, **04.06.2026**, **03.06.2026**, etc.

**Lankawa:** scrape for savings/loan board; use `/get-fd-data` for standard LKR FD strip.

---

# 3. National Savings Bank (`nsb.lk`)

**Stack:** WordPress (`/wp-json/` present).  
**robots.txt:** allows `admin-ajax.php`; sitemaps listed.  
**Note:** path typo **`rates-tarriffs`** is canonical on site.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `/rates-tarriffs/rupee-deposit-rates/` | **HTML tables** | Yes — w.e.f. **02/06/2026** | **Ship** scrape |
| `/rates-tarriffs/foreign-currency-deposit-rates/` | HTML | Yes — w.e.f. **14/11/2024** | **Ship** if FC needed |
| `/rates-tarriffs/lending-rates/` (alias `/lending-rates/`) | HTML | Yes — w.e.f. **02.06.2026** | **Ship** scrape |
| `/rates-tarriffs/nsb-exchange-rates/` | HTML TT + notes | Yes — as at **20/07/2026** | **Ship** (already remittance) |
| `/wp-json/wp/v2/pages/{id}` | JSON | **500** on rate pages | Unusable |
| `/wp-json/wp/v2/search?search=…` | JSON | Yes (titles/URLs only) | Discovery only |
| `/api/*` | — | 404 | None |

---

## 3.1 Rupee deposit rates HTML

### `GET https://www.nsb.lk/rates-tarriffs/rupee-deposit-rates/`  
Alias: `/rupee-deposit-rates/`

**Savings (W.E.F. 02/06/2026) — live samples:**

| Product | Min | Annual % |
|---------|----:|---------:|
| Ordinary / Postal / Rata Ithuru / Sthree | 5–500 | **3.00** |
| Hapan / Punchi Hapan | 5 | **3.50** |
| Happy Savings | 1000 | **3.00–6.00** |
| Neo / i’m | 1000 | **3.00–3.50** |

**Term deposits (W.E.F. 02/06/2026) — live samples:**

| Product | Min | Annual % | Pay | Effective % |
|---------|----:|---------:|-----|------------:|
| FD 01 month | 500,000 | 6.25 | Maturity | 6.43 |
| FD 03 months | 1,000 | 6.75 | Maturity | 6.92 |
| FD 06 months | 1,000 | 7.00 | Maturity | 7.12 |
| FD 12 months | 1,000 | 7.25 | Maturity | 7.25 |
| FD 12m monthly | 25,000 | 7.00 | Monthly | 7.23 |
| FD 24 months | 1,000 | 7.75 | Maturity | 7.47 |
| FD 36m Triple A | 25,000 | 7.75 | Maturity | 7.22 |
| FD 60m Triple A | 100,000 | **8.25** | Maturity | 7.15 |
| Gaurawa + (maturity) | 25,000 | 7.75 | Maturity | 7.75 |

Also: National Savings Certificates 3–48m (**6.75–8.00%**), Prarthana children’s certificates **7.25%**.

---

## 3.2 FCY deposit rates HTML

### `GET https://www.nsb.lk/rates-tarriffs/foreign-currency-deposit-rates/`

**Savings W.E.F. 14/11/2024:** USD **1.00%** · EUR 0.50% · GBP 1.00% · AUD 1.00% · JPY 0.01%.

**FD USD 500–50,000:** 1M **2.50%** · 3M **3.50%** · 6M **4.00%** · 12M **4.50%**.

---

## 3.3 Lending rates HTML

### `GET https://www.nsb.lk/rates-tarriffs/lending-rates/`

**Live samples (housing/personal blocks W.E.F. 02.06.2026):**

| Loan | Sample % p.a. |
|------|--------------:|
| Housing ≤ Rs 3 Mn | **11.00** |
| Housing &gt; Rs 3 Mn | 11.50 |
| 1st Home Owner ≤ 5 Mn | **9.50** |
| Personal / Buddhi / Solar (mortgage track) | 11.50 |
| Diriya | 12.00 |
| Auto (new) | 13.00 |
| Pawning (Ordinary Savings holders) | 14.50 |
| Loan vs FD | Effective/published rate **+ 3%** |

---

## 3.4 Exchange rates HTML

### `GET https://www.nsb.lk/rates-tarriffs/nsb-exchange-rates/`

**As at 20/07/2026 — USD:**

| | Buying | Selling |
|--|------:|--------:|
| Telegraphic Transfers | **332.25** | **340.25** |
| Currency notes | 328.98 | 341.10 |

Also EUR / GBP / AUD rows. Path `/rates-tarriffs/exchange-rates/` → **404** (use `nsb-exchange-rates`).

**Lankawa:** already HTML scrape in `parseNsbUsdTt`.

### WordPress JSON

- `GET /wp-json/` → large index (namespaces include `wp/v2`, `contact-form-7`, Events Calendar, …).  
- `GET /wp-json/wp/v2/search?search=deposit+rates` → page titles/URLs (**941**, **950**, **952**, **136298**).  
- Fetching those pages by id → **HTTP 500** (`rest_cannot_read` style body). **Do not depend on WP REST for rate content.**

---

# 4. Cross-bank USD TT snapshot (probe day)

| Bank | Source | TT Buy | TT Sell | As-of signal |
|------|--------|------:|-------:|--------------|
| Sampath | `/api/exchange-rates` | 331.75 | 340.75 | RateWEF 2026-07-20 08:27 |
| Seylan | `/api/exchange-rates-get-value/USD` | 332.50 | 339.50 | Effective Date 2026-07-20 11:15 |
| NSB | HTML `nsb-exchange-rates` | 332.25 | 340.25 | as at 20/07/2026 |

---

# 5. Recommended Lankawa wiring

| Priority | Action |
|----------|--------|
| **P0** | Keep existing FX: Sampath + Seylan JSON, NSB HTML. |
| **P0** | **Sampath** — add deposit adapter on `/api/rates-and-charges/external` (`term_and_deposite` + `savings_rate`). |
| **P0** | **Seylan** — add FD adapter on `/get-fd-data` (`senior-below` maturity/monthly). |
| **P1** | **NSB** — HTML scrape rupee-deposit + lending tables (same fetcher pattern as remittance). |
| **P1** | **Seylan** — HTML scrape `/interest-rates` for savings + personal/housing loan boards. |
| **P2** | Sampath `/foreignRates` + NSB FCY HTML if FC deposit board is in scope. |
| **Park** | Sampath CMS `/api/rates-and-charges` (stale); NSB `wp-json` pages; Seylan loan calculator report POSTs; AWPLR/AWPR (not exposed). |

**Caveats:** All quotes indicative; bonus slabs (Sampath Double S, Seylan Tikiri) need careful field interpretation; NSB path spelling `tarriffs` must be preserved; prefer low cadence + descriptive UA.

---

# 6. Probe inventory (negative / 404)

| Bank | Tried & failed / empty |
|------|------------------------|
| Sampath | `/api/interest-rates`, `/api/fd-rates`, `/api/loan-rates`, `/api/awplr`, `/api/deposit-rates` → 404 |
| Seylan | `/api/exchange-rates`, `/api/interest-rates`, `/api/fd-rates`, `/get-loan-data`, `/get-savings-data` → 404 HTML |
| NSB | `/api/`, `/rates-tarriffs/exchange-rates/`, `wp/v2/pages` list & by-id → 404/500 |

---

*Generated from live HTTP probes on 2026-07-20. Re-verify before shipping parsers if bank HTML/JSON shapes change.*
