# Commercial Bank of Ceylon — public API / rates deep dive (Lankawa)

**Status:** Live probe (high thoroughness), 2026-07-20  
**Host:** `https://www.combank.lk` (Laravel session cookie `commercial_bank_session`, nginx + CloudFront)  
**UA used:** Chrome 126 desktop browser string (also verified `LankawaBot/1.0` on key JSON GETs)  
**Sister docs:** [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md) (card offers), remittance wiring in `src/lib/integrations/remittance-banks.ts`

---

## Verdict

| Surface | Machine-readable? | Live now? | Lankawa fit |
|---------|-------------------|-----------|-------------|
| `GET /api/exchange-rates` | **JSON** (17 currencies) | Yes — USD TT 332 / 340 | **Ship** (already wired for remittance TT) |
| `GET /api/interest-rates-fd` | **JSON** (19 FD tenor×paidIn rows) | Yes — e.g. 12m maturity 10.00% | **Ship** — best deposit-rate feed |
| `GET /rates-tariff` HTML | Tables (savings / FD / FC / lending / REPO / tariffs) | Yes — full board | **Ship** scrape for savings + lending; park fees |
| AWPR | **Not published** | N/A | **Park** — site uses **AWPLR** spreads only (no numeric AWPLR/AWPR API) |
| Card rewards HTML | SSR listing | Yes — 72 offers / 6 supermarket | **Ship** (already wired) |
| `GET /api/s-offers` | JSON | `[]` empty | **Park** canary |
| Static `offers.json` | JSON | Stale 2019 | **Park** — never label live |
| `POST /api/branches` + cities/awards/leaders | JSON | Yes | **Park** (locator/about chrome, not economy) |
| `GET /api/treasury-bills-cal` | JSON | Yes — calculator maturity curve | **Park** — not weekly auction board |

**Bottom line:** ComBank exposes a small, real public JSON set discovered in `/assets/js/main.js`. For Lankawa economy: keep FX TT; add FD JSON; scrape `#interest-rates` / `#lending-rates` / REPO HTML for savings and AWPLR-linked lending. No AWPR page or API.

---

## Discovery method

1. Sitemap + homepage link harvest (`rates-tariff`, product pages).  
2. `/assets/js/main.js` string scan → `/api/*` paths.  
3. Method matrix (GET/POST/OPTIONS) with browser UA; CloudFront WAF returns HTML 403 on many POSTs and some bare bursts.  
4. Confirmed: FD / T-bill / FX / s-offers GETs work **without** session cookie; branches is **POST-only**.

`robots.txt` → **403**. Prefer descriptive UA, low cadence.

---

## 1. Exchange rates JSON

### `GET https://www.combank.lk/api/exchange-rates`

| | |
|--|--|
| **Method** | `GET` only (POST → CloudFront 403 HTML) |
| **Variants** | Trailing `/` same body; `?currency=USD` / `?code=USD` **ignored** (full array); `/api/exchange-rates/USD` → 404 |
| **Content-Type** | `application/json` |
| **Size** | ~6.2 KB / **17** rows |

**Sample fields (per row):**

| Field | Example (USD, 2026-07-20) |
|-------|---------------------------|
| `id` | `1` |
| `excode` | `"USD"` |
| `description` | `"US DOLLARS"` |
| `code` | `"1"` |
| `cheque_buying_rate` | `330.1893` |
| `cheque_selling_rate` | `340` |
| `currency_buying_rate` | `330.05107` |
| `currency_selling_rate` | `340` |
| `telegraphic_transfers_buying_rate` | `332` |
| `telegraphic_transfers_selling_rate` | `340` |
| `sync_at` | `"2026-07-20"` |
| `updated_at` | `"2026-07-20 12:00:03"` |
| `created_at` | `"2020-12-16 11:37:31"` |

