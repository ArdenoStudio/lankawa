# Nations Trust / Standard Chartered / HSBC Sri Lanka — card offers research (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Public marketing surfaces only. No reverse-engineering of authenticated banking apps. Server-side fetch + provenance; never claim live when empty/stale.  
**Sister doc:** [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md)

---

## Verdict (all three)

| Bank | Public offers API? | Best public surface | Local supermarket fit | International fit | Lankawa priority |
|------|--------------------|---------------------|----------------------|-------------------|------------------|
| **Nations Trust (Mastercard)** | **No** — SSR HTML | `nationstrust.com/promotions` (+ hub supermarket page) | **High** — Keells, Cargills, Laugfs, Glomark, Cargills Online | Weak — Travel agents / online (FindMyFare, Crazy Jets); not a global merchant catalog | **P0** with ComBank |
| **Nations Trust Amex** (`americanexpress.lk`) | **No** — SSR HTML | `/en/offers/supermarket-offers` + `/en/offers/global-offers` | **High** — parallel supermarket days (Amex cards) | **High (for Amex holders)** — country pages (SG, TH, IN, HK, …) | **P0** supermarket; **P1** global strip |
| **Standard Chartered LK** | **Yes (JSON)** — TGL feed | `sc.com/lk/data/tgl/offers.json` (+ HTML shell) | **Low / none now** — no Keells/Cargills/SPAR in feed; retail = IPP & lifestyle | **Low** — local hotels + LK travel agents; not international supermarket | **P2** — JSON is nice, content wrong for FoodLK strip |
| **HSBC LK retail** | **N/A** | Redirects to goodbye announcement | **None** — retail sold to NTB **30 Apr 2026** | None on `hsbc.lk` | **Skip** — follow NTB/Amex instead |

**Bottom line for Lankawa:** For a “this week’s supermarket card days” strip next to FoodLK, ingest **NTB Mastercard HTML** and **Amex.lk supermarket HTML** (same bank group, different networks). Treat **SC** as optional lifestyle/IPP JSON (currently all rows past `ed`). Do **not** scrape HSBC retail offer URLs — they 301 to the migration notice.

---

## 1. Nations Trust Bank (Mastercard)

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.nationstrust.com` | Primary marketing (Laravel `ntb_session` / `XSRF-TOKEN`, nginx + CloudFront + AWS ALB) | Yes |
| `https://www.nationstrust.com/promotions` | **Canonical offer index** (~102 listing cards, Jul 2026) | **Primary** |
| `https://www.nationstrust.com/promotions/{slug}` | Per-offer detail (T&Cs, min/max, cadence) | **Primary detail** |
| `https://www.nationstrust.com/promotions/enjoy-exclusive-savings-on-supermarkets` | **Multi-merchant supermarket hub** (table of Cargills / Laugfs / Keells rows) | **P0 hub** |
| `https://www.nationstrust.com/sitemap.xml` | Lists hub pages + some promos (not every `%`-off slug) | Discovery aid |
| `https://www.nationstrust.com/robots.txt` | `User-agent: *` / `Disallow:` (empty) | OK to fetch politely |
| `https://assets.nationstrust.com` | Offer images / category icons | Thumbs only |
| `/api/promotions`, `/api/offers`, `?format=json` | **404 or HTML** — no JSON catalog | Skip |

### Catalog shape (2026-07-20)

**Index:** `GET /promotions` — full SSR HTML of active offers (Isotope-style client filter).

**Category filter:** Client-side only — buttons `data-filter=".supermarket"` etc. Query `?category=supermarket` updates history via JS but **does not** reduce server HTML (same ~240 KB payload).

**Listing counts by `<div class="tag">`:**

| Tag | Count |
|-----|------:|
| Hotels & Resorts | 47 |
| Dining | 24 |
| Homecare & Electronics | 7 |
| Online | 6 |
| **Supermarket** | **5** |
| Wellness | 4 |
| Private Banking | 4 |
| Travel | 3 |
| Other | 2 |
| Automobile | 1 |
| **Cards parsed** | **~102** |
| Unique `/promotions/{slug}` hrefs | **~107** |

### Listing DOM (scrape selectors)

