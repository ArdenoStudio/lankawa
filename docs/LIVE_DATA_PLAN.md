# Live data plan (L0–L6)

Inventory of Lankawa live-data waves. Sister platforms stay **data/attribution** only — never iframes or parallel consumer UIs.

| Wave | Theme | Status |
|------|--------|--------|
| **L0** | API keys & env (`OPENAQ_API_KEY`, `NASA_FIRMS_MAP_KEY`, `FOOD_API_BASE`, …) | Shipped — `.env.example` |
| **L1** | Scrape harden (timeouts, UA, seed honesty, no fake “live”) | Shipped — FoodLK empty-200 not stamped live |
| **L2** | RSS + CBSL path (news feeds, MoH, treasury note) | Shipped — MoH / CPA / Verité RSS; treasury seed + documented path |
| **L3** | Sister platforms (FoodLK, Life, Octane, PropertyLK, Vehicle) | Partial — FoodLK hub/staples → hardened WFP → SPAR → Life → seed; FoodLK still often 500s |
| **L4** | Satellite / remote sensing (FIRMS, NDVI, OpenAQ) | Keys documented; adapters present — not expanded here |
| **L5** | Civic + legal research (CPA, Verité, MoH notices) | Shipped — civic research strip + MoH RSS |
| **L6** | Canary / ops (Telegram failure streaks, provenance badges) | Out of scope — existing ops unchanged |
| **L7** | Bank / household / disaster deepen (this branch) | **Shipped** — see below |

## Food product rule (L3)

- **Retail supermarket APIs are not chased in Lankawa.** SPAR / Keells / Cargills / Glomark ingestion stays in FoodLK.
- Lankawa consumes FoodLK **cleaned** `/hub/summary` and essentials **staples** (`/basket/estimate?preset=essentials`) only — never raw supermarket JSON for the FoodLK path.
- On FoodLK 500/empty: fail cleanly to **WFP HDX** (lagged markets; hardened parse — no fuel rows, fresher staples preferred, stale sugar/flour flagged, loud corpus as-of on `/food`).
- **HARTI daily PDF** and **CBSL daily price-report PDF** ingest on FoodLK are still required for fresh civic food; Lankawa does not claim those live yet.
- Call order: **FoodLK (real metrics) → WFP → SPAR (thin optional) → Life → seed**.

Catalog: [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md).

## Shipped earlier (cursor/live-data-wave)

- News RSS: MoH, CPA, Verité; MoH notices by feed **id**
- Civic research snapshot → seed fallback
- FoodLK cleaned hub/staples → WFP → SPAR → Life → seed
- WFP honesty i18n (not “this morning” shelf copy)

## Shipped on this branch (cursor/live-data-wave-3c69)

- **Supermarket card days** — multi-bank (`card-offers.ts`): Sampath/HNB/Visa JSON + ComBank/DFCC/Pan Asia/People's/NTB HTML; weekday filter; `/food` + COL + economy; `card_day` alert pins
- **Remittance TT** — **7 banks** (`remittance-banks.ts`): ComBank/HNB/Seylan/Sampath JSON + People's/NDB/NSB HTML; per-bank seed
- **WFP hardenings** — drop fuel; prefer quotes near corpus tip; stale sugar/flour; loud corpus as-of on `/food`
- **Irrigation gauges** — ArcGIS FeatureServer on `/disaster`
- **CEB demand clusters** — `GetDemandMgmtClusters` strip on `/economy`
- **NWSDB water bill** — BillCalculator + seed slabs on `/economy`
- **CSE** — notices strip (`GET /notifications` + `POST /approvedAnnouncement`); watchlist quotes via `companyInfoSummery` (`/api/v1/cse/quotes`)

## Not shipping here

- HARTI PDF / CBSL daily price-report PDF parsers inside Lankawa (**still needed on FoodLK**)
- Live CBSL T-bill scrape (seed + documented path only)
- DOA `get_veg_data` or supermarket guest scrapes in-process (Keells/Cargills stay FoodLK-only)
- Expanding SPAR/Keells/Cargills retail API chasing in Lankawa
- Optional CSE `GICSSectorSummery` valuation join (typed, not fetched yet)
- L6 canary expansions

## Related

- Food upstream catalog: [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md)
- Offers survey §0: [`CONSUMER_OFFERS_AND_DATA_SURVEY.md`](./CONSUMER_OFFERS_AND_DATA_SURVEY.md)
- Partner adapters: [`INTEGRATIONS.md`](./INTEGRATIONS.md)
- FoodLK sister: [SuvenSeo/Food-Platform](https://github.com/SuvenSeo/Food-Platform)
- Docs pattern: [Cookie-Cat21/cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs)
