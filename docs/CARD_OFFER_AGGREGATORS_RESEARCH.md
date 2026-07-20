# Sri Lanka card-offer aggregators — research (Lankawa)

**Status:** Research (very thorough), Jul 2026  
**Product rule:** Prefer official bank marketing surfaces (see `COMBANK_OFFERS_RESEARCH.md`, `NTB_SC_HSBC_OFFERS_RESEARCH.md`, `AMANA_PABC_SDB_OFFERS_RESEARCH.md`). Aggregators are evaluated only as optional bootstrap / cross-check — never as the sole “live” authority.

---

## Verdict

| Question | Answer |
|----------|--------|
| Does **MyPromo.lk** expose a public API / RSS? | **No.** Probed `/api*`, `/feed`, `/rss`, `/atom.xml`, `/wp-json` → 404/500. Sitemap lists coarse hub pages only. |
| Does **FD Rates LK** (`fdrateslk.com`) expose a public API / RSS? | **No.** All `/api/*` → 404; `robots.txt` Disallows `/api/`. No RSS/Atom. |
| Usable structured data? | **MyPromo:** schema.org `Offer` on detail pages. **FD Rates:** rich JSON-LD (`Dataset` + `ItemList` + `FAQPage`) but `ItemList` embeds only **10 samples**, not the full catalog. |
| Best aggregator for Lankawa? | **None as primary.** If any: **FD Rates LK** only as optional bootstrap with **CC BY 4.0 attribution** — still prefer bank HTML. |
| Must-not ingest | **MyPromo.lk** — ToS §12 explicitly bans spider/crawl/scrape; catalog is thin vs banks. |
| Fit for Lankawa | Aggregators are **not** a remittance/TT source. Product fit remains a **supermarket-day / card-offers** strip beside FoodLK, fed from **bank primaries**. |

---

## Landscape (Jul 2026)

