# Visa LK / Standard Chartered LK / FD Rates LK — rates & non-card JSON deep dive (Lankawa)

**Status:** Live probe (high thoroughness), 2026-07-20  
**Scope:** Interest-rate / deposit / non-card offer **JSON** (and adjacent public surfaces). Card-promo detail for Visa/SC also summarised where it is the only machine feed.  
**UA used:** Chrome 126 desktop + `LankawaResearch/1.0`  
**Sister docs:** [`NTB_SC_HSBC_OFFERS_RESEARCH.md`](./NTB_SC_HSBC_OFFERS_RESEARCH.md) (SC TGL cards), [`CARD_OFFER_AGGREGATORS_RESEARCH.md`](./CARD_OFFER_AGGREGATORS_RESEARCH.md) (FD Rates card module), [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md) (contrast: real FD JSON)

---

## Verdict

| Source | Deposit / interest JSON? | Other public JSON? | Best non-JSON surface | Lankawa fit |
|--------|--------------------------|--------------------|------------------------|-------------|
| **Visa.com.lk** | **No** — network is not a deposit bank | **Yes** — VMORC `POST …/portal/perks/` (merchant card perks). Live probe 2026-07-20 returned `{"perksGroups":[]}` | Offers SPA + AEM listing chrome | **Card days only** (already wired); **skip** for FD/savings |
| **Standard Chartered LK** | **No** public rates JSON | **Yes** — TGL `offers.json` + `categories.json` (card lifestyle/IPP; all `ed` ≤ 2026-06-30 → stale) | **`lk-interest-rate.pdf`** (deposit + lending board, effective 23 Feb 2026); FX as PDF | **Park FD** unless PDF scrape; TGL optional lifestyle only |
| **fdrateslk.com** | **No** public API / RSS | JSON-LD samples only (not a full dump); `/api/*` → 404 | SSR HTML tables (`/compare` ≈ 36 FD rows) | **Optional secondary** FD gap-finder with attribution; verify on bank |

**Bottom line:** Neither Visa LK nor SC exposes a ComBank-style `interest-rates-fd` JSON. SC publishes deposit rates as a **PDF**. FD Rates LK is an HTML aggregator with a clear ToS path for **factual** rates (attribution) — not a machine feed; card-offers Dataset is CC BY 4.0, FD pages are not.

---

## Discovery method

1. Sitemap / robots / known product hubs (`/save/`, offers portals).  
2. Path matrix for `/api/*`, `/lk/data/*`, `*.json`, rates/deposit slugs.  
3. SPA / Next.js bundle string scan (Visa `main.*.js`; FD Rates RSC/HTML tables).  
4. SC Important Information PDF harvest → `lk-interest-rate.pdf` text extract.  
5. FD Rates ToS + methodology + JSON-LD license check.

---

## 1. Visa Sri Lanka (`visa.com.lk`)

### Domains & surfaces

| Host / path | Role | Rates / deposits? |
|-------------|------|-------------------|
| `https://www.visa.com.lk` | Country marketing (Cloudflare) | No deposit products |
| `https://www.visa.com.lk/en_lk/visa-offers-and-perks/` | VMORC offers SPA (`portal-ui`) | **Card merchant perks only** |
| **`POST /offers/api/portal/portal/perks/`** | Public perks listing JSON | No FD/savings fields |
| `GET /bin/aem/rest?version=2&contentType=offers&level=-1&locale=en_lk` | AEM listing chrome (~25 KB JSON) | UI copy/filters — not rates |
| `GET /gateway/api/benefits-service/benefits` | Benefits service | **401** unauthenticated |
| `GET /gateway/api/site-config-service/config/site/www_visa_com_lk` | Site config | **404** `SITE_NOT_FOUND` |
| `/support/…/exchange-rate-calculator.html` | Travel FX calculator page | Consumer tool — not a deposit API |
| `/api/rates`, `/api/interest-rates`, `/api/offers` | Probed | **404** HTML |

