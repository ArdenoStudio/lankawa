# Sri Lanka fuel retail loyalty & bank fuel-card offers (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Public marketing / retailer surfaces only. No reverse-engineering of authenticated banking or NFC fleet apps. Server-side fetch + provenance; never claim live when empty/stale.

---

## Verdict

| Question | Answer |
|----------|--------|
| Do CPC / IOC / LAUGFS run **consumer** loyalty points or pump cashback? | **No public consumer loyalty program** found for any of the three retail networks. |
| What “fuel cards” exist at retailers? | **Corporate / fleet NFC or prepaid** (Dialog Touch at IOC & LAUGFS; CPC digital card for **state vehicles**; bank prepaid/corporate fuel cards). Admin convenience, not household cashback. |
| Where is real household fuel savings? | **Bank credit-card promotions** (cashback or **1% fuel-surcharge rebate**), plus the **DFCC × Lanka IOC co-branded** Mastercard. |
| Public offers API? | **No.** HTML (and occasional PDFs / WP-JSON for CPC **prices**, not promos). |
| Best Lankawa ingest path | Keep **Octane** for CPC list prices; optionally scrape CPC WP/HTML as provenance mirror; scrape **bank fuel-offer pages** on the same pattern as `COMBANK_OFFERS_RESEARCH.md`. |
| Fit for Lankawa | Medium: “effective pump cost” chip (list price − estimated card benefit − surcharge honesty). Low for retailer loyalty catalogs (empty). |

---

## Retailer landscape

### CPC (Ceylon Petroleum Corporation / Ceypetco)

| Surface | Role | Consumer loyalty? |
|---------|------|-------------------|
| `https://ceypetco.gov.lk/` | Corporate hub | No |
| `https://ceypetco.gov.lk/marketing-sales/` | **Live retail price board** (petrol 92/95, auto diesel, kerosene, fuel oil) + effective dates | Price source, not promos |
| `https://ceypetco.gov.lk/wp-json/wp/v2/pages?slug=marketing-sales` | WordPress JSON for same page (`modified` observed **2026-06-30**) | Useful mirror for scrape |
| `https://ceypetco.gov.lk/historical-prices/` + `/history/` + marketing circulars | Revision history | Complements Octane revision steps |
| `https://ceypetco.gov.lk/national-fuel-pass-2026/` | National Fuel Pass QR materials | **Quota / distribution**, not discounts |
| News (Ada Derana / Newswire, Jan 2026) | Digital fuel card for **government vehicles** | Not a public consumer product |

**Notes**

- Fuel Pass / QR is a **quota and allocation** instrument (crisis-era design; still marketed on CPC site in 2026). Do **not** model it as cashback or points.
- CPC list prices remain the national reference Lankawa already surfaces via Octane (`octane_fuel`). CPC HTML/WP-JSON is a **secondary public provenance** if Octane is down — not a loyalty feed.

### Lanka IOC (LIOC)

| Surface | Role | Consumer loyalty? |
|---------|------|-------------------|
| `https://www.lankaioc.com/` | Consumer + business site | No points catalog |
| `https://www.lankaioc.com/corporate-fuel-cards/` | Dialog partnership **corporate** fuel cards (~64 stations cited) | Fleet only |
| `https://www.lankaioc.com/businesses/strategic-partnerships/` | Mentions bank/brand “promotions and offers” | No machine-readable list |
| `https://www.lankaioc.com/fuel-for-your-vehicle/` | Product marketing | No loyalty / cashback copy found |
| DFCC co-brand (bank side) | Consumer cashback **at LIOC pumps** | Yes — via bank, not LIOC app |

**Notes**

- Closest thing to “IOC loyalty” for households is the **DFCC Lanka IOC Co-Branded Mastercard** (see banks).
- Corporate Dialog Touch card: SMS + web dashboard, limits by employee/station — **out of scope** for consumer morning-check.

### LAUGFS Petroleum

| Surface | Role | Consumer loyalty? |
|---------|------|-------------------|
| `https://laugfspetroleum.lk/services.php` | Services: **NFC Fuel Card** (Dialog + Mobitel), card/FriMi payments | Corporate fleet (~350 companies / 17k cards claimed on page) |
| Site overall | Thin static marketing | No consumer points / cashback |

**Notes**

- LAUGFS **Super** supermarket card days appear on ComBank rewards (see `COMBANK_OFFERS_RESEARCH.md`) — that is **grocery**, not pump fuel.
- Do not confuse LAUGFS LPG price lists (already used for household energy) with petroleum loyalty.

---

## Bank fuel cards & cashback (public offers)

