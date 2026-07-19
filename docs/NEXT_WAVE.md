# Next wave plan — remaining backlog + Watchdog

**Status:** Wave A shipped; Watchdog-native deepen shipped; Wave B next  
**Product rule (locked):** Lankawa stays the umbrella UI. External projects are **data/attribution**, never iframes or parallel consumer apps.

---

## Priority order (recommended)

```
1 Coconut Index / COL honesty     ✅ shipped
2 Journalist citation + PNG export ✅ shipped
W  Watchdog → Lankawa-native       ✅ Land Pulse deepen + Debt Pulse
3 NCPI + PUCSL blocks             ✅ household inflation + tariff slabs
5 Alert pins (localStorage)       ✅ home firing strip
4 NBRO/DMC landslide layers       ✅ panel + flood/landslide map toggle
5b Morning-brief email            ✅ opt-in + cron (needs Resend/Supabase secrets)
6 District WhatsApp share cards   ✅ ShareDistrictCard on district pages
7 Octane CPC revision steps       ✅ /economy + /api/v1/fuel/revisions
8 Split API rate buckets          ✅ default/export/assistant/subscribe
```

Backlog wave complete for planned items. Follow-on retention wave: fact-ledger brief, cricket 24h/economy card, news clusters, PWA offline morning shell.

Still parked: Year-2 satellite ETL (see `docs/DATA_EXPANSION_RESEARCH.md`), protest tracker, Entity Sport cricket, pgvector news.

Follow-on data wave (ranked): FIRMS/GDACS pins → Open-Meteo UV/rain deepen → CSE sectors/most-active → bank remittance TT → FX anomaly + flood rate-of-rise → NDVI district ETL.

---

## 1. Coconut Index / COL honesty UI

### Problem
COL already composites fuel/property/food, but coconut (and other staples) are buried in seed/FoodLK figures. Users cannot see *which* inputs are live vs seed, so the index looks “official” when it is not.

### Done when
- `/cost-of-living` and `/food` show a **Coconut Index** strip: latest coconut unit price, Δ vs prior observation, provenance badge.
- COL methodology page lists each component with **live | life_federation | seed** and last-updated.
- National COL card shows an honesty footer: “Not NCPI — see methodology.”

### Approach
| Piece | Detail |
|-------|--------|
| Data | Prefer FoodLK/Life staple `coconut` if present; else HARTI/seed with explicit label. Persist `coconut_unit_lkr` via cron when available. |
| UI | Compact metric under staples + optional sparkline (7–30d if history exists). |
| Files | `integrations/food.ts`, `cost-of-living.ts`, COL + food pages, methodology page, `sources.ts`, i18n. |
| Risk | FoodLK still 500s → stay on Life/seed; never claim “live coconut market.” |

### Out of scope
Official CCPI coconut subgroup, supermarket barcode feeds.

---

## 2. NBRO / DMC landslide layers

### Problem
Disaster hub has flood, CEB power, USGS quakes, Met advisories — no landslide / slope hazard layer, which is a top wet-season civic need outside river basins.

### Done when
- `/disaster` has a **Landslide / slope risk** panel with district or DS-level status when upstream is reachable.
- Map (or choropleth) can toggle flood vs landslide context without leaving the page.
- Provenance points at NBRO and/or DMC; stale/down badges work like other sources.

### Approach
| Piece | Detail |
|-------|--------|
| Sources | NBRO public bulletins / landslide early warning pages; DMC multi-hazard advisories. Prefer structured JSON/RSS; HTML scrape only with canary. |
| Model | `LandslideSnapshot { asOf, tier, districts[], sourceId, summary }`. Seed fallback with `nbro_seed` if scrape fails. |
| Map | Extend disaster map: GeoJSON overlays or district fill from risk classes (`watch | warning | none`). Monochrome: use hatch/pattern, not color hue alone. |
| Files | `integrations/nbro.ts`, `integrations/dmc.ts` (or combined), disaster page + map components, cron optional, sources registry. |
| Risk | Gov sites change often; treat as **best-effort**. Never imply evacuation orders. |

### Gate
Ship Met Dept panel green for 14 days before investing in dual GIS layers.

---

## 3. Journalist citation cards + chart PNG export

### Problem
Soft launch targets journalists / Discord / r/srilanka. They need **copy-paste provenance** and **shareable charts**, not just screenshots of the whole page.

### Done when
- Economy (and pulse) charts have **Download PNG** + **Copy citation**.
- Citation text includes: metric, value, as-of, source name, Lankawa URL, “not official government.”
- Assistant answers already cite paths; extend the same card pattern to pulse/economy widgets.

### Approach
| Piece | Detail |
|-------|--------|
| PNG | Client-side: wrap chart SVG/canvas (`html-to-image` or native SVG serialize) → PNG download. No server render required. |
| Citation card | `CitationCard` component: title, value, observedAt, source link (`/sources/{id}`), permalink. |
| Files | `components/CitationCard.tsx`, `components/ChartExportButton.tsx`, `EconomyCards.tsx`, optionally PulseCard / embed pages. |
| Risk | Keep monochrome export (white on black or black on white for print). |

### Out of scope
PDF press packs, watermark licensing.

---

## 4. Alert pins + morning-brief email

### Problem
Retention beyond “open the site” needs lightweight personalization and push. Home district pin already exists; alerts and email are the next habit layer.

