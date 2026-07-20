# Platform features backlog — 55 shippable ideas

**Status:** P01–P65 implemented as shippable scaffolds (Jul 2026) on `cursor/platform-features-build-3c69` — live depth still gated by adapters/keys  
**Scope:** Whole Lankawa product — economy, disaster, atlas, household, health, civic, retention, trust/ops — **plus** news (cross-links to `NEWS_RSS_MASTER_PLAN.md`).  
**Rule:** Sisters = data backends. RSS for news, not paid scrapers. No protest tracker. No multi-GB mosaics in-browser.  
**Merge:** See `PLATFORM_FEATURES_MASTER_PLAN.md` §5.

Related docs: `MASTER_PLAN.md` · `DATA_EXPANSION_RESEARCH.md` · `NEWS_RSS_MASTER_PLAN.md` · `IDEAS_BACKLOG.md`

---

## How to read this

| Column | Meaning |
|--------|---------|
| **Pri** | P0 = next waves · P1 = after P0 green · P2 = later / gated |
| **Origin** | `new` or `extend` (named in existing research/plans) |
| **Depends** | Soft prerequisite |

---

## A. Economy & markets (10)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P01** | CSE exchange notices strip on `/economy` | P0 | extend | CSE live | Notices from CSE API (or seed) with freshness |
| **P02** | ASPI / SL20 session high–low range on CSE card | P0 | extend | — | Range shown beside index Δ |
| **P03** | CSE watchlist (localStorage, ≤5 symbols) | P1 | new | P02 | Home chip when Data Saver off |
| **P04** | PUCSL generation-mix spark under tariff card | P1 | extend | PUCSL JSON stable | Mix % + provenance |
| **P05** | CBSL T-bill / WAYR saver strip (stale-OK) | P1 | extend | PDF/seed ingest | Latest yield + as-of |
| **P06** | Fuel “revision week” calendar alert pin | P0 | extend | alert-pins | Fires in CPC window only — no price prediction |
| **P07** | LPG prices for home-district (not only Colombo) | P0 | extend | home pin | Cylinder row for pinned district or honest fallback |
| **P08** | Macro observations cron (inflation/reserves) | P1 | extend | ingest purity | `cbsl_macro` not seed-only forever |
| **P09** | “Markets in the press” card (LBO + Ada Biz RSS) | P1 | extend | NEWS NR-5 | Economy page strip with provenance |
| **P10** | Household energy one-pager (fuel+LPG+tariff estimate) | P1 | new | P07 | Single composition on `/economy` or `/household` |

---

## B. Disaster & weather (10)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P11** | LECO outage adapter beside CEB | P0 | extend | — | Disaster + power metric honesty |
| **P12** | Power outage concentration by district | P1 | extend | P11/CEB | District map or table score |
| **P13** | Met ∩ flood priority pin (same district) | P0 | extend | flood_rising + met | Single home alert when both fire |
| **P14** | Open-Meteo Flood / GloFAS basin panel | P1 | extend | — | Complements river gauges |
| **P15** | GFM / flood-extent GeoJSON pins on disaster map | P1 | extend | map toggle | Pins, not mosaics |
| **P16** | Multi-city / home-district weather (Open-Meteo) | P0 | new | home pin | Today weather uses pin coords when set |
| **P17** | Marine swell card for coastal districts | P2 | extend | P16 | West/south district pages |
| **P18** | Home-district hazard toast (FIRMS/flood/landslide) | P0 | new | home pin + FIRMS key | Toast only for pinned district |
| **P19** | DMC RSS bulletins on `/disaster` | P0 | extend | NEWS NR-5 / feed live | Strip + FreshnessBadge |
| **P20** | JTWC cyclone watch card (seasonal) | P1 | extend | GDACS | Shows when basin active |

---

## C. Atlas — districts, provinces, compare (8)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P21** | District morning pack on home (COL/dengue/AQI when pinned) | P0 | new | home pin | Today gains 1–2 district metrics |
| **P22** | Compare: property + land + AQI columns | P1 | new | compare page | ≤4 districts side-by-side |
| **P23** | Compare WhatsApp share card | P1 | new | P22 | Plain-text deltas |
| **P24** | Province pulse aggregates (flood/dengue/COL) | P1 | new | — | `/provinces/[slug]` summary strip |
| **P25** | Census 2024 footnotes on district pages | P2 | extend | nuuuwan/HDX | Population context, stale-OK |
| **P26** | DS-division search → services filter | P2 | new | gazetteer stub | Find facility by DS name |
| **P27** | District “in the press” strip (keyword match) | P1 | extend | NEWS NR-3 | Headlines mentioning district |
| **P28** | District offline services pack in SW | P1 | new | PWA | Cache services for home district |

---

## D. Household — COL, food, property, vehicles (7)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P29** | COL “what moved your basket” week strip | P0 | extend | fuel/food history | Ranked movers + honesty |
| **P30** | HARTI / essentials ingest if FoodLK stays down | P1 | extend | MASTER D5 | Live or Life with labels |
| **P31** | Property listing-count + 30d trend spark | P0 | extend | PropertyLK | Uses `count` + history if any |
| **P32** | Vehicles make/model median deep-dive | P1 | new | Vehicle API | District → model drill-in |
| **P33** | COL district choropleth | P1 | new | COL composite | Map on `/cost-of-living` |
| **P34** | Coconut Index history spark (7–30d) | P1 | extend | COL honesty | When observations exist |
| **P35** | Remittance live TT scrape (3 banks) | P0 | extend | seed board | `isSeed: false` when scrape green |

