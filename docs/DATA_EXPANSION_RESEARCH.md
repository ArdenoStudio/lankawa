# Data expansion research — satellite, weather, CSE, ML, APIs

**Status:** Research synthesis (parallel agent wave, Jul 2026)  
**Product rule:** Sisters stay data backends; Lankawa is the umbrella UI. No multi-GB mosaics in the browser. Monochrome B&W charts stay custom SVG (not Tremor/Recharts) so PNG export and brand control remain intact.

---

## Economy charts (shipped this wave)

| Change | Why |
|--------|-----|
| Shared `MonoLineChart` + `src/lib/charts/mono.ts` | One geometry path: grid, y labels, end markers, aspect-ratio safe |
| Fuel history = step-after on shared calendar | Revisions are flat between CPC dates; index-aligned lines lied |
| FX / NCPI soft area + zero line (NCPI) | Readability without color |
| World pump → SVG bars + PNG export | Matches journalist export pattern |
| `ChartExportButton` resolves SVG root *or* wrapper | Debt/NCPI export was broken when `id` sat on `<svg>` |

Bookmark libs (Tremor, HyperUI, DaisyUI, shadcn blocks) informed layout density and bar treatment — not adopted as runtime deps.

---

## Food upstream APIs (FoodLK sister + direct)

**Catalog:** [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md) — same spirit as cse-api-docs for FoodLK upstreams ([SuvenSeo/Food-Platform](https://github.com/SuvenSeo/Food-Platform)).

**Verdict (Jul 2026):** FoodLK Fly API often returns HTTP 500. Lankawa call order is FoodLK (real metrics only) → **WFP HDX CSV direct** → SPAR2U retail JSON (rate-limited) → Life federation → seed. Prefer fixing FoodLK sync long-term; keep WFP bypass.

**Live-data sequencing:** [`LIVE_DATA_PLAN.md`](./LIVE_DATA_PLAN.md).

---

## CSE API ([Cookie-Cat21/cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs))

**Verdict:** Not a separate hosted API. The repo documents unofficial `https://www.cse.lk/api/*` endpoints that Lankawa already calls server-side (`src/lib/integrations/cse.ts`). Browser CORS blocks client use; keep server proxy.

**Deepen catalog (announcements / GICS / market status):** [`CSE_API_DOCS.md`](./CSE_API_DOCS.md) — live-probed 2026-07-20.

**Shipped in adapter:** `aspiData`, `snpData`, `marketStatus`, `marketSummery`, `tradeSummary`, `allSectors`, `mostActiveTrades`, `dailyMarketSummery`.

**Highest-ROI still unused / broken in notices path:**

| Endpoint | Daily-user value |
|----------|------------------|
| `GET /notifications` | Halt/auction banners — Lankawa currently **POST**s (405) |
| `POST /approvedAnnouncement` | Corporate disclosures strip (homepage feed) |
| `POST /GICSSectorSummery` | Sector PER/PBV/DY + companies traded (join on `indexCodeSp`) |
| `POST /sectorHighLow?sectorId=1` | ASPI intraday open/high/low companion |

Cite Cookie-Cat docs as a **catalog**, not as an upstream SLA. CSE HTML/API can change without notice.

**Broker alternatives (Asia Securities / Softlogic / CAL):** No public CSE equity quote APIs. Softlogic & CAL trading sit behind ATrad login; CAL has one unofficial HTTP JSON mobile feed for treasuries/FX/UT (not market-wide equities). Details: [`STOCK_BROKER_APIS_RESEARCH.md`](./STOCK_BROKER_APIS_RESEARCH.md).

---

## Satellite — year-1 useful vs park

| Signal | Source pattern | Daily-user product | Priority |
|--------|----------------|--------------------|----------|
| Active fires | NASA FIRMS (MAP_KEY) | Disaster pin + district toast in dry season | **P0** |
| Flood extent flags | GFM / Copernicus EMS summaries → pins | Complement river gauges, not replace | P1 |
| Weekly NDVI anomaly | Sentinel/MODIS ETL (batch) | “Greenery stress” district strip (Watchdog land pulse deepen) | P1 |
| Reservoir surface area | Sentinel-1/2 batch | Hydro / agri context card | P2 |
| Urban heat island | Landsat LST monthly | Colombo heat note (health) | P2 |
| Coastal erosion / land-change mosaics | Heavy ETL | Year-2; keep current seed land-change chart | Park |

**Do not:** stream raw GeoTIFF into Next.js. Emit GeoJSON pins + precomputed district metrics via cron.

---

## Weather & atmosphere APIs

| Source | Use | Notes |
|--------|-----|-------|
| Open-Meteo (already used) | UV index, 7-day rain outlook, multi-city strip | Free, no key for core |
| Open-Meteo Flood / GloFAS | Basin flood probability | Pair with LK Flood gauges |
| Irrigation Dept ArcGIS gauges | Live river levels + rain + alert thresholds | **Prefer over stale lk-flood-api** — see `WEATHER_DISASTER_APIS_RESEARCH.md` |
| MetDept WAS CAP RSS | Official weather warnings (already used) | `cap/{en,si,ta}/rss.xml` + `dashboard-api/advisories` |
| DMC PDF indexes (nuuuwan/lk_dmc) | Landslide / flood bulletin metadata | No DMC CAP feed found |
| NBRO live EW JSON | — | **None public**; NSDI `LHazard_10K` is static zonation only |
| WAQI / OpenAQ | Colombo AQI | Health morning check |
| JTWC / GDACS GeoJSON | Cyclone / multi-hazard alerts | Disaster hub |
| Marine (Open-Meteo Marine) | West/south coast swell for fishers | Niche but sticky |
| RainViewer / Blitzortung | Skip for now | License / attribution friction |

Deep dive: [`docs/WEATHER_DISASTER_APIS_RESEARCH.md`](./WEATHER_DISASTER_APIS_RESEARCH.md).

---

## “ML” year-1 (honest stats, not hype models)

Ship **detectors and composites**, not black-box predictions:

1. **FX MAD / z-score** on sell rate — “unusual move vs 30d” badge  
2. **Flood rate-of-rise** — gauge Δh/Δt alert pin  
3. **Met ∩ flood intersection** — same district wet + rising → priority pin  
4. **Dengue WoW** (nuuuwan `lk_dengue` / epidemiology pages) — week-over-week spike  
5. **Power outage concentration** — CEB/LECO cluster score by district  
6. **COL weekly proxy** — fuel+staples blend already; surface “what moved your basket”  
7. **News cluster polish** — already started; keep keyword/entity clustering  
8. **Fuel revision window only** — never predict price direction; only “CPC revision week” calendar

Avoid: LLM-invented numbers, stock tips, rainfall “forecast models” that duplicate Open-Meteo.

---

## Other high-ROI civic APIs / scrapes

| Source | Product surface |
|--------|-----------------|
| PUCSL generation JSON | Already tariff slabs; add generation mix spark if stable |
| LECO outages | Complement CEB on disaster/home |
| Bank TT remittance boards (People’s / NDB / Sampath) | Remittance compare card (scrape + seed) |
| GDACS + FIRMS | Unified hazard pins |
| HDX LKA / CKAN | Admin boundaries & stats when data.gov.lk is down |
| nuuuwan census 2024 extracts | District context footnotes |
| CBSL T-bill / WAYR PDFs | Rates strip for savers (stale-OK) |
| SLTDA tourist arrivals Excel | Tourism pulse (monthly) |

---

## Recommended ship order (after chart polish)

```
1 FIRMS fire pins + GDACS on /disaster          ✅ shipped (wave)
2 Open-Meteo UV + 7d rain on home morning check ✅ shipped
3 CSE wave-2: sectors + most active + foreign   ✅ shipped
4 Bank remittance TT board (3 banks, seed)      ✅ shipped
5 FX anomaly badge + flood rate-of-rise pins    ✅ shipped
6 Weekly NDVI district ETL (Land Pulse deepen)  ✅ seed shipped (cron later)
```

---

## Agent wave note

Parallel research covered: economy chart UX, CSE docs, satellite stacks, weather APIs, Sri Lanka open data portals, remittance/FX peers, disaster feeds, epidemiology, tourism/stats PDFs, and ML honesty bounds. Literally spinning dozens of duplicate agents on the same APIs does not increase signal; this doc is the merged backlog.