**Currencies:** USD, EUR, GBP, JPY, SGD, AUD, CHF, KWD, OMR, SAR, AED, QAR, JOD, BHD, INR, CAD, NZD.

**Site consumer:** currency converter in `main.js` (`exchangePath`, sessionStorage cache).

**Lankawa:** **Ship** — already `parseCombankUsdTt` → remittance board. Prefer TT columns; note indicative / not CBSL.

---

## 2. Fixed deposit rates JSON

### `GET https://www.combank.lk/api/interest-rates-fd`

| | |
|--|--|
| **Method** | `GET` |
| **Source** | FD calculator (`calculateFd()` in `main.js`) |
| **Rows** | **19** |
| **Fields** | `paidIn` (`monthly` \| `annually` \| `maturity`), `period` (months as string), `rate` (string % p.a.) |

**Live sample (2026-07-20):**

| period (m) | paidIn | rate % |
|-----------:|--------|-------:|
| 1 | monthly | 8.00 |
| 2 | monthly | 8.25 |
| 3 | monthly | 9.00 |
| 4 | monthly | 9.00 |
| 6 | monthly | 9.75 |
| 12 | monthly | 9.55 |
| 12 | maturity | 10.00 |
| 24 | monthly | 10.00 |
| 24 | annually | 10.45 |
| 24 | maturity | 11.00 |
| 36 | monthly | 9.95 |
| 36 | annually | 10.40 |
| 36 | maturity | 11.50 |
| 48 | monthly | 9.85 |
| 48 | annually | 10.30 |
| 48 | maturity | 12.00 |
| 60 | monthly | 9.75 |
| 60 | annually | 10.20 |
| 60 | maturity | 12.50 |

**Alignment:** Matches `#interest-rates` → Fixed Deposits HTML (plus AER / eFD columns only on HTML).

**Gap vs HTML:** Special 100–500 day FDs, Udara senior FD, FC/PFC FD, Money Market weekly rate — **HTML only**.

**Lankawa:** **Ship** for standard LKR FD strip / calculator parity. **Park** expecting full deposit catalog from this endpoint alone.

---

## 3. Rates & tariffs HTML (`/rates-tariff`)

### `GET https://www.combank.lk/rates-tariff`

| | |
|--|--|
| **Title** | Interest Rates \| Exchange Rates |
| **Size** | ~580 KB HTML |
| **Tables** | ~56 |
| **Sections (ids)** | `#interest-rates`, `#exchange-rates`, `#general-tariffs`, `#cards-atm-tariffs`, `#lending-rates`, `#treasury-billsbonds-rate-repo-rates` |
| **API embeds** | None — FX converter loads `/api/exchange-rates/` client-side |

Aliases `/interest-rates`, `/rates-tariffs`, `/rates-and-tariffs` → **404**. Canonical path is `/rates-tariff`.

### 3a. Savings / call / money market (`#interest-rates`)

Expand-block product tables (live examples):

| Product | Sample rate (p.a.) | AER |
|---------|-------------------:|----:|
| Regular Savings | 2.00% monthly | 2.02 |
| Arunalu Children’s | 3.50% | 3.56 |
| Isuru Minors' | 9.00% | — |
| Dotcom Teen | 2.50% | 2.53 |
| Vibe Savings | 2.25% | 2.27 |
| Anagi Women's | 2.25% | 2.27 |
| Power Bonus | 2.00% (+60% bonus → AER 3.24) | 3.24 |
| Super Saver | 2.00–3.00% by balance | 2.02–3.04 |
| Yasasa Pensioners' | 2.00% / 2.50% (&lt;60 / ≥60) | 2.02 / 2.53 |
| Udara Senior — savings | 2.50% | 2.53 |
| Udara Senior — FD monthly / maturity | 9.80% / 10.25% | 10.25 / 10.25 |
| Millionaire Investment Plan | 9.00% | — |
| Seven Days Call | 2.00% / 3.00% by balance | — |
| Money Market | **This week’s rate 7.50%** (Tue–Mon) | — |
| Special 100/200/300/400/500 Days FD | 9.50 / 10.00 / 10.25 / 10.00 / 10.50 | 9.83–10.34 |