| Site | Role | Live catalog size (observed) | Banks covered | Freshness signal | API | RSS | Structured data | License / ToS for ingest |
|------|------|------------------------------|---------------|------------------|-----|-----|-----------------|--------------------------|
| [mypromo.lk](https://www.mypromo.lk) | Deals + bank promos + UGC business portal | **~22 bank-tagged offers** on home bank tiles; **~5** on `/promotions/banksandcards/credit-card-offers-discounts`; **~33** unique `/promotion/{id}/` URLs across fetched pages | 19 banks listed; most show **0** active | Mixed (“5 days ago” … “5 months ago”) | No | Broken (500) | `Offer` + breadcrumbs on detail | **Scrape prohibited** (ToS) |
| [fdrateslk.com](https://www.fdrateslk.com/credit-card-offers) | FD rates + card-offers module | Claims **356** (`ItemList.numberOfItems`); bank pages: DFCC **111**, BOC **75**, ComBank **68**, NTB **102** | **4** (DFCC, BOC, ComBank, NTB) | `dateModified` / “Updated **2026-07-19**” | No (404; robots Disallow `/api/`) | No | Organization, WebPage, Dataset (**CC BY 4.0**), ItemList (10 samples), FAQPage | Dataset schema = CC BY 4.0; ToS allows factual reuse **with attribution**; editorial reprint needs permission |
| [deals4me.lk](https://www.deals4me.lk/credit_card_offers/497/0) | Legacy multi-bank deal directory | Unreachable here (expired TLS / Sucuri “Not Configured”) | Historically broad bank logos | Unknown / degraded | Unknown | Unknown | Unknown | Skip until healthy |
| [tools.numbers.lk/cofinder](https://tools.numbers.lk/cofinder) | Card Offers Finder (Nuxt) | **0** offers — banner: “back in the next festival season” | UI lists 14 banks | Offline / seasonal | No public API in bundles | No | None for offers | Skip until revived |
| [findit.lk](https://www.findit.lk/recommendations/the-best-credit-card-offers-in-sri-lanka) | Editorial / directory | Roundups, not a machine catalog | Marketing blurbs | Editorial | No | No | N/A | Skip for ingest |

**Open-source adjacent (not an aggregator):** [asankaSovis/offer-scraper](https://github.com/asankaSovis/offer-scraper) (MIT) scrapes **bank sites** (DFCC, NDB configs) into JSON — validates the primary-bank approach, not aggregator ingest.

---

## 1. MyPromo.lk — deep dive

### Stack & hosting

- Classic **ASP.NET MVC** surface: `/bundles/js`, `/Scripts/jquery*.js`, `__RequestVerificationToken`, `jquery.unobtrusive-ajax`.
- Media CDN: `mypromo.azureedge.net` (Azure Blob/CDN) — **images / breadcrumbs only**, not a public promotions API (`/api/promotions`, `/promotions.json` → BlobNotFound).
- Analytics / ads: GTM `G-7FQX7NPQTK`, AdSense, OneSignal push.
- Operator blurb: “Maintained by iCreative Work”; business portals for merchant self-submit.

### Discovery surfaces

| Surface | Result |
|---------|--------|
| `robots.txt` | `User-agent:*` only — **no Disallow, no Sitemap line** |
| `sitemap.xml` | **~18 hub URLs** (`/promotions`, `/jobs`, `/banks-in-sri-lanka`, …). **No per-offer URLs.** |
| `/feed`, `/rss`, `/atom.xml` | **HTTP 500** |
| `/api`, `/api/promotions`, `/api/v1/promotions`, `/graphql`, `/wp-json` | 500 / 404 — **no public JSON catalog** |
| `/Search/Promotions` | HTML search UI (not a data API) |
| `/search/GetBusinessNameSuggestions` | Autocomplete helper only |

### Structured data

Detail pages emit schema.org **`Offer`** with useful fields, e.g.:

- `name`, `description`, `url`, `image[]`
- `validFrom`, `priceValidUntil`
- `seller` (`Organization`)
- `category`
- Plus `BreadcrumbList` (some breadcrumb `item` URLs oddly point at `mypromo.azureedge.net/sitesettings/...`)

**Caveat:** Structured data does **not** create a license to crawl; ToS still bans scraping.

### Coverage by bank (home “Find Deals by Banks” tiles, Jul 2026)

| Bank | Active count on home |
|------|----------------------|
| DFCC, Nations Trust | 4 |
| Commercial, HNB, People’s, Sampath | 3 |
| BOC, Cargills Bank | 1 |
| Amana, Amex, Citi, HSBC, NDB, NSB, Pan Asia, Seylan, Std Chartered, SMIB, Union | **0** |

Bank hub pages (`/commercialbank/promotions`, `/dfccbank/promotions`, …) each show only a handful of cards — often overlapping merchant promos (Burger King / Crystal Jade / Popeyes) tagged to multiple banks. **Orders of magnitude thinner** than official bank catalogs (ComBank ~72, BOC index ~72 product URLs, NTB ~107 promotion URLs, FD Rates ~356 aggregated).

### Freshness & provenance

- Cards show relative timestamps (“5 days ago”) and view counts.
- Detail disclaimer: offers “physically collected from business centers or direct submission or social media websites or web portals.”
- **Not** a systematic bank-website mirror — UGC + editorial pickup. Stale multi-month rows appear on the banks-and-cards listing.

### License / compliance

From [Terms](https://www.mypromo.lk/terms) (last updated **25/10/2017**, Shopify-style boilerplate):

- §2: no reproduce / exploit Service without written permission.
- §12 **Prohibited uses** includes: “**(i) to spam, phish, pharm, pretext, spider, crawl, or scrape**”.
- §3: site may be inaccurate / not current; no duty to update.

**Lankawa position: do not scrape or republish MyPromo content.** Linking out in “also see” UI is fine; ingest is not.

---

## 2. FD Rates Sri Lanka (`fdrateslk.com`) — deep dive

### Stack & hosting

- **Next.js App Router** on Vercel (`fd-rates-lk.vercel.app` → canonical `www.fdrateslk.com`).
- Card module routes:
  - `/credit-card-offers`
  - Category: `/dining`, `/supermarkets`, `/online`, `/hotels-travel`, `/electronics`, `/health`, `/other`
  - Bank: `/banks/boc`, `/banks/comb`, `/banks/dfcc`, `/banks/ntb`
- `robots.txt`: `Allow: /`; **`Disallow: /api/`**, `/_next/`, `/calculator?*`; Sitemap declared.
- Sitemap lists the card hub + category + 4 bank pages (no per-offer permalinks).

### API / RSS / machine feeds

| Probe | Result |
|-------|--------|
| `/api`, `/api/offers`, `/api/credit-card-offers`, `/api/v1/offers`, `/data/offers.json` | **404** HTML |
| `/feed.xml`, `/rss.xml`, `/atom.xml` | **404** |
| Public developer docs | **None** |

Offers are **SSR HTML** (+ React Server Components flight payload). No documented JSON export.

### Structured data (strongest among aggregators)

On `/credit-card-offers` (Jul 2026):

| `@type` | Notes |
|---------|--------|
| `Organization` | Site identity |
| `WebPage` | `dateModified: 2026-07-19` |
| `ItemList` | `numberOfItems: 356` but **`itemListElement` length = 10** (SEO sample, not full dump) |
| `Dataset` | name “Sri Lanka Credit Card Offers 2026”; **`license`: `https://creativecommons.org/licenses/by/4.0/`**; `dateModified: 2026-07-19` |
| `FAQPage` | Coverage / usage FAQ |

Per-offer cards in HTML typically include: bank badge, discount %, merchant title, short description, card type line, **Valid until** date. **No outbound `sourceUrl` to the bank offer page** observed on bank listing HTML — provenance is asserted in copy (“sourced directly from their official websites”) but not linkable per row.

### Coverage

| Bank | Offers (site count) |
|------|---------------------|
| DFCC | 111 |
| Nations Trust | 102 |
| Bank of Ceylon | 75 |
| Commercial Bank | 68 |
| **Sampath, HNB, People’s, Cargills, HSBC, …** | **Not covered** (FAQ: “more banks will be added”) |

Category mix (hub): Dining 83, Hotels & Travel 97, Supermarkets **18**, Online 14, Electronics 18, Health 16, Other 110.

### Freshness

- Hub badge / schema: **2026-07-19** (research day +1 = **current** relative to bank monthly cycles).
- FAQ: banks update monthly; page refreshed when they re-collect from official sites.
- Supermarket sample validity windows clustered late Jul 2026 (aligned with typical monthly campaigns).

### License / ToS nuance

[Terms of Use](https://www.fdrateslk.com/terms) (updated Apr 26, 2026):

- §5 IP: **editorial** content may not be republished without permission.
- §5 also: **factual rate data** (rates, bank names, tenures) may be referenced **with attribution + link**.
- Card-offer **`Dataset` JSON-LD explicitly declares CC BY 4.0** — stronger green light for **facts** (merchant, %, bank, validity) than MyPromo, provided attribution.

**Lankawa position:** Legal/product-safer to scrape **banks** (same facts, first-party URLs). If bootstrapping from FD Rates: attribute “FD Rates Sri Lanka”, link the page, prefer facts over copied editorial blurbs, and treat as **secondary** until each row is verified against the bank.

Methodology page focuses on **FD rates** (not card offers) but states they do not rely on third-party aggregators for rates — card module claims the inverse role (they *are* the aggregator).

---

## 3. Other aggregators (shorter)

### Deals4me.lk

- Historically a WhatsApp-submission deal board with bank logo filters (HSBC, Sampath, ComBank, NDB, DFCC, Union, BOC, HNB, Seylan, Pan Asia, People’s, …).
- From this environment: **TLS certificate expired** and/or **Sucuri WAF misconfigured** → not a reliable upstream.
- No evidence of a public API/RSS in prior public pages.
- **Skip.**

### Numbers.lk Card Offers Finder

- Nuxt app at `tools.numbers.lk/cofinder`.
- Bank chips for 14 issuers, but live state is **empty** with “We will be back in the next festival season”.
- `cofinder.*.js` has UI + share helpers; **no offers JSON endpoint** in the bundle; Pinia favorites store empty.
- `robots.txt` uses Cloudflare-style content signals (search/ai-input/ai-train) — not an open data license.
- **Skip until they republish a live dataset.**

### Findit.lk

- Local business / “people’s choice” directory with editorial credit-card roundups.
- Not a structured, dated offer feed.
- **Skip for ingest.**

---

## 4. Official bank hubs (why aggregators lose)

Cross-check against primaries (same research window):

| Bank | Canonical public hub | Machine API? | Catalog signal |
|------|----------------------|--------------|----------------|
| Commercial Bank | `/rewards-promotions` | Seasonal `/api/s-offers` often `[]`; see `COMBANK_OFFERS_RESEARCH.md` | ~72 SSR offers |
| BOC | `/personal-banking/card-offers` (+ category `/…/product`) | No public offers JSON (`/api/card-offers` 404) | ~72 product URLs on index; categories: dining, supermarkets, travel, health-beauty, automobile, zero-plans, visa/mastercard |
| DFCC | `/cards/credit-card-offers` (also `/personal-banking/credit-cards/offers`) | No usable WP JSON; Next.js HTML | Large monthly set (FD Rates lists 111) |
| NTB | `/promotions` | No `wp-json` | ~107 `/promotions/{slug}` URLs |
| People’s Bank | `/special-offers/` + `/promotion-category/*` | `wp-json` present but **500** here | Category taxonomy (supermarkets, restaurants, …) |
| Sampath | Cards microsite tabs | No clean offers API found | Needs dedicated scrape research |
| HNB | Site unreachable from this environment | — | Defer |

**None of the major aggregators beat bank pages on provenance, T&Cs depth, or (except FD Rates’ 4-bank slice) coverage.**

---

## 5. Recommendation for Lankawa ingest

### Do this (P0–P1)

1. **Primary ingest = official bank HTML** (already the direction of bank research docs).
   - P0 supermarket-day strip: ComBank + BOC + DFCC + NTB (+ People’s when WP/HTML stable).
   - Normalize to the shared shape used in `COMBANK_OFFERS_RESEARCH.md` (`sourceId`, `offerId`, bank, merchant, discount, validity, weekday cadence, `sourceUrl`).
2. **Cadence:** daily or 2×/week — bank catalogs change on monthly/campaign cycles.
3. **Honesty:** label `live` only with `fetchedAt` + bank `sourceUrl`; never claim completeness across all SL banks.
4. Optional: MIT patterns from `offer-scraper` for DFCC/NDB selector maintenance — reimplement in Lankawa TypeScript adapters, don’t vendor their JSON as truth.

### Maybe later (P2)

5. **FD Rates LK HTML** as **bootstrap / gap-finder** only:
   - Parse bank pages for merchant + % + valid-until.
   - Require **attribution** (CC BY / ToS §5).
   - Drop or quarantine rows that fail bank verification.
   - Do **not** depend on JSON-LD `ItemList` (only 10 items) or invent an `/api` that does not exist.

### Do not

6. **MyPromo.lk ingest/scrape** — ToS scrape ban + sparse/stale UGC catalog.
7. **Deals4me / Numbers cofinder / Findit** as live upstreams in current state.
8. Payment-gateway APIs (ePay, Genie, BOC IPG) — unrelated to promotional catalogs.

### Product mapping

| Lankawa surface | Upstream |
|-----------------|----------|
| Morning “supermarket day” chip | Bank primaries (Keells/Cargills/Spar/Glomark/Laugfs rows) |
| Food page adjacency | Same adapters; join by merchant keywords with FoodLK |
| Full multi-bank browser | Only after ≥4 bank adapters are green — **not** via MyPromo |
| Attribution footer | Banks first; if FD Rates used for bootstrap, name + link |

---

## 6. Suggested adapter priority

```
P0  combank-offers.ts     ← research done
P0  boc-offers.ts         ← /personal-banking/card-offers + /product
P0  dfcc-offers.ts        ← /cards/credit-card-offers
P1  ntb-offers.ts         ← /promotions/{slug}
P1  peoples-offers.ts     ← special-offers / promotion-category
P2  sampath-offers.ts
P2  fdrates-bootstrap.ts  ← optional, attributed, verify-against-bank
—   mypromo               ← never as ingest
```

---

## Probe log (2026-07-20)

Live checks from research environment: MyPromo home/banks/detail/sitemap/robots/API/RSS; FD Rates card hub + 4 bank pages + terms/about/methodology/sitemap/robots/API/RSS; Numbers cofinder + Nuxt bundles; Deals4me (TLS/WAF fail); BOC/DFCC/NTB/People’s/ComBank public hubs; GitHub `offer-scraper` DFCC parameters.

---

## Related docs

- `docs/COMBANK_OFFERS_RESEARCH.md`
- `docs/NTB_SC_HSBC_OFFERS_RESEARCH.md`
- `docs/AMANA_PABC_SDB_OFFERS_RESEARCH.md`
- `docs/FUEL_LOYALTY_OFFERS_RESEARCH.md`
- `docs/FOOD_API_SOURCES.md` (retail context for supermarket-day join)