### Done when
- User can pin **alert interests** (FX move %, flood elevated, power outage, Met warning) in localStorage.
- Home shows a **Your alerts** strip when a pin fires (client compare against pulse).
- Optional: email/Telegram delivery of morning brief — **ops pipe only**, not in-app chat.

### Approach
| Piece | Detail |
|-------|--------|
| Pins (P0) | Extend `preferences.ts`: `lankawa_alert_pins` JSON. Pure client evaluation against pulse metrics — no backend. |
| Email (P1) | Double opt-in form → Resend/Postmark/Supabase Edge. Daily cron sends cached brief (`/api/v1/brief`) for locale. Hard daily cap. |
| Telegram (ops) | Reuse Koel/Chime for **source down** alerts (`consecutive_failures > 3`), not consumer chat (architecture rule). |
| Files | `AlertPins.tsx`, preferences, home page; later `api/subscribe` + cron mailer. |
| Risk | Email = PII + deliverability. Ship pins first; email only with env secrets + privacy note. |

### Explicit non-goal
In-app messaging, WhatsApp Business broadcast (regulatory/cost).

---

## 5. NCPI monthly + PUCSL tariff blocks

### Problem
Economy shows CBSL macro seed + FX/fuel/gold/LPG, but not the two household numbers people argue about: **official inflation (NCPI/CCPI)** and **electricity tariff slabs**.

### Done when
- `/economy` shows latest NCPI (or CCPI) YoY + MoM with period label and DCS/CBSL provenance.
- PUCSL / CEB tariff block: residential slab table (units → LKR/kWh) with effective date.
- Both write to `observations` when ingestable; otherwise curated seed with honesty badge.

### Approach
| Piece | Detail |
|-------|--------|
| NCPI | Scrape or manually curated monthly release from DCS/CBSL press notes. Cadence ~monthly → `cadenceMinutes: 43200`. |
| PUCSL | Tariff schedule pages / gazette summaries → structured slabs JSON. Rarely changes; seed-first is fine. |
| UI | Two cards under macro snapshot; link to methodology/disclaimer. |
| Files | `integrations/ncpi.ts`, `integrations/pucsl.ts`, economy page, sources, optional cron. |
| Risk | Official series revisions — always show **period**, never “live inflation.” |

---

## Watchdog things

### What Watchdog is (context)
[Team Watchdog](https://github.com/team-watchdog) — SL open-source research collective. Relevant repos:

| Repo | What | Fit for Lankawa |
|------|------|-----------------|
| **satellite2024** | Sentinel-2 annual mosaics 2017–2024 + LULC grids (MIT) | Year-2 environment depth |
| **databank-sri-lanka** | Curated machine-readable civic datasets | Possible seed/source for NCPI/debt/transport tables |
| **Elixir / Kitchen / etc.** | Crisis-era tools | Out of product scope |
| **Protest tracker dataset** | Historical 2022 protests | **Do not ship** (explicit non-goal) |

Master plan already says: *Watchdog satellite2024 = link/consume with licence check, don’t bundle blindly.* Licence is **MIT** — legally fine to cite/reuse with attribution. Practical constraint is **size** (JPG mosaics on Drive/Mega; PNG/TIFF tens of GB).

### Recommended Watchdog policy for Lankawa

**Now (shipped):**
1. Land Change Pulse on `/environment` + district pages + methodology + API/CSV (`lankawa_land_pulse`).
2. Foreign Debt Pulse on `/economy` from databank discovery → Lankawa seed/API (`lankawa_debt_pulse`).
3. See `docs/WATCHDOG_VS_LANKAWA.md` for the full rework thesis.

**Later (year-2 / funded — parked):**
- District-level greenery/built-up **index** derived from LULC grids (offline ETL → `observations`).
- Compare-year slider on environment page.
- Reservoir surface / Sentinel flood only after morning retention is proven.

**Never:**
- Bundle protest-tracker into Lankawa.
- Present Watchdog LULC as official Survey Dept land use.
- Iframe Watchdog apps or Skylines twin into the product shell.

### Databank
Treat [databank.watchdog.team](https://databank.watchdog.team/) as a **discovery index**: when NCPI/PUCSL/debt CSVs exist there in clean form, prefer ingesting those over brittle HTML scrapes — still re-host normalized JSON in Lankawa with our provenance path.

---

## Suggested sprint slices

### Wave A (code-only, ~1 PR)
1. Coconut Index strip + COL honesty badges  
2. CitationCard + chart PNG export on economy  
3. Watchdog attribution block on environment (links only)

### Wave B
4. NCPI monthly card + PUCSL tariff seed/table  
5. Alert pins (localStorage only)

### Wave C (ops / GIS)
6. NBRO/DMC landslide panel + map toggle  
7. Morning-brief email (opt-in) + Chime ops alerts  
8. Watchdog LULC index ETL (optional, size-gated)

---

## Acceptance gates (all waves)

- Every new number has `FreshnessBadge` + `/sources/{id}`.
- Seed/live never silent — honesty copy in EN/SI/TA.
- Monochrome UI: direction via `+/−` and patterns, not hue.
- No Telegram/email in consumer UX except optional brief subscription.
- Do not start satellite mosaics until Waves A–B retain users (D1/D7 analytics already stubbed).
