# Commercial Bank of Ceylon — card offers research (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Public marketing surfaces only. No reverse-engineering of authenticated banking apps. Server-side fetch + provenance; never claim live when empty/stale.

---

## Verdict

| Question | Answer |
|----------|--------|
| Public offers API for current card promos? | **No.** Ongoing deals are **server-rendered HTML** on `combank.lk`. |
| Any JSON endpoint? | **Yes, but weak for daily product:** `/api/s-offers` (seasonal SPA) returns `[]` when no campaign; static `/assets/offers/js/offers.json` is a **2019–2020** merchant dump (337 rows, not current). |
| Mobile app offer APIs documented? | **No.** ComBank Digital (Fiserv) and Q+ are closed; no public developer docs for offer feeds. |
| Best Lankawa ingest path | **HTML scrape** of rewards listing + detail pages; optional seasonal JSON when non-empty. |
| Fit for Lankawa | High for a **card-offers / supermarket-day** strip (Keells, Cargills, Spar, Glomark, Laugfs) alongside FoodLK — not a remittance TT source. |

---

## Domains & surfaces

| Host / path | Role | Scrape? |
|-------------|------|---------|
| `https://www.combank.lk` | Primary marketing site (Laravel session cookie `commercial_bank_session`, nginx + CloudFront) | Yes — public pages |
| `https://www.combank.lk/rewards-promotions` | **Canonical ongoing card offers index** (SSR HTML, ~72 offers as of 2026-07-20) | **Primary** |
| `https://www.combank.lk/rewards-promotion/{category}/{slug}` | Offer detail (T&Cs, min/max bill, card eligibility) | **Primary detail** |
| `https://www.combank.lk/seasonal-offers` | Seasonal campaign SPA (`/assets/offers/js/main.js`) | Secondary |
| `https://www.combank.lk/api/s-offers` | JSON used by seasonal SPA | Probe; often empty |
| `https://www.combank.lk/assets/offers/js/offers.json` | Static JSON (legacy) | Do **not** treat as live |
| `https://www.combank.lk/info/file/{id}/{slug}` | PDFs (e.g. UnionPay privileges) | Occasional |
| `https://maxrewards.combank.net` | Max Loyalty redemption portal (ASP.NET, login) | Skip for offers ingest |
| `https://www.combankdigital.com` | ComBank Digital web (Fiserv) | Auth-only — **out of scope** |
| `https://vkyc.combank.net`, `https://business.combank.net` | Onboarding / business digital | Out of scope |
| `combank.net` apex | Unreliable from this environment; bank still references `combank.net` / `commercialbk.com` legacy online banking | Prefer `combank.lk` |

`robots.txt` returned **403** when probed — treat as opaque; use a descriptive UA, low cadence, and stop on owner request (same compliance bar as `FOOD_API_SOURCES.md`).

---

## Card promotions — current catalog shape

**Index:** `GET https://www.combank.lk/rewards-promotions`  
**Stack signals:** Laravel CSRF meta, full HTML of all active offers (no XHR list API).  
**Filters:** Category chips are in-page anchors (`#supermarket`, `#food-restaurants`, …). Date filter via GET works: `?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` (Jul 2026 window → ~45 offers).

### Categories (slug → count on 2026-07-20)

| Category slug | Count |
|---------------|------:|
| `other-offers` | 15 |
| `premium-card-offers` | 10 |
| `food-restaurants` | 9 |
| `travel` | 8 |
| `leisure` | 7 |
| `supermarket` | 6 |
| `online-shopping` | 6 |
| `healthcare` | 5 |
| `fashion-jewellery` | 3 |
| `education` | 1 |
| `auto` | 1 |
| `q-payment-app-offers` | 1 |
| **Total unique detail URLs** | **72** |

### Listing card DOM (scrape selectors)

```html
<a class="reward ..." href="https://www.combank.lk/rewards-promotion/{cat}/{slug}">
  <div class="reward-image" style="background-image: url('…S3 thumb…')"></div>
  <div class="offer-tag percentage">
    <p>Up to</p><p class='percentage'>25%</p><p>Off</p>
    <!-- or class="offer-tag" with "Best Offer" -->
  </div>
  <div class="reward-content">
    <p class="category">Supermarket</p>
    <h3>…title…</h3>
    <p class="valid-date">Offer valid on every Saturday till 25th July 2026</p>
  </div>
</a>
```

