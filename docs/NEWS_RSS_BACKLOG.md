# News & RSS expansion backlog — 60+ additions

**Strategy (locked):** Stay on **RSS/Atom**, not paid scrape APIs (RapidAPI / World News API). Outlets almost never ship official APIs; RSS is the free, attributable path.  
**Status:** Research backlog (Jul 2026). Items are *not* shipped unless marked ✅ elsewhere.  
**Rule:** Sisters stay data backends; Lankawa remains the umbrella UI. No iframe mosaics of news sites.

---

## A. Feed coverage (add / harden sources)

Verified working RSS from environment probes (HTTP 200 + `<item>`/`<entry>` count > 0):

| ID | Outlet | URL | Notes |
|----|--------|-----|-------|
| *(live)* | Daily Mirror breaking | `…/rss/breaking_news/108` | Already in `SL_NEWS_FEEDS` |
| *(live)* | Ada Derana EN | `adaderana.lk/rss.php` | Already live |
| *(live)* | Lankadeepa | `…/rss/latest_news/1` | Already live |
| *(live)* | Tamil Guardian | `…/rss.xml` | Already live |
| *(live)* | EconomyNext | `economynext.com/feed/` | Already live |
| *(live)* | Newswire | `newswire.lk/feed/` | Already live (gzip) |
| **N01** ✅ wave | Island.lk | `https://island.lk/feed/` | Add next |
| **N02** | Island news category | `https://island.lk/category/news/feed/` | Optional narrow |
| **N03** ✅ wave | Lanka Business Online | `https://www.lankabusinessonline.com/feed/` | Economy depth |
| **N04** | LBO alias | `https://www.lbo.lk/feed/` | Same family — pick one |
| **N05** ✅ wave | Ada Derana Biz English | `https://bizenglish.adaderana.lk/feed/` | Markets / SME |
| **N06** ✅ wave | Roar Media EN | `https://roar.media/english/feed/` | Features / explainers |
| **N07** | Yamu | `https://www.yamu.lk/feed` | Lifestyle / city (niche) |
| **N08** | CPA Lanka | `https://www.cpalanka.org/feed/` | Civic research |
| **N09** | Verité Research | `https://www.veriteresearch.org/feed/` | Policy briefs (low volume) |
| **N10** ✅ wave | DMC updates | `dmc.gov.lk/…&format=feed&type=rss` | Disaster civic RSS |
| **N11** | MoH feed | `https://www.health.gov.lk/feed/` | Health notices (sparse) |
| **N12** | BBC Asia (filter) | `feeds.bbci.co.uk/news/world/asia/rss.xml` | Keep only SL-mention titles |
| **N13** | Daily Mirror business RSS | `dailymirror.lk/rss/business/1` | Probe returned empty — recheck / canary |
| **N14** | Daily Mirror sports RSS | `dailymirror.lk/rss/sports/1` | Same — recheck |
| **N15** | FT.lk RSS | `ft.lk/rss/1` or `rssFeed/1` | Timed out / flaky — retry with backoff |
| **N16** | NewsFirst EN | *no stable RSS from probe* | Park until real feed URL found |
| **N17** | Hiru / Sunday Times / Morning | 403/404 | Park; do not scrape HTML |
| **N18** | Ada Derana Sinhala RSS | `sinhala.adaderana.lk/rss.php` | Probe empty — recheck UA/path |
| **N19** ✅ wave | Align Python ingest to full TS feed list | `ingest/sources/sl_news.py` | Ops parity |
| **N20** | Per-feed canary Action | GH Action hits each URL weekly | Catch rot early |

---

## B. Parser & data model (extract more from RSS)

| ID | Addition |
|----|----------|
| **N21** | Parse `description` / `content:encoded` → short snippet (strip HTML, ≤240 chars) |
| **N22** | Parse RSS `category` / `dc:subject` → topic tags |
| **N23** | Parse `media:thumbnail` / enclosure image → optional monochrome-safe thumb (Data Saver off only) |
| **N24** | Persist `guid` / stable hash for dedupe across republish |
| **N25** | Language detect / feed-level `lang` (`en` / `si` / `ta`) on each headline |
| **N26** | Author / `dc:creator` when present |
| **N27** | Feed-level ETag / `If-Modified-Since` to cut bandwidth |
| **N28** | Per-outlet health rows (not one blob `news_rss`) + freshness badges |
| **N29** | Durable headline store (Supabase) — last 7–30 days, not just count metric |
| **N30** | Cron poll every 30–60m (match cadence) instead of once-daily ingest |

---

## C. Product surfaces (user-facing)

