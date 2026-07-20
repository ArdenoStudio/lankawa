# Retail loyalty & offer/price APIs — Keells, Cargills, SPAR, Glomark (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Public marketing / storefront surfaces only. No reverse-engineering of authenticated loyalty apps (APK MITM, private tokens). Server-side fetch + provenance; never claim live when empty/blocked.

Related: [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md), [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md), [`HOUSEHOLD_RETAIL_EMI_RESEARCH.md`](./HOUSEHOLD_RETAIL_EMI_RESEARCH.md) (MySoftlogic / Singer / Abans / Arpico EMI), FoodLK [`DATA_SOURCES.md`](https://github.com/SuvenSeo/Food-Platform/blob/main/docs/DATA_SOURCES.md).

---

## Verdict

| Chain | Loyalty program | Public loyalty / personalized-offers API? | Public price / catalog API (beyond Shopify `products.json`)? | Lankawa fit |
|-------|-----------------|-------------------------------------------|---------------------------------------------------------------|-------------|
| **Keells** | **Nexus** (app `com.keellsnexus.lk`, ~2M members) | **No** — app / Salesforce-backed; login required | **Yes (guest JSON)** via `zebraliveback.keellssuper.com` — Cloudflare-gated from bare bots | Via FoodLK; not a Lankawa direct bypass yet |
| **Cargills** | **Cargills Rewards** (online + outlet; historically Dialog Star Points / “Cargills Member”) | **No** — registration UI on site; no open points feed | **Yes** — `POST /Web/GetDynamicSection/` (homepage modules); full category list needs browser context | Strong candidate for a **limited** direct staple bypass; FoodLK already scrapes |
| **SPAR** | **SPAR Rewards Sri Lanka** (app; marketing `sparrewards.lk`) | **No** | **Shopify `products.json` only** (already wired; often **429**) | Keep as optional bypass; no loyalty API |
| **Glomark / Softlogic** | **Softlogic ONE** (`slone.softlogic.lk:8055`, OTP login) | **No** | **Yes** — per-SKU JSON `variation-detail/{id}` + LD+JSON on PDP; category HTML for listings | Useful for **SKU watchlist** staples; FoodLK uses HTML categories |

**Naming note:** “Keells Go” does not appear as a current distinct App Store product. Live surfaces are **Keells** shopping (`com.jkit.keellsretailapp`) and **Keells Nexus** loyalty. Treat “Keells Go” as informal shorthand for Keells online / app shopping unless a separate brand resurfaces.

**Household value for Lankawa:** Loyalty *points balances* and *personalized* app deals are closed. What is useful is (1) **shelf prices** already pursued via FoodLK/SPAR/WFP, (2) **weekday supermarket card promotions** via ComBank HTML (and peers later), and optionally (3) **Cargills homepage JSON** / **Glomark variation-detail** as thin direct fallbacks — not as a second FoodLK.

---

## 1. Keells — Nexus + online catalog

### Loyalty

| Item | Detail |
|------|--------|
| Program | Keells Nexus (since ~2000; digital app relaunch **2026-02-13**, Apadmi; Salesforce/Cyntexa backend mentioned in press) |
| Surfaces | iOS/Android **Keells Nexus**; shopping app links Nexus membership |
| Features (public marketing) | In-app QR at checkout, points, missions, vouchers, personalized + partner deals, e-bills / transaction history |
| Public offers API | **None** documented; deals are account/app scoped |
| Terms | `https://www.keellssuper.com/mobKeellsnexusTermsAndCondition` (Cloudflare-challenged from this environment) |

### Price / catalog APIs

| Endpoint | Role | Auth | Probe (2026-07-20) |
|----------|------|------|---------------------|
| `POST https://zebraliveback.keellssuper.com/1.0/Login/GuestLogin` | Guest session → `userSessionID`, `preferredOutlet` | Public guest | **403 Cloudflare** from this host |
| `GET …/WebV2/GetInitialDataCollection?locationCode={outlet}&shippingDetailsId=0` (fallback `…/Web/GetInitialDataCollection`) | Homepage modules: `dealsProductsList`, `bestSellersList`, `featuredProductsList`, `keellsOwnLabelItems`, dept/category maps | Header `usersessionid` | Via FoodLK scraper (Playwright fallback if API fails) |
| `https://www.keellssuper.com/products.json` | Shopify-style | — | **Not Shopify**; CF challenge HTML |
| Category HTML `/product-category/…` | Fallback listing | — | FoodLK Playwright HTML parse |

**FoodLK source of truth:** `backend/app/scrapers/keells.py` in [SuvenSeo/Food-Platform](https://github.com/SuvenSeo/Food-Platform).

**Lankawa:** Keep **via FoodLK / Life federation**. Direct guest login needs CF-capable fetch (browser or FoodLK sync health) — do not advertise a Lankawa “live Keells” path until that works with honest provenance.

---

## 2. Cargills Food City Rewards / Cargills Online

### Loyalty

| Item | Detail |
|------|--------|
| Program | **Cargills Rewards** on `cargillsonline.com` (`/Web/Rewards`, nav: “Cargills Rewards”) |
| History | Earlier **Cargills Member** + Dialog **Star Points** coalition (earn/burn at Food City + merchant network; 1 point ≈ Rs.1 in launch materials) |
| How to join (public copy) | Register at a Cargills outlet; earn online and in-store; redeem at outlet/online |
| Public points / offers API | **None**. Rewards page is account/registration HTML, not a JSON catalog of member promos |

### Price / catalog APIs (not `products.json`)

Stack: ASP.NET MVC 5 + Angular (`ng-app`), Cloudflare.

| Endpoint | Method | Returns | Auth / notes | Probe |
|----------|--------|---------|--------------|-------|
| `/Web/GetDynamicSection/` | POST `{}` | Homepage **sections**: Banner, Category, Slider/Grid **Product** rows with `ItemName`, `Price`, `Mrp`, `DiscountAmount`, `SKUCODE`, pack/inventory | Unauthenticated JSON | **200**, ~7 sections Jul 2026 (e.g. “Best Of Fruit & Veg” product slider) |
| `/Web/GetCategories/` · `/Web/GetCategoriesV1/` | POST | Menu categories (Vegetables, Rice, …) with `EnId` | Unauthenticated | **200** |
| `/Web/GetPopularCatgoryV1/` | POST | Popular categories | Unauthenticated | **200** |
| `/Web/GetMenuCategoryItemsPagingV3/` | POST | Paged products for a category | Needs browser session + body including `CategoryId` (`EnId`), `Filter` token (`Wwzpa2LygAJqAK1uM94i8A==` in FoodLK), paging fields; plain httpx often errors / “No Products Found” | FoodLK uses **Playwright** `page.evaluate(fetch…)` |
| `/Web/GetSearchBarProductsV1/` | POST | Search | Payload shape not confirmed; empty/error object without correct body | Unreliable without browser capture |
| `/products.json`, `/graphql` | — | — | **404** / redirect to Error | Not Magento GraphQL / Shopify |

Product URL shape (FoodLK): `https://cargillsonline.com/Product?productID={Id}`.

**Lankawa:** Best *direct* retail JSON after SPAR is **`GetDynamicSection`** (small, homepage-biased staple sample). Full catalog stays FoodLK. Do not scrape Rewards login or automate registration.

---

## 3. SPAR Sri Lanka — Rewards + SPAR2U

### Loyalty

| Item | Detail |
|------|--------|
| Program | **SPAR Rewards Sri Lanka** — Tap-Scan-Save app (marketing: [sparrewards.lk](https://sparrewards.lk/); App Store “Spar Rewards Srilanka”, seller DEALDIO LTD; Play packages include `com.sparsrilanka.apps`) |
| Features | Points, e-vouchers, daily deals, store chat, Click & Collect / delivery deep-link to SPAR2U |
| Public API | **None** on marketing site (static HTML/JS; no Spaaza public docs for SL) |
| Bank promo | HNB **SOLO** earn/burn at SPAR (bank-side; not a SPAR price API) |

### Price / catalog APIs

| Endpoint | Role | Probe |
|----------|------|-------|
| `https://spar2u.lk/products.json?limit=&page=` | Full Shopify catalog | **429** `local_rate_limited` when probed aggressively; Lankawa already handles skip |
| `collections.json` | Shopify collections | Same rate limit |

No separate public “offers” JSON discovered. Member deals live in-app.

**Lankawa:** Already implemented (`food-spar.ts`). No loyalty ingest. Prefer FoodLK for multi-page SPAR sync when healthy.

---

## 4. Softlogic Glomark — Softlogic ONE + glomark.lk

### Loyalty

| Item | Detail |
|------|--------|
| Program | **Softlogic ONE** loyalty (used for Glomark member promos, e.g. “Saturday Saver” % off bill at Essentials) |
| Portal | `https://slone.softlogic.lk:8055/` → “Softlogic ONE Loyalty Rewards Program” OTP login |
| Public API | **None** — authenticated portal only |
| CRM FAQ | `https://glomark.lk/crm` (account, e-vouchers, promo-code rules — HTML) |

### Price / catalog APIs (not `products.json`)

Stack: PHP storefront (Zenedge CDN), session cookie `SFSESSIDGLOMARK`.

| Surface | Role | Probe |
|---------|------|-------|
| Category HTML `/…/dp/{n}`, `/…/c/{n}`, `/…/sc/{n}` | Listing cards with Rs prices | FoodLK parse path |
| `/deal-page`, `/special-deals` | Promo HTML (large deal-page, many `/p/{id}` links) | **200**; good for promo scrape, not a clean API |
| Product PDP `/…/p/{id}` | `application/ld+json` Product + Offer (`price`, `LKR`) | Coconut example: price **150** LKR |
| `GET|POST /product-page/variation-detail/{id}` | JSON: `price`, `promoPrice`, `promoRate`, `stock`, `loyaltyPoints`, `erp`, … | **200** with browser-like UA + Referer; field `loyaltyPoints` is product metadata, not member balance |
| `/products.json` | — | **404** |

**Lankawa:** Prefer FoodLK HTML sync for breadth. Optional future: **staple SKU watchlist** calling `variation-detail` for known IDs (rice/dhal/coconut) with low cadence — clearer provenance than deal-page HTML.

---

## Cross-cutting: card offers vs store loyalty

Bank supermarket-day discounts (Keells Sat, Cargills Fri, Spar Tue, Glomark Wed / fixed dates, Cargills Online Wed, …) are already catalogued in [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md). That path is **more useful for a household “shop today” strip** than Nexus / Softlogic ONE / SPAR Rewards APIs (which do not exist publicly).

```
Household savings signals (recommended stack)
├── Shelf staples     → FoodLK (Keells/Cargills/Glomark/SPAR) → WFP → SPAR2U page → Life → seed
├── Supermarket days  → ComBank rewards HTML (± other banks later)
└── Store loyalty apps → out of scope (auth, personalized, ToS)
```

---

## Recommended Lankawa actions

| Priority | Action | Why |
|----------|--------|-----|
| **P0** | Rely on FoodLK for Keells/Cargills/Glomark; keep SPAR2U one-page bypass | Already designed; loyalty APIs don’t help |
| **P1** | Ship ComBank supermarket-day strip (see ComBank research) | Public, weekday-aligned, multi-chain |
| **P2** | Optional `food-cargills.ts`: `GetDynamicSection` → staple match (like SPAR) | Real JSON, no browser; homepage-limited |
| **P3** | Optional Glomark SKU watchlist via `variation-detail` | Stable price JSON once IDs curated |
| **Skip** | Nexus / Softlogic ONE / SPAR Rewards / Cargills Rewards session APIs | Auth + personalized; compliance risk |

### Compliance (same bar as FoodLK)

- Descriptive UA (`LankawaBot/1.0`), low cadence, server-side only  
- No cart/checkout/loyalty registration automation  
- Stop on owner request; honor blocks (CF 403, SPAR 429) with quiet fallback  
- Label provenance honestly (`food_platform_api` · `wfp_hdx` · `spar2u` · `cargills_online` · `glomark_sku` · `combank_card_offers` · seed)

---

## Probe log (this environment, 2026-07-20)

| Target | Result |
|--------|--------|
| SPAR2U `products.json` | HTTP **429** |
| Keells zebra / keellssuper.com | HTTP **403** Cloudflare challenge |
| Cargills `GetDynamicSection` | HTTP **200** JSON product modules |
| Cargills `GetMenuCategoryItemsPagingV3` (plain POST) | Error / null product shell |
| Glomark PDP LD+JSON | Price present |
| Glomark `variation-detail/11624` | JSON price/stock (UA+Referer) |
| Softlogic ONE portal | Login HTML (OTP) |
| SPAR Rewards site | Marketing HTML only |

Medium thoroughness: live HTTP probes + FoodLK scraper source review + public app/marketing pages. No APK traffic capture, no authenticated loyalty sessions.