Thumbs: `https://s3.ap-southeast-1.amazonaws.com/static.combank.cloud/photos/shares/Offers/Thumb Images/{YYYY}/{Month}/…`

### Detail page fields (example: Keells supermarket)

URL pattern: `/rewards-promotion/supermarket/enjoy-the-best-supermarket-deals-at-keells-with-combank-credit-cards`

| Field | Example (Jul 2026) |
|-------|---------------------|
| Title | Enjoy the best supermarket deals at Keells… |
| Validity line | Offer valid on every Saturday till 25th July 2026 |
| Scope | Fresh Vegetables, Fruits, Seafood and Meat |
| Discount | 25% for Credit Cards |
| Min bill | Rs. 4,000/- |
| Max discount | Rs. 1,250/- |
| Cap | One transaction per card per day |
| Eligibility | ComBank Credit Cards (varies by offer: Credit / Debit / Premium / Visa / Mastercard / UnionPay) |

### Supermarket + online (Lankawa-relevant subset)

| Merchant | Rhythm (from listing) | Card note |
|----------|----------------------|-----------|
| Glomark | 16th & 30th Jul 2026 | Credit + Debit |
| Softlogic Glomark (fresh) | Every Wednesday → 29 Jul 2026 | Credit + Debit |
| Keells | Every Saturday → 25 Jul 2026 | Credit |
| Cargills Food City | Every Friday → 31 Jul 2026 | Credit |
| Spar | Every Tuesday → 28 Jul 2026 | Credit |
| Laugfs Super | Every Sunday → 26 Jul 2026 | Credit |
| Hemas eStore | 20th–30th each month → Dec 2026 | Credit + Debit |
| Cargills Online | Every Wednesday → 29 Jul 2026 | Credit |
| tudo.lk | Mondays; salary-week 23–30 | Credit + Debit |
| Atlas | Till 31 Jul 2026 | Credit + Debit |

Also notable: Q+ expressway toll cashback; UnionPay expressway cashback; dining/hotel/travel blocks for premium cards.

---

## Offers APIs / JSON (documented via public JS)

### 1. `GET /api/s-offers` (seasonal)

- **Discovered in:** `/assets/offers/js/main.js` (`loadOffers()`, modal T&Cs).
- **Content-Type:** `application/json`
- **Observed 2026-07-20:** `[]` (empty array) — seasonal board inactive or cleared.
- **Expected item shape** (from JS consumers):  
  `id`, `name`, `from`, `to` (`YYYY-MM-DD`), `category`, `t_c`, `location`, `website`, `social_media`, plus fields used to render cards (image/discount — confirm when non-empty).
- **Lankawa use:** Canary fetch; if `length > 0`, merge with HTML catalog and label `seasonal_api`. If empty, **do not** invent offers.

### 2. `GET /assets/offers/js/offers.json` (static, stale)

- **Size:** ~135 KB, **337** merchant rows.
- **Schema:**  
  `name`, `category`, `from`, `to`, `credit`, `debit`, `credit_offer`, `debit_offer`, `link`, `thumb`, `phone`, `t_c`, `location`, `id`
- **Dates:** Parsed `to` spans **2019–2020 only** (max ~2020-06-30). Not a live feed.
- **Lankawa use:** Historical reference / schema hint only. Never label `live`.

### 3. Probed and absent

`/api/offers`, `/api/rewards`, `/api/r-offers`, `/api/card-offers`, `/api/v1/offers`, `/rewards-promotions?format=json` → HTML or 404, not a JSON catalog.

---

## Mobile apps (public packaging only)

| App | Package / entry | Offers API |
|-----|-----------------|------------|
| **ComBank Digital** | Android `combank.com.combankdigital`; web `combankdigital.com`; powered by **Fiserv** | **Not public.** Banking APIs require customer auth. Do not scrape/login. |
| **Q+ Payment App** | Android `com.euronetindia.combankqpluscustomer`; product page `/services/combank-q-app` | No public offer API; Q+ promos appear under website category `q-payment-app-offers`. |
| **Max Rewards** | `maxrewards.combank.net` (points earn/redeem) | Login portal; not an open offers API. |

