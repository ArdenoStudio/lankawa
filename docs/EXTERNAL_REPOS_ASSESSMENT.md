# External Sri Lanka repos — assessment vs Lankawa

**Probe date:** 2026-07-26  
**Scope:** 21 public GitHub repos reviewed against Lankawa’s civic morning surface (FX, fuel, food, CSE, weather, disaster, dengue, news, districts).  
**Rule:** Prefer machine-readable official/civic feeds with provenance. Skip tourism, campus CRUD, and marketing sites.

---

## Verdict

| Tier | Count | Action |
|------|-------|--------|
| **Integrate** | 3 | Wired or opt-in adapters in this branch |
| **Pattern only** | 5 | UX / research inspiration — not primary feeds |
| **Skip** | 13 | Wrong product surface |

---

## Integrate (high)

| Repo | Upstream surface | Lankawa use |
|------|------------------|-------------|
| [wmrkumara/lanka-price-monitor](https://github.com/wmrkumara/lanka-price-monitor) | GitHub raw `data.json` (CBSL Daily Price Report) + `harti_data_clean.json` | Food fallthrough after FoodLK: `src/lib/integrations/food-price-monitor.ts` |
| [Gajarthan/sri-lanka-macro-publisher](https://github.com/Gajarthan/sri-lanka-macro-publisher) | `data/latest/dcs_ccpi.json` (+ FX/veg archives) | Live CCPI for `/economy` inflation card via `src/lib/integrations/macro-publisher.ts` |
| [Damantha126/Helakuru-Esana-API](https://github.com/Damantha126/Helakuru-Esana-API) | `GET https://esana-api.vercel.app/EsanaV3` | **Opt-in** secondary headlines when `NEWS_ESANA_ENABLED=true` — default remains RSS-only |

### Honesty notes

- **Price monitor:** Third-party JSON republish of CBSL/HARTI PDFs. Attribute as `cbsl_price_monitor` / `harti_price_monitor`, not as FoodLK or a Lankawa PDF scrape.
- **Macro publisher:** DCS CCPI mirror with `status.json` health. Prefer over stale NCPI seed when parse succeeds; label series as **CCPI (Colombo)**, not NCPI.
- **Esana:** Unofficial Helakuru API, GPL-3.0 upstream project, third-party fragility. Off by default; never replaces RSS strategy in `NEWS_RSS_MASTER_PLAN.md`.

---

## Pattern only (medium)

| Repo | Borrow | Do not |
|------|--------|--------|
| [prasannavasan/gold-tracker-lk](https://github.com/prasannavasan/gold-tracker-lk) | 22K / gram / pawn (8g) UX | Spot×FX as “Sri Lanka shop rates” |
| [ethandezilva882-svg/ceylon-macro-engine](https://github.com/ethandezilva882-svg/ceylon-macro-engine) | Future scraper ideas | Fork Phase-1 unfinished stack |
| [IAshinsana/induwara-lk-free-tools](https://github.com/IAshinsana/induwara-lk-free-tools) | Household calculator link-outs | Treat as a data API |
| [nadilHesara/AEGIS-Dengue](https://github.com/nadilHesara/AEGIS-Dengue) | Research climate lags | Ship ML forecasts before Epidemiology Unit live cases |
| [reezmahanan/Weather-App](https://github.com/reezmahanan/Weather-App) | Optional city-coords list later | Duplicate Open-Meteo dashboard |

**Shipped from gold-tracker pattern:** CBSL troy-oz → 24K/22K per gram and per pawn on `/economy` (`src/lib/gold-pawn.ts`). Factor documented in provenance; shops still add margins.

---

## Skip (low)

Tourism / agentic travel (agentic travel planner, peak-lk, Visit-Srilanka, ecotourism AI), Golden-Bark marketing, Aviation registry, Lifestyle Survey form, Auto-Ledger FYP, gov-assets complaint CRUD, smart-waste campus app, lottery archive, hospital appointment RAG, and [Awesome-Sri-Lanka](https://github.com/nicolasize/Awesome-Sri-Lanka) (AI boilerplate with non-existent “APIs”). Keep using `docs/PUBLIC_APIS.md`.

---

## Implementation map (this branch)

| Capability | Code | Source registry |
|------------|------|-----------------|
| CBSL/HARTI food staples fallthrough | `food-price-monitor.ts` → `food.ts` | `cbsl_price_monitor` |
| Live CCPI | `macro-publisher.ts` → `ncpi.ts` / economy | `dcs_ccpi_macro` |
| Gold pawn conversion | `gold-pawn.ts` + economy card | `cbsl_gold` (same) |
| Optional Esana headlines | `news-esana.ts` → `news.ts` | `news_esana` |

Related: [`HARTI_CBSL_FOOD_PDF.md`](./HARTI_CBSL_FOOD_PDF.md) · [`GOLD_RETAIL_RATES_RESEARCH.md`](./GOLD_RETAIL_RATES_RESEARCH.md) · [`INTEGRATIONS.md`](./INTEGRATIONS.md) · [`NEWS_RSS_MASTER_PLAN.md`](./NEWS_RSS_MASTER_PLAN.md).
