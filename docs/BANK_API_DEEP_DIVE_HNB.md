# Hatton National Bank — Venus API deep dive (Lankawa)

**Status:** Live probe (high thoroughness), 2026-07-20  
**API host:** `https://venus.hnb.lk/api/*` (nginx front + Volterra ADC; Express-style JSON)  
**Public site:** `https://www.hnb.lk` (React SPA; CMS data from Venus)  
**Legacy site:** `www.hnb.net` — **DNS NXDOMAIN from this environment** (2026-07-20); sitemap/JS still reference some `hnb.net` image paths  
**UA used:** `LankawaBot/1.0` (also verified browser Chrome UA)  
**Auth (public GETs):** **None** — open CORS `Access-Control-Allow-Origin: *`  
**Sister wiring:** `src/lib/integrations/remittance-banks.ts` (FX), `src/lib/integrations/card-offers.ts` (card promos)

---

## Verdict

| Surface | Machine-readable? | Live now? | Lankawa fit |
|---------|-------------------|-----------|-------------|
| `get_exchange_rates_contents_web` | **JSON** array (17 FX) | Yes — USD 332.3 / 339.7 | **Ship** (already wired remittance TT) |
| `get_rates_contents_web` | **JSON** `{ex, ir, lastUpdate}` | Yes — FX + deposit highlight strip + date | **Ship** upgrade — richer than web-only FX |
| `get_exchange_rate_last_update_date_contents` | **JSON** `[{lastUpdatedDate}]` | Yes — `2026-07-20` | **Ship** as-of stamp (tiny) |
| `get_all_web_card_promos` | **JSON** paginated (~841) | Yes — supermarket DOW on ~page 7 @ limit=50 | **Ship** (already wired) |
| `get_web_card_promo?id=` | **JSON** detail + HTML `content` | Yes | **Ship** optional — weekday/min-bill from HTML |
| `get_all_card_promotion_categories` | **JSON** 16 categories | Yes | **Park** — list filter params ignored |
| `get_all_pcard_promotions` | **JSON** ~20 featured | Yes — hotels/EMI, no grocery | **Park** for FoodLK card-days |
| `get_interest_rates_contents` | **JSON** savings/FD/loans/leasing/**pawning**/treasury | Yes — tables in `table_data_approved` | **Ship** deposits + gold pawning scale |
| `get_treasury_commentary_contents` | **JSON** → PDF URL | Yes — daily PDF on `assets.hnb.lk` | **Park** (PDF, not JSON rates) |
| `get_remittance_houses_contents` | **JSON** 111 partners / 27 countries | Yes | **Park** — partner names, not TT quotes |
| `get_retail_services_tariff_contents` | **JSON** 204 tariff rows | Yes — includes **1% fuel surcharge** | **Park** morning strip; footnote OK |
| `get_branch_locator_contents` / weekend banking | **JSON** ATM/CDM/CRM + hours | Yes | **Park** (locator, not economy) |
| `search_card_promotions` | Referenced in SPA JS | **404** | **Park** — dead path |
| All `post_*_form_contents` | POST JSON | **401** reCAPTCHA | **Park** — never call |
| Dedicated jewellery / bullion sell rate | — | **None** | **Park** — only pawning advance scale |

**Bottom line:** HNB’s public machine surface is the Venus CMS API behind `hnb.lk`. For Lankawa morning check: keep FX + supermarket card promos; prefer `get_rates_contents_web` when you want `updated_on` + deposit teaser; add `get_interest_rates_contents` for FD/savings/pawning (gold **scale of advance**, not retail jewellery). No separate gold-price API.

---

## Discovery method

1. Existing Lankawa adapters already hit `get_exchange_rates_contents_web` + `get_all_web_card_promos`.  
2. Downloaded `https://www.hnb.lk/static/js/main.eeaa8e5f.js` (~5.4 MB) → constant block `base = "https://venus.hnb.lk" + "/api"` listing **57** paths (42 GET + 14 POST + 1 dead search).  
3. Probed every JS path + ~150 name guesses (`*_contents_web`, gold/pawning, etc.).  
4. Scraped `hnb.lk` sitemap / SPA shell; `hnb.net` unreachable (no DNS). Wayback CDX for `venus.hnb.lk/api/*` timed out from this environment.  
5. Confirmed CORS `*` and OPTIONS allow GET/POST; public GETs need no cookies.

