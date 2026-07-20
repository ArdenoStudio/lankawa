# Bank & API universe — master synthesis (Lankawa)

**Status:** Synthesis of live deep-dives, 2026-07-20  
**Branch context:** `cursor/bank-api-deep-dive-3c69`  
**Product rule:** Civic morning check — indicative public quotes only; not advice; not affiliated with banks/CBSL.

This doc is the **single index** for bank rates, remittance, card days, CBSL series, unused sibling endpoints on hosts we already call, and explicit parks. Detail lives in sibling deep-dives (§8).

---

## 0. One-screen status

| Surface | Status |
|---------|--------|
| Remittance USD TT (9 banks) | **Shipped** — `remittance-banks.ts` → `/economy` |
| Supermarket card days | **Shipped** — `card-offers.ts` → `/food` + COL + economy |
| CBSL FX + gold scrapes | **Shipped** — `cbsl.ts` |
| CBSL payments bulletin | **Shipped** — quarterly seed strip |
| Singer EMI chip | **Shipped** — Softlogic per-SKU **parked** |
| Bank FD / deposit board | **Shipped** — ComBank/Sampath/Seylan/HNB JSON → `BankDepositRatesBoard` |
| CBSL OPR (+ corridor seed) | **Shipped** — `cbsl-policy-rates.ts` / `PolicyRatesStrip` |
| CSE dedicated movers | **Shipped** — `topGainers` / `topLooses` → `CseMoversStrip` |
| Open-Meteo Colombo AQI | **Shipped** — fallback in `aqi.ts` + home strip |
| CBSL AWPR / T-bill eResearch live | **Next** (HTML/Excel; no public JSON) |
| FoodLK cleaned data plane | **Parked live** — OpenAPI up, hub/basket **500** → WFP fallback |

---

## 1. Bank interest / FD — what we can get

### 1.1 Ship matrix (deposit rates)

| Bank | Best feed | Format | Live vs tariff? | Lankawa decision |
|------|-----------|--------|-----------------|------------------|
| **Commercial** | `GET /api/interest-rates-fd` | **JSON** 19 rows (`paidIn`, `period`, `rate`) | Matches standard FD HTML | **Ship first** |
| **Seylan** | `GET /get-fd-data` | **JSON** (Content-Type lies `text/html`) | Matches FD calculator / interest page | **Ship** |
| **Sampath** | `GET /api/rates-and-charges/external` | **JSON** slabs (`FDNOR`, `FDSAN`, …) | Live core dump (prefer over stale CMS `/api/rates-and-charges`) | **Ship** (`FDNOR` primary) |
| **HNB** | `GET venus…/get_interest_rates_contents` | **JSON** nested tables (`table_data_approved[].data` stringified) | Reviewed dates on divisions | **Ship** (primary “Fixed Deposits Interest Rates”) |
| **NSB** | `/rates-tarriffs/rupee-deposit-rates/` | **HTML** | w.e.f. stamps on page | **Ship** scrape (P1 after JSON four) |
| **People's** | `/interest-rates/` | **HTML** | Rich AER boards | **Ship** scrape |
| **NDB** | `/rates/interest-rates-on-deposits` (+ advances) | **HTML** | “Last Updated” stamps | **Ship** scrape |
| **BOC** | `/rates-tariff` HTML | **HTML** | Live | **Ship** HTML; **park** `GET /api/interest-rates-fd` (**stale** vs HTML) |
| **DFCC** | `/rates-and-tariff` Next.js RSC | Embedded CMS JSON / tab HTML | Live | **Ship** RSC/HTML parse |
| **NTB** | `/deposit-interest-rates` (+ savings/flexi) | **HTML** | Live | **Ship** scrape |
| **Amana** | Profit-paid / PSR HTML | **HTML** (Islamic profit, not interest) | Monthly refresh | **Ship** with Islamic disclaimer |
| **Cargills Bank** | Deposit board HTML | **HTML**; `pyxle-api` rates JSON enum unknown | Live HTML | **Ship** HTML; finish JSON later |
| **Union** | `/interest-rates/*` | **HTML** behind Incapsula | Live via WAF-solvable fetch | **Ship if** WAF path reusable; else seed |
| **PABC** | Senior FD HTML + PDFs | HTML/PDF; Sucuri | Partial | **Ship** senior FD only; **park** main ladder / empty FX page |
| **SC LK** | `lk-interest-rate.pdf` | **PDF** only | Effective ~Feb 2026 | **Park** (low ROI vs JSON banks) |
| **Visa LK** | — | N/A (not a deposit bank) | — | **Skip** for FD |
| **FD Rates LK** | `/compare` SSR HTML | Aggregator, no API | Optional gap-finder + attribution | **Optional P2** — never sole source |