**Lankawa:** **Ship** HTML parse for savings + special FD + money-market week rate. Prefer JSON for standard FD tenors.

### 3b. AWPR / AWPLR

| Term | On combank.lk? |
|------|----------------|
| **AWPR** | **0 hits** on `/rates-tariff` and homepage |
| **AWPLR** | **15 hits** under `#lending-rates` — spreads only, **no published numeric AWPLR** |

Examples: Home loan floating/hybrid **AWPLR + 3.00%**; agri floating **AWPLR+3.50%**; advances vs FC deposits **AWPLR + 1.50%**.

**Lankawa:** **Park** “ComBank AWPR”. For prime-rate context use **CBSL AWPLR** (or similar official series), then optionally show ComBank **spread products** from lending HTML.

### 3c. Lending (`#lending-rates`) — effective from 05 Jun 2026

| Product | Sample |
|---------|--------|
| Lease Standard 1y–7y | 13.00% → 16.00% |
| Personal loan Standard 1y–7y | 14.50% → 17.00% |
| Home loan Standard fixed 3y–15y | 14.00% → 16.00%; 15–20y **AWPLR+3%*** |
| Gold / pawning short-term | 13.00%–15.00% |
| Overdraft | 16.00%; temporary 22.00%; casual excess 29.00% |

**Lankawa:** **Ship** optional lending strip (personal/home/gold) with “indicative / conditions apply” disclaimer. **Park** deep fee schedules.

### 3d. REPO / outright T-bill HTML (week of 16–22 Jul 2026)

| Instrument | Sample |
|------------|--------|
| REPO ≥ LKR 1.0M | 1m 8.00%, 3m 9.00%, 6m 9.75%, 12m 10.00% |
| Outright T-bill ≥ LKR 5.0M | 3m 9.70%, 6m 9.80%, 12m 9.90% |

**Lankawa:** **Park** unless building a treasury-investor board (niche vs household FD).

### 3e. FC account rate tables (under exchange section)

PFC/BFC FD (USD 1m–1y 3.00–4.25%), FC savings (USD 1.00%), FC Plus tiered, Forex Plus multi-year, FC children’s (USD 3.50%). HTML only.

**Lankawa:** **Park** unless NRFC/PFCA comparison is in scope.

### 3f. General + cards/ATM tariffs

Fee tables (service charges, remittance fees, card annual fees, **28% APR / 2.33% monthly** w.e.f. 01.07.2026 on premium cards).

**Lankawa:** **Park** for product UI; not a daily civic pulse.

---

## 4. Card promotions (known + reconfirmed)

| URL | Method | Result | Fit |
|-----|--------|--------|-----|
| `/rewards-promotions` | GET HTML | **72** detail URLs; supermarket **6** (+1 premium Keells) | **Ship** (wired in `card-offers.ts`) |
| `/rewards-promotion/{cat}/{slug}` | GET HTML | T&Cs, min/max bill | Ship detail enrichment |
| `/api/s-offers` | GET JSON | `[]` | Park canary |
| `/assets/offers/js/offers.json` | GET JSON | 337 rows, `to` ≤ 2019 | Park — stale |
| `/seasonal-offers` | GET HTML SPA | Uses `/api/s-offers` | Park while empty |

**Supermarket cadence (listing, 2026-07-20):** Glomark 16th & 30th Jul; Laugfs Sun→26 Jul; Keells Sat→25 Jul; Cargills Fri→31 Jul; Spar Tue→28 Jul; Softlogic Glomark Wed→29 Jul; premium Keells 21 Jul.

Expected seasonal item fields (from `main.js` / `card()`): `id`, `name`, `from`, `to`, `category`, `t_c`, `location`, `website`, `social_media`, `credit`, `debit`, `credit_offer`, `debit_offer`, `link`, `thumb`, `phone`.

