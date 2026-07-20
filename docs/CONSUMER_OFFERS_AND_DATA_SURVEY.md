# Consumer offers & adjacent data survey (Jul 2026)

**Status:** Research synthesis from 40+ parallel probes  
**Product rule:** Lankawa is civic morning check — not a deals aggregator. Prefer official/structured sources; supermarket **day-of-week card offers** are the only card slice worth shipping near FoodLK.

Detailed bank/sector notes live in sibling docs listed in §5.

---

## 0. What Lankawa has today

| Area | Status |
|------|--------|
| Bank remittance TT | People's / NDB / Sampath HTML scrape (+ seed) |
| Food / retail prices | FoodLK → WFP → SPAR → Life |
| Card / wallet / telecom / loyalty offers | **None** |

---

## 1. Bank card promotions — who has real data?

### Tier A — machine-readable (build here first)

| Bank | Surface | Shape | Supermarket signal |
|------|---------|-------|--------------------|
| **HNB** | `venus.hnb.lk/api/get_all_web_card_promos` (+ detail/search) | **JSON** ~841 promos | Filter Lifestyle/Shopping/Dining |
| **Sampath** | `sampath.lk/api/card-promotions?category=super_markets` | **JSON** ~97 offers | **P0** day-of-week Keells/Cargills/SPAR/Glomark/LAUGFS |
| **Visa LK** | `POST visa.com.lk/offers/api/portal/portal/perks/` | **JSON** ~300 VMORC offers | Some Glomark/dining; network-wide |
| **Standard Chartered** | `/lk/data/tgl/offers.json` | **JSON** ~28 | Weak grocery (hotels/IPP); dates often expired |
| **Pan Asia** | Inline `arr_offers` JS on card-offers page | JS array | Keells Wed / Glomark Thu / Cargills / LAUGFS |
| **DFCC** | Next.js RSC CMS fields on card-offers | Embedded JSON | Typed discount + ISO dates |

### Tier B — scrapeable HTML (supermarket slice only)

| Bank | Hub | Notes |
|------|-----|-------|
| **Commercial** | `/rewards-promotions` (~72) | Best HTML list; Keells Sat, Cargills Fri, Spar Tue… |
| **BOC** | `/personal-banking/card-offers` (~72) | CloudFront WAF; supermarket DOW strong |
| **People's** | WP `promotion` CPT + sitemap (~218) | `data-*` attrs; REST blocked |
| **NTB Mastercard** | `/promotions` + supermarket hub | High grocery density |
| **NTB Amex** | `americanexpress.lk/.../supermarket-offers` | Parallel Amex eligibility |
| **Amana** | Visa debit offers + `data-ics` | Debit-only; Glomark Wed |
| **Union Bank** | `/credit-cards-offers/` | Incapsula; fuel/supermarket blasts |
| **Cargills Bank** | Cards Promotions gallery | Image+PDF EDMs; sitemap watch |
| **Seylan** | `/Promotions/Cards` | Large HTML; weak structure |
| **NSB** | News RSS keyword filter | No standing catalog |
| **NDB** | `/cards/card-offers` (~105) | Clean HTML + offer IDs |

### Tier C — skip / park

| Source | Why |
|--------|-----|
| **HSBC LK retail** | Sold to NTB (Apr 2026); offer URLs dead |
| **SDB** | No merchant offers feed |
| **MyPromo.lk** | ToS bans scrape; thin/stale |
| **numbers.lk / Deals4me** | Offline / empty |
| **0% hospital/education/solar EMI catalogs** | High churn; not morning civic |
| **Hotels / airlines / OTAs** | Noise for Today |

### Aggregators

| Site | Use |
|------|-----|
| **fdrateslk.com** | Optional gap-finder (CC BY Dataset); verify on bank |
| **MyPromo / CardPromotions.org** | Not primary ingest |

---

## 2. Recommended card product for Lankawa

**Ship:** “Today’s supermarket card days” — 1–3 bullets next to `/food` or `/cost-of-living`.

```
Cron → Sampath JSON + HNB Venus JSON + ComBank HTML (P1)
     → filter category=supermarket + weekday match
     → {bank, merchant, discount, minBill, validTo, sourceUrl}
     → seed fallback
```

**Honesty:** “Indicative public bank offers — confirm at checkout / bank site. Not affiliated.”

**Do not ship:** full hotel catalogs, EMI hospitals, “best card” rankings, MyPromo mirrors.

---

## 3. Remittance / FX expansion (high ROI, not “promos”)

| Bank | Better path than current HTML |
|------|-------------------------------|
| **Commercial** | `GET combank.lk/api/exchange-rates` (TT columns) |
| **HNB** | `venus.hnb.lk/api/get_exchange_rates_contents_web` |
| **Seylan** | `…/api/exchange-rates-get-value/USD` |
| **Sampath** | Switch scrape → `sampath.lk/api/exchange-rates` (`TTBUY`/`TTSEL`) |
| **NDB** | Fix URL → `/rates/exchange-rates` |
| **BOC / DFCC** | HTML / embedded RSC |

---

## 4. More “stuff like this” — useful vs useless

### Build / expand (civic or money)

