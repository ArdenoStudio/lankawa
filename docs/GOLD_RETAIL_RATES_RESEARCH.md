# Gold retail / pawn rates beyond CBSL — research

**Status:** Research (medium thoroughness, Jul 2026)  
**Product surface:** `/economy` gold card (already live via CBSL troy-oz scrape)  
**Question:** Can Lankawa show daily jewellery-shop or bank **selling** rates (22K per pawn) beyond the official CBSL XAU/LKR table? Public APIs?

---

## Verdict

| Path | Daily selling rate? | Public API? | Lankawa fit |
|------|---------------------|-------------|-------------|
| **CBSL** (already shipped) | Official indicative LKR / troy oz | Form POST HTML scrape (not JSON API) | Keep as trust anchor |
| **CBSL → pawn conversion** | Derived 24K/22K per gram & per pawn (8g) | Same CBSL feed | **P0** — highest household ROI, no new upstream |
| **Named jewellers** (Vogue, Mallika Hemachandra, Nileka, etc.) | Rarely publish a live board on their own sites | No rate APIs (WooCommerce/`wp-json` is catalog only) | **Skip** as live sources |
| **goldpricesrilanka.com shop cards** | Aggregated 22K/pawn for Vogue et al. | CPT `slg_shop` REST has **no price fields**; homepage cards were **~2 months stale** on probe | **Do not** treat as live |
| **Gold buyers / bullion sites** | Often publish buy/sell per 8g | HTML pages only | **P1** optional compare board (same honesty pattern as remittance banks) |
| **Banks** | Publish **pawning advances** (loan LTV), not retail sell rates | No daily gold APIs | Seed-only advance strip at best; not a gold-price feed |
| **api.gold-api.com** | International XAU/USD | Public JSON | Useful for spot context only; **not** CBSL and not shop rates |

**Bottom line:** There is no trustworthy public API for Sri Lankan jewellery-shop daily selling rates. Banks are the wrong product for “today’s gold sell price.” Best next step for Lankawa is **pawn-unit conversion from the existing CBSL card**, then optionally a small **indicative retail board** scraped from gold-buyer pages that actually update.

---

## What Lankawa has today

- Source: `cbsl_gold` in `src/lib/sources.ts`
- Adapter: `fetchCbslGoldRates()` / `fetchLatestCbslGoldRate()` in `src/lib/integrations/cbsl.ts`
- Upstream: `POST https://www.cbsl.gov.lk/cbsl_custom/exrates/exrates_results.php` with `chk_cur[]=XAU~Gold (per Troy oz.)`
- UI: `/economy` card — **LKR per troy ounce**, omit if parse fails
- Household gap: Sri Lankans quote **22K per pawn (8g)** at shops and pawn counters; troy oz is unfamiliar

CBSL methodology (their page): gold USD/oz at start of business day × indicative USD/LKR spot → LKR per troy oz. Shops then add margins, making charges, and purity factors.

---

## Jewellery shops

### Vogue Jewellers (`voguejewellers.com`)

| Check | Result (Jul 2026 probe) |
|-------|-------------------------|
| Daily gold rate page | **None** |
| FAQ | “Prices based on international gold market rates for the day” — no numbers |
| Stack | WordPress + WooCommerce |
| `wp-json` | Catalog/CMS only (`wc/store`, `wp/v2`) — **no gold-rate route** |

Not a scrape candidate for daily rates.

### Other major brands

| Shop | Own site daily rate board? | Notes |
|------|---------------------------|-------|
| Mallika Hemachandra | No | WooCommerce; promo/exchange posts, not a rate feed |
| Nileka Jewellery | No | Marketing site |
| Swarnamahal / Raja / Muthukaruppan Chettiar | No public first-party boards found in this pass | Appear on aggregator only |

### Aggregator: goldpricesrilanka.com

Useful as a **discovery map**, weak as a **live feed**.

| Signal | Detail |
|--------|--------|
| Shops listed | Vogue, Mallika Hemachandra, Nileka, Muthukaruppan Chettiar, Raja, Swarnamahal |
| Homepage shop cards (22K / pawn) | Vogue **364,500**; Mallika **364,000**; Nileka **363,400**; Muthukaruppan **360,600**; Swarnamahal **360,000**; Raja **358,800** |
| Shop card freshness | All stamped **Updated: May 25, 2026** when probed **2026-07-20** → stale |
| REST | `GET /wp-json/wp/v2/slg_shop` lists shops; **prices not in `meta`/`acf`** |
| Custom rate APIs | `/wp-json/slg/v1/*`, `/wp-json/gdsl/v1/*` → 404 |
| “Live” karat cards | Client JS calls `https://api.gold-api.com/price/XAU`, converts with a **plugin-configured CBSL USD/LKR**, then applies purity × 8g — **not shop quotes** |
| CBSL-derived table on same site | Updates daily (e.g. 22K pawn ~LKR 317,701 official on 2026-07-20) — derivative of CBSL, not retail |

**Do not** wire Lankawa to GPSL shop cards or re-host their XAU conversion as “jewellery rates.”

---

## Gold buyers / bullion sites (retail-ish daily boards)

