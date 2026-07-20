# Arpico / Softlogic / Abans / Singer — household promotions & EMI (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026 · **Loop 8 shipped:** Singer thin chip (`singer-emi.ts`) on `/economy` household  
**Product rule:** Public marketing / storefront surfaces only. No reverse-engineering of authenticated loyalty apps (Softlogic ONE OTP, Singer loyalty balance login, Abans account). Server-side fetch + provenance; never claim live when empty/stale/404.

**Sister docs:** [`RETAIL_LOYALTY_APIS_RESEARCH.md`](./RETAIL_LOYALTY_APIS_RESEARCH.md) (Glomark / Softlogic ONE), [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md), [`AMANA_PABC_SDB_OFFERS_RESEARCH.md`](./AMANA_PABC_SDB_OFFERS_RESEARCH.md) (0% IPP merchant blocks), [`NTB_SC_HSBC_OFFERS_RESEARCH.md`](./NTB_SC_HSBC_OFFERS_RESEARCH.md), [`CARD_OFFER_AGGREGATORS_RESEARCH.md`](./CARD_OFFER_AGGREGATORS_RESEARCH.md).

---

## Verdict

| Retailer | Public promotions hub? | Public EMI / installment API? | Best public surface | Household fit for Lankawa | Priority |
|----------|------------------------|-------------------------------|---------------------|---------------------------|----------|
| **Softlogic (MySoftlogic)** | **Thin** — `/deal-page` + `/promo/{slug}` HTML; no `/promotions` | **Yes** — `GET /product-page/variation-detail/{id}` JSON includes `promotions[]` with bank + months + monthly amount | Per-SKU JSON + LD+JSON `Offer` on PDP | **Strong for appliances EMI compare** (not grocery days) | **P0** for an “instalments” chip |
| **Singer Sri Lanka** | **Yes** — `/offers`, `/bank-offers`, `/hot-deals`, hire-purchase pages | **Yes** — `GET /json-get-emi` + `GET /json-get-single-emi` | EMI JSON + easy-payment / HP HTML | **Strong** — multi-bank EMI + MintPay + HP schemes | **P0** |
| **Abans (BuyAbans)** | **Campaign HTML** — sitemap lists `/today-offer/*`, `/weekly-deals`, flash sales; many slugs **404** (stale sitemap) | **No** dedicated EMI JSON found; FAQ says plans on PDP at checkout | Bank IPP pages + BuyAbans campaign HTML | **Medium** — bank-side 0% IPP is clearer than merchant API | **P1** via banks; optional HTML campaigns |
| **Arpico** | **Partial** — corporate site has no promo catalog; **My Arpico** OpenCart `product/special` = “Monthly Offers” | **No** EMI JSON; furniture 0% lives on **bank** pages | `myarpico.com/index.php?route=product/special` + Amex/Sampath/Seylan furniture IPP | **Split:** grocery specials on My Arpico; furniture EMI via banks | **P1** specials (grocery); EMI via banks |

**Bottom line for Lankawa:** For a household **“0% / EMI this month”** strip (fridge, washer, TV), ingest **Singer `json-get-emi`** (merchant × bank × tenor) and **Softlogic `variation-detail` promotions** (per SKU). Treat **Abans / Arpico furniture** EMI primarily from **bank installment catalogs** (Amex NTB ESP, Seylan, Sampath, HNB, Pan Asia Lifestyle/IPP). Do **not** expect a unified retailer promotions REST API from any of the four. Softlogic Glomark supermarket card-days stay on the ComBank/NTB/PABC path already researched — separate from MySoftlogic appliance EMI.

---

## Comparison matrix

