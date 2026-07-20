# Existing APIs — unused sibling endpoints

**Probe date:** 2026-07-20  
**Scope:** Inventory of `src/lib/integrations/`, then live probes of unused siblings on hosts Lankawa already calls.  
**UA:** `LankawaBot/1.0` (civic-data). Server-side only; indicative public data — not advice.

Related deep-dives (bank hosts): [`BANK_API_DEEP_DIVE_HNB.md`](./BANK_API_DEEP_DIVE_HNB.md) · [`BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`](./BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md) · [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md) · [`CSE_API_DOCS.md`](./CSE_API_DOCS.md) · [`WEATHER_DISASTER_APIS_RESEARCH.md`](./WEATHER_DISASTER_APIS_RESEARCH.md) · [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md) · [`CEB_DEMAND_MGMT_CLUSTERS.md`](./CEB_DEMAND_MGMT_CLUSTERS.md)

---

## 1. Integration inventory (`src/lib/integrations/`)

| File | Role / primary host |
|------|---------------------|
| `aqi.ts` | OpenAQ PM2.5 (not Open-Meteo) |
| `brief.ts` | Morning brief assembly |
| `card-offers.ts` | Bank supermarket card days (Sampath, HNB Venus, ComBank HTML, peers) |
| `cbsl.ts` | CBSL FX HTML/tables |
| `cricket.ts` | CricAPI |
| `cse.ts` | `cse.lk/api` market + notices |
| `demand-mgmt-clusters.ts` | CEB Care `GetDemandMgmtClusters` |
| `dengue.ts` | Epidemiology weekly reports |
| `earthquake.ts` | USGS events |
| `firms.ts` | NASA FIRMS fires |
| `flood.ts` | lk-flood-api (+ Irrigation ArcGIS stale fallback) |
| `food.ts` | FoodLK cleaned API → Life fallback |
| `food-direct.ts` | WFP HDX CSV |
| `food-harti-cbsl.ts` | HARTI/CBSL PDF stubs (not live) |
| `food-spar.ts` | SPAR2U `products.json` thin bypass |
| `gdacs.ts` | GDACS multi-hazard |
| `glofas.ts` | Open-Meteo Flood / GloFAS |
| `irrigation-gauges.ts` | Irrigation ArcGIS `gauges_2_view` |
| `landslide.ts` | nuuuwan DMC landslide JSON |
| `leco.ts` | LECO outages HTML |
| `life.ts` | Life Platform federation |
| `lpg.ts` | Litro / LAUGFS LPG HTML |
| `marine.ts` | Open-Meteo Marine |
| `metdept.ts` | MetDept WAS advisories + CAP EN RSS |
| `news.ts` / `news-cluster.ts` | RSS + clustering |
| `octane.ts` | Octane fuel API |
| `power.ts` | CEB Care load-shedding / outages |
| `propertylk.ts` | PropertyLK districts |
| `remittance-banks.ts` | Bank FX boards (ComBank, HNB, Sampath, …) |
| `singer-emi.ts` | Singer EMI JSON |
| `tenders.ts` | Promise.lk procurements |
| `vehicle.ts` | Vehicle Platform stats |
| `weather.ts` | Open-Meteo forecast |

*(Plus matching `*.test.ts` files.)*

**Also outside this folder but host-relevant:** `src/lib/nwsdb.ts` → NWSDB `BillCalculator`.

---

## 2. Host deep-dives — used vs unused siblings

For each host: **what Lankawa uses now**, **siblings that respond with useful JSON/HTML**, **product fit**.

---

### 2.1 `venus.hnb.lk` (HNB Venus CMS API)

**Adapters:** `remittance-banks.ts`, `card-offers.ts`  
**Catalog:** [`BANK_API_DEEP_DIVE_HNB.md`](./BANK_API_DEEP_DIVE_HNB.md) (57 SPA paths mined)

#### Used now

| Endpoint | Use |
|----------|-----|
| `GET /api/get_exchange_rates_contents_web` | Remittance USD buy/sell (`buyingRate`/`sellingRate`) |
| `GET /api/get_all_web_card_promos?page&limit&cardType=credit` | Paginated credit card promos → supermarket DOW filter |

