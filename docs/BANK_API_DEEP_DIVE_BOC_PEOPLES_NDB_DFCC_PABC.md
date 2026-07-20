# BOC · People's · NDB · DFCC · Pan Asia (PABC) — public rates deep dive (Lankawa)

**Status:** Live probe (high thoroughness), 2026-07-20  
**Hosts:** `https://www.boc.lk` · `https://www.peoplesbank.lk` · `https://www.ndbbank.com` · `https://www.dfcc.lk` · `https://www.pabcbank.com`  
**UA used:** Chrome 126 desktop (Sucuri / CloudFront friendly); remittance path already uses `LankawaBot/1.0`  
**Sister docs:** [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md), [`BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`](./BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md), [`AMANA_PABC_SDB_OFFERS_RESEARCH.md`](./AMANA_PABC_SDB_OFFERS_RESEARCH.md), remittance wiring in `src/lib/integrations/remittance-banks.ts`

Rates below are **indicative public quotes** from probe day — not advice; banks may change without notice.

---

## Verdict (cross-bank)

| Bank | Best machine feed | FD / savings | Loans | FX | Tariff / fees | Lankawa fit |
|------|-------------------|--------------|-------|-----|---------------|-------------|
| **BOC** | HTML `/rates-tariff` (**50** tables); calculator JSON `/api/interest-rates-fd` is **stale vs HTML** | HTML (live); JSON calculator **do not trust** | HTML lending tables | HTML TT (**shipped**); `POST /api/exchange-rates` **500** | Fee sections on same page | **Ship** HTML scrape for FD/savings/loans; keep FX HTML; **park** FD JSON until it matches tariff |
| **People's** | HTML `/interest-rates/` (+ PDF tariffs under `/roastoth/`) | HTML (rich AER boards) | HTML min/max + AWPLR spreads | HTML TT (**shipped**) | PDF guides (General, CC, pawning, FX) | **Ship** interest HTML; PDFs as provenance |
| **NDB** | HTML `/rates/interest-rates-on-deposits` + `/rates/interest-rates-on-advances` | HTML (Last Updated stamps) | HTML advances | HTML TT (**shipped**) | No public tariff JSON | **Ship** deposits + advances HTML |
| **DFCC** | Next.js RSC on `/rates-and-tariff` (embedded CMS JSON) + FX HTML | RSC FD matrices + special tenors | RSC lending (AWPLR + fixed bands) | HTML TT (**shipped**) | Customer / CC / corporate **PDFs** | **Ship** parse RSC (or tab HTML) for FD/savings/loans; keep FX |
| **PABC** | Sucuri-gated WP; **PDFs** + senior FD **HTML table**; FX page empty | Senior FD HTML; main FD ladder not on product HTML | Consumer-loan **PDFs**; `Interest-Rates.pdf` is **internal housing sheet** | `/treasury/exchange-rate/` **no rates table** | `Full-Tariff-PDF-1.pdf` + media library | **Ship** senior FD HTML + tariff/loan PDFs after Sucuri; **park** FX until a table appears; **do not** treat `Interest-Rates.pdf` as public FD board |

