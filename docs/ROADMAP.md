# Lankawa Roadmap

**Active sequencing:** see [`docs/MASTER_PLAN.md`](./MASTER_PLAN.md) — UI redo (Phase A), federation fixes (B), ingest purity (C), then live civic / brief / launch (D–F). When this file and the master plan disagree, the master plan wins until this roadmap is updated.

Phase 8 shipped July 2026 (infrastructure + live data). Phase 7 shipped July 2026. This document captures delivered work and the Phase 9 backlog (partially superseded by the master plan).

## Phase 8 Delivered

| Feature | Status |
|---------|--------|
| Supabase/Postgres schema | ✅ `001_initial.sql` + `002_phase8.sql` (pulse_snapshots, ingest_runs, export_audit, events) |
| Database integration | ✅ `src/lib/db.ts` read/write when Supabase env vars set; `DATABASE_URL` for migrations |
| Pulse DB preference | ✅ FX prefers DB observations, falls back to live CBSL scrape |
| Ingest cron | ✅ `/api/cron/ingest` with `CRON_SECRET` Bearer validation + CBSL FX persistence |
| Pulse persistence | ✅ Snapshots stored on successful pulse build; `/api/v1/pulse/history` (30 days) |
| Status dashboard | ✅ `/status` — all sources, freshness, last error (in-platform) |
| Civic assistant MVP | ✅ `/assistant` — rule-based FAQ + optional OpenAI RAG over Lankawa JSON |
| API rate limiting | ✅ 60 req/min per IP on `/api/v1/*` via middleware |
| Platform health | ✅ `GET /api/v1/status` — DB connected, sources fresh, version |
| Deployment docs | ✅ `docs/DEPLOYMENT.md`, updated `.env.example`, GitHub Actions ingest secrets |
| API v0.6 | ✅ `/status`, `/pulse/history`, `/assistant` + OpenAPI update |

## Phase 7 Delivered

| Feature | Status |
|---------|--------|
| Expanded public services | ✅ Police stations, MOH offices, divisional hospitals for all 25 districts (153 facilities) |
| Transport directory | ✅ `/transport` with bus routes, railway, airports + lazy MapLibre map |
| Data export | ✅ `/developers` download UI + `/api/v1/export/{districts,elections,services}` |
| Cost of living index | ✅ `/cost-of-living` ranked table + `/compare` integration |
| PWA offline expansion | ✅ SW v2 caches district API profiles + pulse snapshot; install prompt |
| Environment / AQI seed | ✅ `/environment` district AQI table; link from `/health` |
| Embeddable widgets | ✅ `/embed` preview + `/embed/pulse`, `/embed/fuel`, `/embed/fx` |
| MP scorecards expansion | ✅ 12 sample MPs + `/civic/[slug]` constituency pages |
| API v0.5 | ✅ `/transport`, `/cost-of-living`, `/export/{dataset}` + OpenAPI update |

## Phase 6 Delivered

| Feature | Status |
|---------|--------|
| Property / Housing pulse | ✅ `/property` with district median price bands, choropleth map, home pulse card |
| Historical election explorer | ✅ `/elections/history` with 2010, 2015, 2019, 2024 presidential tabs + swing charts |
| Pradeshiya Sabha layer | ✅ `/local-government` searchable directory (327 seed bodies) |
| Dengue choropleth | ✅ Table/map toggle on `/health` with district case bands |
| API v0.4 | ✅ `/property`, `/elections/history`, `/local-government` + OpenAPI update |
| Global search expansion | ✅ Property and local government entries indexed |
| Nav & cross-links | ✅ Property nav, district/province/elections links |

## Phase 5 Delivered

| Feature | Status |
|---------|--------|
| Fuel price history | ✅ Octane API integration, 90-day sparkline on `/economy` |
| Budget tracker (MVP) | ✅ `/budget` with FY 2024/25 & 2025/26 seed data |
| Dengue / health pulse | ✅ `/health` with district table, links from district pages |
| API v0.3 | ✅ `/budget`, `/health/dengue`, `/fuel/history` + ETag/Cache-Control |
| District compare mode | ✅ `/compare?districts=colombo,kandy` side-by-side metrics |
| MP scorecards (seed) | ✅ `/civic` with sample attendance & bills data |
| Tender feed (seed) | ✅ `/tenders` with search/filter |
| PWA manifest | ✅ `manifest.json`, icons, minimal offline SW for districts |

## Phase 4 Delivered