#### Unused siblings that respond usefully (live 2026-07-20)

| Endpoint | HTTP / shape | Notes |
|----------|--------------|-------|
| `GET /api/get_rates_contents_web` | 200 `{ ex, ir, lastUpdate }` | FX with `updated_on` + deposit teaser strip |
| `GET /api/get_exchange_rate_last_update_date_contents` | 200 `[{ lastUpdatedDate }]` | As-of stamp (`2026-07-20`) |
| `GET /api/get_interest_rates_contents` | 200 ~46 KB | Savings/FD/pawning/treasury tables (`table_data_approved`) |
| `GET /api/get_web_card_promo?id=` | 200 detail | HTML `content` with weekday, min bill, T&Cs |
| `GET /api/get_all_web_card_promos?…&cardType=debit` | 200; **93** debit | Includes Glomark debit supermarket |
| `GET /api/get_all_card_promotion_categories` | 200; 16 cats | Filter metadata only (list ignores `category=`) |
| `GET /api/get_all_pcard_promotions` | 200; ~20 featured | Hotels/EMI — no grocery |
| `GET /api/get_remittance_houses_contents` | 200; 111 partners | Names/countries — **no** TT quotes |
| `GET /api/get_retail_services_tariff_contents` | 200; ~204 rows | Includes 1% fuel surcharge note |
| `GET /api/get_branch_locator_contents` (+ weekend banking) | 200 | ATM/CDM locator |
| `GET /api/get_treasury_commentary_contents` | 200 → PDF URL | Daily commentary PDF |
| `GET /api/get_shares_and_debentures_contents` | 200 | HNB ticker metadata (CSE covers this) |

**Dead / auth-gated (do not ship):** `search_card_promotions` → 404; guessed `get_gold_rates` / `get_interest_rates` short names → 404; all `post_*_form_contents` → 401 reCAPTCHA; `get_exchange_rates_contents` (no `_web`) → 401.

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P0** | `get_web_card_promo?id=` | Parse weekday/min-bill when list title is thin |
| **P0** | `cardType=debit` | Debit Glomark / supermarket days |
| **P1** | `get_rates_contents_web` + last-update | Remittance as-of + FX freshness |
| **P1** | `get_interest_rates_contents` | Economy FD/savings/pawning-advance strip |
| **Park** | Remittance houses, branch locator, prestige partners, tariff dump | Not morning-check core |

---

### 2.2 `sampath.lk`

**Adapters:** `remittance-banks.ts` (`/api/exchange-rates`), `card-offers.ts` (`/api/card-promotions?category=super_markets`)  
**Catalog:** [`BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`](./BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md)

#### Used now

| Endpoint | Use |
|----------|-----|
| `GET /api/exchange-rates` | USD `TTBUY`/`TTSEL` remittance |
| `GET /api/card-promotions?category=super_markets&page_number&size` | Supermarket card days (5 live rows) |

#### Unused siblings that respond usefully

| Endpoint | HTTP / shape | Live notes |
|----------|--------------|------------|
| `GET /api/card-promotions` (no category) | 200; **total 97** | Full offer board |
| `GET /api/card-promotions?category=dining` | 200; **17** | Dining strip |
| `…category=hotels` | 200; **36** | Hotels |
| `…category=Electronics_and_Furniture` | 200; **14** | EMI/appliance adjacency |
| `…category=VISA_Offers` | 200; **8** | Visa co-brand |
| `…category=travel_and_leisure` | 200; **4** | Travel |
| `…category=health_and_insurance` | 200; **3** | Health |
| `…category=online` / `fashion` / `Premium_Offers` / `Other` | 200 | Smaller slices |
| `GET /api/offer-catergories` | 200; 13 cats | Category dictionary (typo in path) |
| `GET /api/rates-and-charges/external` | 200 JSON | **Live** LKR savings + term + T-bill/REPO |
| `GET /api/rates-and-charges/foreignRates` | 200 JSON | FCY savings/term |
| `GET /api/rates-and-charges` | 200 JSON | CMS copy — **staler** than `/external` |
| `GET /api/currency-rates` | 200; 29 rows | Encashment (`CURRT`), not TT |
| `GET /api/branches` | 200; **316** branches | lat/lng, hours, phones |
| `GET /api/sliders` | 200; **223** | Marketing CMS — low civic value |
| `GET /api/products` | 200 ~1.7 MB | Product CMS chrome |
| `GET /api/daily-market-reports` | 200 | PDF links |
| `GET /api/bank-holidays` | 200 | Holiday HTML tables |

