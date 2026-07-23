# Lankawa Ideas Backlog

Synthesized from **60+ parallel research agents** (July 2026). Prioritized for implementation after Phase A–C gates in `MASTER_PLAN.md`.

## Ship next (aligned with current build)

| Idea | Why | Phase |
|------|-----|-------|
| Morning home + Cal Sans/Inter | Retention surface | A ✅ |
| PropertyLK `/districts` map | Live credibility | B1 ✅ |
| Honest Food Life federation labels | Trust | B2 ✅ |
| Skip link + focus-visible | A11y | A ✅ |
| `llms.txt` | AI citations | F2 ✅ |
| USGS earthquake panel | Disaster completeness | F ✅ |
| Learn guides | Trust | ✅ |
| Cron persist weather/power/CSE/news | Ingest purity | C ✅ |
| Adapter canary GH Action | Scraper rot | C ✅ |
| `/embed/today` | Partner embeds | A7 ✅ |
| Morning delta strip | D7 habit | A+ ✅ |
| FX buy–sell band + remittance calc | Economy habit | ✅ |
| Atom feed + CSV export + sitemap | Syndication/SEO | ✅ |
| Home district pin + PWA shell | Retention/offline | ✅ |
| Monochrome signed deltas | A11y after B&W | ✅ |
| CBSL gold card on `/economy` | High habit, reuses CBSL | ✅ |
| LAUGFS/Litro LPG scrape + seed fallback | Household energy | D partial ✅ |
| Met Dept WARNING/ADVISORY card | Disaster | ✅ |
| Coconut Index flow/root UI | COL honesty | F1 |
| WM-pattern: tenders/environment live vs seed copy | Trust | ✅ |
| WM-pattern: Met∩flood district intersection | Alert precision | ✅ |
| WM-pattern: disaster multi-toggle + GFM pins | Map IA | ✅ |
| WM-pattern: shareable multi-layer URL views | Journalist deep links | Planned |
| WM-pattern: citizen\|markets\|ops presets | Persona packs | Planned |
| WM-pattern: Cmd+K district fly-to | Atlas power-user | Planned |
| Lanka Stress Index (composite) | One morning number | Planned |
| Regional PMTiles + bootstrap tiers | Perf / 4G | Planned |

## High-value backlog

- Suba Delta / Week Ledger / home-district pin (localStorage) ✅ (week ledger + home pin + morning deltas)
- Alert pins + morning brief email + Atom delta feeds ✅ (pins + brief opt-in shipped; Atom news feed already live; ops docs in DEPLOYMENT.md)
- Economy: FX buy–sell band, Octane revision steps, world pump compare ✅ (band/remittance + CPC revision steps shipped; world pump seed card shipped)
- Disaster map + DMC landslide + NBRO baseline ✅
- Trilingual AI brief (fact-ledger + downgrade ladder) ✅ (pulse fact ledger + locale topic templates + mode ladder)
- Cricket: economy card + post-match 24h metric (CricAPI 100/day) ✅
- Journalist citation cards + chart export ✅
- Split API rate buckets + CSV exports + `/changes` ✅ (buckets + `/changes` + expanded exports)
- PWA offline morning shell + habit-gated install ✅ (sw v4 caches brief/pulse; offline banner)
- News clusters on home (Jaccard, no pgvector) ✅
- NCPI monthly + PUCSL tariff blocks ✅
- Remittance calculator for diaspora ✅
- Village WhatsApp share cards + Data Saver mode ✅ (morning check + district share cards + Data Saver)
- World Monitor **patterns only** (no AGPL fork): see `docs/WORLD_MONITOR_ADAPTATION.md` — shareable views, personas, Cmd+K, Stress Index, PMTiles

## Recently shipped / partial

- Household LPG card: `/economy` now probes public Litro/LAUGFS price-list pages and shows a clearly labeled July 2026 seed snapshot if scraping fails.
- Data Saver mode: header toggle persists `lankawa_data_saver`, skips cricket visually, caps home news at 5 headlines, and avoids loading heavy map bundles where possible.
- Share morning check: home Today section now shares FX, fuel, weather, and power via Web Share API or copies plain text for WhatsApp/manual sharing.
- Honesty: tenders + environment live/seed copy; Met∩flood district intersection; webhook docs softened (HMAC ready, delivery not enabled). See `docs/WORLD_MONITOR_ADAPTATION.md`.

## Platform features (50+)

See **`docs/PLATFORM_FEATURES_MASTER_PLAN.md`** (phases PF-0…PF-6) and inventory **`docs/PLATFORM_FEATURES_50.md`** (**P01–P65**): economy, disaster, atlas, household, health, civic, retention, news slice, trust/ops — not news-only.

## News / RSS (exhaustive)

See **`docs/NEWS_RSS_MASTER_PLAN.md`** (phases NR-0…NR-6) and inventory **`docs/NEWS_RSS_BACKLOG.md`** (N01–N75). Strategy: **RSS only**, no paid scrape APIs.

## Explicitly defer

- Protest/unrest tracking
- Satellite land-cover (year 2)
- FoodLK UI as live while upstream 500s
- Entity Sport cricket ($150+/mo)
- Paywalling election results
- Paid news scrape APIs (RapidAPI / World News) as core deps

## Agent count note

This backlog aggregates outputs from planning explore agents + unbiased idea agents across retention, data layers, i18n, API, PWA, trust, economy, disaster, atlas, Ardeno composition, AI brief, cricket, COL, ops, a11y, SEO, alerts, gov open data, testing, maps, monetization, education, runbooks, Sinhala/Tamil copy, diaspora, journalism, schools, SME, health, transport, privacy, performance, competitors, embeds, and rural UX.