| ID | Addition |
|----|----------|
| **N31** | Dedicated `/news` page (archive + filters) — stop dumping “all” onto `/sources/news_rss` |
| **N32** | Cluster detail view (member headlines, outlet count, first-seen / last-seen) |
| **N33** | Topic rails: politics / economy / disaster / sports / health (reuse brief classifier) |
| **N34** | District-scoped news strip (keyword + district gazetteer match) |
| **N35** | Global search indexes headline titles + topics |
| **N36** | News alert pin (`news_keyword` / `news_cluster`) in `ALERT_PIN_IDS` |
| **N37** | `/embed/news` or `/embed/brief` widget for partners |
| **N38** | Atom **delta** feed (only new since `?since=`) for power users |
| **N39** | PWA cache `/api/v1/news` + `/api/v1/news/clusters` for offline morning |
| **N40** | Data Saver actually caps news (wire `headlineLimit` to preference) |
| **N41** | Optional “open original” affordance with clear external-link honesty (policy decision) |
| **N42** | In-app story card: title + snippet + source + publishedAt (no full scrape) |
| **N43** | Explore hub news section with topic chips (not just remounted NewsPulse) |
| **N44** | Journalist “copy cluster citation” (outlets + first-seen time) |
| **N45** | WhatsApp share of morning news cluster (plain text, like district share) |

---

## D. Clustering, brief & “ML-lite”

| ID | Addition |
|----|----------|
| **N46** | Raise cluster quality: token stems + Sinhala/Tamil normalized compare |
| **N47** | pgvector / embedding clusters (parked E2) when volume justifies |
| **N48** | Cross-outlet “agreement score” (N sources same story → boost on home) |
| **N49** | New-story detector for email brief (only bullets that appeared since yesterday) |
| **N50** | Correlate clusters ↔ pulse metrics (fuel revision day + economy headlines) |
| **N51** | Disaster keyword → auto-suggest Met/flood/landslide pins |
| **N52** | Sports cluster → cricket card deep-link when SL match day |
| **N53** | Economy cluster → CSE / FX page deep-link |
| **N54** | Trilingual brief that keeps SI/TA *outlet* titles when feed lang = si/ta |
| **N55** | HTML email digest (not plain-text only) with unsubscribe link |
| **N56** | Brief archive API + `/brief/[date]` pages |
| **N57** | Fact-ledger rows cite *which RSS items* grounded each bullet |

---

## E. Trust, ops, API, i18n

| ID | Addition |
|----|----------|
| **N58** ✅ wave | Fix `sources.ts` methodology (remove “pending news.ts”; list real feeds) |
| **N59** ✅ wave | i18n labels for every outlet (not only Mirror/Ada) |
| **N60** | Document `/api/v1/news/clusters` in OpenAPI |
| **N61** | `GET /api/v1/news?topic=&lang=&since=&source=` filters |
| **N62** | CSV export of 24h headlines for journalists |
| **N63** | Rate-limit bucket note for news export endpoints |
| **N64** | Unsubscribe route + one-click link (DB already has `unsubscribed_at`) |
| **N65** | Feed robots / ToS register — only approved RSS, never HTML scrape |
| **N66** | Status page: per-feed last success / item count / error |
| **N67** | `llms.txt` section listing news API + Atom for AI citations |
| **N68** | Sinhala + Tamil UI copy review for news empty/error states |
| **N69** | Accessibility: cluster list keyboard nav + live region on refresh |
| **N70** | Privacy copy: “we store titles/urls/timestamps, not reading history” |

---

## F. Civic RSS beyond newspapers (still RSS)

| ID | Addition |
|----|----------|
| **N71** | DMC RSS → disaster hub “bulletins” strip (complement Met/FIRMS) |
| **N72** | Health MoH RSS → dengue / outbreak context beside choropleth |
| **N73** | Think-tank RSS (CPA / Verité) → `/civic` “research drops” |
| **N74** | BBC Asia SL-filter → “international mentions” rail (diaspora) |
| **N75** | Biz Ada + LBO → economy page “markets in the press” card |

---

## Recommended ship waves

```
Wave N-A (feeds):     N01, N03, N05, N19, N20, N58, N59
Wave N-B (parser):    N21, N22, N24, N25, N28, N29, N30
Wave N-C (surfaces):  N31, N32, N33, N36, N40, N42, N44
Wave N-D (retention): N49, N55, N56, N64, N38, N39
Wave N-E (civic RSS): N71, N72, N73, N75
Wave N-F (later):     N16–N18 park, N47 pgvector, N12 BBC filter
```

---

## Explicitly out of scope

- Paying for RapidAPI / World News API as a core dependency  
- HTML scraping NewsFirst / Hiru / paywalled pages  
- Hosting full article bodies or competing as a news portal  
- Protest-tracking from headlines without a dedicated ethics review  

---

## Count

**75 numbered additions (N01–N75)** — exceeds the 50-item floor. Prioritize Wave N-A/B before UI chrome.
