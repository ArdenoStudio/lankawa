# FoodLK OpenAPI exhaust — all 41 paths

**Probe date:** 2026-07-20  
**Host:** `https://food-platform-backend.fly.dev`  
**Catalog:** `GET /openapi.json` → OpenAPI **3.1.0**, title *Food Price Intelligence API*, version `0.1.0`  
**Path count:** **41** (matches OpenAPI `paths` keys)  
**UA:** `LankawaBot/1.0` (civic-data)  
**Related:** [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md) · [`EXISTING_APIS_UNUSED_ENDPOINTS.md`](./EXISTING_APIS_UNUSED_ENDPOINTS.md) §2.7

Server-side probes only; indicative public data — not advice. Admin routes probed **without** `x-admin-key`.

---

## Verdict

| Metric | Count |
|--------|------:|
| OpenAPI paths | 41 |
| Probed (one method each) | 41 |
| **Non-500** | **9** |
| HTTP 500 | 32 |

OpenAPI / Swagger UI stay up (`/openapi.json` **200**, `/docs` **200**, `/redoc` **200**) while almost all cleaned data routes return **500**. Liveness is split: root `GET /health` → **200** `{"status":"ok"}`, but `GET /api/v1/health` → **500**.

Lankawa should keep failing cleanly to WFP when hub/basket 500; use the nine non-500 surfaces only as canaries / schema / admin-guard signals — not as grocery metrics.

---

## Non-500 (9)

| # | Method | Path | HTTP | Probe note | Shape / notes |
|---|--------|------|-----:|------------|---------------|
| 4 | GET | `/api/v1/ops/database/provider` | **200** | defaults | `provider=supabase-postgres`, `dialect=postgresql`, `is_supabase_host=true`, `database_present=true` — infra hint, not product UI |
| 23 | GET | `/api/v1/hub/manifest` | **200** | defaults | Route map + dataset URLs + sister links (property/vehicle/octane). Works while `hub/summary` 500s — best canary |
| 25 | GET | `/api/v1/retention/subscriptions/schema` | **200** | defaults | Retention field schema (`email`, cadence, channels, districts, …) |
| 36 | POST | `/api/v1/admin/trigger/aggregate` | **403** | no admin key | `{"detail":"Forbidden"}` — auth gate healthy |
| 37 | POST | `/api/v1/admin/trigger/sync` | **403** | no admin key | Forbidden — do not call from Lankawa |
| 38 | POST | `/api/v1/admin/trigger/market-sync` | **403** | no admin key | Forbidden |
| 39 | GET | `/api/v1/admin/status` | **403** | no admin key | Forbidden |
| 40 | GET | `/` | **200** | defaults | `{"name":"Food Price Intelligence API","docs":"/docs"}` |
| 41 | GET | `/health` | **200** | defaults | `{"status":"ok"}` — process liveness (≠ `/api/v1/health`) |

---

## HTTP 500 (32)

All of the cleaned product / intelligence / pipeline / alert write paths probed below returned plain **500** (`Internal Server Error`) on probe day.

| # | Method | Path | Probe args |
|---|--------|------|------------|
| 1 | GET | `/api/v1/health` | — |
| 2 | GET | `/api/v1/platform/freshness` | — |
| 3 | GET | `/api/v1/ops/reliability/summary` | — |
| 5 | GET | `/api/v1/intelligence/brief` | — |
| 6 | GET | `/api/v1/stats/summary` | — |
| 7 | GET | `/api/v1/categories/summary` | — |
| 8 | GET | `/api/v1/home/summary` | — |
| 9 | GET | `/api/v1/intelligence/summary` | — |
| 10 | GET | `/api/v1/compare/districts` | `left=Colombo&right=Kandy` |
| 11 | GET | `/api/v1/compare/sources` | `left=spar&right=keells` |
| 12 | GET | `/api/v1/basket/estimate` | `preset=essentials` |
| 13 | GET | `/api/v1/items` | defaults |
| 14 | GET | `/api/v1/items/{slug}/history` | `slug=rice` |
| 15 | GET | `/api/v1/items/{slug}/history.csv` | `slug=rice` |
| 16 | GET | `/api/v1/items/{slug}/history.json` | `slug=rice` |
| 17 | GET | `/api/v1/items/{slug}` | `slug=rice` |
| 18 | GET | `/api/v1/offers` | defaults |
| 19 | GET | `/api/v1/offers/{offer_id}` | `offer_id=1` |
| 20 | GET | `/api/v1/pipeline/runs` | defaults |
| 21 | GET | `/api/v1/pipeline/status` | defaults |
| 22 | GET | `/api/v1/market-quotes` | defaults |
| 24 | GET | `/api/v1/hub/summary` | — |
| 26 | POST | `/api/v1/retention/subscriptions/preview` | `{"email":"probe@example.com"}` |
| 27 | GET | `/api/v1/trends/market` | `item=Rice` |
| 28 | GET | `/api/v1/trends/summary` | — |
| 29 | GET | `/api/v1/trends/{category}` | `category=staples` |
| 30 | GET | `/api/v1/changes` | — |
| 31 | GET | `/api/v1/embed/summary` | defaults (`kind=basket`) |
| 32 | POST | `/api/v1/alerts/subscribe` | `{"email":"probe@example.com"}` |
| 33 | GET | `/api/v1/alerts/manage/{token}` | `token=probe-token` |
| 34 | POST | `/api/v1/alerts/confirm/{token}` | `token=probe-token` |
| 35 | POST | `/api/v1/alerts/unsubscribe/{token}` | `token=probe-token` |

