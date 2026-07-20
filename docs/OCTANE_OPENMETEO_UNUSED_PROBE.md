# Octane unused routes + Open-Meteo air-quality — live probe

**Probe date:** 2026-07-20  
**Hosts:** `https://octane-api.fly.dev`, `https://air-quality-api.open-meteo.com`  
**UA:** `LankawaBot/1.0 (civic-data probe)`  
**Sister docs:** [`EXISTING_APIS_UNUSED_ENDPOINTS.md`](./EXISTING_APIS_UNUSED_ENDPOINTS.md) (§2.6–2.8) · [`INTEGRATIONS.md`](./INTEGRATIONS.md) · [`WEATHER_DISASTER_APIS_RESEARCH.md`](./WEATHER_DISASTER_APIS_RESEARCH.md)

**Lankawa today:** `octane.ts` uses only `/v1/prices/latest|history|changes`. AQI uses OpenAQ (`aqi.ts`), not Open-Meteo. Weather/flood/marine already hit other Open-Meteo hosts.

---

## Verdict (ship / park)

| Surface | Live? | Freshness (probe day) | Lankawa fit |
|---------|-------|----------------------|-------------|
| Octane `GET /v1/comparison/world` | **200** | SL pump stamp **2026-06-30** (~20d stale; `/v1/health` → `degraded`) | **Ship** — economy “vs neighbours” chip; show `recorded_at` + FX |
| Octane `GET /v1/prices/sentiment` | **200** | Snapshot **2026-05-10** (~71d old on Fly) | **Park** until Fly serves fresh git sentiment (or Lankawa reads GitHub raw with max-age) |
| Octane `GET /v1/prices/forecast` | **200** | Regression OK; embeds same stale sentiment | **Park** AI-adjusted curve; optional later ship of **linear-only** strip if labeled as model, not CPC |
| Open-Meteo `GET …/v1/air-quality` (Colombo) | **200** | Current hour (`2026-07-20T12:30` Asia/Colombo) | **Ship** — OpenAQ backup / multi-pollutant enrich |

**Bottom line:** Wire **world comparison** and **Open-Meteo AQ** next. Do **not** surface Fly sentiment/forecast as live outlook while `generated_at` lags months; keep using Octane price boards for pump truth.

**Path hygiene:** bare `/v1/sentiment` and `/v1/forecast` → **404**. Real paths are under `/v1/prices/…`. `/v1/market-context` → **404** on Fly (OpenAPI has no such path).

---

## 1. Octane — unused siblings

OpenAPI (probe): `/v1/comparison/world`, `/v1/prices/forecast`, `/v1/prices/sentiment` present; `/v1/health` reports `stale: true`, `stale_hours: 480`, `latest_recorded_at: 2026-06-30`.

### 1.1 `GET /v1/comparison/world?fuel=`

| | |
|--|--|
| **Default fuel** | `petrol_95` (query key is `fuel`, not `fuel_type`) |
| **Auth** | None |
| **Shape** | SL LKR+USD, world avg USD, `delta_vs_world_pct`, 4 South Asian neighbours, `fx_rate_used` |

**Probe samples (2026-07-20):**

| Fuel | SL LKR | SL USD | World avg USD | Δ vs world | Neighbours (USD) |
|------|--------|--------|---------------|------------|------------------|
| `petrol_95` | 495 | 1.476 | 1.673 | −11.8% | BD 1.18 · IN 1.14 · NP 1.30 · PK 1.07 |
| `petrol_92` | 414 | 1.234 | 1.673 | −26.2% | same gasoline set |
| `auto_diesel` | 382 | 1.139 | 1.707 | −33.3% | BD 0.93 · IN 1.03 · NP 1.28 · PK 1.11 |

Example body (abbrev.):

```json
{
  "fuel_type": "petrol_95",
  "fuel_category": "gasoline",
  "sri_lanka": { "price_lkr": 495.0, "price_usd": 1.476, "recorded_at": "2026-06-30" },
  "world_average_usd": 1.673,
  "delta_vs_world_pct": -11.8,
  "neighbors": [
    { "country": "Bangladesh", "price_usd": 1.18, "recorded_at": "2026-07-12" },
    { "country": "India", "price_usd": 1.14, "recorded_at": "2026-07-12" },
    { "country": "Nepal", "price_usd": 1.3, "recorded_at": "2026-07-12" },
    { "country": "Pakistan", "price_usd": 1.07, "recorded_at": "2026-07-12" }
  ],
  "fx_rate_used": 335.4113
}
```

**Ship notes:** One call → COL / economy “Sri Lanka vs region” without scraping GlobalPetrolPrices. Prefer `petrol_92` or `auto_diesel` for household relevance. Always expose `sri_lanka.recorded_at` and neighbour `recorded_at` (neighbours were fresher than SL on probe day). Fail soft if `/v1/health` is `degraded` — still show comparison with a “prices as of …” line.

