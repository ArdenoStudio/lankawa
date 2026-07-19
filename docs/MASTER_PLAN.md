# Lankawa Master Plan — UI Redo + Platform Completion

**Status:** Implementation in progress (July 2026) — Phases A–F scaffolding landed on `cursor/master-plan-ui-and-integrations-3c69`  
**Owner:** Ardeno Studio  
**Product:** Lankawa is the umbrella. Sister apps stay APIs. Lanka Monitor is a UI/UX donor, not a second deploy.

### Progress snapshot

| Phase | Status |
|-------|--------|
| A UI morning surface | Done — brand-first hero, Today grid, NewsPulse, depth rail, Cal Sans + Inter |
| B Federation fixes | Done — PropertyLK `/districts`, Food Life-federation honesty, status provenance |
| C Ingest purity | Done — cron FX/weather/power/CSE/news/macro; pulse DB-first; freshness walk test; canary route |
| D Live civic layers | Partial — OpenAQ/tenders/dengue adapters with seed fallback; upstream coverage varies |
| E Differentiators | Partial — SI/TA RSS, morning brief + quality gate, cricket card; pgvector cluster deferred |
| F Depth & launch | Partial — COL composite + methodology, llms.txt/OpenAPI, D1/D7 retention beacon |

---

## 0. North star

Someone opens Lankawa three mornings in a row on a phone.

Not launch-day traffic. Not a second dashboard. Not “WorldMonitor for Sri Lanka.”

**One line:** Sri Lanka’s daily civic surface — money, weather, power, news, districts — with provenance on every number.

**Architecture rule (locked):**

```
Lankawa (Next.js)  →  server-side adapters  →  partner APIs / scrapers / DB
                   →  trilingual UI + public /api/v1/*
```

- Sisters (Octane, PropertyLK, Vehicle, Life/Ariva, FoodLK, Koel/Chime, Vega) are **data backends**, never iframes or external UI link-outs.
- Lanka Monitor contributes **card discipline, freshness surfacing, morning-check composition** — keep Lankawa brand (`docs/BRAND.md`). Do not reuse Monitor branding.
- Vega (Kafka/Flink lakehouse) is **Phase D+** optional event/news depth — not a home dependency.

---

## 1. Current state (honest)

### Already strong
- Phase 4–8 shipped: district atlas, pulse, economy, disaster, embeds, assistant, status, rate limits, cron FX ingest.
- Live adapters: Octane, Vehicle, Life, flood, Open-Meteo, CEB power, CSE (Chime pattern), news RSS, CBSL FX.
- Freshness contract + `FreshnessBadge` + `/status` + source registry exist.

### Broken / thin
| Gap | Reality |
|-----|---------|
| **PropertyLK** | Upstream healthy (`/districts` 200). Lankawa calls wrong path `/api/v1/districts` (404) and expects wrong JSON shape → seed. |
| **FoodLK** | Fly process up; nearly all `/api/v1/*` return HTTP 500. Needs FoodLK ops fix, not just adapter tweaks. |
| **Home composition** | Hero is busy (search + 3 CTAs + pulse strip). News/CSE live but buried. Not yet a “morning coffee” surface. |
| **Ingest purity** | Many adapters scrape on request. Only CBSL (+ news file cache) are real workers. Stale→down is not fully DB-authoritative. |
| **Seed civic modules** | Dengue, tenders, MPs, AQI, COL, transport, local gov still largely seed. |

### Explicit non-goals
- No investigative journalism / protest tracking.
- No AGPL WorldMonitor fork.
- No 3D globe.
- No new layer until existing live layers stay green.
- Do not maintain `lanka-monitor` as a parallel product.

---

## 2. UI redo principles

Keep Lankawa tokens/brand. Steal Monitor’s **restraint**, not its name.

