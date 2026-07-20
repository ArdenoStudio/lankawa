# LankaClear / LankaPay — JustPay & LANKAQR research (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Prefer official CBSL / LankaPay aggregates for economy context. Do **not** treat payment-rail SDKs or bank MID docs as public data APIs. Merchant *deals* stay on bank marketing surfaces (see `CARD_OFFER_AGGREGATORS_RESEARCH.md`, `COMBANK_OFFERS_RESEARCH.md`).

---

## Verdict

| Question | Answer |
|----------|--------|
| Public **stats API** (JSON/CSV)? | **No.** Marketing counters on [lankapay.net](https://www.lankapay.net); authoritative series in **CBSL Payments Bulletin** PDFs (quarterly). |
| Public **merchant directory** API? | **No.** Merchants are onboarded per FI; no national open merchant catalog. |
| Public **merchant promo** feed from LankaPay? | **No.** Occasional joint promo *mentions* in LankaPay newsletters; not a scrapeable offer catalog. |
| JustPay / LANKAQR **developer API** for third parties? | **Integration-only, gated.** Bank → MID → LankaPay SDK / certification / CBSL security baseline. Not a public REST catalog. |
| Best Lankawa fit? | **Quarterly payments pulse** (seed from CBSL bulletin): CEFTS / JustPay / LANKAQR volume·value·merchant counts. **Not** a deals or merchant-map product. |
| Must-not | Treat JustPay Flutter/SDK packages as data sources; scrape private MID; invent MDR/promo claims from blogs without CBSL/LankaPay primary. |

---

## Who is who

| Entity | Role |
|--------|------|
| **LankaClear → LankaPay (Pvt) Ltd** | National payment network / switch operator (CEFTS, JustPay, LANKAQR settlement path, etc.) under CBSL oversight. Site: [lankapay.net](https://www.lankapay.net). |
| **JustPay** (2017; JustPay Web 2023) | Account-to-merchant retail rail via CEFTS. Apps/wallets link CASA; alternative to card IPG for many use cases. |
| **LANKAQR** | National EMV QR standard (CBSL Circular No. 06/2018). Static/dynamic QR; on-us settle in FI, off-us via CEFTS. Cross-border accept: UPI (India), UnionPay, Alipay+; Weixin Pay acceptance announced Mar 2026. |

---

## Public statistics (authoritative)

### Primary source

[CBSL Payments Bulletin](https://www.cbsl.gov.lk/en/publications/other-publications/statistical-publications/payments-bulletin) — English PDF only, quarterly. Latest checked: **4Q 2025** (`Payments_Bulletin_4Q2025_e.pdf`). Source tables credit **LankaPay (Pvt) Ltd**.

### Headline numbers

**JustPay (CBSL Table 21)**

| Metric | Note (end-4Q 2025 / during 4Q) |
|--------|--------------------------------|
| Volume | ~**7.3 million** transactions in Q4 2025 (~28.5M for full-year series as published) |
| Value | ~**Rs. 38 billion** in Q4 2025 |
| Participants | 12 LCBs + 4 LSBs + 8 LFCs; **25** JustPay-enabled mobile apps (end-4Q 2025; was 30 at end-3Q — series can revise) |
| Limits (rules text) | Max **Rs. 50,000** per JustPay txn; OTP for amounts **> Rs. 10,000** (from 1 Apr 2024) |

LankaPay marketing page (as of mid-2026, labeled “as of 30 Sep 2025”): **220,904** “New Accounts”, **7.0M** volume, **Rs. 35.7bn** value — align with **3Q** bulletin, not a live API.

**LANKAQR (CBSL Tables 22–24)**

| Metric | 3Q 2025 | 4Q 2025 |
|--------|---------|---------|
| Domestic volume | ~274k txns | ~266k txns |
| Domestic value | ~Rs. 1.18bn | ~Rs. 1.33bn |
| Merchants registered (end period) | **452,090** | **460,990** |
| Global (intl PSP apps) volume | ~12.6k (Q3) | ~17.4k (Q4) |
| Global value | ~Rs. 215m (Q3) | ~Rs. 296m (Q4) |

LankaPay LANKAQR marketing counters (30 Sep 2025): **28** enabled apps, **22** FIs, **367,364** / **24,113** domestic / international “transaction volume” labels — treat as marketing; **prefer CBSL tables** for time series.

**Context:** CEFTS (~68M txns / ~Rs. 6.3T in 3Q 2025) dwarfs LANKAQR. Currency in circulation remains large; QR adoption is the policy gap the 2026 national programme targets.

### Secondary / policy promo (not a data API)

National QR Payment Promotion Programme (launch messaging around **6 Apr 2026**, covered by CBSL/gov + trade press):

- **Rs. 0 MDR** on LANKAQR for transactions **≤ Rs. 5,000** (banks/LankaPay absorb; supersedes the bulletin’s general “max 1% domestic MDR” for that band — confirm against current CBSL circular before UI copy).
- P2P QR transfers; consumer/merchant prize draws; district “Social Visibility Index” claimed in secondary write-ups.
- Cross-border: Weixin Pay → LANKAQR merchants (LankaPay, Mar 2026).

Use for **editorial footnotes / “policy watch”**, not machine-ingested offer rows.

---

## APIs & integration surfaces

### What exists

| Surface | Public? | Use for Lankawa |
|---------|---------|-----------------|
| LankaPay website product pages + quarterly newsletter PDFs (`/upload/documents/…`) | Yes (HTML/PDF) | Manual/seed extract of headline stats; promo *names* only |
| CBSL Payments Bulletin PDFs | Yes | **Preferred** quarterly seed for economy strip |
| JustPay **SDK + MID** (via acquiring bank) | No — member/fintech only | Out of scope (payment acceptance, not civic data) |
| Community Flutter wrapper [`lankapay_justpay_flutter`](https://pub.dev/packages/lankapay_justpay_flutter) | Package public; credentials/MID private | Irrelevant to Lankawa ingest |
| Bank apps (FriMi, iPay, UPay, Genie, Q+, Helakuru, Pay&GO, …) | Consumer apps | Promo catalogs = **bank sites**, not LankaPay |

### Probed (Jul 2026)

| Path on `lankapay.net` | Result |
|------------------------|--------|
| `/api`, `/api/v1`, `/public/api`, `/graphql`, `/wp-json` | **404** |
| `/sitemap.xml` | SPA shell, not a URL inventory |
| `/robots.txt` | Allows all; no Sitemap hint |
| `/en/downloads` | Document hub (PDFs), not JSON |

**No** open merchant GeoJSON, promo RSS, or stats REST endpoint found.

### Historical merchant lists

Ad-hoc campaign PDFs (e.g. Mobitel mCash LANKAQR Avurudu **2021** merchant list) are **stale one-offs**, not maintained national directories. Do not bootstrap a live merchant map from them.

---

## Merchant promo data — where it actually lives

LankaPay runs **rails + occasional joint promo schemes** (e.g. JustPay Joint Promotional Scheme naming high-volume apps in Q4 2024 newsletter: iPay, UPay, FriMi, PayMaster, Genie, Helakuru, Pay&GO). That is **app-adoption marketing**, not supermarket/dining offer rows.

For consumer-facing merchant discounts, Lankawa’s existing path remains correct:

1. Bank HTML/SSR offer hubs (`COMBANK_OFFERS_RESEARCH.md`, `NTB_SC_HSBC_OFFERS_RESEARCH.md`, `AMANA_PABC_SDB_OFFERS_RESEARCH.md`)
2. Aggregators only as optional cross-check (`CARD_OFFER_AGGREGATORS_RESEARCH.md`) — never primary

Payment-gateway / JustPay certification APIs remain **unrelated to promotional catalogs** (same conclusion as card-offer research item #8).

---

## Lankawa product fit

| Idea | Fit | Notes |
|------|-----|-------|
| **Payments pulse** card (JustPay + LANKAQR volume/value, merchant count, CEFTS context) | **Yes — P2** | Quarterly seed JSON from CBSL PDF extract; stale-OK like T-bill / remittance boards. Cite CBSL + LankaPay. |
| “Pay with LANKAQR here” merchant map | **No** | No public directory; 460k+ merchants without open geo. |
| JustPay/LANKAQR **deals of the week** from LankaPay | **No** | No feed; use bank offer adapters. |
| Embed JustPay checkout in Lankawa | **No** | Wrong product; gated SDK/compliance. |
| Policy note: zero MDR ≤ 5k / P2P QR / tourist QR | **Yes — footnote** | Beside FoodLK or economy morning brief when circulars are confirmed. |
| App list “which apps support JustPay/LANKAQR” | **Low** | Marketing page logos; count drifts vs CBSL; low daily-user value vs bank offers. |

### Suggested ship shape (if pursued)

```
seed: src/data/lankapay-payments-seed.json
  { period, justpay: {volume, value, apps}, lankaqr: {domesticVolume, domesticValue, merchants, globalVolume, globalValue}, sourceUrl }
UI: EconomyCards / MorningBrief footnote — “Digital rails (CBSL Qn)”
Cron: optional PDF scrape later; manual refresh each bulletin release is enough year-1
```

Do **not** block FoodLK, FIRMS, or bank-offer P0 work on this.

---

## Risks / honesty

- Marketing counters on lankapay.net lag or disagree with CBSL revised series — **always prefer bulletin tables**.
- MDR rules changed in 2026 for small tickets; bulletin text may lag cabinet/CBSL circulars — label policy copy with date.
- “450,000 merchants” ≈ registered QR stickers, **not** active monthly usage (usage still thin vs CEFTS).
- Secondary blogs (e.g. fintech marketing posts) are useful for programme narrative only.

---

## Sources checked

- https://www.lankapay.net/en/for-business/lanka-qr  
- https://lankapay.net/en/for-financial/fintech/justpay  
- https://www.lankapay.net/en/for-you/justpay  
- https://www.cbsl.gov.lk/sites/default/files/Payments_Bulletin_3Q2025_e.pdf  
- https://www.cbsl.gov.lk/sites/default/files/Payments_Bulletin_4Q2025_e.pdf  
- https://www.cbsl.gov.lk/en/publications/other-publications/statistical-publications/payments-bulletin  
- LankaPay Quarterly Newsletter Vol. 4 Q4 2024 (JustPay joint promo scheme)  
- LankaPay news: Q+ joins JustPay; Weixin Pay × LANKAQR (Mar 2026)  
- Endpoint probes on lankapay.net (`/api*`, sitemap, robots, downloads)  
- Adjacent: mCash 2021 campaign merchant PDF (stale); pub.dev JustPay Flutter (integration-only)
