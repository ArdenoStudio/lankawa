# Weather & disaster APIs beyond the core four — research

**Date:** Jul 2026  
**Thoroughness:** medium (live HTTP probes + public docs + community repos)  
**Question:** What Sri Lanka weather/disaster feeds exist beyond Open-Meteo, MetDept WAS, GDACS, and NASA FIRMS that Lankawa already uses?

**Verdict:** The highest-ROI addition is the **Irrigation Department public ArcGIS FeatureServer** (live river gauges + rainfall + alert thresholds). MetDept already exposes a real **CAP RSS** (used by Lankawa). **DMC has no CAP feed** — PDF bulletins + news RSS only, mirrored as JSON indexes by nuuuwan. **NBRO has no public live-warning JSON**; only static NSDI hazard zonation and a fragile rainfall map UI.

---

## Already in Lankawa (baseline)

| Source | Integration | Notes |
|--------|-------------|--------|
| Open-Meteo (+ Flood/GloFAS, Marine) | `weather.ts`, `glofas.ts`, `marine.ts` | Forecast / UV / rain / basin discharge / swell |
| MetDept WAS | `metdept.ts` | `dashboard-api/advisories` + `cap/en/rss.xml` |
| GDACS | `gdacs.ts` | Regional multi-hazard GeoJSON |
| NASA FIRMS | `firms.ts` | Active fire CSV (needs `NASA_FIRMS_MAP_KEY`) |
| lk-flood-api | `flood.ts` | Community REST over river gauges |
| NBRO/DMC landslide | `landslide.ts` | Seed districts + `lk_dmc` summary confirmation |
| DMC news RSS | `news.ts` | Headlines only |
| USGS earthquakes | `earthquake.ts` | Land bbox query |

---

## 1. Irrigation Department — river gauges (P0)

### Official public path (best)

Irrigation’s Hydrology division publishes a public ArcGIS Online dashboard and FeatureServer. Full automated telemetry (106 stations, ~10 min) is **authorised-only**; the public layer is what civic apps can use.

| Asset | URL |
|-------|-----|
| Public dashboard | `https://www.arcgis.com/apps/dashboards/2cffe83c9ff5497d97375498bdf3ff38` |
| Gauges FeatureServer (query) | `https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0/query` |
| Org services root | `https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services?f=pjson` |
| HTML entry | `https://www.irrigation.gov.lk/web/` → “Realtime Water Level in Major Rivers” |

**`gauges_2_view` fields (probed Jul 2026):** `basin`, `gauge`, `water_level`, `rain_fall`, `alertpull`, `minorpull`, `majorpull`, `EditDate`, point geometry.

- Layer is a **time series** (~6.4k features), not one row per station — query with `orderByFields=EditDate DESC` and collapse to latest-per-`gauge`.
- Freshness probed live: readings dated **2026-07-20** (same day as research).
- Related layers worth knowing: `hydrostations` (static coords), `24hr_rainfall` (aggregated `sum_rain_fall`), `Flood_Map` (inundation polygons by basin/DSD/GND), `river_basins`.

### Community mirrors

