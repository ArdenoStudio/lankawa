# Amana Bank / Pan Asia Bank / SDB Bank — card offers research (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Public marketing surfaces only. No reverse-engineering of authenticated banking apps. Server-side fetch + provenance; never claim live when empty/stale.  
**Sister docs:** [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md), [`NTB_SC_HSBC_OFFERS_RESEARCH.md`](./NTB_SC_HSBC_OFFERS_RESEARCH.md)

---

## Verdict (all three)

| Bank | Public offers API? | Best public surface | Local supermarket fit | Card types | Lankawa priority |
|------|--------------------|---------------------|----------------------|------------|------------------|
| **Amãna Bank** | **No** — SSR HTML (+ ICS JSON blobs in DOM) | `amanabank.lk/…/visa-debit-card/offers/` | **Medium** — Glomark Wednesdays + local supers; no Keells/Cargills/Spar/Laugfs in catalog | **Debit only** (Islamic bank; Prestige = premium debit tier) | **P1** — large debit catalog; complements credit-heavy banks |
| **Pan Asia (PABC)** | **No REST offers API** — inline JS `arr_offers` on page | `pabcbank.com/card-offers/` (Sucuri cookie gate) | **High** — Keells, Glomark, Cargills, LAUGFS with weekday cadence | Almost all **Credit**; 1 dual debit+credit hotel row | **P0** with ComBank/NTB for supermarket strip |
| **SDB Bank** | **No** | Product pages only; debit-promo URL **dead** | **None** — no merchant card-day catalog | Visa **debit** product page only | **Skip** for card-offers strip |

**Bottom line for Lankawa:** For “this week’s supermarket card days,” ingest **Pan Asia `arr_offers`** (parse JS array after Sucuri cookie) and **Amana debit HTML** (especially Glomark + `data-ics` dates). **Do not** plan SDB merchant-offer scraping — `/en/debit-card-promotions` 404s and live “Product Promotions” are savings/FD/loan tiles only.

---

## Comparison matrix

| Dimension | Amãna | Pan Asia | SDB |
|-----------|-------|----------|-----|
| Canonical offers URL | `/personal/services/visa-debit-card/offers/` | `/card-offers/` | *(none live)* — `/en/product-promotions` |
| Stack | Static/CMS HTML (Cloudflare email obfuscation) | WordPress + Elementor + Sucuri CloudProxy | Affno CMS (Joomla-style `/index.php/…`) |
| Offer count (2026-07-20) | **~128** listing cards; **108** with `data-ics` | **36** in `arr_offers` | **0** merchant card deals |
| Structured fields in page | `data-ics` JSON: `start`, `end`, `summary`, `description` | JS objects: `cat`, `img`, `text`, `date`, `backtext`, `offer_type[]` | N/A |
| Detail pages | In-page modal (`Tell Me More`); no per-offer slug | Mostly in-array `backtext`; legacy `/card-offers/{merchant}-…` slugs in sitemap (stale-looking) | N/A |
| JSON / WP REST | `/api/offers` → 404 HTML | `wp-json` works **after Sucuri**; page content is shell; **catalog is inline JS**, not CPT | No offers JSON |
| Bot / WAF | `robots.txt` allows; sitemap present | **Sucuri JS cookie** required (`sucuri_cloudproxy_uuid_*`) | `robots.txt` **403**; pages OK with browser UA |
| Supermarket merchants | Glomark (Wed), Raheems, Zam Zam, Dehiwala Super, Union Lanka | Keells (Wed), Glomark (Thu), Cargills (select dates), LAUGFS (Mon) | None listed |
| Credit cards | No conventional credit-card product on offers surface | Credit-first catalog; IPP / 0% plans heavy | No credit card product page found |
| Fit vs ComBank/NTB | Debit + Islamic banking niche + district filter | Closest to ComBank supermarket-day pattern | Out of scope |

---