Empty categories probed (`travel`, `fuel`, `online_shopping`, `lifestyle`, `healthcare` slug variants) → `total: 0` (wrong slugs; use enumerated categories above).

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P0** | `/api/rates-and-charges/external` | Deposit/FD board next to remittance |
| **P1** | Other `card-promotions` categories | Optional dining/electronics chips — keep supermarket primary |
| **P2** | `foreignRates` | NRFC/FCY deposit compare |
| **Park** | `branches`, `sliders`, `products`, stale CMS rates | Locator/marketing |

---

### 2.3 `cse.lk` (`www.cse.lk/api`)

**Adapter:** `cse.ts`  
**Catalog:** [`CSE_API_DOCS.md`](./CSE_API_DOCS.md)

#### Used now

| Endpoint | Use |
|----------|-----|
| `POST /aspiData`, `/snpData` | Index levels |
| `POST /marketStatus`, `/marketSummery`, `/dailyMarketSummery` | Session + EOD / foreign-domestic |
| `POST /tradeSummary` | Local top g/l (from board) |
| `POST /allSectors` + `/GICSSectorSummery` | Sector heat + PER/PBV/DY join |
| `POST /mostActiveTrades` | Most active |
| `GET /notifications` + `POST /approvedAnnouncement` | Notices strip |
| `POST /companyInfoSummery` (form `symbol`) | Watchlist quotes |

#### Unused siblings that respond usefully (re-probed 2026-07-20)

| Endpoint | HTTP / shape | Notes |
|----------|--------------|-------|
| `POST /topGainers` | 200 list[10] | Dedicated movers (`symbol`, `price`, `changePercentage`) |
| `POST /topLooses` | 200 list[10] | CSE spelling |
| `POST /mostActiveVolumes` | 200 list[10] | Volume leaders |
| `POST /sectorHighLow` (form `sectorId=1`) | 200 | ASPI open/high/low |
| `POST /52WeekSectors` (form `sectorId=1`) | 200 | 52w / YTD change |
| `POST /listAllSectors` | 200 `content[22]` | Sector master ids/labels |
| `POST /marketIndices` | 200 nested | GICS rows without ASI/SL20 (redundant vs `allSectors`) |
| `POST /getAnnouncementByCompany` | 200; form symbol+dates | Per-symbol disclosures |
| `POST /getFinancialAnnouncement` | 200; 10 financial PDFs | Annual/quarterly |
| `POST /circularAnnouncement` / `/directiveAnnouncement` | 200; 5 each | Regulatory |
| `POST /getNonComplianceAnnouncements` | 200 | Sparse |
| `GET /news/web?top=true&type=CN&numberOfRecord=3` | 200 `{ CN: […] }` | Press teasers |
| `GET /corporateAnnouncementCategory` | 200 list[53] | Category metadata |
| `GET /smd/categories` | 200 list[57] | Filter dictionary |
| `POST /getBuyInBoardAnnouncements` | 200; **210** | Noisy dump |
| `POST /getNewListingsRelatedNoticesAnnouncements` | 200; **262** | Noisy dump |