`venus.hnb.lk/` itself is default nginx “Welcome” HTML — only `/api/*` is useful.

---

## Auth & transport

| | |
|--|--|
| **Base** | `https://venus.hnb.lk/api/<endpoint>` |
| **Public GETs** | No API key, no cookie, no Referer required |
| **CORS** | `Access-Control-Allow-Origin: *` |
| **Errors** | `404` `{"status":404,"msg":"Endpoint is not found"}`; admin-ish paths `401`/`403` `{"message":"Unauthorized"}` |
| **POST forms** | `401` `{"error":"Failed reCAPTCHA validation"}` without Google reCAPTCHA token from `hnb.lk` |
| **CDN assets** | PDFs/images under `https://assets.hnb.lk/atdi/...`; card thumbs often `merchants/...` relative (legacy `hnb.net/images/cardpromotions/` — broken DNS here) |

---

## Full catalog (from `hnb.lk` SPA + live probe)

### A. Rates & money (high value)

#### 1. `GET /api/get_exchange_rates_contents_web` — **SHIP** (wired)

| | |
|--|--|
| **URL** | `https://venus.hnb.lk/api/get_exchange_rates_contents_web` |
| **Auth** | None |
| **Shape** | JSON **array** of 17 currencies |
| **Size** | ~1.6 KB |

**Sample keys (per row):** `currency`, `currencyCode`, `buyingRate`, `sellingRate`

**Live USD (2026-07-20):** `buyingRate` 332.3 · `sellingRate` 339.7  

**Currencies:** AUD, GBP, CAD, CNY, DKK, EUR, HKD, INR, JPY, NZD, NOK, SGD, SEK, CHF, THB, AED, USD.

**Lankawa:** Already `parseHnbUsdTt` → remittance board. Treat as indicative TT-style board rates (not CBSL). Prefer pairing with CBSL middle rate.

**Note:** No `updated_on` on this slim endpoint — use §2 or §3 for as-of.

---

#### 2. `GET /api/get_rates_contents_web` — **SHIP** (upgrade)

| | |
|--|--|
| **URL** | `https://venus.hnb.lk/api/get_rates_contents_web` |
| **Auth** | None |
| **Shape** | `{ ex, ir, lastUpdate }` |
| **Size** | ~4.2 KB |

**`ex[]` keys:** `id`, `currency`, `currencyCode`, `buyingRate`, `sellingRate`, `status` (`CURRENT`), `updated_on` (ISO), `updated_by`, `displayOrder`  

**`ir[]` keys:** `title`, `title2`, `description` — homepage-style deposit teasers, e.g.:

| title | description (sample) |
|-------|----------------------|
| Savings Accounts Interest Rates | Singithi Lama: 3.50% |
| Fixed Deposits | 6-Month Maturity Rate: 9.75% |
| Call Deposits | Rate: 3.00% |
| Money Market Savings | Rate: 7.50% |

**`lastUpdate`:** stringified JSON array `[{"id":"...","lastUpdatedDate":"2026-07-20"}]`

**Lankawa:** Prefer this over §1 when adding as-of timestamps; `ir` is a cheap deposit chip but incomplete vs §4.

---

#### 3. `GET /api/get_exchange_rate_last_update_date_contents` — **SHIP** (tiny)

| | |
|--|--|
| **URL** | `https://venus.hnb.lk/api/get_exchange_rate_last_update_date_contents` |
| **Shape** | `[{ id, lastUpdatedDate }]` |
| **Sample** | `lastUpdatedDate: "2026-07-20"` |

---

#### 4. `GET /api/get_interest_rates_contents` — **SHIP** (deposits + pawning/gold)

| | |
|--|--|
| **URL** | `https://venus.hnb.lk/api/get_interest_rates_contents` |
| **Auth** | None |
| **Shape** | `{ status: 200, msg: "Success", data: Category[] }` |
| **Size** | ~46 KB |

**Top categories (`data[].name`):** `Savings` · `Loans` · `Leasing` · `Pawning` · `Treasury`

**Nesting:**

```
data[]
  id, name
  interest_rate_sub_category[]
    id, name, order
    sub_category_division_approved[]
      title, last_reviewed_on, description, only_description
      table_condition  (Draft.js JSON — ignore)
      table_data_approved[]
        id, data  ← stringified JSON: { columns: string[], rows: string[][] }
```