1. **Brand first** — island mark + “Lankawa” hero-level; headline must not overpower the brand.
2. **One composition** — first viewport = morning surface, not a module directory.
3. **Hero budget** — brand, one line, one short support sentence, one CTA group, one dominant visual plane (map silhouette / island atmosphere — full-bleed, not inset card collage).
4. **No hero overlays** — no floating chips, promo stickers, or stat badges on the hero media.
5. **Cards only when interactive** — pulse metrics are the interaction unit; drop decorative card chrome elsewhere.
6. **Every number has a freshness badge** — stale is visible, never silent.
7. **Mobile-first** — 4G morning check is the primary design target.
8. **Trilingual** — EN / සිංහල / தமிழ் strings for every new surface (brief especially).
9. **Motion** — 2–3 intentional motions (hero entrance, pulse stagger, freshness fade) — not noise.
10. **Typography** — keep Noto Sans family for SI/TA coverage; sharpen hierarchy (display weight for brand, quieter body). Avoid Inter/Roboto defaults and purple/glow AI clichés.

### Target home information architecture

```
┌──────────────────────────────────────────────┐
│  HERO (one composition)                      │
│  Brand · one line · one CTA · full-bleed     │
│  visual (island / atmosphere)                │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│  TODAY — morning strip / grid                │
│  FX · Petrol · Diesel · Weather · Power      │
│  (+ Flood when elevated)                     │
│  each with FreshnessBadge                    │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│  NEWS PULSE (headlines → later AI brief)     │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│  DEPTH RAIL — Districts · Economy · Disaster │
│  (links into existing modules, not duplicates)│
└──────────────────────────────────────────────┘
│  SourceHealthBar (compact)                   │
```

CSE, property, vehicles, food stay on depth pages (`/economy`, `/property`, …) unless they earn a home slot after 30 green days.

### UI work packages (Phase A)

| ID | Work | Notes |
|----|------|-------|
| A1 | Audit + cut home clutter | Remove secondary CTA cluster from hero; move search below fold or into header |
| A2 | Morning Today grid | Promote Monitor-style metric cards; unify `PulseCard` / `FreshnessBadge` |
| A3 | News on home | Mount `NewsPulse` under Today |
| A4 | Depth rail | Slim module entry (Districts / Economy / Disaster / Explore) — not a dashboard of cards |
| A5 | Visual system pass | Hero atmosphere, spacing, motion; keep teal/maroon/gold tokens |
| A6 | Inner-page consistency | Shared `PageHeader`, density rules for `/economy`, `/disaster`, `/explore` |
| A7 | Embeds + OG | Match new home language on `/embed/*` and social cards |

**UI gate:** cold load on mid phone shows brand + Today metrics + news without scrolling past the fold on a typical viewport; every Today metric shows freshness.

---

## 3. Data & integration track (parallel-safe after A1–A3)

### Phase B — Fix the federation

| ID | Work | Done when |
|----|------|-----------|
| B1 | **PropertyLK adapter** | Call `/districts`; map `{district,count,avg_price}` → Lankawa snapshot; raise timeout; live provenance on `/property` |
| B2 | **FoodLK recovery** | Upstream `/api/v1/*` returns 200 (ops). Then map a stable summary endpoint. Until then prefer Life food domain with honest provenance |
| B3 | **Life timeout resilience** | Retry/backoff; never block home on Life |
| B4 | **Partner health on `/status`** | Show upstream HTTP outcome, not only seed fallback |

### Phase C — Ingest purity (Monitor lesson → Lankawa workers)

| ID | Work | Done when |
|----|------|-----------|
| C1 | Expand cron beyond CBSL | Weather, power, CSE, news write `observations` + `source_health` |
| C2 | Pulse prefers DB | Live scrape only as fallback; page load never required to hit gov sites |
| C3 | Freshness walk test | Kill a source → badge goes `stale` then `down` |
| C4 | Telegram ops alert (optional) | `consecutive_failures > 3` → Koel/Chime delivery pipe — ops only, not consumer UI |

### Phase D — Live civic layers (former Phase 9 P0)