`robots.txt`: `Disallow: /content_library/modal/`; Sitemap declared. No ban on `/offers/api/`.

### Perks JSON (only machine catalog)

**Endpoint:** `POST https://www.visa.com.lk/offers/api/portal/portal/perks/`  

| | |
|--|--|
| **Auth** | None for listing; `Origin` + `Referer` on `visa.com.lk` sufficient |
| **Empty `{}`** | **400** `Data binding and validation failure` |
| **Working body shape** (from SPA / shipped Lankawa adapter) | `siteId` + `perkTypeRequests[]` with `perkType: "OFFERS"`, `locale: "en_lk"`, `pageRequest`, `perkArguments.offerType` |

```json
{
  "siteId": "www_visa_com_lk",
  "perkTypeRequests": [
    {
      "perkType": "OFFERS",
      "locale": "en_lk",
      "pageRequest": { "index": 0, "size": 50 },
      "perkArguments": { "offerType": "U" },
      "perkFilterCriteria": {
        "andCriteria": [
          {
            "key": "merchantName",
            "op": "in",
            "val": ["Glomark", "Keells", "Cargills", "SPAR", "LAUGFS"]
          }
        ]
      }
    }
  ]
}
```

**Live result (2026-07-20):** HTTP 200, body `{"perksGroups":[]}` for `offerType` `U` / `P` / `A`, with and without merchant filter. `perkType: "BENEFITS"` also returns empty groups; other perkType strings → 400.

**Bundle-discovered siblings** (`main.8b06a21e35c6a68f.js`):

| Endpoint pattern | Notes |
|------------------|--------|
| `{origin}/{locale}/api/portal/portal/perks/` | Listing (canonical) |
| `{origin}/offers/api/offer/` | Detail — bare GET → 500 |
| `{origin}/offers/api/premium/offers/` | Premium detail |
| `{origin}/offers/api/locale` | Bare GET → 500 |
| `{origin}/bin/aem/rest?…contentType=offers…` | Listing UI config |
| `{origin}/gateway/api/benefits-service/benefits` | Auth |

Main bundle has **zero** hits for `fixed deposit`, `interest rate`, `savings account`, `time deposit`, `FD rate`.

### Interest / deposit / non-card verdict (Visa)

- Visa LK is a **card network offers portal**, not a licensed bank deposit board.  
- Sitemap (265 URLs): no deposit/savings/loan product catalogs; only FX calculator + press mentions of “rate”.  
- **No interest-rate or deposit JSON exists to ship.**  
- For Lankawa: keep supermarket merchant filter on perks when non-empty; seed fallback when `perksGroups` empty (current state).

---

## 2. Standard Chartered Sri Lanka (`sc.com/lk`)

### Domains & surfaces

| Host / path | Role | Machine? |
|-------------|------|----------|
| **`https://www.sc.com/lk/data/tgl/offers.json`** | The Good Life privileges catalog | **JSON** ~73 KB, **28** offers |
| `https://www.sc.com/lk/data/tgl/categories.json` | TGL category tree | **JSON** ~2 KB |
| `https://www.sc.com/lk/data/whitelist-parameter/allowable/all.json` | UTM/query allowlist for forms | JSON — **not rates** |
| `https://www.sc.com/lk/promotions/the-good-life-privileges/` | TGL HTML shell | Loads JSON above |
| `https://www.sc.com/lk/save/` (+ `#time-deposits`, `#savings-accounts-deposits`) | Deposits marketing hub | HTML |
| `https://www.sc.com/lk/save/fixed-deposit-accounts/` | FD product page | HTML — **no % table / no rates JSON** |
| `https://www.sc.com/lk/important-information/` | Docs index | Links to PDFs |
| **`https://av.sc.com/lk/content/docs/lk-interest-rate.pdf`** | Official interest-rate board | **PDF** (~493 KB, LM **2026-02-23**) |
| `https://av.sc.com/lk/content/docs/lk-exchange-rates.pdf` | FX sheet | PDF (LM **2026-07-20**) |
| `/lk/data/rates.json`, `deposit-rates.json`, `fd-rates.json`, `interest-rates.json`, … | Probed | → 404 shell |
| `https://retail.sc.com/lk/360rewards/` | Points portal | **403 / auth — skip** |