```html
<div class="col-lg-3 ... grid-item supermarket">
  <div class="promo-box">
    <div class="promo-image">
      <img src="https://assets.nationstrust.com/…jpg" alt="…">
      <div class="tag">Supermarket</div>
    </div>
    <div class="info">
      <h6>Cargills Food City</h6>   <!-- merchant -->
      <h5>30% off with Mastercard Credit Cards</h5>
    </div>
    <div class="promo-footer">
      <small>Valid till 31st July 2026</small>
      <a href="https://www.nationstrust.com/promotions/{slug}" …>Learn More</a>
    </div>
  </div>
</div>
```

Filter chip selectors: `button[data-filter=".supermarket"]`, `.dining`, `.hotels-resorts`, `.wellness`, `.online`, `.travel`, …

### Supermarket subset (listing, Jul 2026)

| Merchant | Headline | Validity (listing) |
|----------|----------|--------------------|
| Cargills Food City | 30% off Mastercard Credit | till 31 Jul 2026 |
| Laugfs Super | 25% off Mastercard Credit | till 31 Jul 2026 |
| Keells | Up to 25% off Mastercard Credit | selected dates till 31 Jul 2026 |
| Cargills Online | 15% off Mastercard Credit | every Thursday till 30 Nov 2026 |
| GLOMARK | 25% total bill (Private Banking Mastercard) | 31 Jul 2026 |

**Hub page** `/promotions/enjoy-exclusive-savings-on-supermarkets` collapses several into one HTML table with day-of-week, min bill, max savings (e.g. Cargills Wednesdays / Keells Sundays) — ideal single fetch for the FoodLK strip.

### Detail page fields (example: Glomark PB)

- Meta `description` + `application/ld+json` often duplicate T&C summary (good for cheap parse).
- Body: min bill (LKR 15,000), max savings (LKR 5,000), date, exclusion list, instore + `glomark.lk`.

### Local vs international (NTB Mastercard)

| Bucket | Useful? | Notes |
|--------|---------|-------|
| **Local supermarket** | **Yes** | Primary Lankawa value; weekday cadence in hub/detail |
| Local dining / hotels | Secondary | Large catalog; not FoodLK |
| Online (Daraz, PickMe, Uber Eats, Cargills Online) | Partial | Cargills Online overlaps grocery |
| Travel | Weak international | FindMyFare / Crazy Jets / Classic Travel — LK OTAs, not overseas supermarket networks |
| Regional hub pages (Galle, Trinco, …) | Local tourism | Sitemap lists city promos |

### Recommended scrape (NTB MC)

```
P0  GET /promotions/enjoy-exclusive-savings-on-supermarkets
P0  GET /promotions → filter grid-item.supermarket (+ optional .online for Cargills Online)
P0  GET each supermarket detail slug
P1  sitemap.xml for hub discovery
Skip  /api/* (404), auth apps, APK traffic
```

---

## 2. Nations Trust American Express (`americanexpress.lk`)

NTB is the Amex issuer in Sri Lanka. Offers site is a **separate Laravel** property from `nationstrust.com` (own session cookies / Imperva). Same supermarket merchants, **Amex network** eligibility.

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.americanexpress.lk/en/offers` | Offers home | Yes |
| `https://www.americanexpress.lk/en/offers/supermarket-offers` | **Supermarket index** | **Primary** |
| `…/supermarket-offers/{slug}` | Detail (keells-20, cargills-food-city, laugfs-super, cargills-online-2, arpico, …) | **Primary detail** |
| `…/global-offers` + `…/global-offers/{country}` | **International merchant privileges** (SG, TH, IN, HK, KR, TW, MV, MY, …) | **P1 international** |
| `…/travel-offers` | LK travel (Crazy Jets, Find My Fare, SriLankan Airlines, IPPs) | Secondary |
| `sitemap.xml` | Category hubs + many detail URLs (supermarket detail coverage incomplete vs live index) | Aid |
| `robots.txt` | Allows all; points to sitemap | OK |
| `/api/offers`, `/api/v1/offers` | Tiny HTML stub (~1.5 KB), **not JSON** | Skip |