**Savings subcategories:** Savings Accounts · Money Market Savings · Fixed Deposits · Call Deposits · FCA Savings · FCA Fixed Deposits · HNB FC Advantage · Investment Plans  

**Pawning / gold (not jewellery sell):**

Interest table (`last_reviewed_on` 2026-07-01):

| Facility Amount (LKR) | Interest Rate |
|-----------------------|---------------|
| Below Rs. 1 Mn | 14.25% |
| Above Rs. 1 Mn (valid to 31 Jul 2026) | 14.00% |

Scale of advance (`last_reviewed_on` 2026-07-09):

| Karatage | Scale of Advance (LKR) |
|----------|------------------------|
| 24 KT Gold | 258,000/- |
| 22 KT Gold | 235,000/- |

**FD sample** (`Special Fixed Deposits`, reviewed 2026-07-18): columns `Period`, `Rate`, `AER`, `Special Comments` — e.g. 9 Months 10.50% / AER 10.64%.

**Treasury:** T-bill, T-bond, Repo tables (reviewed ~2026-07-17).

**Lankawa:** **Ship** for economy deposit/pawning strip. Parse `table_data_approved[].data` (JSON.parse). Label gold as **pawning advance**, not retail jewellery. **Park** full loan/leasing catalogs for morning check.

---

#### 5. `GET /api/get_treasury_commentary_contents` — **PARK**

| | |
|--|--|
| **Shape** | `[{ id, language, pdfLink }]` |
| **Sample** | `pdfLink: "https://assets.hnb.lk/atdi/TreasuryCommentary/2026-07-20.pdf"` |

Daily commentary PDF — useful link-out, not structured rates.

---

#### 6. `GET /api/get_shares_and_debentures_contents` — **PARK**

Sparse ticker metadata (`HNB.N0000` / `HNB.X0000`, ISIN, dates) — CSE already covered elsewhere.

---

### B. Card promotions (FoodLK / COL)

#### 7. `GET /api/get_all_web_card_promos` — **SHIP** (wired)

| | |
|--|--|
| **URL** | `https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit` |
| **Auth** | None |
| **Query (working)** | `page`, `limit`, `cardType` (`credit` \| `debit`) |
| **Query (ignored)** | `search`, `merchant`, `category`, `categoryId`, `q`, `keyword`, `filter` — **do not change `total`** |
| **Shape** | `{ page, limit, total, totalPages, data: Promo[] }` |

**List keys:** `id`, `title`, `thumb`, `merchant`, `cardType`, `to` (YYYY-MM-DD), `valid` (e.g. `"Valid Until"`)

**Live totals (2026-07-20):** all ~**841**; credit ~**821**; debit ~**93**.

**Supermarket scan (credit, limit=50):** grocery DOW rows clustered on **page 7** (ids 1365 Cargills, 2369 Keells Tue, 2374 LAUGFS Thu, 1253/3839 Glomark). Lankawa `HNB_MAX_PAGES=12` covers this; early-exit after 10 offers is fine if pages include 7.

**Lankawa:** Keep `normalizeHnbOffer` supermarket + weekday filters. Detail fetch (§8) improves “Every Tuesday” when title omits weekday. Update `sourceUrl` to `https://www.hnb.lk/card-promotion` when convenient (`hnb.net` dead here).

---

#### 8. `GET /api/get_web_card_promo?id={id}` — **SHIP** (optional detail)

| | |
|--|--|
| **URL** | `https://venus.hnb.lk/api/get_web_card_promo?id=2369` |
| **Auth** | None |
| **Keys** | `title`, `thumb`, `from`, `to`, `valid`, `cardType`, `content` (HTML), `merchant`, `assets[]` |
| **Without `id`** | `500` `{"error":"error"}` |
| **Path `/id`** | 404 |

**Keells sample content fields (HTML):** Offer %, min bill LKR 4,000, **Every Tuesday**, eligibility HNB Credit Cards, valid to 2026-07-28.

---

#### 9. `GET /api/get_all_card_promotion_categories` — **PARK**

| | |
|--|--|
| **Shape** | `{ status, lastId, lastOrder, data: [{ id, category, order }] }` |

**Categories (order):** Priority Circle, The Club, Club Elite, Hotel, Travel, Dining, Shopping, Lifestyle, Online, Autocare, Other, Fashion, Hospitals, Jewellery, Education, Solar Solutions.