Industry baseline: almost all Sri Lankan bank cards apply a **~1% fuel surcharge** on petrol-station MCC spend. “Savings” offers are usually (a) **cashback %**, (b) **rebate of that 1% surcharge**, or (c) **co-brand station-specific cashback**. Caps and min-spend dominate economics.

### Active / structural (as of research window Jul 2026)

| Bank / product | Public URL | Benefit (public T&Cs) | Caps / gates | Until |
|----------------|------------|------------------------|--------------|-------|
| **DFCC × Lanka IOC** co-branded Mastercard | Product marketed on `dfcc.lk` credit-card catalog; T&Cs PDF on Azure blob `…/LIOC-Additional-Product-Information-1.pdf` (Last-Modified **2025-08-18**) | **3%** cashback at LIOC stations (from **1 May 2025**); intro **5%** windows earlier; **1%** on non-LIOC spend | LIOC: max **Rs. 1,500** / statement (spend basis **Rs. 50,000** for full 3%); fuel surcharge still billed | Ongoing product (lifetime 3% claim in launch PR) |
| **Seylan Fuel Offer 2026** | `https://www.seylan.lk/index.php/fuel-offer-2026-1` | **5%** cashback on fuel, any day | Membership fee **Rs. 1,999**/yr; min monthly spend **Rs. 25,000**; max refund **Rs. 1,250**/mo; **new registrations closed 30 Apr 2026** | **31 Dec 2026** |
| **NDB Privilege** fuel surcharge rebate | `https://www.ndbbank.com/cards/card-offers/offer-details/77` | Rebate equal to **1% fuel surcharge** | Min **Rs. 15,000** non-fuel retail / statement; max rebate **Rs. 1,000**/cycle; fuel-only spend disqualifies | **31 Dec 2026** |
| **BOC Fuel Card** (prepaid) | `https://www.boc.lk/personal-banking/cards/fuel-cards/boc-fuel-cards` | Prepaid, NFC, works at **CEYPETCO / IOC / LAUGFS** POS | Annual fee **Rs. 1,000**; **1% fuel surcharge**; not a cashback promo | Product page (ongoing) |
| **ComBank Corporate Fuel Credit** + **Prepaid Fuel Card** | `combank.lk/…/corporate-fuel-credit-card`, `…/pre-paid-fuel-card` | Fleet allowance control; blocked for non-fuel MCCs | **1% fuel surcharge** borne by company; joining/annual fee waivers vary | Product pages (ongoing) |

### Episodic / observed campaigns

| Bank | Public URL | Notes |
|------|------------|-------|
| **Union Bank** | `https://www.unionb.com/offer/cashback-fuel/` | **10%** cashback, min txn **Rs. 2,500**, max **Rs. 1,000**, **one-time**, only **10–11 Apr 2026** — pattern for short weekend fuel blasts |
| HNB / Sampath / People’s / NTB offer hubs | Various | From this environment: WAF/503/404 on several offer indexes; HNB retail tariff still lists **1% fuel surcharge** and HNB corporate/fuel card annual fees. Treat as **probe when wiring**, not as empty = no offers. |

### ComBank rewards catalog vs fuel

`COMBANK_OFFERS_RESEARCH.md` (same day): `/rewards-promotions` has supermarket/dining/travel/etc.; **no dedicated fuel-cashback strip** in the Jul 2026 catalog. ComBank’s fuel products are **corporate prepaid/credit**, not Max Rewards pump cashback.

---

## Public data sources — Lankawa inventory

### P0 — prices (already / complement)

| Source ID (proposed) | URL / endpoint | Format | Use |
|----------------------|----------------|--------|-----|
| `octane_fuel` (existing) | Octane partner API | JSON | Primary CPC petrol/diesel + revision steps |
| `cpc_marketing_sales` | `ceypetco.gov.lk/marketing-sales/` + `wp-json/wp/v2/pages?slug=marketing-sales` | HTML + WP JSON | Provenance mirror / effective-date stamp |

### P1 — bank fuel offers (scrape)

| Source ID (proposed) | URL | Format | Notes |
|----------------------|-----|--------|-------|
| `seylan_fuel_offer` | `/index.php/fuel-offer-2026-1` (+ `/promotions/cards` index) | HTML | Stable membership promo page; T&Cs in list items |
| `ndb_card_offers` | `/cards/card-offers` + `/offer-details/{id}` | HTML | Fuel currently id **77**; filter titles containing Fuel / Surcharge |
| `dfcc_lioc_card` | DFCC card catalog + Azure T&Cs PDF | HTML + PDF | Product-page WAF often rejects bots; PDF blob was fetchable |
| `union_bank_offers` | `/offer/…` and offers index | HTML | Episodic; expect short validity windows |
| `combank_card_offers` | See sister doc | HTML | Watch for future fuel category; today supermarket-focused |

### P2 — retailer fleet pages (document only / rare refresh)