**Bot note:** Bare/non-browser UAs sometimes get **302 → home** or **403** on WebFetch; a normal browser UA returns 200. Use a descriptive browser-like UA + low cadence.

### Supermarket (live index slugs, Jul 2026)

`cargills-food-city`, `keells-20`, `laugfs-super`, `cargills-online-2` (+ sitemap still lists `arpico`).

Detail copy mirrors Mastercard economics (e.g. Keells Sunday fresh meat/veg/fruit, min LKR 5,000, max save LKR 1,500) but eligibility is **Nations Trust Bank American Express Credit Card**.

### Local vs international (Amex)

| Bucket | Useful? | Notes |
|--------|---------|-------|
| **Local supermarket** | **Yes** | Same FoodLK merchants as NTB MC / ComBank |
| **Global offers** | **Yes (international)** | Best of the three banks for overseas dining/retail privileges by country |
| Travel offers | Mixed | Airlines / OTAs / instalments — not grocery |

---

## 3. Standard Chartered Sri Lanka

### Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.sc.com/lk/promotions/` | Thin HTML index (Good Life + 360 Rewards links) | Shell only |
| `https://www.sc.com/lk/promotions/the-good-life-privileges/` | TGL UI; loads JSON below | Secondary |
| **`https://www.sc.com/lk/data/tgl/offers.json`** | **Public JSON catalog** (~73 KB, `offers.offer[]`) | **Primary if using SC** |
| `https://www.sc.com/lk/promotions/360-rewards/` | Points programme marketing | Docs only |
| `https://retail.sc.com/lk/360rewards/` | Redemption portal | **403 / auth — skip** |
| `https://av.sc.com/lk/…` | Image/PDF CDN | Assets; listing `/content/docs/` often 403 |
| `/api/promotions`, `/wp-json/*` | 404 | Skip |
| WordPress sitemaps under `/lk/sitemap*.xml` | Page discovery | Weak for offers |

### JSON schema (TGL)

```json
{
  "offers": {
    "offer": [
      {
        "id": 98770,
        "uid": 98770,
        "name": "…",
        "cn": "lk",
        "otitle": "…",
        "odesc": "…",
        "oimg": "https://av.sc.com/lk/content/images/…",
        "sd": "26-05-2026 00:00:00",
        "ed": "30-06-2026 23:59:00",
        "tnc": "…",
        "cat": "restrelax|retail|online|automotive|lifestyle-category",
        "sbcat": "hotel-stay|travel|retail-online|electronics|…",
        "visa": "True",
        "visa_card_list": […],
        "venue": […],
        "url": "",
        "all_categories": […]
      }
    ]
  }
}
```

**Observed Jul 2026-07-20:** **28 offers**, categories dominated by `restrelax` (hotels/travel) and `retail` (**0% IPP** at Singer/Abans/etc., not grocery %). **Zero** supermarket / Keells / Cargills / SPAR / Glomark hits. **All 28 had `ed` ≤ 30 Jun 2026** → treat feed as **stale** until new `ed` appears; do not show as live supermarket days.

HTML promotions page `Last-Modified: Wed, 25 Feb 2026` — marketing shell updates slowly; JSON is the real feed.

### Local vs international (SC)

| Bucket | Useful? | Notes |
|--------|---------|-------|
| Local supermarket % days | **No (current feed)** | Wrong merchant mix |
| Local lifestyle / hotels / IPP | Yes, if Lankawa expands beyond grocery | JSON-ready |
| International supermarket | **No** | `cn=lk` only; travel = LK agents (Findmyfare, Crazy Jets, iCanFly) |
| 360 Rewards points | Not an open offers API | Auth redemption |

---

## 4. HSBC Sri Lanka (retail)

**Completed sale of HSBC retail banking business in Sri Lanka to Nations Trust Bank PLC on 30 April 2026.**

| URL | Result (Jul 2026) |
|-----|-------------------|
| `https://www.hsbc.lk/credit-cards/offers/` | **301 →** `/announcements/goodbye/` |
| `https://www.hsbc.lk/credit-cards/offers/shopping/` | Same goodbye page (~11 KB) |
| `https://www.hsbc.lk/sitemap.xml`, `/robots.txt` | Same goodbye HTML (not real sitemap/robots) |