No working server-side category filter on the list endpoint — client-side filter only.

---

#### 10. `GET /api/get_all_pcard_promotions` — **PARK** (for grocery)

| | |
|--|--|
| **Shape** | `{ status: 200, data: Featured[] }` (~20 rows, full HTML `content`) |
| **Keys** | `id`, `title`, `thumbUrl`, `from`, `to`, `card_type`, `content` |

Featured/priority circle style offers (resorts, EMI). **0** supermarket hits in live dump. Pagination query params ignored (full array).

---

#### 11. `GET /api/search_card_promotions` — **PARK** (dead)

Present in SPA URL constants; live probe → **404** `Endpoint is not found`. POST body variants also 404.

---

#### 12. Prestige / Club partner offers — **PARK**

| Endpoint | Notes |
|----------|-------|
| `get_prestige_prime_discount_partners_contents` | ~21 partners; HTML `details`; many 2025 windows |
| `get_top_notch_offers_for_prestige_prime_members_contents` | Tiny/stale (sample period “Till 31 Dec 2023”) |

Not day-of-week grocery.

---

### C. Remittance partners (not FX)

#### 13. `GET /api/get_remittance_houses_contents` — **PARK**

| | |
|--|--|
| **Shape** | `{ status, data: [{ id, country, detail, createdAt, updatedAt, status }] }` |
| **Count** | 111 rows / 27 countries (UAE 26, UK 10, USA 9, …) |

Partner house names only — **no** buy/sell rates. Keep using Venus FX for remittance TT.

Also: `get_correspondent_bank_contents`, `get_representative_officers_contents` — institutional lists; **park**.

---

### D. Tariffs & fees

#### 14. `GET /api/get_retail_services_tariff_contents` — **PARK** (morning) / footnote OK

| | |
|--|--|
| **Shape** | `{ status, data: TariffRow[] }` (~204) |
| **Keys** | `id`, `language`, `category`, `firstColumn`…`fourthColumn` (HTML), `rowSpan`, `status`, timestamps |

**Fuel:** Debit/credit **Fuel Surcharge 1%** of payment value (also under interest/fee structure). Corporate/Business fuel card annual fee rows present.

**Last update:** `get_retail_services_tariff_last_update_contents` → `lastUpdatedDate: "2024-08-02"` (stale stamp vs live table — trust row copy).

#### 15. Related tariff GETs — **PARK**

| Endpoint | Size / note |
|----------|-------------|
| `get_international_tariffs_contents` | ~94 rows (FX notes, remittance fees, SWIFT/API fees) |
| `get_international_tariffs_last_update_contents` | `2025-06-20` |
| `get_trade_services_tariff_contents` | Trade fees |
| `get_trade_services_tariff_last_update_contents` | `2024-05-14` |
| `get_sme_tariffs_contents` | 2 rows facility charges |

---

### E. Locator / hours / CMS chrome — **PARK**

| Endpoint | Live | Keys / note |
|----------|------|-------------|
| `get_branch_locator_contents` | 812 rows | `type`: CRM 343, ATM 295, CDM 160, CHDM 14; `district`, `direction` lat/lng, `address` |
| `get_weekend_banking_contents` | 255 branches | `weekdays`/`saturday`/`sunday` hours, `atm`/`cdm` counts |
| `get_extended_weekend_banking_web` | subset | `{ data, disclaimer, effective_from }` per-branch Sat/Sun |
| `get_branch_locator_notice_contents` | `null`-ish 2B | empty |
| `get_weekend_banking_notification_contents` | **404** | |
| `get_weekendbank_notice_contents` | banner flags | `isActive: false` |
| `get_special_notice_contents` | 9 notices | image/PDF URLs |
| `get_special_notice_popup_contents` | popup banner | |
| `get_special_notification_contents` | small | |
| `get_homepage_notice_contents` | rich HTML | |
| `get_announcements_contents` | list | IR/CSE-style announcements |
| `get_news_new_contents` | **~1.25 MB** | heavy news corpus — do not poll often |
| `get_awards_contents` | ~396 KB | about-us |
| `get_bank_downloads_contents` | PDF index | |
| `get_reports_contents` | annual/interim | |
| `get_board_of_director_contents` | bios | |
| `get_our_corporate_management_contents` | bios | |
| `get_corporate_information_contents` (+ `_second_table`) | about tables | |
| `get_condominium_developer_list_contents` | property partners | |