---

## 5. Every `/api/` JSON surface found

Discovered in `/assets/js/main.js` + `/assets/offers/js/main.js`, then probed live:

| Endpoint | Method | Auth | Live shape | Lankawa |
|----------|--------|------|------------|---------|
| `/api/exchange-rates` | GET | Public | 17 FX rows | **Ship** |
| `/api/interest-rates-fd` | GET | Public | 19 FD rows | **Ship** |
| `/api/treasury-bills-cal` | GET | Public | 18 `{date, rate}` maturity options for calculator (mix of past/future dates; **not** weekly REPO board) | **Park** |
| `/api/s-offers` | GET | Public | `[]` | **Park** |
| `/api/branches` | **POST** | Public (empty body OK) | ~275 KB; groups → children `branch`×276 + `atm`×46; fields: name, branch_code, multilingual city JSON, address HTML, lat/lng, phone, hours, flags | **Park** |
| `/api/cities` | GET | Public | Default **10** cities; `?city=Colombo` filters (prefix match) | **Park** |
| `/api/awards` | GET | Public | 141 awards (`id`, `position`, `year`, `title`, `image`, `description`) — CT often mislabeled `text/html` but body is JSON | **Park** |
| `/api/leaders/{n}` | GET | Public | n=1..4 boards; n=5 → `[]`. Fields: `id`, `name`, `title`, `avatar`, `blurb` | **Park** |

### Probed absent / blocked

- **404:** `/api/interest-rates`, `/api/savings-rates`, `/api/lending-rates`, `/api/awpr`, `/api/awplr`, `/api/fd-rates`, `/api/rates`, `/api/offers`, `/api/card-offers`, `/api/v1/*`, `/api/gold-rates`, `/api/atms`, etc.
- **405:** `GET /api/branches` → message: supported methods **POST**.
- **403 (WAF):** most bare POSTs to GET-only APIs; intermittent 403 on GETs without browser-like headers during burst probes — retry with Chrome UA succeeds.

No other `/api/` strings in site `main.js` / offers `main.js`.

---

## 6. Lankawa mapping

| Product idea | Source | Action |
|--------------|--------|--------|
| Remittance USD TT | `/api/exchange-rates` TT buy/sell | **Shipped** |
| FD rate board / alert | `/api/interest-rates-fd` + special-day HTML | **Ship next** |
| Savings / MMA week rate | `/rates-tariff#interest-rates` | **Ship** HTML |
| Lending / home / gold | `/rates-tariff#lending-rates` | Optional ship |
| AWPR widget | — | **Park** (use CBSL AWPLR) |
| Card supermarket days | `/rewards-promotions` | **Shipped** |
| Branch locator | `POST /api/branches` | Park |

Honesty: all rates indicative; fees/eligibility differ; not advice; not CBSL official unless labeled.

---

## 7. Ops notes

- Cadence: FX daily (or market hours); FD/savings weekly; cards 1–2×/week; branches rare.  
- Prefer `LankawaBot/1.0` + short timeout (verified on FD + FX).  
- Selector risk on HTML: `.expand-block` / `.expand-link` + nested `<table>`.  
- Do not treat `offers.json` or empty `s-offers` as live.

---

## Agent note

Probed 2026-07-20 against live `combank.lk` (browser UA): exchange-rates, interest-rates-fd, treasury-bills-cal, s-offers, branches POST, cities, awards, leaders/1–5, rates-tariff HTML sections, rewards-promotions, seasonal-offers, static offers.json, main.js API inventory, negative `/api/*` sweep. No authenticated banking / APK MITM.

---

## JSON summary

