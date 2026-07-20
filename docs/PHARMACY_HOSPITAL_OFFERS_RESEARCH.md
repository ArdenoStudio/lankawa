# Sri Lanka pharmacy chains & hospital card discounts — research (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Public marketing / retailer / hospital surfaces only. No authenticated loyalty apps, Agrahara member portals, or pharmacy POS APIs. Prefer bank card-offer primaries (same stack as `COMBANK_OFFERS_RESEARCH.md`). Server-side fetch + honest provenance.

**Sisters:** Card-offer banks · `RETAIL_LOYALTY_APIS_RESEARCH.md` · `/health` (dengue / MoH / heat — civic, not commerce).

---

## Verdict

| Question | Answer |
|----------|--------|
| Do **Hemas / Healthguard / SPC** expose a public offers JSON / RSS feed? | **No.** Hemas eStore has WooCommerce **Store API product/sale prices** (not bank promos). Healthguard is **Cloudflare-blocked**. SPC has HTML outlet lists + stale PDFs, no promo API. |
| Best public “pharmacy discount” signal today? | **Bank card offers** that already name Hemas eStore (and healthcare category merchants) — e.g. ComBank **20% credit / 15% debit** on Hemas eStore **20th–30th each month → Dec 2026**. |
| Hospital **membership / privilege cards** with pharmacy %? | **Yes, but page-copy / membership only** — Asiri Amazing Care **5%** pharmacy (min Rs.1,000; IV/supplements excluded); Queensbury **5%** pharmacy over Rs.1,000; Hemas **Upahara × Agrahara** historically **5%** on in-hospital pharmacies (press, not a live WP catalog). |
| Fit for Lankawa **`/health`**? | **Low.** `/health` is dengue + MoH notices + urban heat. Commercial pharmacy promos would dilute civic trust. |
| Fit for Lankawa **household / card-offers** strip? | **Medium.** Extend the planned supermarket-day strip with a **healthcare / pharmacy** filter from bank HTML — do **not** scrape pharmacy loyalty apps. |
| SPC / Osusala value? | **Outlet directory + static eligibility note** (5% cohorts from news/policy), not a time-bound offer feed. Optional services-directory deepen. |

**Bottom line:** For “public offer feeds,” treat pharmacy like fuel loyalty — **empty retailer APIs; real household savings live on bank marketing pages.** Hospital cards are membership T&Cs, not cron-friendly catalogs. Keep them out of `/health`; optional P2 on card-offers / services.

---

## Landscape (Jul 2026)

| Source | Role | Public catalog? | API / structured | Lankawa priority |
|--------|------|-----------------|------------------|------------------|
| **Hemas eStore** (`hemasestore.com`) | Hemas consumer / wellness e‑commerce (WooCommerce) | On-sale SKUs via WC Store; **bank payday offers via banks** | `wc/store/v1/products` (public); `wc/v3` **401**; TLS chain flaky (needs verify-tolerant fetch) | **P1 via ComBank/other banks**, not eStore scrape |
| **Hemas Hospitals** | Private hospital + in-premises pharmacy | Stale `/category/promotions/` (2021); Upahara in press | WP JSON + RSS (editorial, not offers) | **Skip** for offers; optional news only |
| **Healthguard** (Sunshine) | Branded pharmacy chain (~16 outlets cited in marketing) | Semi-monthly brand % off on social / site | Site **CF 403** here; robots lists sitemap only | **Skip** until ungated public HTML |
| **SPC / Rajya Osusala** | State pharmacy network | Outlet table (~65+ cities); old `priceList.pdf` (2018); `promotion.pdf` near-empty text | No `wp-json` / RSS; PHP pages | **P2 directory** only; eligibility as static note |
| **Asiri Amazing Care** | Paid membership | Benefits list incl. pharmacy 5% | HTML membership page | Static reference / link-out |
| **Durdans Loyalty** | Phone-number tier points | Tier thresholds; discount matrix largely in **image** | WP page + feed | Weak scrape (image T&Cs) |
| **Queensbury Loyalty** | Silver / Gold registration card | HTML table incl. pharmacy 5% | HTML | Small / niche; P3 |
| **Bank healthcare offers** | ComBank / BOC / DFCC / NTB… | Live merchant rows (Siddhalepa, hospital bills, Hemas eStore under online) | HTML (see bank research docs); FD Rates `/credit-card-offers/health` as optional CC BY cross-check | **P0–P1** (same adapters as supermarket strip) |