## 1. Amãna Bank PLC

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.amanabank.lk` | Primary marketing site | Yes |
| `https://www.amanabank.lk/personal/services/visa-debit-card/offers/` | **Canonical all-offers index** (~128 cards) | **Primary** |
| `…/offers/{category}.html` | Category slices (dining, supermarket, …) | Primary filters |
| `…/offers/listing-revamp-offers.html` | Alias of all-offers (same payload size) | Duplicate |
| `https://www.amanabank.lk/sitemap.xml` | Large sitemap; lists offers hub, not each merchant | Discovery |
| `https://www.amanabank.lk/robots.txt` | Allows site; Disallow `/*.php`, `/cdn-cgi/*` | OK politely |
| `/api/offers`, `/offers.json` | **404** | Skip |
| Prestige / Kids category HTML | Same full dump as “All” (no real filter) — treat as buggy | Prefer `data-cat` pages that work |

### Categories (`data-cat` → path)

| data-cat | Path | Offers (ics count, Jul 2026) |
|----------|------|-----------------------------:|
| — | `/offers/` (All) | 128 wrappers / 108–128 ics |
| 7 | `dining.html` | 25 |
| 5 | `clothing-and-retail.html` | 38 |
| 6 | `supermarket.html` | **5** |
| 3 | `leisure-and-hospitality.html` | 14 |
| 1 | `healthcare-and-wellness.html` | 5 |
| 2 | `lifestyle-and-others.html` | 26 |
| 9 | `visa.html` | 15 (Visa global / Haj–Umrah hubs) |
| 8 | `amana-kids.html` | *returns full All dump* |
| 10 | `prestige-card-offers.html` | *returns full All dump* |

Also: district filter via `data-districts` on cards (e.g. `colombo`, `galle`, `puttalam`).

### Listing DOM (scrape selectors)

```html
<div class="item-wrapper-box offer-item-wrapper" data-districts="colombo">
  <img … title="Glomark" alt="Glomark">
  <a class="calendar_button"
     data-ics='{"start":"2026-08-05","end":"2026-08-26","summary":"Glomark",
                "description":"15% Off … (Every Wednesday)"}'>
  <div class="pop" style="display:none;">
    <h3 class="pop_up_title">Glomark</h3>
    <!-- T&Cs, Valid on, % badge -->
  </div>
</div>
```

**Parse tip:** `data-ics` is near-JSON but may contain raw newlines / `&ndash;` — use `json.loads(..., strict=False)` after normalizing `\n`.

### Supermarket subset (Lankawa-relevant, from All + supermarket pages)

| Merchant | Rhythm / window | Notes |
|----------|-----------------|-------|
| Softlogic Glomark | Every Wednesday — 5, 12, 19, 26 Aug 2026 | 15% off; min Rs.7,500; max discount Rs.4,000 |
| Raheems Super (Puttalam) | 20–31 Aug 2026 | 15%; min Rs.15,000; staple exclusions |
| Dehiwala Super Center | Aug 2026 | 15% |
| Union Lanka Super Market | Aug 2026 | 15% selected items |
| Zam Zam City | 15–17 Aug 2026 | 15% |

No Keells / Cargills / Spar / Laugfs rows observed on 2026-07-20.

### APIs / apps

- **No public offers JSON API.**
- Mobile / online banking: marketing only; no developer offer feed.
- PDF: Haj/Umrah leaflet under `/pdf/offers/`; key-fact debit PDF under `/pdf/key-fact-documents/`.

### Recommended ingest

```
P0  GET /personal/services/visa-debit-card/offers/
      → offer-item-wrapper + data-ics + pop_up_title + T&Cs
P0  GET …/offers/supermarket.html  (and dining if needed)
P2  sitemap.xml for hub discovery
Skip kids/prestige category URLs until they filter correctly
```

Suggested `sourceId`: `amana_debit_offers`.

---

## 2. Pan Asia Banking Corporation (PABC)

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.pabcbank.com` | WordPress marketing (Sucuri CloudProxy) | Yes — **after cookie challenge** |
| `https://www.pabcbank.com/card-offers/` | **Canonical catalog** (JS-rendered grid from `arr_offers`) | **Primary** |
| `https://www.pabcbank.com/wp-json/` | WP REST root (needs Sucuri cookie) | Meta only |
| `GET /wp-json/wp/v2/pages?slug=card-offers` | Page shell (filters UI); **not** the offer rows | Weak |
| `https://www.pabcbank.com/page-sitemap.xml` | Lists `/card-offers/` + legacy merchant slugs | Discovery |
| `/card-offers/{merchant}-credit-card-debit-card-offers/` | Legacy detail URLs (sitemap) | Secondary / verify live |
| `/pan-asia-bank-credit-cards-special-installment-payment-plan-offers/` | IPP marketing page | Secondary |
| Pine Labs Credit+ | **Internal** card-issuing platform (API-first for bank ops) | **Not** a public offers API |