| Dimension | Softlogic (mysoftlogic.lk) | Singer (singersl.com) | Abans (buyabans.com) | Arpico (arpico.com + myarpico.com) |
|-----------|----------------------------|-----------------------|----------------------|-------------------------------------|
| Stack | Custom PHP storefront + Oracle Object CDN | Laravel + Imperva | Laravel (session/`XSRF-TOKEN`) + Cloudflare | Corporate static; **OpenCart** on My Arpico |
| Canonical promo URL | `/deal-page`, `/promo/{slug}` | `/offers` → filtered `/products?offers=…`; `/bank-offers`; `/hot-deals` | `/today-offer` (often empty/404 children), `/bundle-offers-new` | Corporate: none; My Arpico: `route=product/special` (“Monthly Offers”) |
| EMI surface | PDP carousel + `variation-detail` JSON | PDP modal → `json-get-emi` / `json-get-single-emi` | FAQ: up to 60 months / 48 months 0% on PDP; no public API | Bank partner pages (furniture outlets) |
| Catalog discovery | `sitemap.xml` (~910 `/p/{id}` product URLs) | Sitemap CMS pages + product listing HTML | Sitemap ~3.9k **category/campaign** URLs; **no PDP URLs** in sitemap | OpenCart routes; specials paginated (375 items / 25 pages observed) |
| Public JSON | **Yes** (per SKU) | **Yes** (EMI + stock helpers) | **No** (`/products.json` → HTML shell; Magento `/rest/V1` → HTML) | OpenCart HTML; `/api/login` **403** |
| Loyalty | Softlogic ONE OTP (`slone.softlogic.lk:8055`) — closed | Loyalty point-balance page (login) | Account loyalty points (login) | Arpico Privilege (marketing; co-brand SC history) |
| WAF / bots | ZenEdge | Imperva | Cloudflare | Cloudflare on My Arpico (`ai-train=no`) |

---

## 1. Softlogic — MySoftlogic.lk (+ Glomark / Softlogic ONE)

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://mysoftlogic.lk/` | Appliance / electronics storefront | Yes |
| `https://mysoftlogic.lk/deal-page` | Deals hub (HTML product grid) | Primary deals HTML |
| `https://mysoftlogic.lk/promo/{slug}` | Brand/campaign pages (e.g. `SamsungStore`) | Secondary |
| `https://mysoftlogic.lk/{slug}/p/{id}` | PDP (EMI UI + LD+JSON) | Detail |
| `GET /product-page/variation-detail/{id}` | **Per-SKU JSON** incl. price + `promotions[]` | **Primary API** |
| `GET /product-page/details-content/{id}` | Specs HTML-in-JSON | Optional |
| `https://glomark.lk/` | Softlogic supermarket (separate research) | FoodLK path |
| `https://slone.softlogic.lk:8055/` | Softlogic ONE loyalty OTP login | **Skip** (auth) |
| `https://www.softlogic.lk/` | Holdings corporate; no retail promo catalog | Skip |

`/promotions`, `/offers`, `/products.json`, `/api/offers` → **404**.

### EMI API shape (live probe 2026-07-20)

`GET https://mysoftlogic.lk/product-page/variation-detail/60`  
Headers useful: `Accept: application/json`, `X-Requested-With: XMLHttpRequest` → `200 application/json`.

Example fields:

```json
{
  "status": true,
  "price": 388599,
  "promoPrice": 256499,
  "promoRate": 34,
  "stockStatus": false,
  "promotions": [
    {
      "promotionType": "installment",
      "isCardPromotion": true,
      "bank": "COMMERCIAL",
      "description": "COM Bank 48 months Refs & washers",
      "discountPercentage": 0,
      "interestPercentage": 5,
      "installmentMonths": "48 Months",
      "monthlyInstallment": 5610.915625
    }
  ]
}
```

Observed on sample deal SKUs: installment rows often **COMMERCIAL** only; some SKUs return `promotions: []` (price promo only). PDP HTML also shows KOKO / multi-bank logo assets — treat JSON `promotions[]` as source of truth for structured EMI, not logo presence.

Also: schema.org **Product** + **Offer** on PDP (`price`, `priceCurrency: LKR`).

### Bank-side Softlogic IPP (not merchant API)

HNB and peers publish “0% at Softlogic Stores / Softlogic MAX / mysoftlogic.lk” call-and-convert pages (dated windows, min bill). Useful as **eligibility copy**, not a machine catalog.

### Lankawa recommendation

| Priority | Action |
|----------|--------|
| P0 | Cron sample of appliance category sitemap IDs → `variation-detail/{id}`; store `bank`, months, `monthlyInstallment`, `promoPrice`, stock |
| P1 | `/deal-page` HTML as “on sale” seed list of IDs |
| Skip | Softlogic ONE portal; holdings site |