**400 / avoid:** guessed `equityList`, `marketDepth`, `lastTrades`, `topGainersByPercentage`, etc. without correct body.

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P1** | `sectorHighLow` / `52WeekSectors` | Fill ASPI high/low / range when `aspiData` sparse |
| **P1** | `getAnnouncementByCompany` | Watchlist per-symbol notices |
| **P2** | Dedicated `topGainers` / `topLooses` / `mostActiveVolumes` | Clearer than deriving from `tradeSummary` |
| **P2** | `getFinancialAnnouncement` | PDF link-out for major names |
| **Skip** | Buy-in / new-listings / COVID dumps | Economy card noise |

---

### 2.4 `cebcare.ceb.lk`

**Adapters:** `power.ts`, `demand-mgmt-clusters.ts`

#### Used now

| Endpoint | Use |
|----------|-----|
| `GET /Incognito/DemandMgmtSchedule` | Antiforgery bootstrap (HTML) |
| `GET /Incognito/GetDemandMgmtClusters?LoadShedGroupId=A–Y` | Cluster + customer counts (`demand-mgmt-clusters.ts`) |
| `POST /Incognito/GetLoadSheddingEvents` | Scheduled events (`power.ts`) |
| `GET /Incognito/GetProvinces` | Province list |
| `GET /Incognito/GetAreasByProvince?provinceId=` | Areas |
| `GET /Incognito/GetOutageLocationsInArea?areaId=` | Present outage sampling |
| `GET /Incognito/GetLoadSheddingGeoAreas?LoadShedGroupId=` | Geo areas for labels |

#### Unused / adjacent that respond

| Path | HTTP / shape | Notes |
|------|--------------|-------|
| `GET /Incognito/OutageMap` | 200 HTML (~34 KB) | Full outage map UI — scrapeable but heavy |
| `GET /Incognito/GetDemandMgmtClusters` polygons (`Points[]`) | Already fetched | **Discarded** today — usable for district heatmaps |
| Letter groups A–Y vs numeric 1–5 | A–Y arrays; 1–5 `{}` | Documented; no new endpoint |

**Probed 404:** `GetPresentOutages`, `GetOutages`, `GetCalendar`, `GetBillCalculator`, `GetTariff*`, `GetInterruptedLocations`, etc.

SignalR client is loaded on schedule pages — no public unauthenticated hub URL documented for civic poll.

#### Lankawa product fit

| Priority | Idea | Fit |
|----------|------|-----|
| **P2** | Keep `Points` (simplified centroids) | District power risk map on `/disaster` |
| **P3** | OutageMap HTML parse | Only if Incognito JSON gaps return |
| **Skip** | Invented bill/tariff Incognito paths | Use PUCSL/LECO/NWSDB elsewhere |

---

### 2.5 `combank.lk`

**Adapters:** `remittance-banks.ts` (`/api/exchange-rates` TT columns), `card-offers.ts` (`/rewards-promotions` HTML)  
**Catalog:** [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md)

#### Used now

| Surface | Use |
|---------|-----|
| `GET /api/exchange-rates` | USD TT buy/sell only |
| `GET /rewards-promotions` (+ detail HTML) | Supermarket card offers |

#### Unused siblings that respond usefully

| Endpoint | HTTP / shape | Notes |
|----------|--------------|-------|
| **Same FX row unused columns** | — | `cheque_*`, `currency_*` rates unused |
| `GET /api/interest-rates-fd` | 200; **19** FD rows | Best structured deposit feed |
| `GET /rates-tariff` HTML | 200 large | Savings / lending / REPO / FC tables |
| `GET /api/s-offers` | 200 `[]` | Seasonal canary (empty) |
| `GET /assets/offers/js/offers.json` | 200; 337 rows | **Stale 2019–2020** — never label live |
| `POST /api/branches` | 200 ~275 KB | 276 branches + 46 ATMs |
| `GET /api/cities` | 200 | City filter helper |
| `GET /api/awards` | 200; 141 | Marketing |
| `GET /api/leaders/{1–4}` | 200 | About chrome |
| `GET /api/treasury-bills-cal` | 200; 18 points | Calculator curve — not auction board |
| `GET /seasonal-offers` | 200 HTML SPA | Uses empty `s-offers` |
| Non-supermarket reward categories | HTML | Dining/travel/healthcare already on listing |