### Sucuri gate (ops note)

1. `GET /card-offers/` → HTML with base64 `S='…'` challenge.  
2. Decode + `eval` sets `sucuri_cloudproxy_uuid_*=…` cookie.  
3. Replay `GET` with that cookie → full HTML (~285 KB) including `var arr_offers = […]`.

Without the cookie, every path (including `wp-json`) returns the challenge page.

### Catalog shape (`arr_offers`, 2026-07-20)

**36** objects. Schema:

```js
{
  cat: "18",                    // category id (string)
  img: "http://www.pabcbank.com/wp-content/uploads/…",
  text: "25% OFF",              // badge
  date: "07-07-2026",           // publish / start-ish (DD-MM-YYYY)
  backtext: "Enjoy 25% OFF …",  // full copy incl. T&Cs summary
  offer_type: ["Credit card"]   // or ["Debit card","Credit card"]
}
```

**Filter UI → `cat` ids:**

| cat | Label |
|-----|--------|
| 18 | Supermarkets |
| 9 | Fashion |
| 10 | Jewellery |
| 4 | Hotel |
| 12 | Restaurants |
| 8 | Healthcare |
| 13 | Lifestyle |
| 14 | Automobile |
| 15 | Online Shopping |
| 16 | Other |
| 19 | BizClass |
| (privilege) | Privilege Banking |

**Observed counts:** Hotel `4`=18, Lifestyle `13`=9, Supermarkets `18`=4, Other `16`=3, Restaurants `12`=2.  
**Card types:** 36 credit-tagged; only **1** also includes debit (Oak Ray Elephant Lake).

### Supermarket subset (Jul 2026 windows in `backtext`)

| Merchant | Cadence | Discount / caps |
|----------|---------|-----------------|
| LAUGFS Super | Every Monday (6, 13, 20, 27 Jul) | 25%; min Rs.3,500; max Rs.2,000 |
| Keells | Every Wednesday (8, 15, 22, 29 Jul) | 25%; min Rs.5,000; max Rs.2,000 |
| Softlogic Glomark | Every Thursday in Jul | 25%; min Rs.5,000; max Rs.2,000 |
| Cargills Food City / Hall / Express | 9th & 23rd Jul | 25%; min Rs.5,000; max Rs.2,000 |

Also: heavy **0% IPP** block (Softlogic, Singhagiri, Singer, Damro, Abans, …) under Lifestyle/`13` — useful for a separate “instalments” chip, not FoodLK supermarket days.

### APIs

| Endpoint | Result |
|----------|--------|
| Custom CPT `/wp-json/wp/v2/offers` etc. | **404** `rest_no_route` |
| `/wp-json/wp/v2/pages?slug=card-offers` | Page HTML shell; `arr_offers` **not** in REST `content.rendered` |
| Pine Labs Credit+ | Bank-internal issuing/processing — **out of scope** |

### Recommended ingest

```
P0  Solve Sucuri → GET /card-offers/
      → regex/extract var arr_offers = […] → JSON-normalize
P0  Filter cat=="18" (and parse weekday from backtext)
P1  offer_type includes for credit vs debit labeling
P2  Legacy /card-offers/* detail slugs if still populated
Skip Pine Labs / online banking login / APK
```

Suggested `sourceId`: `pabc_card_offers`.  
`provenance`: `pabc_arr_offers_js`.

---