| Feature | Status |
|---------|--------|
| Public services for all 25 districts | ✅ 78 seeded facilities (hospital, school, GN office per district + extras) |
| Province choropleth maps | ✅ Density / presidential / parliamentary modes, lazy-loaded |
| API expansion | ✅ Provinces, parliamentary, services, flood history |
| Election swing charts | ✅ 2019 presidential baseline vs 2024 |
| Flood sparklines | ✅ Per-station history on district pages |
| Vanni crosswalk | ✅ Explainer on elections + affected district pages |
| GeoJSON optimization | ✅ 579KB → 124KB (~79% reduction) |

## GeoJSON Optimization Notes

- **Before:** `public/geo/districts.geojson` — 592,630 bytes (~579 KB)
- **After:** 126,873 bytes (~124 KB) — **78.6% reduction**
- **Method:** Coordinate precision reduction (4 decimal places) + vertex decimation (min 0.008° spacing) via `scripts/simplify-geojson.mjs`
- **Caching:** `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` on `/geo/*` via `next.config.ts`

## Data Limitations & Seed Caveats

1. **Public services:** Representative facilities per district sourced from MoH hospital lists, MoE school directories, and district secretariat references. Phase 7 adds police, MOH, and divisional hospital entries (6 per district + extras) — not exhaustive official gazette lists.
2. **2019 presidential baseline:** Sri Lanka's prior presidential election was November 2019 (Gotabaya Rajapaksa vs Sajith Premadasa). Used as the "2020 comparison baseline" for swing charts; district figures are seeded approximations aligned with published national totals, not digitized official district ledgers.
3. **Vanni districts:** Kilinochchi, Mannar, Mullaitivu, and Vavuniya share aggregated Vanni electoral-district presidential totals in official returns — individual admin-district splits are not published separately.
4. **Flood history:** Depends on lk-flood-api availability; sparklines degrade gracefully when the upstream API is down.
5. **GeoJSON:** Simplified boundaries are suitable for choropleth at national scale; not for cadastral or high-precision GIS.
6. **Budget tracker:** FY 2024/25 and 2025/26 figures are rounded seed data aligned with budget speech totals and Verité Research sector summaries — not digitized appropriation ledgers. Ministry-level splits are illustrative.
7. **Dengue stats:** Weekly district counts are representative seed data patterned on Epidemiology Unit report formats — not live scraped surveillance. Do not use for clinical or outbreak response decisions.
8. **MP scorecards:** Illustrative sample members inspired by Manthri.lk patterns — not scraped from Manthri or official Hansard. Real names and records require ingest pipeline.
9. **Tender feed:** Static seed notices modeled on e-GP publication formats — not live procurement data from the e-GP portal.
10. **Fuel history:** Sourced from Octane partner API with Next.js revalidate caching; falls back to static series when upstream is unavailable.
11. **Property prices:** District median land price bands are representative seed data aligned with PropertyLK patterns. Server-side adapter attempts live fetch from the partner API; falls back to seed when unavailable. Not a property valuation service.
12. **Historical elections (2010, 2015):** District-level presidential results are seeded approximations aligned with published national totals — not digitized official district ledgers.
13. **Local government directory:** 327 seed bodies (MC, UC, PS) covering major councils and Pradeshiya Sabhas per district — not an exhaustive official gazette list of 340+ bodies.
14. **Transport directory:** Static seed of major intercity bus routes, SLR stations, and airports — no GTFS or live timetable data.
15. **Cost of living index:** Composite seed from fuel reference price, property bands, and food basket estimates — not official NCPI/CPI district series.
16. **Air quality:** IQAir-style representative AQI bands by district — not live sensor network data.

---

## Phase 9 — Next Sprint

### P0 — Live data expansion

1. **Live dengue ingest** — Replace seed with Epidemiology Unit weekly scrape/API
2. **Live e-GP tenders** — Replace seed tender feed with procurement portal ingest
3. **Live PropertyLK adapter** — Wire partner API when production endpoint is stable
4. **Environment ingest** — Replace AQI seed with live sensor/API when available
5. **Budget & macro ingest** — Scheduled CBSL/Verité updates into observations table

### P1 — Differentiation

6. **Notification preferences** — Flood alert subscriptions (requires auth — Supabase)
7. **Full Hansard MP ingest** — Replace seed scorecards with real attendance records
8. **API webhooks docs** — Rate-limit headers, webhook documentation for partners
9. **Assistant expansion** — Citation cards, district-scoped context, Sinhala/Tamil queries
10. **Third-party widget SDK** — Documented embed SDK beyond iframe preview; optional CDN bundle