**Unified type / field maps:** [`BANK_FD_API_SCHEMAS.md`](./BANK_FD_API_SCHEMAS.md) → proposed `BankDepositRatesSnapshot`.

**Adapter ship order (FD board):** ComBank JSON → Seylan `/get-fd-data` → Sampath `FDNOR` → HNB primary FD table → then HTML peers (NSB, People's, NDB, BOC, DFCC, NTB…).

### 1.2 JSON vs HTML (mental model)

```
JSON-first (wire adapters now)
  ComBank  /api/interest-rates-fd
  Seylan   /get-fd-data
  Sampath  /api/rates-and-charges/external
  HNB      venus…/get_interest_rates_contents

HTML-first (scrape after JSON four)
  NSB · People's · NDB · BOC tariff · NTB · Amana · Cargills · DFCC RSC · Union (WAF)

Do not trust as live FD source
  BOC /api/interest-rates-fd          ← calculator debt (API ≫ HTML rates)
  Sampath /api/rates-and-charges      ← stale CMS copy
  SC TGL offers.json                  ← cards, not deposits; dates expired
  PABC Interest-Rates.pdf             ← internal housing sheet, not public FD board
```

---

## 2. Remittance / FX — already shipped

**Adapter:** `src/lib/integrations/remittance-banks.ts` → `/economy` remittance board  
**Coverage:** **9 banks** — per-bank `isSeed`, board live/mixed/seed, best buy/sell prefer live.

| Bank | Feed | Format |
|------|------|--------|
| Commercial | `GET /api/exchange-rates` | JSON TT columns |
| HNB | `venus…/get_exchange_rates_contents_web` | JSON `buyingRate`/`sellingRate` |
| Seylan | `GET /api/exchange-rates-get-value/USD` | JSON TT |
| Sampath | `GET /api/exchange-rates` | JSON `TTBUY`/`TTSEL` |
| People's | `/exchange-rates/` | HTML TT |
| NDB | `/rates/exchange-rates` | HTML TT |
| NSB | `/rates-tarriffs/nsb-exchange-rates/` | HTML TT |
| BOC | `/rates-tariff` | HTML TT (POST `/api/exchange-rates` still **500**) |
| DFCC | `/rates-and-tariff/exchange-rates` | HTML TT |

**Also shipped (CBSL):** daily USD TT buy/sell + gold troy-oz scrapes in `cbsl.ts` (official middle/indicative context beside bank boards).

**Not on board:** PABC (no public FX table); optional upgrades = HNB `get_rates_contents_web` as-of stamp, ComBank unused cheque/currency columns.

---

## 3. Card offers — already shipped

**Adapter:** `src/lib/integrations/card-offers.ts`  
**Product:** “Today’s supermarket card days” — compact strip on `/food` + COL; broader list on economy; seed fallback when WAF/empty.

| Tier | Banks / sources | Surface |
|------|-----------------|---------|
| JSON live | Sampath `card-promotions?category=super_markets`, HNB Venus `get_all_web_card_promos`, Visa LK perks (supermarket merchants; empty → seed) | Machine |
| HTML live | ComBank rewards, DFCC RSC, Pan Asia `arr_offers`, People's, NTB MC + Amex, NDB, BOC, Amana | Scrape |
| Soft polish | `mergeTodaysLiveWithSeed`, `rankTopCardOffers`, MorningDelta chip, `card_day` pins | UX |

**Still unused on same hosts (backlog, not blockers):** HNB debit + `get_web_card_promo?id=` detail; Sampath non-supermarket categories. See §5.

---

## 4. CBSL series — ship / park

**Deep dive:** [`CBSL_RATES_API_DEEP_DIVE.md`](./CBSL_RATES_API_DEEP_DIVE.md)  
**Fact:** CBSL has **no** public JSON rates REST API — scrape / Excel / eResearch HTML only.

| Series | Surface | Cadence | Decision |
|--------|---------|---------|----------|
| USD/LKR TT buy–sell | HTML POST (+ session CSV) | Daily | **Already-have** |
| Gold XAU/LKR | HTML POST | Daily | **Already-have** |
| Payments bulletin (CEFTS / JustPay / LANKAQR) | Quarterly PDF → seed | Quarterly | **Already-have** |
| Macro seed (CCPI / GDP / reserves) | Curated JSON | Irregular | **Already-have** |
| OPR + SRR (current) | `plrates.php` HTML | Policy dates | **Ship** |
| SDFR / SLFR corridor + history | `historical_policy_interest_rates.xlsx` | Policy | **Ship** (with OPR; note post-2024 OPR regime) |
| Secondary T-bill 91/182/364 (+ bonds) | eResearch `ReportId=6169` | Weekly | **Ship** (replace stale treasury seed) |
| AWPR weekly | eResearch `6277` (+ WEI canary) | Weekly | **Ship** |
| AWDR / AWFDR / AWLR | `table4.04_*.xlsx` or 6277 | Monthly | **Ship** |
| T-bill/bond primary auctions | Dated fiscal Excel | Weekly/irregular | **Ship** as archive (tip files lag) |
| Commercial bank advertised **ranges** | Same Excel | Monthly | **Park** — use bank FD JSON instead |
| AWCMR / call / repo / OMO detail | eResearch 5206, 1059, 1062, 1064 | Daily | **Park** |
| SLIBOR | eResearch 8231 | — | **Park** (empty/legacy) |
| Multi-ccy FX / REER Excel | `exrates.php` + IF_*.xlsx | Daily/monthly | **Park** unless remittance expands |
| PDMO daily secondary (treasury.gov.lk) | UUID file API | Daily | **Park** (off-CBSL) |

---

## 5. Existing hosts — unused endpoints (prioritized backlog)

**Inventory:** [`EXISTING_APIS_UNUSED_ENDPOINTS.md`](./EXISTING_APIS_UNUSED_ENDPOINTS.md)  
**Focused probes:** [`CSE_UNUSED_ENDPOINTS_PROBE.md`](./CSE_UNUSED_ENDPOINTS_PROBE.md) · [`OCTANE_OPENMETEO_UNUSED_PROBE.md`](./OCTANE_OPENMETEO_UNUSED_PROBE.md) · [`FOODLK_OPENAPI_EXHAUST.md`](./FOODLK_OPENAPI_EXHAUST.md)

| Pri | Host | Unused endpoint | Product surface |
|-----|------|-----------------|-----------------|
| **P0** | ComBank | `/api/interest-rates-fd` | Economy FD strip |
| **P0** | Sampath | `/api/rates-and-charges/external` | Deposit rates |
| **P0** | HNB | `get_web_card_promo?id=` + `cardType=debit` | Card-day accuracy |
| **P0** | Irrigation | `24hr_rainfall` FeatureServer | `/disaster` rainfall beside gauges |
| **P0** | Octane | `/v1/comparison/world` | Fuel vs neighbours chip |
| **P0** | FoodLK | Recover hub/basket; use `hub/manifest` canary | Resume food live path |
| **P1** | HNB | `get_interest_rates_contents`, `get_rates_contents_web` | FD/pawning + FX as-of |
| **P1** | CBSL | `plrates.php` + policy xlsx + eResearch 6169/6277 | Economy rates strip |
| **P1** | CSE | `52WeekSectors`, `getAnnouncementByCompany` (+ movers P2) | Index context / watchlist |
| **P1** | Open-Meteo | Extra forecast vars + `air-quality-api` | Weather / AQI backup |
| **P1** | MetDept | CAP `si` / `ta` RSS | Localized warnings |
| **P1** | Irrigation | `Flood_Map`, `hydrostations` | Map context |
| **P2** | Sampath | Other `card-promotions` categories | Optional dining/electronics chips |
| **P2** | CEB | Cluster `Points` centroids | Power risk map |
| **P2** | NWSDB | `getTariffAdjustment` only | Water bill polish |
| **Park** | Branch locators, CMS sliders, awards, SelfCare account APIs | Not morning check |

---

## 6. Explicit parks

Do **not** build these as primary Lankawa ingest this wave:

| Park | Why |
|------|-----|
| **MyPromo.lk** | ToS bans scrape; thin/stale vs bank first-party |
| **Softlogic per-SKU EMI** (`variation-detail/{id}` crawl) | Strong research; too heavy vs Singer single `json-get-emi` chip — revisit in appliances loop |
| **FoodLK data routes** while **500** | Keep fail-soft → WFP; OpenAPI/`hub/manifest`/`/health` as canaries only |
| **BOC `/api/interest-rates-fd`** | JSON live but **wrong** vs `/rates-tariff` |
| **BOC POST `/api/exchange-rates`** | HTTP 500 — HTML already shipped |
| **PABC FX page** | No rate table |
| **SC TGL `offers.json`** | All `ed` expired on probe; weak grocery |
| **SC FD PDF scrape** | Low ROI vs ComBank/Sampath/HNB JSON |
| **Visa as deposit source** | Card network only |
| **HSBC LK retail offers** | Sold to NTB; URLs dead |
| **Hotels / EMI hospitals / “best card” rankings** | Not morning civic |
| **Telco packs / PickMe / GTFS / wallets-as-offers** | Parked in consumer survey |
| **Octane sentiment + AI forecast** (Fly) | Stale `generated_at` on probe — park until freshness ≤ ~48h |
| **NWSDB SelfCare account/balance/complaint** | PII / authenticated — out of scope |
| **Bank branch locators, awards, remittance-house lists** | Locator/marketing chrome |
| **CBSL money-market minutiae / SLIBOR / advertised bank ranges** | Specialist or superseded by bank FD JSON |
| **Raw supermarket guest APIs from Lankawa** | Stay FoodLK-only ([`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md)) |
| **Authenticated Softlogic ONE / loyalty / internet banking** | Never |

---

## 7. Recommended next 5 ship items (after FD board)

Assume the FD board lands first (ComBank → Seylan → Sampath `FDNOR` → HNB primary), per [`BANK_FD_API_SCHEMAS.md`](./BANK_FD_API_SCHEMAS.md). Then ship, in order:

| # | Item | Upstream | Surface |
|---|------|----------|---------|
| **1** | **CBSL OPR (+ SRR)** card; SDFR/SLFR as corridor from policy Excel tip | `plrates.php` + `historical_policy_interest_rates.xlsx` | `/economy` policy strip |
| **2** | **Secondary T-bill 91/182/364** — replace stale treasury seed | eResearch `ReportId=6169` | `/economy` treasury strip |
| **3** | **Weekly AWPR** (+ optional monthly AWDR/AWFDR/AWLR) | eResearch `6277` / `table4.04_*.xlsx` | `/economy` weighted rates |
| **4** | **Octane world fuel comparison** | `GET /v1/comparison/world` (show `recorded_at`) | Economy / COL “vs neighbours” |
| **5** | **Irrigation 24h rainfall** beside gauges | ArcGIS `24hr_rainfall` | `/disaster` |

**Immediate runners-up (same wave if capacity):** HNB debit + promo detail; CSE `52WeekSectors` + per-company announcements; Open-Meteo air-quality backup; FoodLK recovery canary on `hub/manifest`.

---

## 8. Sibling deep-dive index

### Bank API deep dives
- [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md)
- [`BANK_API_DEEP_DIVE_HNB.md`](./BANK_API_DEEP_DIVE_HNB.md)
- [`BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`](./BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md)
- [`BANK_API_DEEP_DIVE_BOC_PEOPLES_NDB_DFCC_PABC.md`](./BANK_API_DEEP_DIVE_BOC_PEOPLES_NDB_DFCC_PABC.md)
- [`BANK_API_DEEP_DIVE_NTB_AMANA_UNION_CARGILLS.md`](./BANK_API_DEEP_DIVE_NTB_AMANA_UNION_CARGILLS.md)
- [`BANK_API_DEEP_DIVE_VISA_SC_FDRATES.md`](./BANK_API_DEEP_DIVE_VISA_SC_FDRATES.md)
- [`BANK_FD_API_SCHEMAS.md`](./BANK_FD_API_SCHEMAS.md) — exact JSON shapes → unified snapshot

### CBSL & payments
- [`CBSL_RATES_API_DEEP_DIVE.md`](./CBSL_RATES_API_DEEP_DIVE.md)
- [`CBSL_PAYMENTS_BULLETIN.md`](./CBSL_PAYMENTS_BULLETIN.md)
- [`GOLD_RETAIL_RATES_RESEARCH.md`](./GOLD_RETAIL_RATES_RESEARCH.md)
- [`HARTI_CBSL_FOOD_PDF.md`](./HARTI_CBSL_FOOD_PDF.md)
- [`LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md`](./LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md)

### Card / consumer / EMI
- [`CONSUMER_OFFERS_AND_DATA_SURVEY.md`](./CONSUMER_OFFERS_AND_DATA_SURVEY.md)
- [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md)
- [`NTB_SC_HSBC_OFFERS_RESEARCH.md`](./NTB_SC_HSBC_OFFERS_RESEARCH.md)
- [`AMANA_PABC_SDB_OFFERS_RESEARCH.md`](./AMANA_PABC_SDB_OFFERS_RESEARCH.md)
- [`CARD_OFFER_AGGREGATORS_RESEARCH.md`](./CARD_OFFER_AGGREGATORS_RESEARCH.md)
- [`CARD_CIVIC_POLISH_PLAN.md`](./CARD_CIVIC_POLISH_PLAN.md)
- [`HOUSEHOLD_RETAIL_EMI_RESEARCH.md`](./HOUSEHOLD_RETAIL_EMI_RESEARCH.md)
- [`FUEL_LOYALTY_OFFERS_RESEARCH.md`](./FUEL_LOYALTY_OFFERS_RESEARCH.md)
- [`WALLET_MOBILE_MONEY_OFFERS_RESEARCH.md`](./WALLET_MOBILE_MONEY_OFFERS_RESEARCH.md)
- [`PHARMACY_HOSPITAL_OFFERS_RESEARCH.md`](./PHARMACY_HOSPITAL_OFFERS_RESEARCH.md)
- [`RETAIL_LOYALTY_APIS_RESEARCH.md`](./RETAIL_LOYALTY_APIS_RESEARCH.md)
- [`TELCO_PACKS_RESEARCH.md`](./TELCO_PACKS_RESEARCH.md)

### Existing hosts / unused endpoints
- [`EXISTING_APIS_UNUSED_ENDPOINTS.md`](./EXISTING_APIS_UNUSED_ENDPOINTS.md)
- [`CSE_API_DOCS.md`](./CSE_API_DOCS.md)
- [`CSE_UNUSED_ENDPOINTS_PROBE.md`](./CSE_UNUSED_ENDPOINTS_PROBE.md)
- [`OCTANE_OPENMETEO_UNUSED_PROBE.md`](./OCTANE_OPENMETEO_UNUSED_PROBE.md)
- [`FOODLK_OPENAPI_EXHAUST.md`](./FOODLK_OPENAPI_EXHAUST.md)
- [`FOOD_API_SOURCES.md`](./FOOD_API_SOURCES.md)
- [`CEB_DEMAND_MGMT_CLUSTERS.md`](./CEB_DEMAND_MGMT_CLUSTERS.md)
- [`WEATHER_DISASTER_APIS_RESEARCH.md`](./WEATHER_DISASTER_APIS_RESEARCH.md)
- [`STOCK_BROKER_APIS_RESEARCH.md`](./STOCK_BROKER_APIS_RESEARCH.md)

### Adjacent civic research
- [`DATA_EXPANSION_RESEARCH.md`](./DATA_EXPANSION_RESEARCH.md)
- [`INTEGRATIONS.md`](./INTEGRATIONS.md)
- [`LIVE_DATA_PLAN.md`](./LIVE_DATA_PLAN.md)
- [`ASSESSMENT_TAX_RATES_RESEARCH.md`](./ASSESSMENT_TAX_RATES_RESEARCH.md)
- [`IMMIGRATION_PASSPORT_QUEUE_RESEARCH.md`](./IMMIGRATION_PASSPORT_QUEUE_RESEARCH.md)

### Code entry points
- `src/lib/integrations/remittance-banks.ts`
- `src/lib/integrations/card-offers.ts`
- `src/lib/integrations/cbsl.ts`
- `src/lib/integrations/cse.ts` · `octane.ts` · `food.ts` · `irrigation-gauges.ts` · `singer-emi.ts`
- `src/lib/treasury.ts` · `src/lib/payments-bulletin.ts` · `src/lib/economy.ts`

---

## 9. Compliance (applies to all ships)

- Public marketing / civic surfaces only — no authenticated banking, SelfCare, or loyalty OTP.
- Descriptive UA (`LankawaBot/1.0`), low cadence; honor owner takedown.
- Never label **live** when WAF/empty/stale/500 (BOC FD JSON, FoodLK hub, SC TGL dates, Visa empty perks).
- Quotes are indicative — not CBSL official (except CBSL scrapes), not advice; fees and corridors differ by product.
- Aggregators (FD Rates factual rows): attribution + re-verify on bank; no editorial republish; MyPromo out.