**404:** `/api/offers`, `/api/rewards`, `/api/interest-rates`, `/api/gold-rates`, etc.

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P0** | `/api/interest-rates-fd` | Economy FD strip |
| **P1** | `/rates-tariff` savings/lending scrape | Household rates context |
| **Park** | Branches/cities/awards/leaders | Locator/about |
| **Park** | Stale `offers.json`; empty `s-offers` | Canary only |

---

### 2.6 Open-Meteo

**Adapters:** `weather.ts` (`api.open-meteo.com/v1/forecast`), `glofas.ts` (`flood-api…/v1/flood`), `marine.ts` (`marine-api…/v1/marine`)

#### Used now

| Host / path | Variables used |
|-------------|----------------|
| Forecast | `current`: temp, weather_code, precip, uv_index; `daily`: uv_index_max, precipitation_sum (7d) |
| Flood | `river_discharge` at basin centroids |
| Marine | wave height/direction/period (+ current velocity available) |

#### Unused siblings that respond usefully

| Host / path | HTTP | Useful payload |
|-------------|------|----------------|
| Same forecast URL — extra vars | 200 | `relative_humidity_2m`, `apparent_temperature`, `cloud_cover`, `wind_speed_10m`, `wind_gusts_10m`; hourly precip probability; daily max/min temp, sunrise/sunset |
| `air-quality-api.open-meteo.com/v1/air-quality` | 200 | PM10/PM2.5, NO₂, O₃, US/EU AQI (Colombo) — **complements** OpenAQ in `aqi.ts` |
| `ensemble-api.open-meteo.com/v1/ensemble` | 200 | Ensemble temp/precip uncertainty |
| `geocoding-api.open-meteo.com/v1/search` | 200 | Place search (3 Colombo hits) |
| `historical-forecast-api.open-meteo.com/v1/forecast` | 200 | Past daily series |
| `previous-runs-api.open-meteo.com/v1/forecast` | 200 | Model-run comparison |
| `seasonal-api.open-meteo.com/v1/seasonal` | 200 | Seasonal outlook |
| `climate-api.open-meteo.com/v1/climate` | 200 (with valid monthly vars) | Climate normals |
| Model shortcuts `…/v1/gfs`, `/gem`, `/jma` | 200 | Alternate models |
| `customer-api.open-meteo.com` | **401** | Needs API key — skip |

DNS miss here: `elevation-api.*`, `satellite-radiation-api.*` (elevation already embedded in forecast responses).

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P1** | Forecast humidity/wind/hourly rain % | Richer pulse / district weather without new host |
| **P1** | Air-quality API | Backup/complement when OpenAQ lags |
| **P2** | Ensemble / seasonal | “Confidence” / monsoon context on `/disaster` |
| **Park** | Historical/climate deep archives | Analytics, not morning check |

---

### 2.7 FoodLK (`food-platform-backend.fly.dev`)

**Adapter:** `food.ts`  
**OpenAPI:** `GET /openapi.json` (41 paths) — live catalog even when data routes 500

#### Used now

| Endpoint | Role |
|----------|------|
| `GET /api/v1/hub/summary` | Preferred coverage metrics |
| `GET /api/v1/basket/estimate?preset=essentials` | Staples basket |
| Fallbacks: `/stats/summary`, `/categories/summary`, `/home/summary` | Legacy cleaned |

*(All preferred/legacy data routes returned **HTTP 500** on probe day — Lankawa correctly fails to WFP.)*

#### Unused siblings (OpenAPI + probe)