---

## 1. Hemas

### Hemas eStore

| Surface | Result |
|---------|--------|
| `https://hemasestore.com/` | WooCommerce storefront; consumer FMCG / personal care (not a full prescription pharmacy POS feed) |
| `robots.txt` | Allows crawl; Disallows cart/checkout/my-account; Sitemap `sitemap_index.xml` |
| `GET /wp-json/wc/store/v1/products?on_sale=true` | **200** — public Store API; **`X-WP-Total: 348`** on-sale SKUs (prices in LKR minor units) |
| `GET /wp-json/wc/v3/products` | **401** — needs keys |
| `/products.json` | **404** (not Shopify) |
| Bank offer (ComBank detail, live) | **20% credit / 15% debit**; valid **20th–30th every month till Dec 2026**; max order **Rs.40,000**; URL `www.hemasestore.com` |

**Lankawa use**

- **Do** ingest Hemas eStore as a **merchant row** from bank rewards HTML (`sourceId` e.g. `combank_card_offers`, category `online-shopping` / healthcare adjacent).
- **Do not** treat WC on-sale SKU dump as a “pharmacy discount feed” for `/health` — it is shelf promo pricing for consumer goods, high churn, weak civic fit.
- Fetch note: this environment hit **TLS issuer** failures without insecure/verify-bypass; production adapter should use a normal CA bundle and fail soft.

### Hemas Hospitals / Upahara

| Surface | Result |
|---------|--------|
| `https://hemashospitals.com/wp-json/` | WordPress; namespaces include `wp/v2`, no offers CPT |
| `posts?categories=30` (promotions) | **5** posts — fertility/PCR era **2021**; not a live discount board |
| Pages search `upahara` / `pharmacy` / `loyalty` | **Empty** |
| `/feed/` | Editorial RSS |
| Press (Ada Derana Biz) | **Upahara × NITF Agrahara**: free OPD consults; % off specialist / lab / physio / inpatient; **5%** on pharmacies **inside Hemas Hospital premises** |

**Lankawa use:** Membership / insurance partnership — **not** a public offer feed. At most a static “Agrahara at Hemas” honesty note with press provenance; do not invent live %.

### Hemas Health App

Marketing (2020s) promised in-app pharmacy orders and a **future loyalty** points store. **No public developer offers API.** Skip (auth + app-store only).

---

## 2. Healthguard (Sunshine Healthcare)

| Surface | Result |
|---------|--------|
| `https://www.healthguard.lk/` | **HTTP 403** Cloudflare challenge (home, shop, sitemap) |
| `robots.txt` | Reachable; points to `sitemap/sitemap.xml` (also challenged) |
| Parent marketing | `sunshinehealthcare.lk` — corporate, not a promo catalog |
| Third-party / social pattern | Recurring **mid-month / month-start** “up to 15–40% off selected brands”; delivery WhatsApp; gift cards via Infinity |
| Loyalty (secondary sources) | Points-on-spend programme (rates change; e.g. reported **1 pt / Rs.200** in 2025) — **app/store card**, not open API |

**Lankawa use:** **Skip** for automated ingest while CF blocks bots. If a future ungated HTML “offers” page appears, reassess as P2 HTML scrape with low cadence. Do not reverse-engineer the loyalty app.

---

## 3. State Pharmaceuticals Corporation (SPC) / Rajya Osusala

| Surface | Result |
|---------|--------|
| `https://www.spc.lk/` | PHP/LiteSpeed corporate site; news of branch openings (60s+ outlets) |
| `robots.txt` | Disallow `/admin` etc.; Sitemap present (`lastmod` often **2024-06-13**) |
| `wp-json` / `/feed/` | **404** |
| `rajya-osu-sala-outlets.php` | **HTML outlet table** — city, address, short code, phone, WhatsApp, email (**~65** data rows observed) |
| `faqs.php` | **No** discount / senior / pregnant copy |
| `pub/priceList.pdf` | Wholesale/retail list dated **23/04/2018** — **stale**, not a live offer feed |
| `pub/promotion.pdf` | Tiny PDF; extractable text ≈ “Promotion” only |
| News / ministry reporting | **5%** medicine discount at Osu Sala for cohorts such as **seniors (55+)**, **pregnant mothers**, **children under 5**, **clergy**; Ranawiru Wirusara mentioned in some coverage — **not structured on spc.lk** in this probe |