| Mirror | Cadence | Role |
|--------|---------|------|
| [nuuuwan/lk_irrigation](https://github.com/nuuuwan/lk_irrigation) | ~10 min | Scrapes ArcGIS → GitHub JSON (`data/alert_data.json`, per-station `data/rwlds/...`) |
| [yrangana/lk_flood_api](https://github.com/yrangana/lk_flood_api) → `https://lk-flood-api.vercel.app` | Depends on upstream | REST: `/levels/latest`, `/alerts`, `/stations`, … |

**Lankawa today:** already consumes `lk-flood-api`.  
**Probe warning (Jul 2026):** `/levels/latest` returned timestamps stuck at **2026-07-11 09:30:00** while Irrigation ArcGIS and `lk_irrigation` were current on **2026-07-20**. Prefer **direct FeatureServer** or **raw `lk_irrigation` GitHub JSON** as primary; keep `lk-flood-api` as a convenience fallback with a staleness canary.

**Ship suggestion:** Adapter that queries ArcGIS for latest-per-gauge, maps to existing `FloodStationLevel`, computes rate-of-rise from history, attributes “Irrigation Dept via ArcGIS (unofficial civic mirror)”.

---

## 2. MetDept CAP / WAS — deepen, don’t rediscover (P1)

Already integrated. Confirmed live endpoints:

| Endpoint | Status | Use |
|----------|--------|-----|
| `GET https://was.meteo.gov.lk/dashboard-api/advisories` | 200 JSON | Active day hazards (what Lankawa shows) |
| `GET https://was.meteo.gov.lk/dashboard-api/hazards` | 200 JSON | Hazard catalog (includes expired/test rows; filter carefully) |
| `GET https://was.meteo.gov.lk/cap/{en,si,ta}/rss.xml` | 200 RSS | CAP index; item links → CAP XML when alerts exist |
| `GET https://was.meteo.gov.lk/api/warnings` | 401 `Missing API key` | Skip without key |
| Generic `/api/alerts`, `/api/cap` | 403 | Not public |

**Gaps vs current code:** parse CAP XML item bodies when RSS has `<item>`s (today Lankawa only uses `pubDate`); optional SI/TA CAP feeds; do **not** treat `/hazards` as “active” without an explicit published/valid window filter (`advisories` is the safer active feed).

KDE FOSS Public Alert Server lists source id `lk-meteo-en` as operating — confirmation that Met CAP is the national weather CAP, not DMC.

---

## 3. DMC — bulletins, not CAP (P1)

| Channel | Status | Notes |
|---------|--------|-------|
| News RSS | Live | `…/category&id=9&…&format=feed&type=rss` (already in `news.ts`) |
| CAP / Atom alerts | **Not found** | Report views return “View not found” for `format=feed` |
| PDF reports | Live HTML | Landslide `report_type_id=5`, river/flood `report_type_id=6` |
| nuuuwan/lk_dmc | Live JSON indexes | Metadata + PDF URLs + text extracts on GitHub data branches |
| nuuuwan/lk_dmc_vis | ~3 h | River bulletin charts/images (lower cadence than Irrigation) |

**Landslide JSON Lankawa already hits:**

`https://raw.githubusercontent.com/nuuuwan/lk_dmc/data_lk_dmc_landslide_warnings/data/lk_dmc_landslide_warnings/summary.json`

Useful sibling indexes: `lk_dmc_river_water_level_and_flood_warnings`, other `doc_type`s on [nuuuwan/lk_dmc](https://github.com/nuuuwan/lk_dmc).

**Ship suggestion:** Structured parse of latest landslide PDF/TXT chunks (HF datasets `nuuuwan/lk-dmc-landslide-warnings-chunks`) → real DS/district tiers to replace seed honesty; keep DMC RSS strip as bulletin headlines.

---

## 4. NBRO landslide — no public live JSON (P2)

| Asset | Reality |
|-------|---------|
| NBRO EW mobile app | Official dissemination; not an open API |
| `http://rainfall.nbro.gov.lk/` / `:8080` map | ARGS UI; probe showed “Developing” / error pages — unsuitable as core dependency |
| Live warning JSON | **None found** |
| Rainfall thresholds (literature) | ~75 / 100 / 150 mm → watch / alert / evacuate (not a feed) |
| OpenLEWS research | Prototype IoT/LLM stack — not a production civic feed |

**Static zonation (useful for map baselayer, not morning alerts):**

`https://gisapps.nsdi.gov.lk/server/rest/services/SLNSDI/LHazard_10K/MapServer`  
(~312k features; Query/Data enabled). Pair with district pin, not live EW.

---

## 5. NSDI ArcGIS — static context layers (P2/P3)

`https://gisapps.nsdi.gov.lk/server/rest/services/SLNSDI?f=pjson`

| Service | Layers of interest |
|---------|-------------------|
| `LHazard_10K` | Landslide hazard zonation |
| `Climate_Meteorology` | Met/hydro/agro/raingauge station points, climate zones |
| `Inland_Waters` | Reservoir, river, dam, basin, watershed polygons |

Good for atlas overlays; not for alert cadence.

---

## 6. Other notes (park or low priority)

| Idea | Finding |
|------|---------|
| Irrigation “Reservoirs Status” / rainfall HTML | Public pages on irrigation.gov.lk; ModSecurity often blocks non-browser scrapes — prefer ArcGIS layers above |
| DMC CAP | Historical HazInfo/LIRNEasia CAP pilots; **no current national DMC CAP endpoint** |
| Tsunami | No SL-specific CAP API; stay on MetDept + GDACS/USGS |
| alert.lk (nuuuwan) | Aggregator UI over similar sources — peer, not a new upstream |
| OpenAQ / WAQI | Atmosphere, already in expansion backlog |

---

## Recommended ship order

1. **Irrigation ArcGIS gauges** (or `lk_irrigation` raw JSON) as primary flood levels; staleness canary on `lk-flood-api`.  
2. **Met CAP XML parse** when RSS items appear; keep `advisories` as active source of truth.  
3. **lk_dmc landslide chunk parse** → replace seed district tiers.  
4. **NSDI LHazard / Inland_Waters** as optional map baselayers.  
5. Skip NBRO rainfall host and invented DMC CAP until an official feed appears.

---

## Honesty / provenance rules

- Label Irrigation ArcGIS and nuuuwan mirrors as **civic republish**, not “official DMC warning”.  
- Never imply NBRO EW app parity from seed tiers.  
- Met CAP / advisories are the only structured **official weather warning** JSON/RSS found.  
- When `lk-flood-api` lags Irrigation by >6 h, surface `stale` and fall back.

---

## Probe log (Jul 2026)

| Probe | Result |
|-------|--------|
| `was.meteo.gov.lk/dashboard-api/advisories` | 200, empty active hazards |
| `was.meteo.gov.lk/cap/en/rss.xml` | 200, empty channel (no items) |
| ArcGIS `gauges_2_view` latest | Live water levels same day |
| `lk-flood-api.vercel.app/levels/latest` | 200 but timestamps 2026-07-11 |
| `lk_irrigation` README / `alert_data.json` | Live 2026-07-20 |
| `lk_dmc` landslide `summary.json` | 200, updated same day |
| NBRO rainfall map / root | UI degraded (“Developing” / IIS default) |
| DMC report `format=feed` | 404 View not found |
| NSDI `LHazard_10K` count | ~312403 |
