# Live data plan (L0–L6)

Inventory of Lankawa live-data waves. Sister platforms stay **data/attribution** only — never iframes or parallel consumer UIs.

| Wave | Theme | Status in this PR |
|------|--------|-------------------|
| **L0** | API keys & env (`OPENAQ_API_KEY`, `NASA_FIRMS_MAP_KEY`, `FOOD_API_BASE`, …) | Shipping — documented in `.env.example` |
| **L1** | Scrape harden (timeouts, UA, seed honesty, no fake “live”) | Shipping — FoodLK empty-200 no longer stamped live |
| **L2** | RSS + CBSL path (news feeds, MoH, treasury note) | Shipping — MoH / CPA / Verité RSS; treasury remains seed with documented path |
| **L3** | Sister platforms (FoodLK, Life, Octane, PropertyLK, Vehicle) | Partial — FoodLK cleaned hub/staples → WFP → SPAR → Life → seed; FoodLK still often 500s |
| **L4** | Satellite / remote sensing (FIRMS, NDVI, OpenAQ) | Keys documented; adapters already present — not expanded here |
| **L5** | Civic + legal research (CPA, Verité, MoH notices) | Shipping — live civic research strip + MoH notices via RSS |
| **L6** | Canary / ops (Telegram failure streaks, provenance badges) | Out of scope this PR — existing ops paths unchanged |

## Food product rule (L3)

- **Retail supermarket APIs are not chased in Lankawa.** SPAR / Keells / Cargills / Glomark ingestion stays in FoodLK.
- Lankawa consumes FoodLK **cleaned** `/hub/summary` and essentials **staples** (`/basket/estimate?preset=essentials`) only — never raw supermarket JSON for the FoodLK path.
- On FoodLK 500/empty: fail cleanly to **WFP HDX** (lagged markets) without implying live supermarket shelves.
- **HARTI daily PDF** and **CBSL daily price-report PDF** ingest on FoodLK are still required for fresh civic food; Lankawa does not claim those live yet.
- Call order: **FoodLK (real metrics) → WFP → SPAR (thin optional) → Life → seed**.

Catalog: [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md).

## Shipping in this PR (cursor/live-data-wave)

- `docs/LIVE_DATA_PLAN.md` + `docs/FOOD_API_SOURCES.md`
- News RSS: Ministry of Health, Centre for Policy Alternatives, Verité Research
- MoH notices filter aligned with feed **id** (and name fallback)
- Async civic research snapshot from CPA/Verité headlines → seed fallback
- Direct WFP HDX CSV adapter (`wfp_hdx`) while FoodLK 500s
- Food provenance chain: FoodLK cleaned hub/staples (real metrics only) → WFP → SPAR → Life → seed
- i18n + HartiEssentialsNote / food page honesty for lagged WFP (not “this morning” shelf copy)
- Tests for `food-direct` parse path + FoodLK hub/basket metric guards

## Not shipping here

- HARTI PDF / CBSL daily price-report PDF parsers inside Lankawa (**still needed on FoodLK** for fresh civic food)
- Live CBSL T-bill scrape (seed + documented path only)
- DOA `get_veg_data` (upstream 404) or supermarket guest scrapes in-process (Keells/Cargills stay FoodLK-only)
- Expanding SPAR/Keells/Cargills retail API chasing in Lankawa
- L6 canary expansions

## Related

- Food upstream catalog: [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md)
- Partner adapters: [`INTEGRATIONS.md`](./INTEGRATIONS.md)
- FoodLK sister: [SuvenSeo/Food-Platform](https://github.com/SuvenSeo/Food-Platform)
- Docs pattern: [Cookie-Cat21/cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs)