These are closer to what people mean by “today’s selling rate,” but they are **private dealer quotes**, not official.

| Source | URL | What publishes | API? | Scrape notes |
|--------|-----|----------------|------|--------------|
| Cash Gold | `https://cashgold.lk/daily-gold-price/` | 18/21/22/24Kt per **8g** + 30-day table | No (WP HTML) | Clean `<table>`; spot-based + separate rounded “Rates as at …” block; probe showed history through **2026-07-18** |
| Cash Gold Lanka | `https://cashgoldlanka.lk/gold-rate/` | “Selling rate per 8g” by karat | No | Rates may be JS-hydrated; confirm before adapter |
| Bullion Lanka Jewellers | `https://bullionlankajewellers.lk/gold-rates/` | Buy + sell per 8g | No | HTML; dates in copy can lag |
| Gold Lanka | `https://goldlanka.lk/gold-price-today-sri-lanka/` | Buy + sell boards | No | HTML |
| Lanka Gold Global | `https://lankagoldglobal.lk/` | “Sea Street” style gram/pawn | No | Spot-derived; small HTML footprint |

**Honesty rule (if shipped):** Label as indicative dealer quotes; never as CBSL or as a specific bridal jeweller’s ticket price. Making charges and assay still apply in-store.

---

## Banks — pawning advances ≠ gold selling rates

Banks (ComBank, NDB, BOC, People’s, Sampath, HNB, NSB, etc.) market **gold loans / pawning**: cash advance as a % of appraised gold value, plus interest. That is **not** a daily jewellery selling rate.

| Bank | Public page finding |
|------|---------------------|
| **NDB Ran Naya** | HTML table: **24K** advance **235,000 / 230,000 / 220,000** LKR by 4/6/12 month tenure (per sovereign karatage wording on page) |
| **Commercial Bank** | Gold Loans product page; advance figures often cited in marketing (web summaries ~Rs.263k 24K / ~Rs.250k 22K) — treat as **stale-OK seed**, re-verify at implement time (values not stably in static HTML on probe) |
| BOC / People’s / NSB / HNB | Several canonical pawning URLs **404** or soft-land; need branch-accurate discovery before any scrape |
| Sampath | Soft personal-banking shell; no clear daily gold table in this pass |

Third-party tools (e.g. induwara.lk pawning calculator) hardcode LTV/interest presets and warn users to confirm branch rates — same honesty bar Lankawa should keep.

**Product fit:** Optional “pawning advance snapshot” seed card is possible later. It must **not** replace or sit unlabeled next to CBSL gold as if it were today’s sell price.

---

## Public APIs (summary)

| API / endpoint | Role | Use in Lankawa? |
|----------------|------|-----------------|
| CBSL gold form POST | Official LKR / troy oz | **Yes — already live** |
| `https://api.gold-api.com/price/XAU` | International USD/oz JSON | Optional spot footnote only; do not override CBSL |
| Jeweller `wp-json` / WooCommerce | Product catalogs | No |
| GPSL `slg_shop` REST | Shop directory without prices | No |
| Bank JSON gold feeds | None found | — |

Conversion constants (if deriving pawn display from CBSL oz):

- 1 troy oz = **31.1034768 g** (use full precision; GPSL JS uses `31.1035`)
- 1 pawn = **8 g** (Sri Lanka market convention)
- 24K pawn ≈ CBSL_oz / 31.1034768 × 8  
- 22K pawn ≈ 24K pawn × **0.916** (NGJA / common 22K ≈ 91.6%; some sites use `0.9166667`)

Document the factor in provenance copy so we do not imply CBSL publishes karat tables.

---

## Recommended ship order

```
1  Derive 22K + 24K per pawn (and per gram) from live CBSL oz on /economy
   — secondary lines under existing gold card; keep troy oz as official figure
2  Provenance note: “Derived from CBSL troy oz; shops add margins”
3  Optional P1: 2–3 gold-buyer indicative sell quotes (cashgold.lk-class HTML)
   — remittance-banks honesty pattern; seed fallback if scrape fails
4  Skip named jeweller boards until a brand publishes a fresh first-party daily rate
5  Park bank pawning advances as a separate seed strip (not gold price)
```

---

## Anti-patterns

- Scraping GPSL shop cards and presenting them as live Vogue/Mallika rates (stale + third-hand)
- Calling `api.gold-api.com` and labeling the result “CBSL” or “Sri Lanka market”
- Mixing bank advance ceilings with jewellery selling rates in one undifferentiated card
- Claiming a public jewellery-rate API exists when only HTML dealer boards do

---

## Probe log (2026-07-20)

- Vogue home + FAQ + `wp-json` namespaces inspected  
- GPSL homepage shop cards + `slg_shop` REST + `sl-plugin` `public.js` (`api.gold-api.com`)  
- cashgold.lk 30-day table parsed  
- NDB / ComBank pawning pages fetched; several other bank pawning URLs 404  
- `api.gold-api.com/price/XAU` returned live USD price JSON  

Related: `src/lib/integrations/cbsl.ts`, `docs/DATA_EXPANSION_RESEARCH.md` (remittance scrape pattern), `docs/IDEAS_BACKLOG.md` (CBSL gold card shipped).