| Find | Why |
|------|-----|
| **Irrigation Dept ArcGIS gauges** | Live river levels — better than stale lk-flood-api tip |
| **CEB `GetDemandMgmtClusters`** | Geo outage clusters + customer counts |
| **NWSDB `BillCalculator` JSON** | Live water tariff slabs |
| **CSE** `GICSSectorSummery`, `companyInfoSummery`, GET notifications | Watchlist quotes + real notices ([CSE_API_DOCS.md](./CSE_API_DOCS.md)) |
| **CBSL Payments Bulletin** (quarterly PDF) | Cards/CEFTS/LANKAQR macro strip |
| **National minimum wage Act seed** | COL footnote vs legal floor |
| **Assessment tax gazette %** | LG atlas calculator (user enters AV) |
| **Singer / Softlogic EMI JSON** | Optional household appliances strip (secondary) |

### Park / skip

| Find | Why |
|------|-----|
| Telco full pack catalogs | Noise; thin “GB/month ladder” only if ever |
| PickMe / Uber promo pages | Sparse / in-app |
| FriMi / eZ Cash / mCash offer APIs | Payment rails ≠ catalogs; Genie HTML P2 only |
| Google/Apple Pay SL | No offer APIs; Apple Pay N/A |
| GTFS bus/train | Still no public national feed |
| Passport queues / court cases / UGC cutoffs | No public APIs |
| SLTDA hotel rates | PDF lag only |
| Customs ASYCUDA | No public duty API (tariff.lk third-party if ever) |
| Jewellery shop gold boards | Stale aggregators; stick to CBSL oz → pawn |
| Pharmacy loyalty apps | Use bank healthcare merchants instead |
| Retail loyalty (Nexus, SPAR Rewards) | No public APIs |

---

## 5. Detail docs (this wave)

| Doc | Topic |
|-----|-------|
| [COMBANK_OFFERS_RESEARCH.md](./COMBANK_OFFERS_RESEARCH.md) | Commercial Bank |
| [NTB_SC_HSBC_OFFERS_RESEARCH.md](./NTB_SC_HSBC_OFFERS_RESEARCH.md) | NTB / SC / HSBC |
| [AMANA_PABC_SDB_OFFERS_RESEARCH.md](./AMANA_PABC_SDB_OFFERS_RESEARCH.md) | Amana / Pan Asia / SDB |
| [CARD_OFFER_AGGREGATORS_RESEARCH.md](./CARD_OFFER_AGGREGATORS_RESEARCH.md) | MyPromo / FDRates |
| [FUEL_LOYALTY_OFFERS_RESEARCH.md](./FUEL_LOYALTY_OFFERS_RESEARCH.md) | CPC/IOC + bank fuel % |
| [RETAIL_LOYALTY_APIS_RESEARCH.md](./RETAIL_LOYALTY_APIS_RESEARCH.md) | Keells/Cargills/SPAR loyalty |
| [HOUSEHOLD_RETAIL_EMI_RESEARCH.md](./HOUSEHOLD_RETAIL_EMI_RESEARCH.md) | Softlogic/Singer EMI JSON |
| [WALLET_MOBILE_MONEY_OFFERS_RESEARCH.md](./WALLET_MOBILE_MONEY_OFFERS_RESEARCH.md) | FriMi / Genie / mCash |
| [TELCO_PACKS_RESEARCH.md](./TELCO_PACKS_RESEARCH.md) | Dialog/Mobitel/Airtel/Hutch |
| [PHARMACY_HOSPITAL_OFFERS_RESEARCH.md](./PHARMACY_HOSPITAL_OFFERS_RESEARCH.md) | Hemas / Healthguard / SPC |
| [CSE_API_DOCS.md](./CSE_API_DOCS.md) | cse.lk endpoint catalog |
| [WEATHER_DISASTER_APIS_RESEARCH.md](./WEATHER_DISASTER_APIS_RESEARCH.md) | Irrigation ArcGIS etc. |
| [GOLD_RETAIL_RATES_RESEARCH.md](./GOLD_RETAIL_RATES_RESEARCH.md) | Jewellery vs CBSL |
| [STOCK_BROKER_APIS_RESEARCH.md](./STOCK_BROKER_APIS_RESEARCH.md) | Brokers vs cse.lk |
| [LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md](./LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md) | LankaPay |
| [ASSESSMENT_TAX_RATES_RESEARCH.md](./ASSESSMENT_TAX_RATES_RESEARCH.md) | LG rates |
| [IMMIGRATION_PASSPORT_QUEUE_RESEARCH.md](./IMMIGRATION_PASSPORT_QUEUE_RESEARCH.md) | Passport |

---

## 6. Ship order (if we build)

```
1 Remittance JSON: ComBank + HNB + Seylan + Sampath switch + NDB URL fix
2 Supermarket card-days: Sampath JSON + HNB Venus + ComBank HTML
3 Disaster: Irrigation ArcGIS gauges + CEB demand clusters
4 Household: NWSDB water bill calculator
5 CSE deepen: companyInfoSummery + GET notifications + GICSSectorSummery
6 Optional: Genie promo tip · Singer/Softlogic EMI · CBSL payments quarterly seed
```

**Never:** MyPromo ingest, full EMI/hotel catalogs, wallet IPGs as “offers.”