---

## Full path table (OpenAPI order)

| # | Method | Path | OpenAPI summary | HTTP | Non-500? |
|---|--------|------|-----------------|-----:|:--------:|
| 1 | GET | `/api/v1/health` | Health Check | 500 | no |
| 2 | GET | `/api/v1/platform/freshness` | Platform Freshness | 500 | no |
| 3 | GET | `/api/v1/ops/reliability/summary` | Ops Reliability Summary | 500 | no |
| 4 | GET | `/api/v1/ops/database/provider` | Ops Database Provider | 200 | **yes** |
| 5 | GET | `/api/v1/intelligence/brief` | Intelligence Brief | 500 | no |
| 6 | GET | `/api/v1/stats/summary` | Stats Summary | 500 | no |
| 7 | GET | `/api/v1/categories/summary` | Categories Summary | 500 | no |
| 8 | GET | `/api/v1/home/summary` | Home Summary | 500 | no |
| 9 | GET | `/api/v1/intelligence/summary` | Intelligence Summary | 500 | no |
| 10 | GET | `/api/v1/compare/districts` | Compare Districts | 500 | no |
| 11 | GET | `/api/v1/compare/sources` | Compare Sources | 500 | no |
| 12 | GET | `/api/v1/basket/estimate` | Basket Estimate | 500 | no |
| 13 | GET | `/api/v1/items` | List Items | 500 | no |
| 14 | GET | `/api/v1/items/{slug}/history` | Item History | 500 | no |
| 15 | GET | `/api/v1/items/{slug}/history.csv` | Item History Csv | 500 | no |
| 16 | GET | `/api/v1/items/{slug}/history.json` | Item History Json | 500 | no |
| 17 | GET | `/api/v1/items/{slug}` | Item Detail | 500 | no |
| 18 | GET | `/api/v1/offers` | List Offers | 500 | no |
| 19 | GET | `/api/v1/offers/{offer_id}` | Get Offer | 500 | no |
| 20 | GET | `/api/v1/pipeline/runs` | Pipeline Runs | 500 | no |
| 21 | GET | `/api/v1/pipeline/status` | Pipeline Status | 500 | no |
| 22 | GET | `/api/v1/market-quotes` | Market Quotes | 500 | no |
| 23 | GET | `/api/v1/hub/manifest` | Hub Manifest | 200 | **yes** |
| 24 | GET | `/api/v1/hub/summary` | Hub Summary | 500 | no |
| 25 | GET | `/api/v1/retention/subscriptions/schema` | Retention Subscription Schema | 200 | **yes** |
| 26 | POST | `/api/v1/retention/subscriptions/preview` | Retention Subscription Preview | 500 | no |
| 27 | GET | `/api/v1/trends/market` | Get Market Price Trends | 500 | no |
| 28 | GET | `/api/v1/trends/summary` | Get Trends Summary | 500 | no |
| 29 | GET | `/api/v1/trends/{category}` | Trends | 500 | no |
| 30 | GET | `/api/v1/changes` | Get Price Changes | 500 | no |
| 31 | GET | `/api/v1/embed/summary` | Embed Summary | 500 | no |
| 32 | POST | `/api/v1/alerts/subscribe` | Subscribe Alert | 500 | no |
| 33 | GET | `/api/v1/alerts/manage/{token}` | Manage Alert | 500 | no |
| 34 | POST | `/api/v1/alerts/confirm/{token}` | Confirm Alert | 500 | no |
| 35 | POST | `/api/v1/alerts/unsubscribe/{token}` | Unsubscribe Alert | 500 | no |
| 36 | POST | `/api/v1/admin/trigger/aggregate` | Trigger Aggregate | 403 | **yes** |
| 37 | POST | `/api/v1/admin/trigger/sync` | Trigger Sync | 403 | **yes** |
| 38 | POST | `/api/v1/admin/trigger/market-sync` | Trigger Market Sync | 403 | **yes** |
| 39 | GET | `/api/v1/admin/status` | Admin Status | 403 | **yes** |
| 40 | GET | `/` | Root | 200 | **yes** |
| 41 | GET | `/health` | Health | 200 | **yes** |

---

## Catalog meta (not in the 41 `paths`)

| URL | HTTP | Notes |
|-----|-----:|-------|
| `GET /openapi.json` | **200** | Source of this exhaust (26 KB) |
| `GET /docs` | **200** | Swagger UI |
| `GET /redoc` | **200** | ReDoc |
| `GET /openapi.yaml` | 404 | YAML twin not published |

---

## Lankawa implications

1. **Preferred cleaned calls still 500:** `hub/summary`, `basket/estimate?preset=essentials`, plus legacy `stats/summary` / `categories/summary` / `home/summary` — keep WFP → SPAR → Life → seed bypass ([`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md)).
2. **Canary:** poll `GET /api/v1/hub/manifest` (200 today). When `hub/summary` returns non-500 with real coverage, resume live FoodLK metrics.
3. **Do not** treat `/health` 200 or admin 403 as “food data is live.”
4. **Never** call admin triggers from Lankawa; never chase supermarket guest APIs as a FoodLK substitute.