### P2 — Platform

11. **Tamil/Sinhala voice search**
12. **Citizen report layer** — Crowdsourced potholes, outages moderated in-platform
13. **Court backlog & HRCSL metrics** — PDF extraction pipeline
14. **Local government councillor records** — Meeting minutes and member lists
15. **Custom domain** — Production domain with Vercel DNS + edge caching tuning

---

## Phase 8 — Infrastructure Sprint (Delivered July 2026)

<details>
<summary>Original Phase 8 plan (superseded by delivered table above)</summary>

### P0 — Live data & platform

1. **Real-time ingest pipeline** — Supabase + cron for budget, tenders, MP records, dengue, property
2. **Live dengue ingest** — Replace seed with Epidemiology Unit weekly scrape/API
3. **Live PropertyLK adapter** — Wire partner API when production endpoint is stable
4. **Live e-GP tenders** — Replace seed tender feed with procurement portal ingest
5. **Environment ingest** — Replace AQI seed with live sensor/API when available

### P1 — Differentiation

6. **Notification preferences** — Flood alert subscriptions (requires auth — Supabase)
7. **Full Hansard MP ingest** — Replace seed scorecards with real attendance records
8. **API webhooks docs** — Rate-limit headers, webhook documentation for partners
9. **LLM civic assistant** — Grounded only on Lankawa sources with citation cards
10. **Third-party widget CDN** — Documented embed SDK beyond iframe preview

### P2 — Platform

11. **Tamil/Sinhala voice search**
12. **Citizen report layer** — Crowdsourced potholes, outages moderated in-platform
13. **Court backlog & HRCSL metrics** — PDF extraction pipeline
14. **Local government councillor records** — Meeting minutes and member lists

</details>

---

## Gap Analysis: What Sri Lankan Civic Platforms Are Missing

Research across existing portals (Election Commission, CBSL, Disaster Management Centre, Ministry websites, Verité Research, Manthri.lk, etc.) reveals persistent gaps Lankawa could own:

| Gap | Opportunity for Lankawa |
|-----|---------------------------|
| **Unified district key** | Most portals use inconsistent geography; Lankawa's 25-district atlas is already the right abstraction |
| **Budget & expenditure tracker** | Phase 5 MVP shipped — extend with provincial budgets and year-over-year charts |
| **Government tenders (Procurement)** | Phase 5 seed feed shipped — integrate live e-GP in Phase 8 |
| **MP attendance & voting** | Phase 7 seed scorecards shipped — full Hansard ingest in Phase 8 |
| **Dengue & disease maps** | Phase 6 choropleth shipped — live Epidemiology Unit ingest in Phase 8 |
| **Fuel price history** | ✅ Phase 5 — extend to district-level transport cost proxies |
| **Bus & rail connectivity** | ✅ Phase 7 static directory — live GTFS if ever published |
| **Court case backlog / HRCSL** | Human rights and judicial metrics are PDF-only |
| **Local government (Pradeshiya Sabha)** | ✅ Phase 6 directory shipped — extend to councillor records |
| **Climate & air quality** | ✅ Phase 7 AQI seed — live ingest in Phase 8 |
| **Cost of living index** | ✅ Phase 7 composite seed — NCPI district proxies when available |
| **Property / housing pulse** | ✅ Phase 6 PropertyLK-style module shipped |

**Lankawa's moat:** trilingual, in-platform (no link-outs), provenance on every number, district-first navigation, dark civic UX.

---

## Ardeno Stack Integration Opportunities

In-platform modules (not external links) aligned with the SuvenSeo / Ardeno ecosystem:

| Module | Integration approach |
|--------|---------------------|
| **Octane (fuel)** | ✅ Phase 5 — fuel history sparklines on `/economy`; cost-of-living fuel component in Phase 7 |
| **PropertyLK** | ✅ Phase 6 — district median land price bands + choropleth on `/property`; COL property component Phase 7 |
| **lk-flood-api** | Already integrated; extend to push notifications tier on `/disaster` |
| **Shared auth (future)** | Single sign-on across Ardeno apps for saved districts / alerts — Phase 8+ |
| **Unified search** | ✅ Phase 6 — property + local government indexed in GlobalSearch |

All integrations must follow Lankawa rules: freshness tiers, `/sources/[id]` provenance, no external UI links.

---

*Last updated: Phase 8 completion, July 2026*