| Endpoint | Probe | Notes |
|----------|-------|-------|
| `GET /api/v1/hub/manifest` | **200** | Route map, datasets, sister links — works while hub/summary 500s |
| `GET /health` (root) | **200** `{"status":"ok"}` | Liveness (≠ `/api/v1/health` which 500s) |
| `GET /api/v1/offers` | 500 | Retail offers list |
| `GET /api/v1/market-quotes` | 500 | Market quotes |
| `GET /api/v1/items`, `/items/{slug}`, `/history` | 500 | Item series |
| `GET /api/v1/changes` | 500 | Price changes |
| `GET /api/v1/trends/summary`, `/trends/{category}` | 500 | Trends |
| `GET /api/v1/trends/market?item=` | 500 (422 without `item`) | Market trends |
| `GET /api/v1/compare/districts`, `/compare/sources` | 500 (422 without params) | Compare |
| `GET /api/v1/intelligence/brief`, `/intelligence/summary` | 500 | Intelligence |
| `GET /api/v1/embed/summary` | 500 | Embed basket |
| `GET /api/v1/platform/freshness`, `/pipeline/*`, `/ops/reliability/summary` | 500 | Ops |
| `GET /api/v1/ops/database/provider` | **200** | Infra hint (not product UI) |
| `GET /api/v1/retention/subscriptions/schema` | **200** | Alert schema |
| Alert subscribe/confirm/manage | OpenAPI | User alerts — product decision |
| Admin trigger/* | 403/admin | Do not call |

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P0** | Keep polling hub + essentials basket | Resume live when FoodLK recovers |
| **P1** | `hub/manifest` | Health/canary + discover new cleaned routes |
| **P1** | `/changes`, `/trends/*`, `/items/{slug}/history` | Food pulse deepen **after** 500s clear |
| **P2** | `compare/districts` | COL / district food compare |
| **Park** | Alerts subscribe, ops/admin | Separate product surface |
| **Never** | Raw supermarket guest APIs from Lankawa | Stay FoodLK-only ([`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md)) |

---

### 2.8 Octane (`octane-api.fly.dev`)

**Adapter:** `octane.ts`  
**OpenAPI:** `/openapi.json` / `/docs`

#### Used now

| Endpoint | Use |
|----------|-----|
| `GET /v1/prices/latest` | CPC pump prices (pulse/economy) |
| `GET /v1/prices/history` | Fuel history |
| `GET /v1/prices/changes` | Revision strip |

#### Unused siblings that respond usefully

| Endpoint | HTTP / shape | Notes |
|----------|--------------|-------|
| `GET /v1/prices/forecast` | 200 | Regression + AI forecast points + embedded sentiment |
| `GET /v1/prices/sentiment` | 200 | News sentiment direction |
| `GET /v1/comparison/world?fuel=` | 200 | SL vs world avg + **BD/IN/NP/PK** neighbors |
| `GET /v1/calculator/trip` | 200 | Trip cost from live CPC |
| `GET /v1/fuels` | 200; 5 fuels | Fuel catalog |
| `GET /v1/health` | 200 `degraded` | Upstream health |
| `GET /v1/prices/history.csv` / `.json` | 200 | Export formats |
| `GET /v1/embed/widget` | 200 HTML | Embeddable widget |
| `POST /v1/alerts/subscribe` (+ manage) | OpenAPI | User price alerts |
| `POST /v1/digest/subscribe` | OpenAPI | Email digest |

**404:** `/v1/market-context` (frontend may still reference; API removed).

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P0** | `/v1/comparison/world` | Economy “vs neighbours” chip (data already on pulse COL story) |
| **P1** | `/v1/prices/sentiment` + forecast | Fuel outlook note (label model/sentiment honestly) |
| **P2** | Trip calculator | Optional household tool |
| **Park** | Alerts/digest/embed | Sister Octane product surfaces |

---

### 2.9 Irrigation ArcGIS (`services3.arcgis.com/J7ZFXmR8rSmQ3FGf`)

**Adapter:** `irrigation-gauges.ts` → `gauges_2_view/FeatureServer/0`  
**Org root:** `/arcgis/rest/services?f=pjson` → **48** FeatureServers

#### Used now

| Layer | Use |
|-------|-----|
| `gauges_2_view` (L0, ~6391 time-series rows) | Latest-per-gauge water level / rain / alert thresholds |

#### Unused siblings with useful civic JSON (live counts)

| Service | Layer highlight | Count / fields | Fit |
|---------|-----------------|----------------|-----|
| **`24hr_rainfall`** | Aggregated polygons | **41** stations; `sum_rain_fall`, basin, lat/lon | **P0** rainfall companion to gauges |
| **`hydrostations`** | Static stations | **42**; coords + basin | **P1** station master / map pins |
| **`Flood_Map`** | Inundation DSD/GND | e.g. L3 DSD **9**, L4 GND **417**; `Flooding_area` | **P1** historical inundation overlay |
| **`Flood__Nov2025`** | Event polygons | **7** basins | **P2** recent event basemap |
| Flood survey services (`service_c177…`, `65c8…`) | `flood_dpth_m` points | **1065** / **38** | **P2** crowd depth points (civic republish) |
| **`Scheme_Data_view` / `_2`** | Tanks, anicuts, sluices | Tanks **353**+; anicuts **395** | **P2** reservoir/scheme atlas |
| **`river_basins` / `rivers`** | Polylines/polygons | 727 / 3379 | **P3** basemap |
| **`Irrigation_Offices`** | Offices | **313** | Park locator |
| **`Inundation_Buildings`** | Buildings | **67k** | Heavy — park |
| Many catchment/WFL engineering layers | Contours, bunds, … | Large | Park (engineering, not morning alerts) |

Sample `24hr_rainfall` tip (probe): Putupaula 20.2 mm, Deraniyagala 14.5, Hanwella 12.3.

#### Lankawa product fit

| Priority | Layer | Fit |
|----------|-------|-----|
| **P0** | `24hr_rainfall` | `/disaster` rainfall strip beside gauges |
| **P1** | `Flood_Map` GND/DSD | Context polygons (label historical/event, not live warning) |
| **P1** | `hydrostations` | Stable gauge coordinates |
| **P2** | Scheme tanks | “Major tanks” atlas |
| **Honesty** | All Irrigation layers | Civic republish — not DMC official warning |

---

### 2.10 NWSDB (`ebis.waterboard.lk`)

**Adapter:** `src/lib/nwsdb.ts` (not under `integrations/`)

#### Used now

| Endpoint | Use |
|----------|-----|
| `POST /api_nwsdb/bill/BillCalculator` | Domestic bill estimate (`CategoryId`, `NoOfDays`, `Consumption`) — uses `Calculation.*`; ignores unreliable `Tariff[].UnitRate` |
| Seed slabs from Gazette | Fallback when live fails |
| HTML refs | `directPay/#/BillCalculator`, waterboard tariff page |

#### Unused siblings discovered in DirectPay SPA (`main.*.js`)

| Endpoint | Probe | Notes |
|----------|-------|-------|
| `POST /api_nwsdb/bill/getTariffAdjustment` | **200** `{"data":{"TariffAdjustment":"0.00000"}}` | Adjustment helper for date range + consumption |
| `GET /api_nwsdb/bill/accountDetails?accountNumber=` | **401** unrecognized account | Account-bound — **do not** probe random accounts in product |
| `GET /api_nwsdb/fieldServices/accountBalance?accountNumber=` | 200 error / hang upstream | Account-bound — skip for civic |
| `GET /api_nwsdb/callCenter/complaintStatus?complaintId=` | **401** invalid complaint | Account/ticket-bound |
| `POST /api_nwsdb/bill/ebillRegistration` | 500 without valid payload | Registration — out of scope |
| `POST /api_nwsdb/fieldServices/NCRequestsDataSave` | Write | **Never** call |
| `Api/SelfCare/BillDetails` · `BillDueAmount` · `GetBillWithPending` | Relative to SelfCare base | Account-authenticated self-care — **out of scope** |
| `www.waterboard.lk/wp-json` | 200 | WP CMS — tariff page HTML already linked |
| Guessed `/api_nwsdb/bill/GetCategories` etc. | 404 | No public category list API |

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P2** | `getTariffAdjustment` | Optional “adjustment” line on water bill card |
| **Skip** | Account/balance/complaint/e-bill | PII / authenticated SelfCare — not civic morning check |
| **Keep** | Seed + BillCalculator | Current honesty model is correct |

---

### 2.11 MetDept WAS (`was.meteo.gov.lk`)

**Adapter:** `metdept.ts`

#### Used now

| Endpoint | Use |
|----------|-----|
| `GET /dashboard-api/advisories` | Active day hazards (source of truth for “now”) |
| `GET /cap/en/rss.xml` | CAP index; item links → CAP XML (EN only) |

#### Unused siblings that respond usefully

| Endpoint | HTTP / shape | Notes |
|----------|--------------|-------|
| `GET /dashboard-api/hazards` | **200** list[**14**] | Full hazard catalog: level, districts, multilingual summaries — includes **test**/expired rows (`summary: "<p>test</p>"`, `valid_to` in past). **Do not** treat as active without date filter |
| `GET /cap/si/rss.xml` | 200 RSS | Sinhala CAP index |
| `GET /cap/ta/rss.xml` | 200 RSS | Tamil CAP index |
| SPA shell `/` | 200 HTML | UI only |