---

## E. Health & environment (6)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P36** | Dengue week-over-week spike alert pin | P0 | extend | dengue stats | Home pin + district highlight |
| **P37** | Colombo AQI on Today strip when fresh | P0 | extend | OpenAQ | Home metric, not only `/environment` |
| **P38** | MoH notices strip on `/health` | P1 | extend | NEWS NR-5 | RSS + provenance |
| **P39** | Urban heat monthly note (Colombo) | P2 | extend | LST seed | Health page context |
| **P40** | NDVI weekly cron → observations | P1 | extend | land pulse seed | Seed → live ETL path |
| **P41** | Land-change year compare control | P2 | extend | Watchdog deepen | 2018↔2024 interactive |

---

## F. Civic — elections, budget, tenders, LG (6)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P42** | e-GP “closing soon” tender alerts | P0 | extend | tenders adapter | Pin or `/tenders` filter |
| **P43** | Budget YoY + ministry charts (beyond seed) | P1 | extend | seed budget | Charts + methodology |
| **P44** | Real MP / Hansard ingest (replace seed scorecards) | P2 | extend | ROADMAP | Provenance or stay seed-honest |
| **P45** | Local-gov meeting minutes / contacts deepen | P2 | extend | LG directory | Per-body page substance |
| **P46** | Election night refresh mode | P1 | new | elections seeds | Live region + cadence honesty |
| **P47** | CPA / Verité research drops on `/civic` | P1 | extend | NEWS NR-5 | RSS strip |

---

## G. Retention, alerts, PWA, share (8)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P48** | HTML morning-brief email + deep links | P0 | extend | NEWS NR-4 | Not plain-text only |
| **P49** | One-click brief unsubscribe | P0 | extend | NEWS NR-4 | Honors `unsubscribed_at` |
| **P50** | Brief archive `/brief/[date]` | P1 | extend | NEWS NR-4 | Yesterday’s brief readable |
| **P51** | Alert pins: dengue, CSE %, COL basket, news cluster | P0 | new/extend | alert-pins | New IDs + i18n + tests |
| **P52** | Dynamic OG / share PNG for morning + district | P1 | new | — | Link unfurl shows numbers |
| **P53** | Web Push for fired pins (opt-in) | P2 | new | P51 | Permission + quiet hours |
| **P54** | Embed `/embed/cse` + `/embed/brief` | P1 | extend/new | embeds | Partner iframe |
| **P55** | Data Saver harden (skip CSE sectors, land chart, maps) | P0 | new | data-saver | Audit checklist green |

---

## H. News (platform-facing slice — full plan elsewhere) (5)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P56** | Per-feed canary + `/status` rows | P0 | extend | NEWS NR-0/1 | Outlet-level health |
| **P57** | Durable headlines DB + 30–60m cron | P0 | extend | NEWS NR-1 | 7d history survives RSS blip |
| **P58** | Dedicated `/news` + cluster detail | P0 | extend | NEWS NR-2 | Not `/sources` dump |
| **P59** | Topic rails + journalist cluster citation | P1 | extend | P58 | Cite/share works |
| **P60** | Atom delta feed `?since=` | P1 | extend | NEWS NR-3 | Power-user syndication |

*(Full news sequencing: `docs/NEWS_RSS_MASTER_PLAN.md` NR-0…NR-6 — 75 more inventory items.)*

---

## I. Trust, API, assistant, i18n (5)

| ID | Feature | Pri | Origin | Depends | Done when |
|----|---------|-----|--------|---------|-----------|
| **P61** | Assistant district-scoped + SI/TA grounded answers | P1 | extend | pulse/COL | Locale query returns cited metrics |
| **P62** | Signed change webhooks from `/changes` | P2 | extend | API | Partner docs + HMAC |
| **P63** | Widget SDK beyond iframe preview | P2 | extend | embeds | npm or documented snippet |
| **P64** | i18n CI gate (new keys in en/si/ta) | P0 | new | — | PR fails if SI/TA missing |
| **P65** | Telegram **ops** alerts on adapter failure streak | P1 | extend | MASTER C4 | Ops only — not consumer UI |

---

## Ship waves (recommended)

```
Wave P-A (household morning):  P16, P18, P21, P07, P29, P37, P51, P55, P64
Wave P-B (money deepen):       P01, P02, P06, P35, P10, P31
Wave P-C (disaster harden):    P11, P13, P19, P36, P12
Wave P-D (news foundation):    P56, P57, P58   ← aligns NEWS NR-0/1/2
Wave P-E (retention):          P48, P49, P50, P52, P54
Wave P-F (atlas/civic):        P22, P23, P24, P27, P42, P47
Wave P-G (later):              P03, P14, P15, P33, P40, P43, P46, P53, P61+
```

**Critical path for daily users:** Wave P-A → P-B → P-C. News Wave P-D parallel once canary exists. Do not start P-G satellite/ETL until P-A retention metrics move.

---

## Explicitly out of scope (still)

- Protest / unrest tracking  
- Entity Sport paid cricket  
- RapidAPI / World News as core news deps  
- HTML scrape of NewsFirst / Hiru  
- Multi-GB satellite mosaics in the Next app  
- Paywalling election results  

---

## Count

**65 platform features (P01–P65)** · News-only inventory remains **N01–N75** in `NEWS_RSS_BACKLOG.md`.  
Together: **140** tracked additions; this file is the cross-product “what should we build next” list.