`/lk/robots.txt` is not a robots file (404 HTML page). Sitemap index is WordPress-generated and sparse (mostly historical `sitemap-pt-page-*` stubs).

### TGL offers JSON (card / merchant — not deposits)

**`GET https://www.sc.com/lk/data/tgl/offers.json`**

```json
{
  "offers": {
    "offer": [
      {
        "id": 98770,
        "cn": "lk",
        "otitle": "…",
        "odesc": "…",
        "sd": "26-05-2026 00:00:00",
        "ed": "30-06-2026 23:59:00",
        "cat": "restrelax|retail|online|automotive|lifestyle-category",
        "sbcat": "…",
        "visa": "True",
        "visa_card_list": [],
        "tnc": "…"
      }
    ]
  }
}
```

| Probe (2026-07-20) | Value |
|--------------------|--------|
| Count | **28** |
| Categories | `restrelax` 13, `retail` 8, `online` 5, `lifestyle-category` 1, `automotive` 1 |
| Deposit / FD / interest-rate product hits in text | **0** |
| `ed` range | **13 Jun 2026 – 30 Jun 2026** (all expired vs probe day) |
| Supermarket / Keells / Cargills | **0** |
| Retail content | Mostly **0% IPP** (Singer, Abans, Vision Care, …) + lifestyle |

`categories.json` top-level codes: `dining`, `retail`, `restrelax`, `online`, `automotive` — **no deposit/savings/loan node**.

### Deposit / interest rates — PDF only

**Canonical board:** `https://av.sc.com/lk/content/docs/lk-interest-rate.pdf`  
**Title signal in PDF:** “Display of Interest Rates - Annex I” — **Effective 23 Feb 2026**.

Extracted board samples (indicative; confirm PDF before product use):

| Product | Board / range (p.a.) |
|---------|----------------------|
| Standard Savings | 0.25% – 0.50% (max 0.50%) |
| Marathon Saver | 3.50% – 7.00% (savings max row 3.50% AER 3.56%) |
| My Dream (minor) | 3.00% – 3.50% |
| Call deposits | 0.75% – 1.75% |
| Time deposit 1y monthly | 4.25% (AER 4.33%) |
| Time deposit 1y maturity | 4.50% |
| TD ladder (1–12m) | 3.50% – 4.50% board |
| Credit cards | 26% p.a. |
| Personal loans 1y fixed | 11.25% – 11.50% |

**No JSON twin** under `www.sc.com/lk/data/` or `av.sc.com/lk/data/` (non-TGL / non-whitelist paths 403/404). FD product HTML does not embed a rate table with `% p.a.` — it points users to eligibility PDFs / tariff docs.

### Interest / deposit / non-card verdict (SC)

| Need | Available? | Path |
|------|------------|------|
| FD / savings JSON API | **No** | — |
| FD / savings official figures | **Yes (PDF)** | `lk-interest-rate.pdf` |
| Non-card *merchant* offers JSON | **Yes (TGL)** | Lifestyle/IPP only; currently stale dates |
| Deposit *product promotions* JSON | **No** | Marketing HTML under `/lk/save/` |

**Lankawa:** Do **not** invent an SC FD JSON adapter. If economy board needs SC deposits: PDF parse with as-of from PDF effective date, or skip (coverage already strong via ComBank FD JSON + other bank HTML). Keep TGL as optional P2 lifestyle — never label live while all `ed` are past.

---

## 3. FD Rates Sri Lanka (`fdrateslk.com`) — optional aggregator