**Lankawa use**

```
P2  Parse rajya-osu-sala-outlets.php → services / facility directory
P3  Static eligibility blurb (cite ministry/news + “verify at counter”) — not cron offers
Skip priceList.pdf / promotion.pdf as “live offers”
```

Suggested `sourceId`: `spc_osusala_outlets` (directory) vs never `spc_offers_live` until a dated public promo board exists.

---

## 4. Hospital card / membership programmes (pharmacy-relevant)

| Programme | Pharmacy discount (public copy) | Other notes | Feed quality |
|-----------|----------------------------------|-------------|--------------|
| **Asiri Amazing Care** (`asirihealth.com/services/amazing-care-membership`) | **5%** on pharmacy bill; min **Rs.1,000**; excludes IV & supplementary drugs | Also 10% lab/imaging/room etc.; paid packages | HTML benefits list — **static** |
| **Queensbury Loyalty** | **5%** pharmacy over **Rs.1,000** (Silver & Gold) | Full service % table in HTML | Small network; scrapeable table |
| **Durdans Loyalty** | Not explicit in FAQ text; discount artwork is **image** | Points: Rs.1,000 hospital fee = 1 pt; Bronze→Platinum tiers | Weak for automation |
| **Hemas Upahara (Agrahara)** | **5%** hospital-premise pharmacies (press) | State-employee insurance partnership | Press-only |
| **Lanka Hospitals** | No live `/loyalty` page (404); bank partners historically (**People’s Nirogi**, HNB SOLO) with pharmacy network mentions | Prefer **bank offer pages** | Via banks |
| **Nawaloka Medicare membership** | Loyalty discounts on hospital services; pharmacy not clearly called out in snippets | Registration microsites | Low |

**Pattern:** Private hospitals sell **membership** or ride **bank co-brand** promos. Neither yields a national, dated, multi-merchant JSON feed comparable to ComBank `/rewards-promotions`.

---

## 5. Bank & aggregator health category (actual public offer feeds)

Aligned with existing research:

| Bank / hub | Health-related public surface | Pharmacy-chain hits (observed) |
|------------|-------------------------------|--------------------------------|
| **ComBank** `/rewards-promotions` | Category `#healthcare` + **Hemas eStore** under online-shopping | Hemas eStore payday %; Siddhalepa; hospital bill settlement; medical travel |
| **BOC** `/personal-banking/card-offers/health-beauty` | Siddhalepa hospital/clinics; hospital 0% plans | No Healthguard / Osusala / Asiri pharmacy SKUs in index sample |
| **FD Rates LK** `/credit-card-offers/health` | Aggregated **16** ItemList samples (wellness/spa/Siddhalepa heavy) | **0** Hemas / Healthguard / Asiri / Osusala name hits in page text | Optional CC BY 4.0 factual cross-check only ([`CARD_OFFER_AGGREGATORS_RESEARCH.md`](./CARD_OFFER_AGGREGATORS_RESEARCH.md)) |

**Recommended ingest (same adapters as supermarket strip):**

```
P0  Bank healthcare + online rows that match pharmacy/wellness merchants
      (Hemas eStore, hospital bill, Siddhalepa, …)
P1  Normalize category: healthcare | pharmacy | hospital | wellness
P2  SPC outlet directory (non-offer)
P3  Asiri / Queensbury membership fact cards (manual or rare HTML refresh)
Skip Healthguard CF, Hemas app loyalty, Agrahara portals, WC SKU firehose on /health
```

### Suggested normalized record (bank path)