---

### F. POST form endpoints — **PARK** (all)

From SPA; all require reCAPTCHA:

`post_application_form_contents`, `post_apply_now_form_contents`, `post_balance_transfer_form_contents`, `post_card_upgrade_form_contents`, `post_contact_us_form_contents`, `post_customer_feedback_form_contents`, `post_customer_feedback_form_new`, `post_customer_satisfaction_form_contents`, `post_customer_satisfaction_form_contents_feedback`, `post_data_subject_request_form_contents`, `post_easy_payment_plan_form_contents`, `post_inquiry_form_contents`, `post_the_club_hnb_form_contents`, `post_value_added_benefits_form_contents`

Probe: `POST {}` → `401 Failed reCAPTCHA validation`.

---

### G. Guessed / non-public paths

| Path | Result |
|------|--------|
| `get_gold_rates_contents`, `get_pawning_rates_contents`, … | **404** |
| `get_exchange_rates_contents` (no `_web`) | **401** Unauthorized |
| `get_card_promo_by_id`, `get_all_card_promos` | **403** Unauthorized |
| `get_web_card_promo` (no query) | **500** |
| `/api`, `/api/docs`, `/swagger` | **404** |

---

## Site scrape notes (`hnb.lk` / `hnb.net`)

| Source | Finding |
|--------|---------|
| `https://www.hnb.lk` | SPA shell; all routes return same HTML; data via Venus |
| `asset-manifest.json` + `main.*.js` | **Canonical API inventory** (base `https://venus.hnb.lk/api`) |
| `sitemap.xml` | Product URLs incl. `/card-promotion`, `/personal/pawning`, cards tree — no raw API URLs |
| `www.hnb.net` | **No DNS** here; historical image/PDF hosts still referenced in JS |
| `assets.hnb.lk/atdi/...` | Live PDF/CDN for treasury commentary, downloads |

---

## Lankawa ship / park matrix

| Priority | Action | Endpoint | Product surface |
|----------|--------|----------|-----------------|
| **Done** | Keep | `get_exchange_rates_contents_web` | `/economy` remittance TT |
| **Done** | Keep | `get_all_web_card_promos` (+ optional detail) | `/food` + COL card-days |
| **P1** | Upgrade FX adapter | Prefer `get_rates_contents_web` (or add `updated_on` + lastUpdate) | Remittance as-of honesty |
| **P1** | New adapter | `get_interest_rates_contents` → FD/savings + pawning gold scale | Economy deposit / gold-loan chip |
| **P2** | Detail enrich | `get_web_card_promo?id=` for weekday/min bill | Card-day strip quality |
| **Park** | — | Remittance houses, tariffs, branches, news, prestige, POST forms, dead search | Noise / auth / PDF |

**Honesty copy:** Indicative public HNB Venus rates/offers — confirm on `hnb.lk`. Not CBSL. Not affiliated. Pawning scale ≠ jewellery buy/sell price.

---

## Operational tips

1. **Cadence:** FX + interest once per morning cron; card promos every few hours (841 rows — page 1–12 credit @ 50 is enough for grocery).  
2. **Do not** download `get_news_new_contents` on cron (~1.2 MB).  
3. **UA:** `LankawaBot/1.0` works; no WAF on Venus GETs observed.  
4. **Thumbs:** Prefer not depending on `hnb.net` image hosts; titles/merchants suffice for civic strip.  
5. **Parse interest tables:** `JSON.parse(table_data_approved[i].data)` → `{columns, rows}`.

---

## Related docs / code

- [`CONSUMER_OFFERS_AND_DATA_SURVEY.md`](./CONSUMER_OFFERS_AND_DATA_SURVEY.md) — HNB Venus called out as Tier A  
- [`GOLD_RETAIL_RATES_RESEARCH.md`](./GOLD_RETAIL_RATES_RESEARCH.md) — bank pawning ≠ jewellery  
- `src/lib/integrations/remittance-banks.ts` — `parseHnbUsdTt`  
- `src/lib/integrations/card-offers.ts` — `fetchHnbOffers` / `normalizeHnbOffer`  
- Sister bank deep-dives: [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md), [`BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`](./BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md)