### Stack

- Next.js App Router on Vercel (`fd-rates-lk.vercel.app` → canonical `www.fdrateslk.com`).  
- Primary product: **fixed deposit comparison**; secondary module: **credit card offers** (4 banks).

### API / RSS / machine feeds

| Probe | Result |
|-------|--------|
| `/api`, `/api/rates`, `/api/fd-rates`, `/api/v1/rates`, `/data/rates.json`, `/rates.json` | **404** HTML |
| `/feed.xml`, `/rss.xml` | **404** |
| `/_next/data/{build}/….json` | **404** (no exposed data route) |
| `robots.txt` | `Allow: /` · **`Disallow: /api/`**, `/_next/`, `/calculator?*` |
| Public developer docs | **None** |

Rates are **SSR HTML tables** (+ React flight payload). Not a JSON API.

### FD HTML surfaces (2026-07-20)

| Path | Role | Structured data |
|------|------|-----------------|
| `/` | Hub — “Best Fixed Deposit Rates…” | Organization, WebSite, FAQPage, ItemList (**5** sample ListItems) |
| `/compare` | Full comparison table | Organization, BreadcrumbList |
| `/best-fixed-deposit-rates` | Ranked article | Article `dateModified: 2026-07-19`, ItemList (5), HowTo |
| `/12-month-fd-rates-sri-lanka` | 1y focus | Article + ItemList + sample `FinancialProduct` |
| `/boc-fd-rates`, `/nsb-fd-rates` | Per-bank tenure tables | Breadcrumb only |
| `/methodology` | Sourcing policy | “Rates last updated: **2026-07-19**” |
| `/credit-card-offers` | Card module | ItemList `numberOfItems: 356` (10 samples) + **Dataset CC BY 4.0** |

**`/compare` table (parsed):** **36** data rows = **9 banks × 4 tenures** (3m / 6m / 1y / 2y).

Banks present: Commercial, NTB, Seylan, Pan Asia, Sampath, HNB, People’s, NSB, BOC.  
**Absent from compare table:** Standard Chartered, NDB, DFCC (as issuer), Amana, Union, Cargills Bank, HSBC.

Example top row: Seylan **2 Years 11.50% p.a.**, min LKR 10,000.  
12-month leaders in ItemList samples: Commercial / NTB **10% p.a.** (min LKR 25,000).

### License / ToS (document carefully)