### Loop 8 decision — Softlogic per-SKU **skipped**

Softlogic EMI is strong in research, but wiring it needs a sitemap/deal-page ID crawl plus one `variation-detail/{id}` call **per SKU**. That is too heavy for an optional thin household chip beside Singer’s single `json-get-emi` sample. **Park Softlogic** until a dedicated appliances ingest loop; do not half-wire one hardcoded Softlogic SKU as if it were a catalog.

---

## 2. Singer Sri Lanka — singersl.com

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.singersl.com/` | Canonical store (`singer.lk` → same) | Yes |
| `/offers` | **302** → `/products?offers=-@2090@2091@2097@2119&availability=-@1` | Offer-filtered PLP |
| `/bank-offers` | Credit-card / deal PLP (offer facet `2119` etc.) | Primary browsing |
| `/hot-deals` | Redirects into same PLP family | Alias |
| `/added-services/easy-payment` | Easy payment schemes marketing | Docs |
| `/singer-hire-purchase-installment-payments` (+ `-pay`, `/hp-installment-payments`) | Hire-purchase / HP installment | HP path |
| `/stock-clearance-sales` | Clearance hub | Secondary |
| `GET /json-get-emi` | **Banks + default EMI rows for a product** | **Primary API** |
| `GET /json-get-single-emi` | Per-bank tenor table | **Primary detail** |
| `/api/*`, `/products.json`, `/wp-json` | 404 | Skip |

`robots.txt`: Allow `/`; Disallow query `/*?category`, duty-free cart, brochure download. Sitemap lists hubs (hot-deals, bank-offers, HP, offers).

### EMI API contracts (live 2026-07-20)

**List banks for product**

`GET /json-get-emi?product_id={id}&product_price={price}` → JSON array `[banks[], defaultInstallments[]]`.

Bank object fields: `id`, `name`, `logo` (Azure CDN), `term_conditions`, `call_convert` (0|1).

Observed banks on sample SKU `7884` (price 53699): Sampath, Com Bank, DFCC, Peoples, Seylan, HNB, NDB, MintPay (8).

**Per-bank tenors**

`GET /json-get-single-emi?bank_id={id}&product_id={id}&product_price={price}` → `[installmentRows[], bankInfo]`.

Row shape: `{ "installment": 6, "interest": "5,400" }` (monthly amount as formatted string).

PDP wires these via `check_emi_offers()` / `load_emi_details()` (jQuery GET). Also MintPay “Pay in 3” on PDP HTML; stock helpers `json-check-product-stock`, `ifs-single-shop-stock-validation` (POST, CSRF) — not needed for offer strip.

### Lankawa recommendation

| Priority | Action |
|----------|--------|
| P0 | For featured appliance SKUs (or PLP scrape of `/bank-offers`), call `json-get-emi` then `json-get-single-emi` per bank; normalize tenors + `call_convert` |
| P1 | Link out to `/added-services/easy-payment` and HP pages for hire-purchase (non-card) |
| P2 | Offer facet IDs on `/products?offers=` change over time — don’t hardcode without refresh |

### Loop 8 — shipped thin chip

Adapter: `src/lib/integrations/singer-emi.ts` + `src/data/singer-emi-seed.json`.  
UI: `HouseholdEmiStrip` on `/economy` under household tariffs (`#household-emi`).  
Probe (2026-07-20): `json-get-emi?product_id=7884&product_price=53699` → 200, 8 banks; capped `json-get-single-emi` for tenors. Seed + `isSeed` honesty when Imperva/timeout. Not grocery — separate from supermarket card days.

---

## 3. Abans — BuyAbans.com (+ BigDeals)

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://buyabans.com/` | Primary online store (`abans.com` / `www.abans.com` redirect here) | Yes |
| Sitemap `/today-offer`, `/weekly-deals`, `/24-hour-flash-sale`, `/online-flash-deals` | Campaign hubs | **Unreliable** — many child slugs **404**; `/today-offer` returned empty body in probe |
| `/bundle-offers-new` | Live bundle PLP HTML | Secondary |
| `/home-appliance/...` categories | Category HTML (bank logos / EMI mentions in chrome) | Listing |
| `https://bigdeals.lk/` | Abans deals sister site | Secondary HTML |
| FAQ `/faq`, `/buy` | Documents installment up to **60 months**, interest-free up to **48 months** on PDP/checkout | Docs only |
| `abansgroup.com` | Corporate WordPress | No promo API |

Probes: `/promotions`, `/offers`, `/deals`, `/api/offers`, `/graphql`, Magento `/rest/V1/*`, `/products.json` → **404 or HTML homepage shell**. No Shopify `products.json`. Sitemap (~3972 locs) is almost entirely **categories + campaign paths**, not product PDPs — product URLs are not discoverable from sitemap alone.

### EMI reality

Merchant site: plans rendered on product/checkout UI (not a public catalog API). Structured EMI for Abans/BuyAbans/Abans Elite is published by **banks**, e.g.:

| Bank surface | Example (Jul 2026) |
|--------------|--------------------|
| Amex (NTB) | `/en/offers/installment-offers/abans-5`, `abans-retail-elite` — up to **36 months ESP**, min ~LKR 50,000; elite page valid till **30 Jun 2026** |
| Seylan | `/promotions/cards/gadgets/abans-elite`, `/promotions/cards/online-deals/buy-abans` — 0% up to 12–24M; online min Rs.10,000; call-and-convert |
| Sampath | Card offer pages for `www.buyabans.com` (e.g. 6/12/20/60 months 0%) |

ComBank×Abans POS/EPP partnership is **acquiring infrastructure** (enterprise API to Abans ERP) — **not** a public promotions API.

### Lankawa recommendation

| Priority | Action |
|----------|--------|
| P1 | Ingest Abans/BuyAbans rows from **bank IPP/ESP HTML** (Amex index already lists them) |
| P2 | Opportunistic scrape of live BuyAbans campaign pages when HTTP 200 and non-empty; treat sitemap as stale hints |
| Skip | Expecting `/api/offers` or Magento REST |

### Loop 8 — **parked**

No public merchant EMI JSON. Do not scrape BuyAbans campaign HTML for this chip. Revisit via bank IPP (Amex/Seylan/Sampath) in a later loop.

---

## 4. Arpico — arpico.com + My Arpico

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.arpico.com/` | Richard Pieris corporate / retail blurb | Low |
| `https://myarpico.com/` | **OpenCart** e-commerce (Supercentre online) | Primary store |
| `GET …/index.php?route=product/special` | **“Monthly Offers”** — 375 products / 25 pages (probe) | **Primary promo list** |
| `route=product/product&product_id=` | PDP | Detail |
| `www.arpicosupercentre.com` | Redirects → My Arpico | Alias |
| `/api/offers`, `/promotions` on arpico.com | 404 / 403 | Skip |
| OpenCart `route=api/login` | **403** | Skip |

My Arpico `robots.txt`: Allow `/` with Cloudflare content signals `ai-train=no`; Disallow `/admin/`, `/private/`. Pretty paths like `/promotions` SPA-fallback to homepage HTML; use **`route=product/special`**.

### What “Monthly Offers” contains

SSR HTML product cards with:

- `product_id`, name  
- `data-price` / `data-special` (e.g. `₨ 450.00` → `₨ 337.50`)  
- Displayed “SAVE Rs. 0” badge can be wrong — **prefer `data-*` attributes**

Observed catalog skew: **FMCG / Arpico own-brand groceries** (face wash, tea, curry powder…), not white-goods EMI. Store context on homepage: location **Nawinna**. No installment JSON on specials or sample PDP.

### Furniture / EMI

0% installment at **Arpico Furniture** outlets is published by banks (not My Arpico API), e.g.:

- Amex: `/en/offers/installment-offers/arpico-furniture` (ESP up to 36M; validity into Sep 2026 in probe)  
- Sampath / Seylan furniture outlet IPP pages  

Richard Pieris Finance (`services_financial.php`) is leasing/loans — not a card EMI catalog.

### Lankawa recommendation

| Priority | Action |
|----------|--------|
| P1 | Paginate `product/special` for a **grocery specials** chip (alongside FoodLK); parse `data-price` / `data-special` |
| P1 | Arpico Furniture EMI via **bank** installment pages |
| Skip | Corporate arpico.com as offer source; OpenCart admin API |

### Loop 8 — **parked**

My Arpico `product/special` is grocery/FMCG, not white-goods EMI. Furniture 0% lives on bank pages. Park both for this household EMI strip; do not conflate with Singer.

---

## 5. Bank-side IPP as the cross-merchant catalog

Merchant sites rarely expose a durable **merchant-level** 0% catalog. Banks do:

| Source | Softlogic | Singer | Abans / BuyAbans | Arpico |
|--------|-----------|--------|------------------|--------|
| Amex installment index | — | `…/singer-1` | `…/abans-5`, `…/abans-retail-elite` | `…/arpico-furniture` |
| Seylan card promotions | Softlogic stores (peer pages) | Singer IPP page | Abans Elite + BuyAbans online | Arpico Furniture |
| Sampath card offers | — | Singer outlets | buyabans.com | Arpico Furniture |
| HNB lifestyle | Softlogic Stores / MAX / mysoftlogic | — | — | — |
| Pan Asia `arr_offers` | Softlogic Glomark + Lifestyle IPP block | Singer, Abans, Damro in IPP | Same IPP block | — |
| ComBank rewards HTML | Softlogic **Glomark** + Softlogic restaurants (not MySoftlogic EMI API) | — | — | — |
| SC `offers.json` | Path existed historically; **404 HTML shell** in this probe | Stale retail IPP historically | Same | — |

For Lankawa “instalments” UX: **union** of (1) Singer + Softlogic JSON EMI and (2) bank ESP/IPP HTML for Abans/Arpico Furniture — with clear provenance and end dates.

---

## 6. What not to build

1. Authenticated Softlogic ONE / Singer loyalty / BuyAbans points APIs.  
2. Treating BuyAbans sitemap campaign URLs as live without HEAD/GET checks.  
3. Claiming SC Good Life `offers.json` as live until it returns JSON again ([`NTB_SC_HSBC_OFFERS_RESEARCH.md`](./NTB_SC_HSBC_OFFERS_RESEARCH.md)).  
4. Using MyPromo merchant promo pages as primary (ToS scrape ban; thin).  
5. ComBank–Abans POS “secure API” — private ERP integration, not public offers.

---

## 7. Suggested ingest order

```
P0  softlogic-variation-emi.ts   ← /product-page/variation-detail/{id}
P0  singer-emi.ts                ← /json-get-emi + /json-get-single-emi
P1  amex-installment-merchants.ts← /en/offers/installment-offers/{slug}
P1  myarpico-monthly-offers.ts   ← route=product/special (grocery specials)
P2  buyabans-campaigns.ts        ← only 200 + non-empty campaign HTML
P2  seylan/sampath IPP HTML      ← Abans / Arpico Furniture / Singer rows
```

Product placement: separate **“Appliances & EMI”** strip from FoodLK supermarket card-days — different cadence, merchants, and APIs.

---

## Probe log (2026-07-20)

| Probe | Result |
|-------|--------|
| Softlogic `variation-detail/60` | 200 JSON; 3× COMMERCIAL installment rows; promoPrice 256499 |
| Softlogic `/deal-page` | 200 HTML; ~59 PDP links |
| Singer `json-get-emi?product_id=7884&product_price=53699` | 200 JSON; 8 banks |
| Singer `json-get-single-emi` (Sampath) | 200 JSON; 6/12/20/24 month rows |
| Singer `/offers` | 302 → products offer filter |
| BuyAbans `/today-offer` | 200 empty body; many sitemap children 404 |
| BuyAbans `/products.json` / Magento REST | HTML shell / not JSON API |
| My Arpico `product/special` | 200 “Monthly Offers”; 375 products; `data-price`/`data-special` |
| Amex installment index | Singer, Abans, Arpico Furniture slugs live |
| SC `…/offers.json` | 404 HTML (Akamai) |
| Softlogic ONE portal | Login HTML only |

Medium thoroughness: no APK MITM, no authenticated sessions, no exhaustive SKU crawl.