| ID | Work | Source |
|----|------|--------|
| D1 | Dengue live | Epidemiology Unit |
| D2 | e-GP tenders live | Procurement portal |
| D3 | AQI live | OpenAQ / IQAir |
| D4 | Budget/macro → observations | CBSL / Verité |
| D5 | HARTI / essentials (if FoodLK stays dead) | Own ingest or Life |

**Breadth gate:** no D-item starts until B1 + C1–C3 are green for the existing Today layers.

### Phase E — Differentiator (Monitor Phase 3)

| ID | Work | Notes |
|----|------|-------|
| E1 | RSS broaden | SI/TA outlets + existing EN |
| E2 | Embed + cluster | pgvector; tune threshold ~0.85 |
| E3 | Trilingual AI brief | Claude; hourly cache; hard daily cap; degrade to previous brief |
| E4 | Brief quality gate | Human-readable or don’t ship |
| E5 | Cricket card | Free API evaluation; home only on match days |

### Phase F — Depth & launch hygiene

| ID | Work |
|----|------|
| F1 | Cost-of-living composite (live inputs) + methodology page |
| DMC/NBRO warnings on disaster map |
| F2 | Public API docs polish + `llms.txt` |
| F3 | Analytics = D1/D7 return, not vanity pageviews |
| F4 | Soft launch channels (LK Discords, r/srilanka) — not HN chase |
| F5 | Vega (optional) — SL news/event correlation feed into brief topics |

### Parked (year-2 / funded)
Satellite reservoir surface area, sprawl, Sentinel flood — only after retention proven. Watchdog satellite2024 = link/consume with licence check, don’t bundle blindly.

---

## 4. Sister project map

| Project | Role in Lankawa | Action |
|---------|-----------------|--------|
| **Octane** | Fuel API | Keep; cache hard |
| **PropertyLK** | District price aggregates | Fix adapter (B1) |
| **Vehicle-Platform** | Used-vehicle medians | Keep |
| **life-platform (Ariva)** | Meta living-cost / Ardeno hub | Keep; food secondary |
| **FoodLK** | Staples API | Fix upstream (B2) or replace with HARTI ingest |
| **Koel / Chime** | CSE adapter pattern + future Telegram ops | No UI embed; no Telegram in Lankawa consumer UX |
| **lanka-monitor** | UI patterns + CBSL scrape lessons | Harvest; do not deploy in parallel |
| **Vega** | Streaming lakehouse | Optional Phase F5 |
| **lk-flood-api** | Flood stations | Keep |

---

## 5. Suggested build order

Do UI and federation in parallel only where they don’t collide (adapters don’t block A1–A3).

```
A1 → A2 → A3     UI morning surface
     ↘
B1               Property fix (quick win, unblocks credibility)
B2 / B3          Food + Life resilience
A4 → A5 → A6 → A7  finish UI system
C1 → C2 → C3     ingest purity + stale test
D*               live civic replacements (gated)
E*               AI brief (gated on news quality)
F*               composite, launch, optional Vega
```

---

## 6. Definition of done (program)

1. Home passes the morning-check UI gate (Phase A).
2. Property live (not seed) on `/property` with correct provenance.
3. Food either live from FoodLK or honestly sourced from Life/HARTI — never silent fake.
4. Today layers DB-backed; deliberate scraper kill → visible stale/down.
5. News on home; AI brief only if quality gate passes.
6. `docs/INTEGRATIONS.md` + `docs/DATA_SOURCES.md` match production reality.
7. Lanka Monitor not required for users to get the daily surface.

---

## 7. Doc index

| Doc | Role |
|-----|------|
| `docs/MASTER_PLAN.md` | This file — sequencing + gates |
| `docs/ROADMAP.md` | Historical phases + Phase 9 backlog |
| `docs/INTEGRATIONS.md` | Partner adapter status |
| `docs/ARCHITECTURE.md` | Layer diagram + freshness contract |
| `docs/BRAND.md` | Visual identity (authoritative for UI redo) |
| `docs/DEPLOYMENT.md` | Env, cron, Supabase |

When this plan and `ROADMAP.md` disagree, **this file wins** until ROADMAP is updated.