**Terms of Use** — [https://www.fdrateslk.com/terms](https://www.fdrateslk.com/terms) — last updated **26 Apr 2026**.

| Clause | Meaning for Lankawa |
|--------|---------------------|
| §1 Informational only | Rates may lag; always confirm with bank |
| §2 No financial advice | Do not frame as recommendation |
| §3 Accuracy | No warranty of currency/completeness |
| **§5 Intellectual Property** | **Editorial** (guides, articles, blurbs): no republish without permission. **Factual rate data** (interest rates, bank names, tenures): “not subject to copyright protection”; free to reference **with attribution to “FD Rates Sri Lanka” + link to the page** |
| §7 Liability | Use at own risk |
| §9 Governing law | Sri Lanka |

**Creative Commons:**

- Card-offers page JSON-LD `@type: Dataset` → **`license: https://creativecommons.org/licenses/by/4.0/`** (“Sri Lanka Credit Card Offers 2026”, `dateModified: 2026-07-19`).  
- **FD rate pages do not declare a Dataset / CC BY license** — rely on ToS §5 factual-use + attribution, not CC BY.

**Methodology** ([/methodology](https://www.fdrateslk.com/methodology)): sources claimed as official bank websites / notices / branch / CS confirmation; **no third-party aggregators** for FD rates; gross p.a. before 5% WHT; lag and promotional-tier gaps acknowledged.

**Privacy:** GA4 only; no scrape-specific ban beyond robots `/api/` disallow.

### Lankawa position on FD Rates

1. **Prefer first-party bank JSON/HTML/PDF** (e.g. ComBank `/api/interest-rates-fd`, SC interest PDF, other bank rate pages).  
2. If using FD Rates as bootstrap / gap-finder:  
   - Attribute **“FD Rates Sri Lanka”** + deep-link.  
   - Copy **facts** (bank, tenure, %, min deposit) — not editorial prose.  
   - Re-verify each row against the bank before labelling live.  
3. Do **not** treat HTML scrape as a stable API; expect layout churn.  
4. Card module: see [`CARD_OFFER_AGGREGATORS_RESEARCH.md`](./CARD_OFFER_AGGREGATORS_RESEARCH.md) — secondary only; CC BY Dataset applies to that module’s facts with attribution.

---

## Cross-source comparison (deposit rates)

| Capability | Visa LK | SC LK | FD Rates LK | ComBank (contrast) |
|------------|---------|-------|-------------|--------------------|
| Public FD JSON | No | No | No | **Yes** `/api/interest-rates-fd` |
| Public savings JSON | No | No | No | HTML `#interest-rates` |
| Official deposit board | N/A | **PDF** Feb 2026 | Aggregated HTML | JSON + HTML |
| Card / merchant JSON | Perks (empty today) | TGL (stale) | No API (card HTML + CC BY Dataset samples) | Weak/empty seasonal JSON |
| Attribution / license clarity | Visa ToS (marketing) | Bank docs | ToS §5 factual OK + card Dataset CC BY | Bank first-party |

---

## Recommendations for Lankawa

| Priority | Action |
|----------|--------|
| **Ship (already)** | Visa supermarket perks when `perksGroups` non-empty; seed if empty |
| **Ship elsewhere** | ComBank FD JSON + other bank first-party boards for economy FD strip |
| **Park** | SC TGL until new `ed` dates appear; SC FD PDF scrape (low ROI vs ComBank JSON) |
| **Optional P2** | FD Rates `/compare` HTML bootstrap with attribution — never sole source |
| **Never** | Claim Visa/SC “deposit rate API”; republish FD Rates editorial; ignore ToS attribution |

### Suggested normalized FD row (if ever ingesting SC PDF or FD Rates HTML)

```ts
{
  sourceId: "sc_interest_pdf" | "fdrateslk_compare_html" | "combank_interest_rates_fd";
  bank: string;
  product: "fixed_deposit" | "savings" | "call" | "other";
  tenureLabel: string;       // "12 months"
  ratePaPercent: number;     // gross
  payout: "maturity" | "monthly" | null;
  minDepositLkr: number | null;
  asOf: string;              // ISO date from PDF effective / page dateModified
  sourceUrl: string;
  isSeed: boolean;
  verifiedAgainstBank: boolean; // false until bank confirm
}
```

---

## Probe log (this environment)

| Target | Result |
|--------|--------|
| Visa `POST …/perks/` valid body | 200 `perksGroups: []` |
| Visa `POST {}` | 400 validation |
| Visa AEM offers rest | 200 ~25 KB UI JSON |
| Visa benefits-service | 401 |
| SC `offers.json` / `categories.json` | 200; 28 offers, cats dining/retail/… |
| SC invented `/lk/data/*rates*` | 404 |
| SC `lk-interest-rate.pdf` | 200 PDF; deposit + lending tables; effective 23 Feb 2026 |
| SC FD HTML | 200; no embedded rate JSON/% table |
| FD Rates `/compare` | 200; 36 FD rows SSR |
| FD Rates `/api/*`, RSS | 404; robots Disallow `/api/` |
| FD Rates `/terms`, `/methodology` | 200; §5 factual + attribution; rates updated 2026-07-19 |
| FD Rates card Dataset license | CC BY 4.0 on `/credit-card-offers` only |

**Out of scope:** Authenticated SC mobile / 360 Rewards, Visa logged-in benefits, APK MITM.