| Source | URL | Why low |
|--------|-----|---------|
| LIOC corporate fuel cards | `lankaioc.com/corporate-fuel-cards/` | Not household |
| LAUGFS NFC | `laugfspetroleum.lk/services.php` | Not household |
| BOC / ComBank fuel card product pages | boc.lk / combank.lk | Explain surcharge + prepaid; not % cashback calendars |
| Fuel Pass | ceypetco National Fuel Pass pages | Quota UX, not price benefit |

### Skip

- Authenticated Dialog Touch / bank apps  
- APK traffic capture  
- Treating Fuel Pass QR as a discount  
- Third-party “best cards 2026” blogs as primary truth (use only as discovery leads)

---

## Suggested normalized record (bank fuel offers)

```ts
{
  sourceId: "bank_fuel_offer";
  bank: string;
  offerId: string;
  url: string;
  kind: "cashback_pct" | "surcharge_rebate" | "co_brand_station" | "prepaid_fuel_product" | "fleet_nfc";
  retailers: ("cpc" | "ioc" | "laugfs" | "any_pos")[];
  cashbackPercent: number | null;
  surchargeRebatePercent: number | null; // usually 1
  maxBenefitLkr: number | null;
  minSpendLkr: number | null;
  membershipFeeLkr: number | null;
  fuelSurchargePercent: number | null; // honesty: usually 1 even when cashback applies
  validFrom: string | null;
  validUntil: string | null;
  registrationClosed: boolean | null;
  termsExcerpt: string;
  fetchedAt: string;
  provenance: "html" | "pdf" | "wp_json";
}
```

### Effective pump cost (display honesty)

For a given list price \(P\) (LKR/L from Octane/CPC):

- Card pay without promo ≈ \(P \times 1.01\) (surcharge).
- With cashback \(c\%\) and monthly cap, show **illustrative** net only with cap + min-spend disclosed; never imply uncapped litres.

---

## Recommended scrape targets (priority)

```
P0  Octane (existing) — list + revisions
P1  CPC marketing-sales HTML or WP-JSON — provenance / dates
P1  Seylan fuel-offer-2026 page
P1  NDB /cards/card-offers (+ detail 77 and future fuel-titled rows)
P1  DFCC LIOC T&Cs PDF (when HTML WAF blocks)
P2  Union Bank /offer/* fuel campaigns
P2  BOC + ComBank fuel product pages (surcharge + product facts)
Skip Fuel Pass as discount; skip Dialog fleet dashboards
```

### Ops / compliance

- Cadence: **weekly** for structural products (DFCC/BOC/ComBank fuel cards); **2–3× weekly** for bank promo indexes during campaign seasons.
- UA: `LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)` — same as `DATA_SOURCES.md`.
- Rate limit + backoff; some bank CDNs return **403/503/WAF** — seed last-known T&Cs and label stale.
- Legal: public marketing only; stop on owner request.

---

## Lankawa product mapping

| Surface idea | Data | Notes |
|--------------|------|-------|
| Economy “pump reference” | Octane / CPC list | Already shipped |
| “Pay with card?” honesty chip | Industry 1% surcharge + active bank fuel offers | Avoid implying all cards waive surcharge |
| Station-brand tip | DFCC→IOC 3% vs “any station” Seylan/NDB | IOC-only vs MCC-any |
| Loyalty tab | **Do not build** on retailer points — empty | Revisit if CPC/IOC/LAUGFS launch public schemes |
| Fleet NFC | Out of scope for consumer pulse | Link-out only if B2B surface appears later |

Sister docs: `COMBANK_OFFERS_RESEARCH.md` (card promo scrape pattern), `DATA_SOURCES.md` / `INTEGRATIONS.md` (Octane).

---

## Open risks

1. **No retailer loyalty feed** — product must not invent CPC/IOC/LAUGFS points.  
2. **Bank WAF** — DFCC/HNB/Sampath often reject datacenter UA; need browser-like UA + PDF fallbacks.  
3. **Seylan membership closed to new joiners** — page can remain “valid” while unusable for new users; surface `registrationClosed`.  
4. **Cashback vs surcharge stacking** — DFCC PDF states 1% fuel surcharge still applies; net math must include it.  
5. **Fuel Pass ≠ promo** — high Google rank; easy to mis-label in UI.  
6. **Episodic weekend cashback** (Union Bank style) — short TTL; daily scrape or miss entirely.

---

## Agent note

Researched Jul 2026 against public CPC, LIOC, LAUGFS, Seylan, NDB, BOC, ComBank fuel-product, DFCC catalog/PDF, and Union Bank offer pages. Medium thoroughness: no APK MITM, no authenticated sessions, incomplete coverage of every bank’s offer CMS (WAF).