### 1.2 `GET /v1/prices/sentiment`

| | |
|--|--|
| **HTTP** | 200 |
| **Shape** | `{ available, sentiment: { direction, confidence, magnitude_lkr, summary, generated_at, headlines_analyzed, signals[] } }` |

**Probe body:** `available: true`, `direction: "up"`, `confidence: 0.8`, `magnitude_lkr: 25`, `generated_at: 2026-05-10T15:22:11Z`, 30 headlines, Middle East / Iran-war signals.

**Park why:** Fly’s baked sentiment is **stale** vs Octane’s daily git workflow (master commits refresh `ai_sentiment.json`; production image lags). Surfacing “outlook” from May on a July pulse would mislead. Revisit when Fly deploy catches up, or when Lankawa can prefer GitHub raw with a freshness gate (same pattern Octane’s own frontend uses).

### 1.3 `GET /v1/prices/forecast?fuel=&history_days=&horizon_days=`

| | |
|--|--|
| **Required** | `fuel` (422 without it) |
| **Defaults** | `source=cpc`, `history_days=365`, `horizon_days=90` |
| **HTTP** | 200 |

**Probe (`petrol_95`, horizon 30):** `r_squared ≈ 0.74`, `slope_lkr_per_day ≈ 0.58`; 8 regression anchors; 30 linear + 30 AI-adjusted points. Linear end ~515 LKR (19 Aug); AI-adjusted end ~523 (sentiment bump). Embedded `sentiment` matches §1.2 (May stamp).

**Park why:** Linear projection is honest only as a **chart model**, not a CPC announcement. AI layer inherits stale sentiment → park. If shipping later: linear series only + NFA label; never “expected next revision.”

### 1.4 Negative probes (do not call)

| Path | HTTP |
|------|------|
| `/v1/sentiment`, `/v1/forecast` | 404 |
| `/v1/market-context`, `/v1/market/context` | 404 |

---

## 2. Open-Meteo air-quality — Colombo

**URL pattern:**

```
https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude=6.9271&longitude=79.8612
  &current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index,dust
  &hourly=pm10,pm2_5,european_aqi,us_aqi
  &timezone=Asia%2FColombo
```

| | |
|--|--|
| **HTTP** | 200 (~5 KB with 120 hourly steps) |
| **Auth / key** | None (public; polite cadence) |
| **Resolved grid** | ≈ 6.90°N, 79.90°E · elev. 9 m · `Asia/Colombo` |

**Current (probe 2026-07-20 ~12:30 SLT):**

| Metric | Value | Unit |
|--------|-------|------|
| European AQI | 26 | EAQI |
| US AQI | 51 | USAQI |
| PM2.5 | 9.6 | μg/m³ |
| PM10 | 14.1 | μg/m³ |
| NO₂ | 6.3 | μg/m³ |
| SO₂ | 8.8 | μg/m³ |
| O₃ | 65.0 | μg/m³ |
| CO | 288 | μg/m³ |
| UV index | 8.55 | — |
| Dust | 3.0 | μg/m³ |

**Ship notes:** Complements OpenAQ (station PM2.5) with modelled multi-pollutant + dual AQI indices, same family as existing `weather.ts` / `marine.ts` / `glofas.ts`. Use as **fallback when OpenAQ key/lag fails**, and/or enrich environment pulse with NO₂/O₃/dust. Label as Open-Meteo model grid (not a DMC/CEA official station). Prefer `us_aqi` or raw PM2.5 for bands consistent with OpenAQ UI; keep `european_aqi` as secondary.

**Park (for this wave):** ensemble / seasonal / climate Open-Meteo hosts — already listed in the unused-endpoints inventory; not needed for morning AQI.

---

## 3. Recommended Lankawa ship order

1. **Ship** — `octane.ts`: `fetchWorldComparison(fuel)` → economy / COL neighbour chip (`petrol_92` or `auto_diesel` + as-of stamps).  
2. **Ship** — new thin adapter (or extend weather/env): Open-Meteo air-quality for Colombo (+ optional district lat/lon later).  
3. **Park** — Octane sentiment + AI forecast until Fly freshness ≤ ~48h (or GitHub-raw path with age check).  
4. **Park** — Octane alerts / digest / embed (sister product).

Cross-ref priority matrix: [`EXISTING_APIS_UNUSED_ENDPOINTS.md`](./EXISTING_APIS_UNUSED_ENDPOINTS.md) §3 (Octane world = P0; Open-Meteo AQ = P1).

---

*Generated from live HTTP probes on 2026-07-20. Re-check `/v1/health` and sentiment `generated_at` before shipping outlook UI.*
