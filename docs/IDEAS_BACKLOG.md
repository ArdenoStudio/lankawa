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
| CBSL gold card on `/economy` | High habit, reuses CBSL | D next |
| LAUGFS/Litro LPG scrape + seed fallback | Household energy | D partial ✅ |
| Met Dept WARNING/ADVISORY card | Disaster | F |
| Coconut Index flow/root UI | COL honesty | F1 |

## High-value backlog

- Suba Delta / Week Ledger / home-district pin (localStorage)
- Alert pins + morning brief email + Atom delta feeds
- Economy: FX buy–sell band, Octane revision steps, world pump compare
- Disaster map + DMC landslide + NBRO baseline
- Trilingual AI brief (fact-ledger + downgrade ladder)
- Cricket: economy card + post-match 24h metric (CricAPI 100/day)
- Journalist citation cards + chart export
- Split API rate buckets + CSV exports + `/changes`
- PWA offline morning shell + habit-gated install
- NCPI monthly + PUCSL tariff blocks
- Remittance calculator for diaspora
- Village WhatsApp share cards + Data Saver mode ✅ (morning check share + local Data Saver shipped; village cards still open)

## Recently shipped / partial

- Household LPG card: `/economy` now probes public Litro/LAUGFS price-list pages and shows a clearly labeled July 2026 seed snapshot if scraping fails.
- Data Saver mode: header toggle persists `lankawa_data_saver`, skips cricket visually, caps home news at 5 headlines, and avoids loading heavy map bundles where possible.
- Share morning check: home Today section now shares FX, fuel, weather, and power via Web Share API or copies plain text for WhatsApp/manual sharing.

## Explicitly defer

- Protest/unrest tracking
- Satellite land-cover (year 2)
- FoodLK UI as live while upstream 500s
- Entity Sport cricket ($150+/mo)
- Paywalling election results

## Agent count note

This backlog aggregates outputs from planning explore agents + unbiased idea agents across retention, data layers, i18n, API, PWA, trust, economy, disaster, atlas, Ardeno composition, AI brief, cricket, COL, ops, a11y, SEO, alerts, gov open data, testing, maps, monetization, education, runbooks, Sinhala/Tamil copy, diaspora, journalism, schools, SME, health, transport, privacy, performance, competitors, embeds, and rural UX.
