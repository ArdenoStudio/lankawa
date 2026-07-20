# FoodLK upstream sources (Lankawa catalog)

Catalog of Food Platform / FoodLK upstream sources — style inspired by [Cookie-Cat21/cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs): URLs, API availability, and the Lankawa call path.

Primary sister repo: [SuvenSeo/Food-Platform](https://github.com/SuvenSeo/Food-Platform) (`docs/DATA_SOURCES.md`).

## Architecture (Lankawa)

```
FoodLK API  ──(200 + real metrics)──►  provenance: live / food_platform_api
     │
     │  HTTP 500 / empty / no metrics
     ▼
WFP HDX CSV (direct)  ──────────────►  provenance: wfp_hdx
     │
     │  fetch/parse fail
     ▼
SPAR2U products.json (1 page)  ─────►  provenance: spar2u / spar2u_retail
     │  (429 / fail → skip)
     ▼
Life /life/overview food domain  ───►  provenance: life_federation
     │  (healthy or degraded OK; skip seed/down fixture-only)
     ▼
food-seed.json  ────────────────────►  provenance: seed
```

**Rule:** Prefer FoodLK sister first. While FoodLK public `/api/v1/*` returns 500s, Lankawa **bypasses** with a direct WFP HDX CSV adapter (`src/lib/integrations/food-direct.ts`), then an optional SPAR2U retail page (`src/lib/integrations/food-spar.ts`). HARTI PDF ingest remains planned on FoodLK; Lankawa does not claim HARTI live yet.

Env: `FOOD_API_BASE` (default `https://food-platform-backend.fly.dev/api/v1`).

---

## Retail (grocery) — ingested by FoodLK

| Source | URL / endpoint | API? | FoodLK status | Lankawa call path |
|--------|----------------|------|---------------|-------------------|
| **SPAR2U** | `https://spar2u.lk/products.json` (paginated `limit`/`page`) | Public JSON catalog | Active in FoodLK | **Direct optional bypass** `food-spar.ts` → `sourceId: spar2u_retail` after WFP fails (1 page, `limit=250`; 429 skips) |
| **Keells** | Guest JSON via `https://zebraliveback.keellssuper.com/1.0` (`Login/GuestLogin` → `WebV2/GetInitialDataCollection`) (+ HTML fallback) | Guest session JSON (CF-gated) | Active in FoodLK | Via FoodLK / Life federation — see [`RETAIL_LOYALTY_APIS_RESEARCH.md`](./RETAIL_LOYALTY_APIS_RESEARCH.md) |
| **Cargills** | `POST /Web/GetDynamicSection/` (+ browser `GetMenuCategoryItemsPagingV3/`) | Dynamic section JSON | Active in FoodLK | Via FoodLK / Life federation; optional future direct `GetDynamicSection` bypass |
| **Glomark** | Category HTML on `glomark.lk`; per-SKU `GET /product-page/variation-detail/{id}` | HTML + per-SKU JSON | Active in FoodLK (HTML) | Via FoodLK only; variation-detail noted for SKU watchlist |

Loyalty apps (Keells Nexus, Cargills Rewards, SPAR Rewards, Softlogic ONE) have **no public offer/points APIs**. Card supermarket-day promos: [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md).

---

## Official market quotes — FoodLK sync + Lankawa bypass

| Source | URL / endpoint | API? | Notes | Lankawa call path |
|--------|----------------|------|-------|-------------------|
| **WFP HDX** | [Dataset](https://data.humdata.org/dataset/wfp-food-prices-for-sri-lanka) · CSV `…/download/wfp_food_prices_lka.csv` | Public CSV (HDX). Suffix without `_lka` → S3 `NoSuchKey`. | Strongest historical retail/wholesale series | **Direct** `food-direct.ts` → `sourceId: wfp_hdx` when FoodLK fails |
| **HARTI** | Index `https://www.harti.gov.lk/daily-price.php` · daily English PDF under `/assets/pdf/food_price/daily/eng/…` | PDF parse | Multi-market veg/fruit | Planned via FoodLK — **not** live in Lankawa yet |
| **CBSL price report** | Index `https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report` · PDF under `/sites/default/files/cbslweb_documents/…` | PDF parse | Selected commodities | FoodLK only; Lankawa treasury yields stay seed (separate path) |
| **DOA SHEP** | `https://infohub.doa.gov.lk/wp-admin/admin-ajax.php?action=get_veg_data&item=…` | WordPress AJAX JSON | **Currently 404** / unstable | Do not call from Lankawa until FoodLK marks healthy |
| **DCS weekly** | `https://www.statistics.gov.lk/InflationAndPrices/StaticalInformation/RetailPrices` | PDF/table discovery | Colombo open-market retail | FoodLK sync only |
| **Fisheries** | `https://www.fisheries.gov.lk/web/index.php/en/statistics/weekly-fish-prices` | Weekly Excel/PDF | Wholesale + selected retail fish | FoodLK sync only |
| **vegeservice.lk** | Public `/api/prices?date=…` | JSON API | Probe often empty for “today” — needs date-range | Candidate; not wired in Lankawa |

---

## FoodLK public API (sister)

Base: `{FOOD_API_BASE}` → typically `https://food-platform-backend.fly.dev/api/v1`

| Endpoint | Role | Lankawa |
|----------|------|---------|
| `GET /stats/summary` | `offers_count`, `sources_count`, … | Tried first; live only if counts/metrics > 0 |
| `GET /categories/summary` | Per-category retail/market medians | Same |
| `GET /home/summary` | Cheapest offers + market quotes | Same |

As of mid-2026 integration checks these often return **HTTP 500**. Empty or error-shaped 200s must **not** be labeled `live`.

Life federation fallback: `GET {LIFE_API_BASE}/life/overview` food domain.

---

## Compliance

- Server-side fetches only; descriptive UA (`LankawaBot/1.0`)
- No cart/checkout automation
- Respect robots/terms; stop on owner request
- Always show provenance: FoodLK live · WFP HDX · SPAR2U · Life · seed