```ts
{
  sourceId: "combank_card_offers" | "boc_card_offers" | /* other banks */;
  offerId: string;
  url: string;
  category: "healthcare" | "online-shopping" | string;
  merchant: string;           // "Hemas eStore" | "Siddhalepa Clinics" | …
  merchantKind: "pharmacy_retail" | "hospital" | "wellness" | "other";
  discountPercent: number | null;
  discountLabel: string | null;
  cadence: string | null;     // "20th–30th monthly" | "every Saturday" | …
  validTo: string | null;
  cardTypes: string[];        // credit | debit | …
  minBillLkr: number | null;
  maxDiscountLkr: number | null;
  sourceUrl: string;
}
```

Hospital membership facts (if ever shown) should use a **separate** `sourceId` (`asiri_amazing_care`, `queensbury_loyalty`) and label **`membership`**, not `card_offer_live`.

---

## 6. Lankawa product fit

| Surface | Fit | Why |
|---------|-----|-----|
| **`/health`** | **Poor** | Page job is surveillance & MoH trust (P36–P39). Promo tiles would look like affiliate clutter next to dengue. |
| **Household / card-offers strip** (beside FoodLK) | **Good (secondary category)** | Same scrape stack; payday Hemas eStore + healthcare merchants help “what saves money this week.” |
| **Services directory** | **Medium (SPC outlets)** | Rajya Osusala table is a clean public HTML directory; pairs with existing hospital/MOH facility seeds. |
| **Morning brief** | **Optional one-liner** | Only when a bank healthcare offer is in-window (e.g. Hemas eStore 20–30th); never invent Osusala “today’s deal.” |

```
Household health-adjacent savings (recommended)
├── Bank healthcare / online merchants  → combank-offers.ts (+ boc / ntb / …)
├── SPC Osusala outlets                 → optional directory seed/adapter
└── Hospital membership T&Cs            → link-out / rare static facts
Pharmacy loyalty apps (Healthguard / Hemas Health) → out of scope
```

---

## Compliance

- Descriptive UA (`LankawaBot/1.0`), low cadence, server-side only  
- No loyalty registration, Agrahara login, or mobile-app traffic capture  
- Honor Cloudflare / Imperva blocks with quiet skip (Healthguard, some Hemas corporate)  
- Provenance labels: `combank_card_offers` · `boc_card_offers` · `spc_osusala_outlets` · `asiri_amazing_care` (static) · never claim `live` on press-only Upahara %  
- Medical disclaimer: discounts ≠ clinical advice; eligibility verified at counter

---

## Probe log (this environment, 2026-07-20)

| Target | Result |
|--------|--------|
| Healthguard home / sitemap | **403** CF challenge |
| Hemas eStore home | **200** with TLS verify bypass; WooCommerce |
| Hemas eStore `wc/store/v1/products?on_sale=true` | **200**, total **348** |
| Hemas eStore `wc/v3/products` | **401** |
| Hemas Hospitals WP promotions cat | 5 posts, last **2021** |
| SPC home / outlets / faqs | **200**; outlets table populated; faqs no discount text |
| SPC `pub/priceList.pdf` | Dated **2018-04-23** |
| SPC `pub/promotion.pdf` | No useful offer text |
| ComBank Hemas eStore offer detail | 20%/15%, 20–30 monthly → Dec 2026, max Rs.40,000 |
| Asiri Amazing Care | 5% pharmacy clause in HTML |
| Queensbury loyalty | 5% pharmacy row in HTML table |
| Durdans loyalty | Tiers in HTML; % matrix image-led |
| FD Rates `/credit-card-offers/health` | 16 ItemList samples; no major pharmacy-chain names |
| BOC health-beauty index | Siddhalepa-focused sample |

---

## Recommended Lankawa actions

| Priority | Action | Why |
|----------|--------|-----|
| **P0** | Ship bank card-offer adapters; include **healthcare + Hemas eStore** rows | Only durable public offer feed |
| **P1** | UI filter `healthcare` on household offers strip — **not** on `/health` | Product honesty |
| **P2** | Optional `spc_osusala_outlets` HTML → services directory | Real public table, civic-aligned |
| **P3** | Static membership footnotes (Asiri 5% pharmacy; Queensbury) with `sourceUrl` | Rare refresh |
| **Skip** | Healthguard scrape, Hemas WC SKU firehose on health page, Agrahara/Upahara as “live offers” | Blocks / wrong product job / press-stale |
