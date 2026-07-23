# World Monitor adaptation guide (patterns only)

**Status:** Living doc — July 2026  
**Product rule (locked):** Learn from World Monitor’s UX and architecture *patterns*. **Do not fork AGPL code.** Re-implement under Lankawa’s license and brand.

---

## What World Monitor is

[World Monitor](https://github.com/) (and related global OSINT dashboards in that lineage) is a **global, multi-layer situation surface**: many toggles, shareable view state, freshness signalling, and a dense “ops room” aesthetic aimed at worldwide event monitoring.

Important attributes for Lankawa decisions:

| Attribute | Implication |
|-----------|-------------|
| **AGPL-licensed** | Copying source, or a derivative that includes WM code, would force AGPL on Lankawa. **Forbidden.** |
| **Global OSINT** | Protest tracking, military/Telegram war-room feeds, globe views — out of Lankawa scope. |
| **Layer-first IA** | Catalog of layers + multi-toggle + URL-encoded view is a *pattern*, not a product to clone. |

Lankawa’s north star remains: **Sri Lanka’s daily civic morning surface** — money, weather, power, news, districts — with provenance on every number (`docs/MASTER_PLAN.md`). Not “World Monitor for Sri Lanka.”

---

## Explicit: do NOT fork AGPL code

1. **No** cloning World Monitor (or AGPL forks) into this repo.
2. **No** vendoring WM TypeScript/React/shaders/globe code, even “temporarily.”
3. **No** wrapping WM as an iframe, submodule, or “inspiration branch” that ships binary/source derivatives.
4. **Yes** to reading public demos/docs and writing *original* Lankawa implementations of the same *ideas* (layer catalog, URL state, honesty badges).
5. When unsure: treat any WM file as **untouchable**; reinvent from scratch against Lankawa types and MapLibre/district GeoJSON.

If a contributor pastes AGPL-derived snippets, reject the PR and rewrite.

---

## What Lankawa already has vs World Monitor

| Capability | World Monitor (typical) | Lankawa today |
|------------|-------------------------|---------------|
| Geography | Global globe / multi-region | Sri Lanka 25 districts (+ provinces); MapLibre choropleths |
| Layers | Large catalog, many simultaneous | Focused modules: flood/landslide/GFM pins, AQI, COL, elections, property |
| Freshness | Status / age on layers | `FreshnessBadge`, `/status`, source registry, seed vs live honesty |
| View state | Shareable multi-layer URLs | Partial (search params on some feeds); not a full layer-bitmask yet |
| Personas | Ops / markets / citizen variants | Single civic morning surface; home-district pin |
| Alerts | Dense OSINT pins | LocalStorage alert pins (FX, flood, Met∩flood, CSE, tenders, …) |
| Ingest | Aggressive multi-source | Cron + request adapters; fail-closed / seed-honest when upstream down |
| Brand | War-room / OSINT | Lankawa brand-first morning (`docs/BRAND.md`) |

Lankawa already ships the **restraint** we want from Monitor-class UIs: provenance links, seed labels, and “not official government” footers — without the OSINT war room.

---

## Patterns adapted this wave

These are Lankawa-native implementations inspired by WM-class products — **not** ports.

| Pattern | Where it lives | Honesty / notes |
|---------|----------------|-----------------|
| **Layer registry mindset** | `src/lib/sources.ts` + `/sources/[id]` | Every metric traces to a registered source; provenance aliases (e.g. `public_services_seed` → `public_services_stub`) |
| **Multi-toggle map modes** | `DisasterRiskMap` flood / landslide / GFM | Local mode toggle; monochrome fills — not a WM layer stack |
| **URL / filter state** | Tenders, district feeds, compare | Query params for district/q/status; deepen toward shareable multi-layer views later |
| **Presets (lightweight)** | Home district pin, alert pins, CSE watchlist | Device-local personalization — not WM persona packs yet |
| **Flood choropleth + pin overlays** | Disaster map + `flood-extent-pins` | Pins/seed GeoJSON; never claim DMC inundation mosaics |
| **Freshness / status honesty** | `/status`, badges, tenders + environment live/seed copy | Live copy only when `sourceId` is live (e.g. `egp_procurement`, `openaq_lk`) |
| **Cron fail-closed** | Ingest + adapters | Prefer seed/empty + explicit label over fabricating “all clear” |
| **Compound hazard signal** | `met_flood` via Met∩flood district intersection | When both geo sets exist, require overlap; else coarse AND fallback |

### Honesty fixes in this wave (related)

- Tenders: `asOf` / `disclaimer` vs `asOfLive` / `disclaimerLive` by seed vs PROMISe live.
- Environment: `subtitleLive` / `asOfLive` / `disclaimerLive` when OpenAQ or Open-Meteo overlays are active.
- Developers webhooks: **HMAC helper ready; outbound delivery not enabled yet.**

---

## High-value next adaptations (patterns only)

Prioritize only after live layers stay green (`MASTER_PLAN` non-goal).

| Idea | Why | Sketch |
|------|-----|--------|
| **Variants / personas** `citizen` \| `markets` \| `ops` | Same data, different default layer packs | Query `?view=citizen` or localStorage preset; never a separate AGPL UI |
| **Bootstrap tiers** | Faster morning cold load | Tier-0: FX/fuel/weather/power; Tier-1: news/CSE; Tier-2: maps |
| **Shareable views** | Journalist / WhatsApp deep links | Encode selected map mode + district + pins in URL; document schema |
| **Cmd+K district fly-to** | Power-user atlas | Command palette → district slug → map flyTo + morning pack |
| **Lanka Stress Index** | One morning number | Composite of FX anomaly, flood/Met∩flood, power, dengue spike — with methodology page + seed honesty |
| **Regional PMTiles** | Faster maps offline/4G | Host Sri Lanka district/province PMTiles on CDN; keep GeoJSON fallback |

Each item must remain **Lankawa-licensed**, trilingual, and provenance-first.

---

## Explicit non-goals

Do **not** adapt these World Monitor / OSINT tropes:

- 3D **globe** or Cesium-style Earth
- **Protest / unrest** tracking
- **Military**, conflict, or Telegram “war room” OSINT feeds
- Shipping a second product that is “Lankawa Monitor”
- Forking or dual-licensing under AGPL to “save time”
- Dense floating sticker overlays on the hero (conflicts with brand-first UI rules)

Aligned with `docs/MASTER_PLAN.md` explicit non-goals and `docs/IDEAS_BACKLOG.md` deferrals.

---

## License constraints

| Action | Allowed? | Notes |
|--------|----------|-------|
| Read WM docs/demos; write original Lankawa code | ✅ | Patterns only |
| Copy WM source, shaders, or substantial structure | ❌ | AGPL contamination |
| Link to WM as prior art in docs | ✅ | Attribution as inspiration, not dependency |
| Use MIT/Apache MapLibre, Open-Meteo, OpenAQ, etc. | ✅ | Prefer permissive upstreams |
| Reuse Lanka Monitor **UI discipline** (not branding) | ✅ | Donor UX; keep Lankawa brand |
| Embed WM or other AGPL apps | ❌ | Product + license risk |

**Bottom line:** Inspiration is fine. A fork is not. When a pattern is valuable, implement it in `src/` against Lankawa types, sources, and honesty contracts — then document it here.

---

## Related docs

- `docs/MASTER_PLAN.md` — north star + non-goals  
- `docs/IDEAS_BACKLOG.md` — shipped / planned WM-pattern items  
- `docs/BRAND.md` — brand-first UI  
- `docs/ARCHITECTURE.md` — freshness contract  
- `docs/INTEGRATIONS.md` — adapter honesty  