## 3. SDB Bank (SANASA Development Bank)

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.sdb.lk/en/digital-banking/cards` | Visa debit **product** features (limits, payWave, ATMs) | Product copy only |
| `https://www.sdb.lk/en/product-promotions` | “Product Promotions” hub | **No card merchant deals** |
| `/en/debit-card-promotions` | Linked in commented HTML; **404** → `/404-page.html` | Dead |
| `/en/general-promotions` | Exists; no merchant card catalog observed | Low |
| `https://www.sdb.lk/sitemap.xml` | Lists cards + product-promotions | OK |
| `robots.txt` | **403** | Opaque — polite UA |

### What “promotions” actually lists (live)

Tiles only: **SDB Lakdaru**, **5 Year Fixed Deposits**, **All-Purpose Property Loan**, **Power Fixed Deposits**. Debit Card Promotions / General Promotions buttons are **HTML-commented out**.

### APIs

- No public card-offers API, WP JSON, or merchant feed found.  
- Stack attribution: “Solution by Affno.”

### Recommended ingest

**Skip** for Lankawa card-offers / supermarket-day strip. Optionally keep a stub `sourceId: sdb_card_offers` that returns empty with provenance `sdb_no_catalog` if product wants a bank completeness checklist.

---

## Normalized record (shared with sister banks)

```ts
{
  sourceId: "amana_debit_offers" | "pabc_card_offers" | "sdb_card_offers";
  bank: string;
  offerId: string;          // hash(merchant+start+discount) or stable slug
  url: string;              // hub or detail
  category: string;         // supermarket | dining | hotel | …
  title: string;
  merchant: string;
  discountPercent: number | null;
  discountLabel: string | null;
  validityText: string;
  validFrom: string | null; // ISO
  validUntil: string | null;
  cadence: string | null;   // "every Wednesday" | …
  cardTypes: ("credit"|"debit"|"prestige"|"visa")[];
  minBillLkr: number | null;
  maxDiscountLkr: number | null;
  termsExcerpt: string;
  district: string | null;  // Amana data-districts
  fetchedAt: string;
  provenance: "amana_html_ics" | "pabc_arr_offers_js" | "sdb_no_catalog";
}
```

---

## Lankawa product mapping

| Surface idea | Source | Notes |
|--------------|--------|-------|
| Supermarket payment days | **PABC cat 18** + **Amana supermarket / Glomark** | Align with ComBank/NTB cadence parser (SL weekdays) |
| Debit-only strip | Amana | Useful for non-credit households / Islamic banking |
| IPP / electronics | PABC Lifestyle `13` | Separate from FoodLK |
| SDB | — | No feed |

Sister catalog rows (when wired):

| Source | URL / endpoint | API? | Lankawa path |
|--------|----------------|------|--------------|
| Amana debit HTML | `/…/visa-debit-card/offers/` + category pages | HTML + `data-ics` | Planned `amana-offers.ts` |
| PABC card offers | `/card-offers/` after Sucuri | Inline JS array | Planned `pabc-offers.ts` |
| SDB | — | — | Skip / empty stub |

### Ops / compliance

- Cadence: **2–3× weekly** enough (monthly merchant windows).  
- UA: `LankawaBot/1.0 (+https://…; research)`.  
- PABC: cache Sucuri cookie ≤24h (`max-age=86400`); refresh on challenge body.  
- Never label empty SDB as live deals.  
- Honesty: seed fallback if scrape/WAF fails.

---

## Open risks

1. **PABC Sucuri** — cookie solve must stay in Node/server; pure `curl` without eval fails.  
2. **PABC `date` field** is not always `validUntil` — prefer parsing `backtext` for “until / every …”.  
3. **Amana kids/prestige pages** duplicate All — don’t use for category metrics.  
4. **Amana `data-ics` newlines** break naive JSON.parse.  
5. **SDB dead links** may return later — re-probe `/en/debit-card-promotions` quarterly; don’t build scraper until content exists.  
6. **Pine Labs “API-first”** press is easy to misread as public offers API — it is not.

---

## Agent note

Researched Jul 2026 against live `amanabank.lk` (all-offers + category pages, robots/sitemap, API probes), `pabcbank.com` (Sucuri solve, `arr_offers` extract, `wp-json` page shell, sitemap offer URLs, Pine Labs context via public press), and `sdb.lk` (cards product, product-promotions, dead debit-promo URL, sitemap). Medium thoroughness: no APK MITM, no authenticated banking sessions.