```json
{
  "bank": "Commercial Bank of Ceylon",
  "host": "https://www.combank.lk",
  "probed_at": "2026-07-20",
  "ua": "Mozilla/5.0 Chrome/126 (also LankawaBot/1.0 on FD/FX)",
  "surfaces": [
    {
      "url": "https://www.combank.lk/api/exchange-rates",
      "method": "GET",
      "content_type": "application/json",
      "sample_fields": [
        "id",
        "excode",
        "description",
        "cheque_buying_rate",
        "cheque_selling_rate",
        "currency_buying_rate",
        "currency_selling_rate",
        "telegraphic_transfers_buying_rate",
        "telegraphic_transfers_selling_rate",
        "sync_at",
        "updated_at"
      ],
      "example_live": {
        "excode": "USD",
        "telegraphic_transfers_buying_rate": 332,
        "telegraphic_transfers_selling_rate": 340,
        "sync_at": "2026-07-20",
        "updated_at": "2026-07-20 12:00:03",
        "currency_count": 17
      },
      "variants": {
        "trailing_slash": "same",
        "query_currency_or_code": "ignored_full_array",
        "path_USD": 404,
        "POST": "403_cloudfront"
      },
      "lankawa_fit": "ship",
      "notes": "Already wired in remittance-banks.ts parseCombankUsdTt"
    },
    {
      "url": "https://www.combank.lk/api/interest-rates-fd",
      "method": "GET",
      "content_type": "application/json",
      "sample_fields": ["paidIn", "period", "rate"],
      "example_live": {
        "rows": 19,
        "samples": [
          {"paidIn": "monthly", "period": "3", "rate": "9.00"},
          {"paidIn": "maturity", "period": "12", "rate": "10.00"},
          {"paidIn": "maturity", "period": "60", "rate": "12.50"}
        ]
      },
      "lankawa_fit": "ship",
      "notes": "FD calculator feed; aligns with rates-tariff Fixed Deposits table; misses special-day/FC/Udara"
    },
    {
      "url": "https://www.combank.lk/api/treasury-bills-cal",
      "method": "GET",
      "content_type": "application/json",
      "sample_fields": ["date", "rate"],
      "example_live": {
        "rows": 18,
        "first": {"date": "2022-07-01", "rate": 11.2},
        "last": {"date": "2039-08-15", "rate": 10.5}
      },
      "lankawa_fit": "park",
      "notes": "T-bill calculator maturity dropdown — not weekly REPO/auction HTML board"
    },
    {
      "url": "https://www.combank.lk/api/s-offers",
      "method": "GET",
      "content_type": "application/json",
      "sample_fields": [
        "id",
        "name",
        "from",
        "to",
        "category",
        "t_c",
        "location",
        "website",
        "social_media",
        "credit",
        "debit",
        "credit_offer",
        "debit_offer",
        "link",
        "thumb",
        "phone"
      ],
      "example_live": [],
      "lankawa_fit": "park",
      "notes": "Seasonal SPA canary; empty on probe"
    },
    {
      "url": "https://www.combank.lk/api/branches",
      "method": "POST",
      "content_type": "application/json",
      "sample_fields": [
        "group",
        "children.type",
        "children.name",
        "children.branch_code",
        "children.city",
        "children.address",
        "children.location.latitude",
        "children.location.longitude",
        "children.phone",
        "children.weekdays",
        "children.atm_facilities"
      ],
      "example_live": {
        "groups": "a-z style",
        "branch_count": 276,
        "atm_count": 46,
        "sample_name": "ACHCHUVELY BRANCH"
      },
      "lankawa_fit": "park",
      "notes": "GET returns 405; POST with empty or filter JSON works"
    },
    {
      "url": "https://www.combank.lk/api/cities",
      "method": "GET",
      "content_type": "application/json",
      "sample_fields": [
        "city_id",
        "postal_code",
        "city",
        "district",
        "province",
        "latitude",
        "longitude"
      ],
      "example_live": {
        "default_rows": 10,
        "filter": "?city=Colombo returns prefix matches"
      },
      "lankawa_fit": "park"
    },
    {
      "url": "https://www.combank.lk/api/awards",
      "method": "GET",
      "sample_fields": ["id", "position", "year", "title", "image", "description"],
      "example_live": {"count": 141},
      "lankawa_fit": "park"
    },
    {
      "url": "https://www.combank.lk/api/leaders/{n}",
      "method": "GET",
      "sample_fields": ["id", "name", "title", "avatar", "blurb"],
      "example_live": {
        "leaders_1": 12,
        "leaders_2": 29,
        "leaders_3": 10,
        "leaders_4": 10,
        "leaders_5": 0
      },
      "lankawa_fit": "park"
    },
    {
      "url": "https://www.combank.lk/rates-tariff",
      "method": "GET",
      "content_type": "text/html",
      "sections": [
        "interest-rates",
        "exchange-rates",
        "general-tariffs",
        "cards-atm-tariffs",
        "lending-rates",
        "treasury-billsbonds-rate-repo-rates"
      ],
      "sample_fields": [
        "product expand-link title",
        "Interest Rate (p.a.)",
        "Annual Effective Rate",
        "eFD",
        "AWPLR spreads"
      ],
      "example_live": {
        "regular_savings_pct": 2.0,
        "money_market_week_pct": 7.5,
        "fd_12m_maturity_pct": 10.0,
        "special_500_day_fd_pct": 10.5,
        "personal_loan_standard_1y_pct": 14.5,
        "home_loan_floating": "AWPLR + 3.00%",
        "repo_12m_ge_1m_lkr_pct": 10.0,
        "awpr_mentions": 0,
        "awplr_mentions": 15
      },
      "lankawa_fit": "ship",
      "notes": "Ship savings/lending/special-FD scrape; park fee/tariff tables; no AWPR — AWPLR spreads only"
    },
    {
      "url": "https://www.combank.lk/rewards-promotions",
      "method": "GET",
      "content_type": "text/html",
      "sample_fields": [
        "a.reward href",
        "category",
        "h3 title",
        "offer-tag percentage",
        "valid-date"
      ],
      "example_live": {
        "detail_urls": 72,
        "supermarket": 6,
        "keells": "every Saturday till 25th July 2026",
        "cargills": "every Friday till 31st July 2026"
      },
      "lankawa_fit": "ship",
      "notes": "Already wired in card-offers.ts"
    },
    {
      "url": "https://www.combank.lk/assets/offers/js/offers.json",
      "method": "GET",
      "content_type": "application/json",
      "sample_fields": [
        "name",
        "category",
        "from",
        "to",
        "credit",
        "debit",
        "credit_offer",
        "debit_offer",
        "link",
        "thumb",
        "phone",
        "t_c",
        "location",
        "id"
      ],
      "example_live": {"rows": 337, "max_to": "2019"},
      "lankawa_fit": "park",
      "notes": "Stale static dump — never label live"
    }
  ],
  "absent_or_blocked": [
    "/api/interest-rates",
    "/api/savings-rates",
    "/api/lending-rates",
    "/api/awpr",
    "/api/awplr",
    "/api/fd-rates",
    "/api/rates",
    "/api/offers",
    "/api/card-offers",
    "/api/v1/exchange-rates",
    "/interest-rates",
    "POST /api/exchange-rates"
  ],
  "lankawa_priority": {
    "ship": [
      "GET /api/exchange-rates (done)",
      "GET /api/interest-rates-fd",
      "GET /rates-tariff#interest-rates HTML (savings/special FD/MMA)",
      "GET /rewards-promotions (done)"
    ],
    "park": [
      "AWPR (not published; AWPLR spreads only)",
      "treasury-bills-cal",
      "branches/cities/awards/leaders",
      "s-offers empty + offers.json stale",
      "general/cards tariff fee tables",
      "FC deposit HTML unless NRFC scope"
    ]
  }
}
```