**Auth / blocked:** `/api/warnings` → 401 Missing API key; `/api/alerts`, `/api/cap`, `/api/advisories`, … → **403**.  
**404 HTML fallback:** `/dashboard-api/forecast`, `/stations`, `/rainfall`, `/warnings`, etc. — no public JSON there.

#### Lankawa product fit

| Priority | Endpoint | Fit |
|----------|----------|-----|
| **P1** | CAP `si` / `ta` RSS (+ XML bodies) | Locale parity on warning pages |
| **P2** | `/hazards` with strict `valid_from`/`valid_to` window | Archive / “recent hazards” — never replace `advisories` |
| **Skip** | Keyed `/api/warnings` | No key in civic stack |

---

## 3. Cross-host priority matrix (unused → ship)

| Pri | Host | Unused endpoint | Product surface |
|-----|------|-----------------|-----------------|
| P0 | HNB | `get_web_card_promo` + debit promos | Card-days accuracy |
| P0 | Sampath | `/api/rates-and-charges/external` | Deposit rates |
| P0 | ComBank | `/api/interest-rates-fd` | Deposit rates |
| P0 | Irrigation | `24hr_rainfall` | Disaster rainfall |
| P0 | Octane | `/v1/comparison/world` | Fuel vs neighbours |
| P0 | FoodLK | Recover hub/basket; use `hub/manifest` canary | Food live path |
| P1 | HNB | `get_interest_rates_contents`, `get_rates_contents_web` | FX as-of + FD/pawning |
| P1 | CSE | `sectorHighLow`, `52WeekSectors`, per-company announcements | Economy deepen |
| P1 | Open-Meteo | Extra forecast vars + air-quality API | Weather / AQI |
| P1 | MetDept | CAP SI/TA | Localized warnings |
| P1 | Irrigation | `Flood_Map`, `hydrostations` | Map context |
| P2 | Sampath | Non-supermarket card categories | Optional chips |
| P2 | CEB | Cluster `Points` centroids | Power map |
| P2 | NWSDB | `getTariffAdjustment` only | Water bill polish |
| Park | Branch locators, CMS sliders, awards, SelfCare account APIs | Not morning check |

---

## 4. Probe method notes

- Prefer **SPA/JS string mining** + OpenAPI over blind path guessing (HNB Venus, ComBank `main.js`, Sampath Nuxt, NWSDB DirectPay bundle, FoodLK/Octane OpenAPI, ArcGIS `?f=pjson`).
- Many bank “category” query params are **ignored** (HNB); Sampath categories must use exact slugs (`super_markets`, `Electronics_and_Furniture`, …).
- FoodLK OpenAPI lists rich siblings, but **data plane 500s** — document existence; do not stamp live until payloads carry metrics.
- Account-bound NWSDB/CEB-authenticated surfaces are listed only to mark **out of scope**.

---

## 5. What this doc is not

- Not a license to scrape authenticated banking/self-care.
- Not a substitute for host-specific deep-dives (linked above).
- Not a claim that unused endpoints are SLAs — HTML/JSON can change without notice.