Play Store / marketing copy mentions cards, bills, ATMs — **no developer endpoint documentation** for promotions.

---

## Recommended scrape targets (priority)

```
P0  GET /rewards-promotions
      → parse a.reward links → {url, category, title, % badge, valid-date, thumb}
P0  GET each /rewards-promotion/{cat}/{slug}
      → parse Offer terms <ol> for discount, min/max, cadence, card types
P1  GET /api/s-offers
      → if non-empty, ingest seasonal merchants
P2  GET /sitemap.xml (lists /rewards-promotions + card product pages; not each offer slug)
P2  Occasional /info/file/* PDFs (UnionPay etc.) — low priority
Skip maxrewards login, combankdigital auth, apk traffic capture
```

### Suggested normalized record

```ts
{
  sourceId: "combank_card_offers",
  bank: "Commercial Bank of Ceylon",
  offerId: string;        // slug or hash(url)
  url: string;
  category: string;       // supermarket | online-shopping | …
  title: string;
  discountPercent: number | null;
  discountLabel: string | null; // "Best Offer" | "Up to 25%"
  validityText: string;
  validUntil: string | null;    // ISO if parseable
  cadence: string | null;       // "every Saturday" | …
  cardTypes: ("credit"|"debit"|"premium"|"visa"|"mastercard"|"unionpay"|"qplus")[];
  merchants: string[];          // Keells, Cargills, …
  minBillLkr: number | null;
  maxDiscountLkr: number | null;
  termsExcerpt: string;
  fetchedAt: string;
  provenance: "combank_html" | "combank_seasonal_api";
}
```

### Ops / compliance

- Cadence: **daily or twice-weekly** is enough (offers change monthly / by campaign).
- UA: `LankawaBot/1.0 (+https://…; research)` — match FoodLK style.
- Rate limit: listing + ≤1 detail/sec; backoff on 429/5xx.
- Honesty: seed fallback if scrape fails; never show expired validity as live.
- Legal: marketing pages are public; still respect ToS / bank takedown.

---

## Lankawa product mapping

| Surface idea | Data | Notes |
|--------------|------|-------|
| “This week’s card supermarket days” | Supermarket category + cadence parse | Complements FoodLK retail prices with **payment discount** context |
| Morning check chip | Top N offers expiring soon / today-of-week match | Needs local weekday logic (SL) |
| Compare banks later | Same pattern for HNB / Sampath / People’s offer pages | Out of scope for this doc |
| Remittance TT | **Not here** — use existing People’s / NDB / Sampath path; ComBank FX is on `/rates-tariff#exchange-rates` (separate research) | |

Sister-style catalog entry (when wired):

| Source | URL / endpoint | API? | Lankawa path |
|--------|----------------|------|--------------|
| ComBank rewards HTML | `/rewards-promotions` + detail slugs | HTML SSR | Planned `combank-offers.ts` scrape → seed fallback |
| ComBank seasonal JSON | `/api/s-offers` | JSON (often `[]`) | Optional merge |
| ComBank offers.json static | `/assets/offers/js/offers.json` | Stale JSON | Do not use |

---

## Open risks

1. **SSR-only catalog** — layout/class renames break scrapers; pin tests on selectors above.  
2. **Validity copy is free text** — “every Saturday till 25th July 2026” needs a small NL date/cadence parser.  
3. **Seasonal API empty** — do not depend on `/api/s-offers` alone.  
4. **Legacy JSON trap** — large file looks authoritative but is years out of date.  
5. **No mobile shortcuts** — app reverse-engineering is out of policy and unnecessary given public HTML.

---

## Agent note

Researched Jul 2026 against live `combank.lk` (listing HTML, detail sample, `/api/s-offers`, static `offers.json`, seasonal `main.js`, Max Rewards, Digital/Q+ public packaging). Medium thoroughness: no APK MITM, no authenticated sessions.