Customer contact for transferred products: NTB hotline **011 441 4151**. Historical HSBC supermarket cashback / SPAR bank-day pages are **not** a live ingest target.

**Lankawa:** Drop HSBC as an offers source. Migrated cardholders’ ongoing promos appear under **NTB / Amex.lk**.

---

## Cross-bank comparison (supermarket vs international)

| Need | Best source | Runner-up | Avoid |
|------|-------------|-----------|-------|
| Local supermarket weekday % | **NTB** hub + listing; **Amex.lk** supermarket; **ComBank** rewards | — | SC TGL (no grocery); HSBC |
| Online grocery | NTB/Amex Cargills Online | ComBank online-shopping | SC |
| International merchant privileges | **Amex.lk `/global-offers`** | — | NTB MC travel (OTAs); SC TGL; HSBC |
| Machine-readable feed | **SC `offers.json`** (wrong vertical / currently expired) | ComBank seasonal `/api/s-offers` (often `[]`) | NTB/Amex (HTML only) |

---

## Suggested normalized record (shared with ComBank)

```ts
{
  sourceId: "ntb_mc_card_offers" | "ntb_amex_card_offers" | "sc_tgl_offers";
  bank: "Nations Trust Bank" | "Standard Chartered Sri Lanka";
  network: "mastercard" | "amex" | "visa" | "mixed";
  offerId: string;
  url: string;
  category: string; // supermarket | online | travel | global | …
  title: string;
  merchant: string | null;
  discountPercent: number | null;
  validityText: string;
  validUntil: string | null;
  cadence: string | null; // "every Sunday" | "Wednesdays" | …
  minBillLkr: number | null;
  maxDiscountLkr: number | null;
  geography: "lk" | "international" | string; // Amex country slug when global
  termsExcerpt: string;
  fetchedAt: string;
  provenance: "ntb_html" | "amex_lk_html" | "sc_tgl_json";
}
```

---

## Recommended ingest priority for Lankawa

```
P0  NTB  GET /promotions/enjoy-exclusive-savings-on-supermarkets
P0  NTB  GET /promotions (supermarket grid-items) + detail slugs
P0  Amex GET /en/offers/supermarket-offers + detail slugs
P1  Amex GET /en/offers/global-offers (+ country children) — international lane
P1  ComBank (sister doc) — already researched
P2  SC   GET /data/tgl/offers.json — only if ed >= today AND cat/sbcat relevant
Skip HSBC retail offer paths (goodbye redirect)
Skip SC 360rewards login, APK/MITM, authenticated banking
```

### Ops / compliance

- Cadence: **daily or twice-weekly** (same as ComBank).
- UA: `LankawaBot/1.0 (+https://…; research)`; for Amex.lk prefer a normal browser UA if bot UA is challenged.
- Rate limit: ≤1 detail/sec; backoff on 403/429.
- Honesty: if SC `ed` &lt; today or supermarket count = 0, show seed/empty — never “live SC supermarket days”.
- Dedupe: NTB MC vs Amex often same merchant/day with different network — expose **network** in UI.

---

## Open risks

1. **NTB filter is client-side** — always parse full `/promotions` HTML, don’t trust `?category=`.  
2. **Amex bot challenges** — monitor 302/403; sitemap incomplete vs live supermarket index.  
3. **SC JSON can be entirely expired** — schema-stable, content-stale; validate `ed`.  
4. **HSBC brand residue** — third-party promo aggregators may still list “HSBC” supermarket days; prefer NTB primary sources.  
5. **Dual NTB surfaces** — Mastercard vs Amex must not be merged into one eligibility string.

---

## Agent note

Researched Jul 2026 against live `nationstrust.com` (promotions HTML, supermarket hub, sitemap, API 404s), `americanexpress.lk` (supermarket + global + travel, sitemap, API stubs), `sc.com/lk` (promotions HTML, TGL `offers.json` schema/counts/dates, 360rewards 403), `hsbc.lk` (retail offer URLs → goodbye / NTB sale 30 Apr 2026). Medium thoroughness: no APK MITM, no authenticated sessions.
