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

## CSE API ([Cookie-Cat21/cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs))

**Verdict:** Not a separate hosted API. The repo documents unofficial `https://www.cse.lk/api/*` endpoints that Lankawa already calls server-side (`src/lib/integrations/cse.ts`). Browser CORS blocks client use; keep server proxy.

**Highest-ROI endpoints not yet surfaced (or underused):**

| Endpoint | Daily-user value |
|----------|------------------|
| `allSectors` | Sector heat / breadth of market day |
| `mostActiveTrades` | What retail actually traded |
| `dailyMarketSummery` | Foreign vs domestic participation |
| `notifications` | Exchange notices strip |
| ASPI high/low from existing summary | Intraday range without new scrape |

Cite Cookie-Cat docs as a **catalog**, not as an upstream SLA. CSE HTML/API can change without notice.

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
| WAQI / OpenAQ | Colombo AQI | Health morning check |
| JTWC / GDACS GeoJSON | Cyclone / multi-hazard alerts | Disaster hub |
| Marine (Open-Meteo Marine) | West/south coast swell for fishers | Niche but sticky |
| RainViewer / Blitzortung | Skip for now | License / attribution friction |

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
