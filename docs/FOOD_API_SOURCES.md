# FoodLK upstream sources (Lankawa catalog)

Catalog of Food Platform / FoodLK upstream sources — style inspired by [Cookie-Cat21/cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs): URLs, API availability, and the Lankawa call path.

Primary sister repo: [SuvenSeo/Food-Platform](https://github.com/SuvenSeo/Food-Platform) (`docs/DATA_SOURCES.md`).

## Product rule

**SPAR / Keells / Cargills (and Glomark) retail ingestion stays in FoodLK.** Lankawa does **not** chase supermarket guest JSON, Shopify catalogs, or loyalty APIs as a FoodLK replacement path for civic food.

Lankawa only consumes FoodLK **cleaned** surfaces:

- `GET /hub/summary` — coverage counts (offers, market quotes, sources)
- `GET /basket/estimate?preset=essentials` — staples / essentials basket rows

…then falls through the bypass chain below. **Retail APIs are not chased in Lankawa.**

**Fresh civic food** (same-day market bands) still needs **HARTI daily PDF** and **CBSL daily price-report PDF** ingest on FoodLK. Until those land, WFP HDX is a **lagged** public series — not “this morning” shelf prices.

## Architecture (Lankawa)

```
FoodLK cleaned API  ──(200 + real metrics)──►  provenance: live / food_platform_api
  /hub/summary + /basket/estimate?preset=essentials
     │
     │  HTTP 500 / empty / zero coverage / no priced staples
     ▼
WFP HDX CSV (direct)  ──────────────►  provenance: wfp_hdx
     │  (lagged markets — not live supermarket)
     │  hardenings: drop fuel rows; prefer fresher staples near corpus tip;
     │  flag stale sugar/flour; loud corpus as-of on /food
     │  fetch/parse fail
     ▼
SPAR2U products.json (1 page)  ─────►  provenance: spar2u / spar2u_retail
     │  (optional thin bypass only; not a retail-API expansion)
     │  (429 / fail → skip)
     ▼
Life /life/overview food domain  ───►  provenance: life_federation
     │  (healthy or degraded OK; skip seed/down fixture-only)
     ▼
food-seed.json  ────────────────────►  provenance: seed
```

**Call order:** FoodLK (real metrics only) → WFP → SPAR → Life → seed.

**Rule:** Prefer FoodLK cleaned hub/staples first. On 500/empty, fail **cleanly to WFP** without labeling live supermarket. Do not add Keells/Cargills direct scrapers in this repo. HARTI/CBSL PDF ingest remains planned on FoodLK for fresh civic food; Lankawa does not claim HARTI live yet.

Env: `FOOD_API_BASE` (default `https://food-platform-backend.fly.dev/api/v1`).

---

## Retail (grocery) — ingested by FoodLK only

| Source | URL / endpoint | API? | FoodLK status | Lankawa call path |
|--------|----------------|------|---------------|-------------------|
| **SPAR2U** | `https://spar2u.lk/products.json` (paginated `limit`/`page`) | Public JSON catalog | Active in FoodLK | **Not chased as FoodLK substitute.** Optional one-page bypass `food-spar.ts` only after FoodLK + WFP fail |
| **Keells** | Guest JSON via `zebraliveback.keellssuper.com` | Guest session JSON (CF-gated) | Active in FoodLK | **FoodLK only** — never direct from Lankawa |
| **Cargills** | `POST /Web/GetDynamicSection/` (+ browser paging) | Dynamic section JSON | Active in FoodLK | **FoodLK only** — never direct from Lankawa |
| **Glomark** | Category HTML + per-SKU `variation-detail/{id}` | HTML + per-SKU JSON | Active in FoodLK | **FoodLK only** |

Loyalty apps (Keells Nexus, Cargills Rewards, SPAR Rewards, Softlogic ONE) have **no public offer/points APIs**. Card supermarket-day promos (bank HTML/JSON) are a separate household strip — not shelf-price ingest: [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md).

---

## Official market quotes — FoodLK sync + Lankawa bypass

| Source | URL / endpoint | API? | Notes | Lankawa call path |
|--------|----------------|------|-------|-------------------|
| **WFP HDX** | [Dataset](https://data.humdata.org/dataset/wfp-food-prices-for-sri-lanka) · CSV `…/download/wfp_food_prices_lka.csv` | Public CSV (HDX). Suffix without `_lka` → S3 `NoSuchKey`. | Strongest historical series; **publishes with lag**. Parse hardenings (shipped): exclude fuel/petrol/diesel; prefer commodities near corpus tip; mark sugar/flour stale when quote lags tip; surface `corpusAsOf` loudly on `/food` | **Direct** `food-direct.ts` → `sourceId: wfp_hdx` when FoodLK fails — never same-day supermarket |
| **HARTI** | Index `https://www.harti.gov.lk/daily-price.php` · daily English PDF under `/assets/pdf/food_price/daily/eng/…` | PDF parse | Multi-market veg/fruit — **still needed for fresh civic food** | Planned via FoodLK — **not** live in Lankawa yet |
| **CBSL price report** | Index `https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report` · PDF under `/sites/default/files/cbslweb_documents/…` | PDF parse | Selected commodities — **still needed for fresh civic food** | FoodLK only; Lankawa treasury yields stay seed (separate path) |
| **DOA SHEP** | `https://infohub.doa.gov.lk/wp-admin/admin-ajax.php?action=get_veg_data&item=…` | WordPress AJAX JSON | **Currently 404** / unstable | Do not call from Lankawa until FoodLK marks healthy |
| **DCS weekly** | `https://www.statistics.gov.lk/InflationAndPrices/StaticalInformation/RetailPrices` | PDF/table discovery | Colombo open-market retail | FoodLK sync only |
| **Fisheries** | `https://www.fisheries.gov.lk/web/index.php/en/statistics/weekly-fish-prices` | Weekly Excel/PDF | Wholesale + selected retail fish | FoodLK sync only |
| **vegeservice.lk** | Public `/api/prices?date=…` | JSON API | Probe often empty for “today” — needs date-range | Candidate; not wired in Lankawa |

---

## FoodLK public API (sister) — what Lankawa calls

Base: `{FOOD_API_BASE}` → typically `https://food-platform-backend.fly.dev/api/v1`

| Endpoint | Role | Lankawa |
|----------|------|---------|
| `GET /hub/summary` | Nested `coverage`: `offers_count`, `market_quotes_count`, … | **Preferred** cleaned surface; live only if counts > 0 |
| `GET /basket/estimate?preset=essentials` | Essentials staples + `summary.total_lkr` | **Preferred** staples surface; live only if priced items / total > 0 |
| `GET /stats/summary` | Flat offer/source counts | Legacy fallback inside FoodLK path |
| `GET /categories/summary` | Per-category retail/market medians | Legacy fallback |
| `GET /home/summary` | Cheapest offers + market quotes | Legacy fallback |

As of mid-2026 integration checks these often return **HTTP 500**. Empty or error-shaped 200s must **not** be labeled `live`. Fail cleanly to WFP without implying live supermarket shelves.

Life federation fallback: `GET {LIFE_API_BASE}/life/overview` food domain.

---

## Compliance

- Server-side fetches only; descriptive UA (`LankawaBot/1.0`)
- No cart/checkout automation
- Respect robots/terms; stop on owner request
- Always show provenance: FoodLK live · WFP HDX (lagged) · SPAR2U · Life · seed
- Do not chase Keells/Cargills/SPAR retail APIs from Lankawa for FoodLK recovery