**Bottom line:** None of these five expose a clean ComBank/Sampath-style **live deposit JSON** that matches the published tariff. Best paths are **HTML tables** (BOC / People's / NDB) and **DFCC RSC-embedded rate objects**. BOC's `GET /api/interest-rates-fd` is real JSON but **out of date vs `/rates-tariff`** — treat as calculator debt, not source of truth. PABC is PDF-heavy + Sucuri; remittance FX for PABC is not available on the public exchange page today.

**Already shipped (FX remittance):** People's, NDB, BOC, DFCC HTML TT parsers in `remittance-banks.ts`. PABC not on the remittance board.

---

## Discovery method

1. Known hubs (`rates-tariff`, `interest-rates`, `rates-and-tariff`, NDB `/rates/*`) + sitemap/robots.  
2. JS mining: BOC `/assets/js/main.js` → `/api/interest-rates-fd`, `/api/investment-rates`, `/api/exchange-rates*`.  
3. DFCC Next.js `self.__next_f` flight payload → `InterestRate` CMS blocks / tab keys.  
4. PABC Sucuri cookie solve (same as card-offers) + `wp-json/wp/v2/media?search=…` for PDF discovery.  
5. Live sample capture for FD, savings, loans, FX, tariff PDFs.

---

# 1. Bank of Ceylon (`boc.lk`)

**Stack:** Laravel (`bank_of_ceylon_session`, `XSRF-TOKEN`) + nginx + AWS ALB; CloudFront WAF on many POSTs.  
**robots.txt:** allows all; `Sitemap: https://www.boc.lk/sitemap.xml`.  
**Canonical rates UI:** `https://www.boc.lk/rates-tariff` (~308 KB SSR HTML, **50** `<table>`s).

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `GET /rates-tariff` HTML | Tables (FX, T-bills, FD, savings, FC, loans, cards, leasing, …) | Yes | **Ship** primary for deposits/loans |
| `GET /api/interest-rates-fd` | **JSON** (17 tenor×paid_in rows) | Yes but **stale vs HTML** | **Park** until reconciled |
| `POST /api/exchange-rates` | Intended JSON | **500** `Server Error` | **Park** (HTML already shipped) |
| `POST /api/exchange-rates/calculate` | JSON calculator | Returns `0` / flaky | **Park** |
| `POST /api/investment-rates` | Calculator | `[]` empty | **Park** |
| `GET /api/investment-months-list` | JSON month list | Yes (1…60) | **Park** (chrome for dead calculator) |
| Other `/api/interest-rates`, `/api/deposit-rates`, … | — | **404** route missing | Skip |

---

## 1.1 Rates & tariffs HTML (primary)

### `GET https://www.boc.lk/rates-tariff`

**Sections observed (h3):** Currency Exchange Rates · Treasury Bill Rates · Rupee Fixed Deposits · Special / Senior FD schemes · Rupee Savings · FC savings/FD · Personal / Housing / Education / Development / Green loans · Advances against deposit · Pensioners · etc.

**Effective-date phrases on page (samples):** FD board “Effective from **08.06.2026**”; other blocks **01.12.2025**, **29.05.2026**, **03.03.2026**, **23.04.2025**.

### Live FX sample (USD row, 2026-07-20)

Columns: Currency notes buy/sell · Drafts buy/sell · Telegraphic/PFCA/BFCA buy/sell.

| | Buy | Sell |
|--|----:|-----:|
| Notes | 331.8000 | 340.8000 |
| Drafts | 331.4000 | 340.8000 |
| **TT / PFCA / BFCA** | **331.8000** | **340.8000** |

**Lankawa:** already `parseBocUsdTt` on this page (TT last pair).

### Live LKR fixed deposits (sample)

| Term & payment | Rate % p.a. |
|----------------|----------:|
| 1 Month | **6.75** |
| 3 Month | **7.25** |
| 6 Month | **7.50** |
| 1 Year — maturity | **7.25** |
| 1 Year — monthly | **7.00** |
| 1 Year senior — maturity | **7.75** |
| 1 Year senior — monthly | **7.50** |

Special senior 2025 block also present (e.g. **11.32%** / AER **11.93%**, from **01.12.2025**).

### Live savings (sample)

| Product | % p.a. |
|---------|-------:|
| Ordinary Savings | 2.00 |
| Samurdhi Investment | 2.25 |
| 18+ Youth Savings | 2.50 |

### Live lending (samples)

| Product | Rate |
|---------|------|
| Personal loan (standard) | Up to 5y **14.00%**; 5–7y higher band on page |
| Housing (≤ Rs 5 Mn, ≤ 10y) | **12.00%** fixed |
| Pawning | **15.00%** |
| Credit cards | **28.00%** |
| Leasing — new cars | **12.75–14.50%** |
| Solar (residential ≤ 3 Mn) | **11.50%** |

---

## 1.2 FD calculator JSON (stale — park)

### `GET https://www.boc.lk/api/interest-rates-fd`

| | |
|--|--|
| **Method** | `GET` (POST → CloudFront **403** HTML) |
| **Auth** | None for GET |
| **Consumer** | `main.js` `fdPath` → FD calculator UI |
| **Rows** | **17** |
| **Fields** | `id`, `paid_in` (`maturity` \| `monthly` \| `annually`), `period` (months), `rate` (number) |

**Live API sample (2026-07-20) — does NOT match `/rates-tariff` HTML:**

| period (m) | paid_in | API rate % | HTML tariff (same tenor) |
|-----------:|---------|----------:|-------------------------:|
| 1 | maturity | **13.5** | **6.75** |
| 3 | maturity | **15** | **7.25** |
| 6 | maturity | **14.75** | **7.50** |
| 12 | maturity | **12** | **7.25** |
| 12 | monthly | **11.75** | **7.00** |
| 24 | maturity | **14.75** | (see HTML multi-year rows) |
| 60 | maturity | **15.5** | (see HTML) |

**Lankawa:** **Park.** Prefer HTML scrape. If ever wired, hard-fail when API vs HTML delta exceeds a threshold.

### Related calculator APIs

| Endpoint | Result (2026-07-20) | Note |
|----------|---------------------|------|
| `POST /api/investment-rates` `{amount,months,_token}` | `[]` | Empty — not usable |
| `GET /api/investment-months-list` | `{0:1,…,18:60,20:3}` | Month picker only |
| `POST /api/exchange-rates` | **500** | Confirmed broken |
| `POST /api/exchange-rates/calculate` `{currency,val,_token}` | `0` / unreliable | Park |

---

## 1.3 Ship / park (BOC)

```
Ship  GET /rates-tariff HTML → FD, savings, lending, T-bill, FX (FX already live)
Park  GET /api/interest-rates-fd          # stale calculator
Park  POST /api/exchange-rates            # 500
Park  investment-rates / calculate        # empty / broken
```

---

# 2. People's Bank (`peoplesbank.lk`)

**Stack:** WordPress marketing site.  
**Canonical interest hub:** `https://www.peoplesbank.lk/interest-rates/` (~284 KB, **18** tables).  
**FX:** `https://www.peoplesbank.lk/exchange-rates/` (shipped).  
**Treasury:** `https://www.peoplesbank.lk/treasury-services/` (FC deposit tables overlap interest hub).  
**wp-json:** `/wp-json/` and page queries → **500** (unusable).

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| `/interest-rates/` HTML | **Yes** — deposit + advances + FC | Yes — FD w.e.f. **09 Jun 2026** | **Ship** |
| `/exchange-rates/` HTML | TT table | Yes — USD TT **332.00 / 340.35** | **Ship** (done) |
| `/roastoth/…/*.pdf` tariffs | PDF | Yes (200) | **Ship** provenance / fees |
| `wp-json` | — | **500** | **Park** |

---

## 2.1 Interest rates HTML

### `GET https://www.peoplesbank.lk/interest-rates/`

**Blocks:** 7-day call · 400-day FD · money-market savings · standard FD · People's Wealth · co-op / Samurdhi / Parinatha · savings products · FC savings/FD · advances · general / international banking tariff links.

### Live LKR FD — standard (min Rs 5,000, w.e.f. **09th June 2026**)

| Period | At maturity % (AER) | Monthly % (AER) |
|--------|--------------------:|----------------:|
| 01 Month | 6.75 (6.96) | — |
| 03 Months | 7.25 (7.45) | 7.00 (7.23) |
| 06 Months | 7.50 (7.64) | 7.25 (7.50) |
| 12 Months | 8.50 (8.50) | 8.20 (8.50) |
| 24 Months | 9.40 (9.00) | 8.65 (9.00) |
| 36 Months | 9.85 (9.00) | 8.65 (9.00) |
| 48 Months | 10.30 (9.00) | 8.65 (9.00) |
| 60 Months | 10.75 (9.00) | 8.65 (9.00) |

\* +**0.5%** for minors / extended FD (page footnote).

### Live “People's Wealth” (min Rs 250,000, fresh deposits)

| Tenure | Maturity % (AER) | Monthly % (AER) |
|--------|-----------------:|----------------:|
| 2 Years | 10.00 (9.54) | 9.15 (9.54) |
| 3 Years | 10.50 (9.55) | 9.15 (9.54) |
| 4 Years | 11.00 (9.54) | 9.15 (9.54) |
| 5 Years | 11.50 (9.51) | 9.10 (9.49) |

### Live advances (min / max % p.a.)

| Description | Min | Max |
|-------------|----:|----:|
| Business Loans | 15.0 | 16.0 |
| Residential Housing | 13.5 | 15.5 |
| Personal Loans | 13.5 | 16.0 |
| Gurusetha Loan | 12.5 | 14.0 |
| Vehicle Loans | 13.5 | 15.0 |
| Education Loans | 13.0 | 14.5 |
| Pawning | 16 | — |
| Export / Import finance (Rs) | Weekly AWPLR+2.5 | Weekly AWPLR+4.5 |
| Credit Cards | — | 28% p.a. / 2.3% monthly |
| OD permanent | 16.50 | 17.50 |
| OD temporary | 23.0 | 32.0 |

### Live FX (exchange-rates page)

USD Telegraphic Transfers: buy **332.0001** / sell **340.3509** (2026-07-20).

---

## 2.2 Tariff PDFs (`/roastoth/`)

WordPress media base path is **`/roastoth/`** (not `/uploads/`). Live **200 application/pdf** on probe:

| URL | Role |
|-----|------|
| `https://www.peoplesbank.lk/roastoth/2024/04/General.pdf` | Current / savings / general |
| `https://www.peoplesbank.lk/roastoth/2024/04/Pawning.pdf` | Pawning & loans |
| `https://www.peoplesbank.lk/roastoth/2026/06/CreditCardTariffGuidePB_2026.pdf` | Credit card |
| `https://www.peoplesbank.lk/roastoth/2024/09/Debit-Card-Tariff-Guide_English.pdf` | Debit card |
| `https://www.peoplesbank.lk/roastoth/2026/06/Tarriff-English.pdf` | Foreign currency |
| `https://www.peoplesbank.lk/roastoth/2026/06/Tarrif-Foreign-English.pdf` | Trade services |
| `https://www.peoplesbank.lk/roastoth/2024/09/Online-Banking.pdf` | IB / mobile |
| `https://www.peoplesbank.lk/roastoth/2024/09/SMS-Alert-Charges.pdf` | SMS |

---

## 2.3 Ship / park (People's)

```
Ship  GET /interest-rates/ HTML → FD, savings, FC, advances
Ship  GET /exchange-rates/ HTML → TT (already remittance)
Ship  /roastoth/*.pdf → fee/tariff provenance (low cadence)
Park  wp-json (500)
```

---

# 3. NDB Bank (`ndbbank.com`)

**Stack:** Bootstrap SSR marketing (no Next/`wp-json` rates API).  
**Hub:** `https://www.ndbbank.com/rates` → children:  
- `/rates/exchange-rates`  
- `/rates/interest-rates-on-deposits`  
- `/rates/interest-rates-on-advances`  

**robots.txt / sitemap.xml:** **404**.  
**`/api/rates`, `/api/exchange-rates`:** **404**.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| Deposits HTML | **4** tables, “Last Updated On” | Yes — **2026-06-16** | **Ship** |
| Advances HTML | **2** tables | Yes — **2026-07-03** (refinance table older) | **Ship** |
| Exchange HTML | 1 TT/DD/notes table | Yes — updated **2026-07-20** | **Ship** (done) |
| JSON rates API | **No** | — | **Park** |

---

## 3.1 Deposit rates HTML

### `GET https://www.ndbbank.com/rates/interest-rates-on-deposits`

**Last Updated On: 2026-06-16** (all four tables).

### Live LKR FD (maturity / monthly / Neos — sample)

| Tenor | Mode | Min % | AER % |
|-------|------|------:|------:|
| 1 Month | Maturity | 8.00 | 8.30 |
| 1 Month | Neos FD Maturity | 8.25 | 8.57 |
| 3 Months | Monthly | 9.20 | 9.60 |
| 3 Months | Maturity | 9.50 | 9.84 |
| 3 Months | Neos | 9.75 | 10.11 |
| 6 Months | Maturity | 9.75 | 9.99 |
| 6 Months | Neos | 10.00 | 10.25 |
| 1 year | Maturity | 10.00 | 10.00 |
| 1 year | Neos | 11.00 | 11.00 |
| 2 years | Maturity | 11.00 | 10.45 |
| 5 years | Maturity | 13.00 | 10.53 |
| 5 years | Neos | 13.25 | 10.70 |
| 12M Certificate (≥ Rs 1 Mn) | — | 10.00 | 10.00 |
| 60M Certificate | — | 13.00 | 10.53 |

Also: **100 / 200 day** tenors; quarterly/annual payout rows for multi-year.

### Live savings (sample)

| Product | Tier | Min % | AER % |
|---------|------|------:|------:|
| Easy Saver | ≥ 2,500 | 2.25 | 2.27 |
| Salary Max | ≥ 2,500 | 2.50 | 2.53 |
| Shilpa Children's | ≥ 1,000 | 2.50 | 2.53 |
| Shilpa reward (net) | — | 5.00 | 5.12 |

FC savings / FC FD tables also on the same page (USD 1M FD **3.75%** / AER **3.82%**, etc.).

---

## 3.2 Advances rates HTML

### `GET https://www.ndbbank.com/rates/interest-rates-on-advances`

**Last Updated On: 2026-07-03** (main table).

| Product | Min % | Max % |
|---------|------:|------:|
| Home Loans (variable) | 13.50 | 14.50 |
| Pawning | 13.25 | 13.75 |
| General personal / doctors / Solar Vantage | 14.50–14.75 | 14.50–15.00 |
| Gold Loan | 11.50 | 12.00 |
| Salary Max Loan | 13.75 | 13.75 |
| Education Loan | 14.75 | 14.75 |
| Credit Cards (monthly) | 2.30 | 2.30 |

Refinance schemes table dated **2025-12-03** (mostly N/A on probe).

---

## 3.3 FX HTML (shipped)

### `GET https://www.ndbbank.com/rates/exchange-rates`

**Last Updated On: 2026-07-20.** USD sample:

| | Buy | Sell |
|--|----:|-----:|
| Currency notes | 331.75 | 340.75 |
| Demand draft | 330.54 | 340.75 |
| **TT** | **331.75** | **340.75** |

---

## 3.4 Ship / park (NDB)

```
Ship  GET /rates/interest-rates-on-deposits
Ship  GET /rates/interest-rates-on-advances
Ship  GET /rates/exchange-rates          # already remittance
Park  /api/*                             # 404
```

---

# 4. DFCC Bank (`dfcc.lk`)

**Stack:** Next.js App Router (`self.__next_f` RSC); CMS model `App\Models\InterestRate`.  
**Canonical hub:** `https://www.dfcc.lk/rates-and-tariff` (~539 KB; **0** classic HTML rate tables — data in flight JSON).  
**FX page:** `https://www.dfcc.lk/rates-and-tariff/exchange-rates` (real `<table>`, shipped).  
**robots.txt:** allows `*`; sitemap present.

### Tab keys (query `?tab=`)

`fixed_deposits` · `saving_rates` · `lending_rates` · `repo_rates` · `foreign_currency_rates` · `senior_citizen_fixed` · `special_USD_fixed_deposit`  
(+ sidenav: `penal-interest-rates`, special USD, senior FD).

**Note:** All tab URLs return the **same full RSC payload** (~539 KB) containing every section — client tab only filters UI. Scrape once.

`GET /api/rates` and `/api/interest-rates` return **Next HTML shells**, not JSON APIs.

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| RSC on `/rates-and-tariff` | Embedded JSON (`content` blobs) | Yes — FD from **2026-06-24** | **Ship** |
| FX HTML table | Yes | Yes — USD TT **331.5 / 341** | **Ship** (done) |
| Customer / CC / corporate PDFs | PDF | Yes | Secondary |
| REST `/api/rates` | **No** (HTML) | Misleading 200 | **Park** |

---

## 4.1 FD rates (from RSC)

**Title blocks:** `FD Rates 1 year and Below` / `FD Rates 1 year and Above`  
**from_date:** **2026-06-24**.

### ≤ 1 year — Nominal / AER / Monthly (LKR)

| Tenor key | Nominal | AER | Monthly |
|-----------|--------:|----:|--------:|
| 1_month | 7.75% | 8.03% | — |
| 2_month | 7.75% | 8.00% | — |
| 3_month | 10.00% | 10.38% | 9.92% |
| 6_month | 10.00% | 10.25% | 9.80% |
| 1_year | 10.50% | 10.50% | 10.03% |

### ≥ 1 year — Nominal (maturity-style)

| Tenor | Nominal | AER (maturity col) |
|-------|--------:|-------------------:|
| 1_year | 10.50% | 10.50% |
| 2_year | 11.00% | 10.45% |
| 3_year | 11.25% | 10.18% |
| 4_year | 12.00% | 10.30% |
| 5_year | 12.50% | 10.20% |

Monthly / quarterly / bi-annual / annual payout rows also present in RSC (same AER columns).

### Special day-count FDs (tenor objects)

| Tenor | Nominal | AER |
|-------|--------:|----:|
| 100 days | 10.00% | 10.37% |
| 200 days | 10.00% | 10.23% |
| 300 days | 10.50% | 10.60% |
| 400 days | 10.50% | 10.45% |

Green Deposit: LKR 1y **7.50%**; FCY 1y **5.00%**.

---

## 4.2 Lending rates (RSC products)

| Product | Min | Max |
|---------|-----|-----|
| Overdrafts — Permanent | AWPLR + 3% | AWPLR + 5% |
| Housing — Variable | AWPLR + 3% | AWPLR + 5% |
| Housing — Fixed (normal) 2–20y | 13.25% | 16.00% |
| Housing — Fixed (professionals / Pinnacle) | 12.75% | 15.50% |
| Leasing | 13.25% | 16.25% |
| Garusaru Loan | 13.50% | 16.00% |
| Prearranged temp OD | 23.00% | 23.00% |
| Temp OD excesses | 36.00% | 36.00% |
| Advances against FD | +2.50% over FD | +4.00% over FD |
| Credit Cards | (effective from **13/07/2026** in payload) | — |

---

## 4.3 Repo / G-Sec (RSC)

**G-Sec REPO Rate** window `from_date` **2026-07-16** → `to_date` **2026-07-22** (sample rows by period and amount buckets `<5m` / `>5m`).

---

## 4.4 FX HTML (shipped)

### `GET https://www.dfcc.lk/rates-and-tariff/exchange-rates`

| Currency | TT Buying | DD/TT Selling |
|----------|----------:|--------------:|
| **USD** | **331.5** | **341** |

---

## 4.5 Tariff PDFs (secondary)

| PDF | Host |
|-----|------|
| DFCC Bank PLC Tariff 2025 v3.05 | `properties.dfcc.lk/dfccweb/uploads/…` |
| General Credit Card Tariff Leaflet Jul 2026 | same |
| Corporate Banking & Project Finance tariff | same |

---

## 4.6 Ship / park (DFCC)

```
Ship  GET /rates-and-tariff          # parse RSC InterestRate content (one fetch)
Ship  GET …/exchange-rates HTML      # already remittance
Park  /api/rates HTML catch-all
P2    Customer/CC tariff PDFs
```

**Parse tip:** unescape `\\"` in `self.__next_f` payloads; collect objects with `1_month`/`2_year` keys or `product` + `nominal_rate_minimum`.

---

# 5. Pan Asia Banking Corporation — PABC (`pabcbank.com`)

**Stack:** WordPress + Elementor + **Sucuri CloudProxy** (JS cookie gate).  
**robots.txt:** Disallow `/wp-admin/` only; sitemaps listed.  
**Card offers:** already documented / shipped (`arr_offers`) — see [`AMANA_PABC_SDB_OFFERS_RESEARCH.md`](./AMANA_PABC_SDB_OFFERS_RESEARCH.md).

### Verdict detail

| Surface | Machine-readable? | Live now? | Fit |
|---------|-------------------|-----------|-----|
| Senior Citizens FD HTML | **Table** (rates + AER) | Yes — w.e.f. **2025-06-01** | **Ship** |
| `GET /interest-rates/` | **302 → PDF** | Yes | See PDF caveat |
| `Interest-Rates.pdf` | PDF | Yes but **“Confidential-Internal” housing/salary sheet** | **Park** for public FD board |
| Consumer Loan Interest Rates PDFs | PDF | Yes (media library) | **Ship** loan strip |
| `Full-Tariff-PDF-1.pdf` | PDF (~699 KB) | Yes | **Ship** fees |
| `/treasury/exchange-rate/` | Marketing HTML | **No rate table / no API** | **Park** FX |
| `/rates-and-tariffs/` | — | **404** | Skip |
| `wp-json` + media search | JSON (after Sucuri) | Yes — PDF discovery | **Ship** discovery helper |
| Card `arr_offers` | Inline JS | Yes | **Ship** (done) |

---

## 5.1 Sucuri gate

Same flow as card-offers (`solveSucuriCookie` in `card-offers.ts`):

1. `GET` any HTML path → challenge with base64 `S='…'`.  
2. Decode → cookie `sucuri_cloudproxy_uuid_*=…`.  
3. Replay with `Cookie` header.  
4. Cookie **rotates**; sticky jar + retry on challenge HTML.

Without cookie: **307** challenge (~1.3 KB). With cookie: full pages / `wp-json` / PDFs.

---

## 5.2 Senior Citizens FD HTML (best structured rates)

### `GET https://www.pabcbank.com/personal-banking/senior-citizen-accounts/senior-citizens-fd/`

**With Effective From: 2025-06-01**

| | 12M monthly | 12M mat. | 13M mat. | 24M monthly | 24M mat. | 36M monthly | 36M mat. | 48M monthly | 48M mat. | 60M monthly | 60M mat. |
|--|----------:|---------:|---------:|-----------:|---------:|-----------:|---------:|-----------:|---------:|-----------:|---------:|
| Int.Rate p.a. | 8.88% | 9.25% | 11.00% | 9.57% | 10.50% | 9.35% | 10.75% | 9.33% | 11.25% | 9.75% | 12.50% |
| A.E.R | 9.25% | 9.25% | 10.95% | 10.00% | 10.00% | 9.77% | 9.77% | 9.73% | 9.73% | 10.20% | 10.20% |

Standard / rising / call FD product pages are mostly marketing (no full public ladder in HTML on probe).

---

## 5.3 PDFs (media library)

Discoverable via Sucuri +  
`GET /wp-json/wp/v2/media?search=Interest|Tariff&per_page=20`

| File | Modified | Role |
|------|----------|------|
| `/wp-content/uploads/2026/06/Interest-Rates.pdf` | 2026-06-01 | **Internal** consumer/housing rate sheet (“Confidential-Internal”; salary bands e.g. 14–18% fixed) — **not** a public FD tariff |
| `/wp-content/uploads/2026/05/Consumer-Loan-Interest-Rates.pdf` | 2026-05-25 | Consumer loan rates |
| `/wp-content/uploads/2026/06/Full-Tariff-PDF-1.pdf` | 2026-06-23 | Full bank tariff / fees |
| `/wp-content/uploads/2026/07/Cardstariff-Updated-01.06.2026-1-1.pdf` | 2026-07-03 | Card tariff |
| Older `Full-tariff-as-at-12-06-2026.pdf`, `BANK-TARIFF-2026.pdf`, … | — | History / provenance |

`GET /interest-rates/` **redirects to** `Interest-Rates.pdf` (the internal sheet) — do not label as FD board.

Also linked sitewide: `/wp-content/uploads/2026/06/Full-Tariff-PDF-1.pdf` as “Fees and charges”; page slug `/fees-and-charges/`.

---

## 5.4 Exchange rates — empty

### `GET https://www.pabcbank.com/treasury/exchange-rate/`

- Title/meta promise USD/GBP/… buy-sell rates.  
- **0** `<table>`s; no `arr_*` rate array; no `/api` FX feed in page.  
- Elementor chrome + schema.org only.

**Lankawa:** **Park** PABC remittance until a table or JSON appears (do not invent rates from meta copy).

---

## 5.5 Ship / park (PABC)

```
Ship  Senior Citizens FD HTML table (after Sucuri)
Ship  Full-Tariff + Consumer-Loan PDFs (media search / stable URLs)
Ship  card-offers arr_offers (already)
Park  Interest-Rates.pdf as “public FD”     # internal housing sheet
Park  /treasury/exchange-rate/              # no numbers
Skip  /rates-and-tariffs/                   # 404
```

---

## Cross-bank live FX snapshot (2026-07-20, USD/LKR TT)

| Bank | Surface | TT Buy | TT Sell | Status |
|------|---------|-------:|--------:|--------|
| BOC | HTML `/rates-tariff` | 331.80 | 340.80 | **Shipped** |
| People's | HTML `/exchange-rates/` | 332.00 | 340.35 | **Shipped** |
| NDB | HTML `/rates/exchange-rates` | 331.75 | 340.75 | **Shipped** |
| DFCC | HTML `…/exchange-rates` | 331.50 | 341.00 | **Shipped** |
| PABC | `/treasury/exchange-rate/` | — | — | **No public table** |

---

## Recommended Lankawa ship order

```
P0  Keep remittance HTML: BOC / People's / NDB / DFCC
P0  People's GET /interest-rates/ → LKR FD + advances strip
P0  NDB deposits + advances HTML (Last Updated stamps)
P1  BOC /rates-tariff HTML scrape (FD/savings/loans) — ignore stale FD JSON
P1  DFCC /rates-and-tariff RSC parser (FD ≤1y / ≥1y + lending AWPLR bands)
P2  PABC senior FD HTML + tariff/loan PDFs (Sucuri reuse from card-offers)
P2  People's /roastoth/ tariff PDFs as fee footnotes
Park BOC /api/interest-rates-fd until rate == HTML
Park PABC FX page; BOC POST FX; NDB/DFCC fake /api HTML
```

Suggested `sourceId`s: `boc_rates_tariff`, `peoples_interest_rates`, `ndb_deposit_rates`, `ndb_advance_rates`, `dfcc_rates_tariff_rsc`, `pabc_senior_fd`, `pabc_tariff_pdf`.

---

## Compliance / product rules

- Public marketing surfaces only; no authenticated banking apps / APK MITM.  
- Descriptive UA, low cadence; honor owner takedown.  
- Never claim **live** when WAF/empty/stale (especially BOC FD JSON vs HTML, PABC FX page, PABC `Interest-Rates.pdf`).  
- Quotes are indicative — not CBSL official, not advice; fees/corridors differ by product.  
- PABC: reuse existing Sucuri solver; do not log challenge cookies in client bundles.

---

*Probed 2026-07-20 from research environment against live bank hosts. Medium–high thoroughness: no authenticated internet-banking sessions.*
