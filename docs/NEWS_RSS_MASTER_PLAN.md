# News & RSS Master Plan

**Status:** Active — Phase NR-0 partial (feed expansion landed in #14)  
**Parent plan:** `docs/MASTER_PLAN.md` (Phase E differentiator expands here)  
**Backlog index:** `docs/NEWS_RSS_BACKLOG.md` (N01–N75 — inventory only; **this file wins** on sequencing)  
**Strategy (locked):** RSS/Atom only. No paid scrape APIs as core deps. No HTML scrape. No news-portal ambition.

---

## 0. North star

Every morning, Lankawa’s news layer answers three questions without leaving the app:

1. **What is the same story across outlets?** (clusters)  
2. **What is new since yesterday?** (delta / brief)  
3. **Does this touch my district, money, or disaster risk?** (routing into civic modules)

Not a second Ada Derana. Not a full-text archive. **Headlines + provenance + routing.**

```
RSS feeds  →  parser/normalize  →  store (cache → DB)
           →  cluster / classify
           →  home · /news · brief · district · disaster · economy
           →  /api/v1/news* · Atom · CSV · embeds
```

---

## 1. Current state (honest)

| Layer | Reality |
|-------|---------|
| Feeds | 11 live in `SL_NEWS_FEEDS` (Mirror, Ada, Lankadeepa, Tamil Guardian, EconomyNext, Newswire, Island, LBO, Ada Biz, Roar, DMC) |
| Parser | Title / url / publishedAt / source only |
| Store | File cache + pulse `headline_count`; no durable headline history |
| Cluster | Jaccard ≥ ~0.35; home shows multi-outlet clusters |
| UI | Home + Explore `NewsPulse`; no `/news` page; cluster cards are shallow |
| Brief | Template/AI ladder + email opt-in; plain-text email; no archive |
| Cron | News metric daily at 06:00 UTC — behind 30m cadence |
| Ops | One blob source `news_rss`; canary incomplete |

### Explicit non-goals
- Competing as a news website or hosting article bodies  
- RapidAPI / World News API as required infrastructure  
- Scraping NewsFirst / Hiru / paywalled HTML  
- Protest/unrest tracking from headlines (ethics park)  
- pgvector until durable store + volume justify it  

---

## 2. Phase overview

| Phase | Name | Goal | Gate to exit |
|-------|------|------|--------------|
| **NR-0** | Feed foundation | Stable approved feed list + docs honesty | ✅ Partial (#14) — finish canary |
| **NR-1** | Parser & store | Richer items + durable history + frequent poll | DB has 7d headlines; cron ≤60m |
| **NR-2** | News product surface | `/news`, clusters, topics, story cards | Morning user can browse without `/sources` |
| **NR-3** | Civic routing | District / disaster / economy / search / pins | ≥1 deep-link path per topic class |
| **NR-4** | Retention digests | Delta brief, HTML email, archive, unsubscribe | D7 brief open or email confirm loop works |
| **NR-5** | Civic RSS modules | DMC / MoH / think-tank / markets-in-press | Each module has honesty + provenance |
| **NR-6** | Scale & quality | Better clusters, filters API, embeds, a11y | Quality gate green 14 days |

```
NR-0 ──► NR-1 ──► NR-2 ──► NR-3
                │           │
                └─► NR-4 ◄──┘   (retention can start after NR-1 store)
                         │
                         ▼
                       NR-5 ──► NR-6
```

**Rule:** Do not start NR-5 (more feeds on new surfaces) until NR-1 store + NR-2 `/news` exist — otherwise feed breadth has nowhere honest to land.

---

## 3. Phase NR-0 — Feed foundation

**Intent:** Only approved RSS URLs; list matches code; rot is visible.

| ID | Work | Done when | Backlog |
|----|------|-----------|---------|
| NR-0.1 | Expand EN/biz/civic feeds | Island, LBO, Ada Biz, Roar, DMC live | N01, N03, N05, N06, N10 ✅ |
| NR-0.2 | Align Python ingest | `sl_news.py` == TS list | N19 ✅ |
| NR-0.3 | Fix source registry + i18n | Methodology lists real feeds; all outlet labels | N58, N59 ✅ |
| NR-0.4 | Per-feed canary Action | Weekly GH Action: HTTP + item count; fails → issue/ops | N20 |
| NR-0.5 | Feed policy register | Short `docs` table: URL, lang, category, ToS note | N65 |
| NR-0.6 | Flaky candidates | Retry Mirror biz/sports, FT.lk, Ada SI with backoff; add only if 7d green | N13–N15, N18 |
| NR-0.7 | Park non-RSS | NewsFirst / Hiru / Morning — document “no feed” | N16, N17 |

**Exit gate:** Canary green on all production feeds for 7 consecutive days.

---

## 4. Phase NR-1 — Parser & durable store

**Intent:** Stop treating news as a single integer. Every headline is a row with enough fields for clustering and digests.

| ID | Work | Done when | Backlog |
|----|------|-----------|---------|
| NR-1.1 | Snippet parse | `description` / `content:encoded` → ≤240 chars | N21 |
| NR-1.2 | Categories | RSS category → normalized tags | N22 |
| NR-1.3 | Stable id | `guid` or hash(url\|title\|source) | N24 |
| NR-1.4 | Language | Feed-level `lang` + optional detect | N25 |
| NR-1.5 | Author (optional) | Store when present; don’t require | N26 |
| NR-1.6 | Conditional fetch | ETag / If-Modified-Since per feed | N27 |
| NR-1.7 | Per-outlet health | `source_health` (or feed table) per feed id | N28, N66 |
| NR-1.8 | Supabase headlines | Migration: headlines last 7–30d; cron upsert | N29 |
| NR-1.9 | Cron cadence | News poll every 30–60m (Vercel cron or Actions) | N30 |
| NR-1.10 | Thumbnails (optional) | Parse media URL; render only if Data Saver off | N23 |

**Schema sketch (illustrative):**

```
news_headlines (
  id text pk,          -- guid/hash
  source_id text,      -- daily_mirror | island | …
  title text,
  url text,
  snippet text null,
  lang text,           -- en | si | ta | unknown
  categories text[],
  published_at timestamptz,
  fetched_at timestamptz,
  cluster_id text null
)
news_feed_health (
  source_id text pk,
  last_success_at, last_error, item_count, etag
)
```

**Exit gate:** Home/API can serve last 24h from DB if live RSS fails; deliberate feed kill → that outlet `down`, others stay up.

---

## 5. Phase NR-2 — News product surface

**Intent:** News is a first-class module, not a home appendix.

| ID | Work | Done when | Backlog |
|----|------|-----------|---------|
| NR-2.1 | `/[locale]/news` | Archive + filters (topic, lang, source) | N31 |
| NR-2.2 | Story card | Title, snippet, source, time, provenance | N42 |
| NR-2.3 | Cluster detail | `/news/clusters/[id]` member list + outlet count | N32 |
| NR-2.4 | Topic rails | politics / economy / disaster / sports / health | N33 |
| NR-2.5 | Home polish | Cluster cards open detail; Data Saver cap wired | N40 |
| NR-2.6 | Citation copy | Journalist cluster citation button | N44 |
| NR-2.7 | WhatsApp share | Plain-text cluster / morning news share | N45 |
| NR-2.8 | External link policy | Product decision: provenance-only vs optional “original” with honesty | N41 |
| NR-2.9 | Explore chips | Topic chips on Explore news block | N43 |
| NR-2.10 | OpenAPI + filters | Document clusters; `?topic&lang&since&source` | N60, N61 |
| NR-2.11 | CSV export | 24h headlines for press | N62, N63 |

**IA target:**

```
/news
  ├─ Today clusters (agreement-sorted)
  ├─ Topic rails
  ├─ Latest headlines (filterable)
  └─ Provenance / feed health
/news/clusters/[id]
  └─ Member headlines · first/last seen · share/cite
```

**Exit gate:** Cold phone load can open `/news`, filter economy, open a cluster, copy citation — without visiting `/sources/news_rss`.

---

## 6. Phase NR-3 — Civic routing

**Intent:** Headlines route into Lankawa’s civic modules (the differentiator vs aggregators).

| ID | Work | Done when | Backlog |
|----|------|-----------|---------|
| NR-3.1 | District gazetteer match | District page “In the press” strip | N34 |
| NR-3.2 | Global search | Titles + topics in `GlobalSearch` | N35 |
| NR-3.3 | News alert pins | `news_cluster` and/or keyword pin | N36 |
| NR-3.4 | Disaster keyword → pins | Suggest Met/flood/landslide when cluster matches | N51 |
| NR-3.5 | Economy deep-link | Economy clusters → `/economy` (CSE/FX) | N53, N75 |
| NR-3.6 | Sports deep-link | Sports clusters → cricket card when match day | N52 |
| NR-3.7 | Pulse correlation | Brief/home note when fuel revision ∩ economy news | N50 |
| NR-3.8 | Embed | `/embed/news` or `/embed/brief` | N37 |
| NR-3.9 | PWA cache | Cache news + clusters endpoints | N39 |
| NR-3.10 | Atom delta | `/feed.xml?since=` or `/feed/delta.xml` | N38 |

**Exit gate:** From a cluster about floods or fuel, one tap lands on the matching civic panel with provenance intact.

---

## 7. Phase NR-4 — Retention digests

**Intent:** Come back tomorrow because the brief changed.

| ID | Work | Done when | Backlog |
|----|------|-----------|---------|
| NR-4.1 | New-since-yesterday | Brief bullets only for new/changed clusters | N49 |
| NR-4.2 | HTML email | Branded plain-safe HTML + deep links | N55 |
| NR-4.3 | Unsubscribe | One-click route; honor `unsubscribed_at` | N64 |
| NR-4.4 | Brief archive | `/brief/[date]` + API history | N56 |
| NR-4.5 | Fact-ledger ↔ RSS | Each bullet lists grounding headline ids | N57 |
| NR-4.6 | SI/TA titles | Prefer native-lang titles when feed lang matches locale | N54 |
| NR-4.7 | Privacy copy | What we store (titles/urls/times only) | N70 |

**Exit gate:** Confirmed subscriber can unsubscribe in one click; archive shows yesterday’s brief; email contains only delta bullets when possible.

---

## 8. Phase NR-5 — Civic RSS modules

**Intent:** Government / research / biz RSS as module context — still RSS, still attributed.

| ID | Work | Surface | Backlog |
|----|------|---------|---------|
| NR-5.1 | DMC bulletins strip | `/disaster` | N71 (feed already in list) |
| NR-5.2 | MoH notices | `/health` near dengue | N11, N72 |
| NR-5.3 | CPA + Verité | `/civic` research drops | N08, N09, N73 |
| NR-5.4 | Markets in the press | `/economy` card from LBO + Ada Biz | N75 |
| NR-5.5 | BBC Asia SL-filter | Diaspora “international mentions” (title filter) | N12, N74 |
| NR-5.6 | Optional niche | Yamu only if Explore wants lifestyle rail | N07 |

**Exit gate:** Each new strip has FreshnessBadge + `/sources` path; empty ≠ “no risk.”

---

## 9. Phase NR-6 — Scale & quality

**Intent:** Better matching and polish once data is durable.

| ID | Work | Done when | Backlog |
|----|------|-----------|---------|
| NR-6.1 | Better Jaccard | Stems + SI/TA normalize | N46 |
| NR-6.2 | Agreement score | Multi-outlet boost on home | N48 |
| NR-6.3 | pgvector clusters | Only if NR-1 store ≥30d and Jaccard saturates | N47 (= MASTER E2) |
| NR-6.4 | A11y | Keyboard clusters + live region | N69 |
| NR-6.5 | SI/TA copy review | Empty/error strings | N68 |
| NR-6.6 | llms.txt news section | AI citation surface | N67 |
| NR-6.7 | Status UI | Per-feed counts on `/status` | N66 |

**Exit gate:** 14 days with canary green, cluster precision spot-check (human) ≥ acceptable, no spike in “wrong language” complaints.

---

## 10. Suggested build order (execution)

```
NR-0.4 canary          finish foundation
NR-1.1 → 1.4           richer parse
NR-1.8 → 1.9           DB + cron cadence     ← critical path
NR-2.1 → 2.3           /news + cluster detail
NR-2.4 → 2.7           topics + share/cite
NR-3.1 → 3.5           district + search + pins + deep-links
NR-4.1 → 4.3           delta brief + HTML email + unsubscribe
NR-5.*                 civic strips (DMC first — feed already live)
NR-6.*                 quality / pgvector only if needed
```

Parallel-safe: OpenAPI/CSV (NR-2.10–2.11) and canary (NR-0.4) anytime after NR-0.  
Do **not** parallelize “add 10 more feeds” with “no `/news` page.”

---

## 11. Definition of done (program)

1. Approved RSS list documented; weekly canary green.  
2. Headlines durable ≥7 days; per-outlet health visible.  
3. `/news` + cluster detail are the primary archive (not `/sources/news_rss`).  
4. Topics route into economy / disaster / district / cricket where relevant.  
5. Morning brief is delta-aware; email has unsubscribe + optional HTML.  
6. No HTML scrape; no paid news API required for core path.  
7. `NEWS_RSS_BACKLOG.md` items marked done as phases complete; this plan stays sequencing authority.

---

## 12. Mapping to platform master plan

| Platform phase | News plan |
|----------------|-----------|
| E1 RSS broaden | NR-0 (+ NR-5 feed adds) |
| E2 embed + cluster / pgvector | NR-2 surfaces + NR-6.3 |
| E3–E4 AI brief quality | NR-4 (+ existing brief ladder) |
| F5 Vega correlation | Optional after NR-3.7; not blocking |
| C ingest purity | NR-1.8–1.9 |

---

## 13. Doc index

| Doc | Role |
|-----|------|
| `docs/NEWS_RSS_MASTER_PLAN.md` | **This file** — phases, gates, order |
| `docs/NEWS_RSS_BACKLOG.md` | Flat inventory N01–N75 |
| `docs/MASTER_PLAN.md` | Whole-product sequencing |
| `docs/IDEAS_BACKLOG.md` | Pointer into news backlog |
| `src/lib/integrations/news.ts` | Feed registry + parser |
| `src/lib/integrations/news-cluster.ts` | Clustering |
| `src/lib/integrations/brief.ts` | Morning brief |

When backlog waves and this plan disagree, **this file wins**.
