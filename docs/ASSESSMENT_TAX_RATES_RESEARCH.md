# Local government assessment tax / property rates — research

**Status:** Research (medium thoroughness, Jul 2026)  
**Product surface:** `/local-government` + `/property` atlas (holding-cost context); optional rates calculator  
**Question:** Are there public APIs or open datasets for Sri Lanka MC / UC / PS **assessment rates** (% of Annual Value) and per-property valuations that Lankawa can ingest?

---

## Verdict

| Path | What it has | Public API? | Lankawa fit |
|------|-------------|-------------|-------------|
| **Gazette Part IV (B)** (`documents.gov.lk`) | Annual **imposition of assessment tax** notices per LA — rate % by use class, discount/warrant rules | **No** — PDF HTML archive only | **P0** canonical source for council rate % |
| **Council websites** (CMC, DMMC, Galle MC, …) | Human-readable rate pages; some e-payment portals | Payment UIs only (login + account #) | **P1** secondary HTML seed / outbound links |
| **Valuation Dept / rating rolls** | Per-property **Annual Value (AV)** | **No** public AV API or open roll | Skip live lookup; user enters AV from notice |
| **data.gov.lk** | National open-data portal (DKAN/CKAN) | API exists in theory; **unreachable** from research env (TLS reset / 403) | Do not depend on for rates catalog |
| **LoGoMIS** (`logomis.lk`) | PFM / local-authority document ZIP downloads | No rates JSON API | Skip for rate % |
| **CMC / eLG / Nekfa / Emetsoft** | Internal LA tax-payment systems | Citizen payment + balance enquiry; **not** open data | Do not scrape authenticated ledgers |
| **IRD RAMIS Web API** | VAT e-invoicing (2026) | Merchant/ERP only | Wrong tax — ignore |
| **induwara.lk calculator** | Handy UX + small MC table | No API; rates can **lag gazette** | Reference UX only; **not** primary data |
| **IMF TAR 24/74 (May 2024)** | Reform context; notes AV datasets held by GVD for ~10 MCs (not public) | N/A | Background; SPRR / PBV are future |

**Bottom line:** There is **no national public API** for assessment tax rates or Annual Values. The durable path is a **year-stamped seed** of gazetted rate percentages (MC/UC/PS × use class), linked to Lankawa’s existing local-gov directory, plus an optional calculator that multiplies **user-supplied AV × council rate %**. Never claim live balance, arrears, or address→AV lookup.

---

## How the tax works (product vocabulary)

Local authorities (≈28 MC + ≈37 UC + ≈276 PS) levy **rates / assessment tax** under:

- Municipal Councils Ordinance (Ch. 252) §§230–252  
- Urban Councils Ordinance (Ch. 255) §§158–179  
- Pradeshiya Sabhas Act No. 15 of 1987 §§134–149  

Formula (built-up / assessed areas):

```
Annual rates = Annual Value (AV) × gazetted rate %
```

- **AV** = hypothetical annual rent set for rating (often stale vs market); printed on the owner’s assessment notice.  
- **Rate %** = set annually by each LA (gazetted), usually by use class (residential / commercial / bare land / etc.). Statutory ceiling commonly cited up to **35%** of AV.  
- **PS acreage tax** (undeveloped agricultural land in some PS): per-acre bye-law charge instead of % of AV.  
- Typical discounts: **10%** if full year paid by 31 Jan; **5%** if quarter paid in first month of quarter.  
- Warrant / surcharge: commonly **15%** residential/bare land, **20%** commercial (varies by LA).

Per-property AV and ledgers stay inside each council’s assessor / revenue system — not published as open data.

---

## Canonical public source: Gazette Part IV (B)

**Portal:** [documents.gov.lk](https://documents.gov.lk) → Gazettes → year index (`/view/gz/find_gazette.html` → `YYYY.html`).  
**URL pattern (English Part IV-B):**  
`https://documents.gov.lk/view/gz/{YYYY}/{M}/{YYYY-MM-DD}(IV-B)E.pdf`

Notices titled along the lines of *“Imposition of Assessment Tax / Assessment Rates for Year YYYY”* for named MCs, UCs, and PSs. Same PDFs often bundle other LA fees (trade licenses, hall hire) — parsers must isolate assessment-tax sections.

### Probe samples (Jul 2026)

| Authority | Year | Source | Observed rate bands |
|-----------|------|--------|---------------------|
| **Colombo MC** | 2026 | Gazette 30 Jan 2026 IV-B | Developed commercial **35%**; developed residential + undeveloped commercial **25%**; undeveloped residential **15%** |
| **Jaffna MC** | 2025 | Gazette 20 Sep 2024 IV-B | Residence / lands **8%**; commercial **10%** |
| **Kalmunai MC** | 2026 | Extra-gazette Dec 2025 | Factories / commercial **15%**; resident / bare land **8%** |
| **Chilaw UC** | 2025 | Gazette 20 Sep 2024 IV-B | Flat **5%** of AV |
| **Pannala PS** | 2025 | Gazette 20 Sep 2024 IV-B | **5%** on developed-area AV (adopting 2018 AV base) |

**Ingest implication:** Prefer gazette PDF text over council marketing pages and third-party calculators. Store `taxYear`, `bodyId`, `useClass`, `ratePercent`, `sourceUrl`, `asOf`.

---

## Council websites & payment systems (not open APIs)

| Surface | Probe | Notes |
|---------|-------|-------|
| [Galle MC assessment page](https://galle.mc.gov.lk/node/106) | HTML **200** | Dwelling **7%**, business **12%**, crown/waste/others **22%** + discount/warrant copy |
| [DMMC Rate Tax](https://dmmc.lk/rate-tax/) | HTML **200** | Commercial **30%**; non-commercial **6%**; bare land **6%** |
| [CMC payments / eServices](https://eservice.colombo.mc.gov.lk/) | Citizen portal | Rates payment needs CMC account # + street + assessment #; login; **no public catalog API** |
| Colombo District LA systems (academic survey) | CMC (ICTA), Emetsoft, eLG (Cicra), Nekfa | Internal payment stacks; 12/13 Colombo LAs IT-enabled for rates — still not open data |

**Do not:** reverse-engineer payment APIs, scrape arrears, or store personal assessment accounts.

---

## What is *not* available publicly

1. **National machine-readable rate schedule** for all 340+ LAs.  
2. **Per-property Annual Value** by address or assessment number (GVD / LA rolls).  
3. **Ward-level AV aggregates** without RTI (PropertyLK sister already drafted RTI templates for CMC ward AVs — see Property platform `docs/phase0/rti_templates.md`).  
4. **Stable data.gov.lk dataset** for assessment rates (portal CKAN endpoints did not respond reliably in this environment).  
5. **LoGoMIS** as a rates feed — downloads are PFM review PDF ZIPs by LA, not rate JSON.  
6. **Future SPRR / PBV / 2027 property-tax reform** — IMF-advised infrastructure; not a Lankawa upstream today.

---

## Third-party calculators — use with caution

[induwara.lk property rates calculator](https://induwara.lk/tools/sri-lanka-property-rates-calculator) (HTML **200**, verified copy dated May 2026):

- Good UX reference: AV input × council % × Jan/quarter discounts × warrant.  
- Small fixed MC table claiming e.g. Colombo / Galle / Jaffna residential **6%**.  
- **Conflicts with live probes:** CMC 2026 gazette (**25% / 35% / 15%** bands), Galle MC site (**7% / 12%**), Jaffna 2025 gazette (**8% / 10%**).  

Treat as **stale secondary**; never ship their table as Lankawa truth without gazette re-verification.

---

## Fit with Lankawa today

| Existing piece | Role |
|----------------|------|
| `/local-government` + `src/data/local-government.json` (~327 bodies) | Join key for `bodyId` / district / type (MC\|UC\|PS) |
| `/api/v1/local-government` | Can later expose optional `assessmentRates[]` when seeded |
| `/property` + PropertyLK sister | Market listing prices — **orthogonal** to rates; holding-cost = listing context × user AV × rate % |
| `local-gov-contacts.ts` (P45) | Can deepen website URL for “pay rates / gazette” links |

No assessment-tax source or adapter exists yet (`sources.ts` has `internal://local-government` directory only).

---

## Recommended ship order

```
P0  Seed assessment-rate JSON for top MCs (CMC, DMMC, Kotte, Moratuwa,
    Kandy, Galle, Negombo, Gampaha, Jaffna, Kalmunai, …)
    Fields: bodyId, taxYear, useClass → ratePercent, discounts, warrant,
            sourceUrl (gazette PDF), asOf
P0  Honesty UI: “Rate % from gazette; enter AV from your notice”
P1  Optional calculator strip on /local-government body detail
P1  HTML scrape of known stable council rate pages as gazette cross-check
P2  Batch Part IV(B) PDF harvest (nuuuwan-style gazette scrape or cron)
    + regex/LLM extract → yearly refresh
P3  RTI / sister PropertyLK ward AV aggregates if responses arrive
Park Live payment-portal scrape, AV-by-address, data.gov.lk dependency
```

### Seed schema (suggested)

```ts
type AssessmentRateRow = {
  bodyId: string;          // matches local-government.json
  taxYear: number;
  useClass: "residential" | "commercial" | "undeveloped_residential"
    | "bare_land" | "other";
  ratePercent: number;     // of Annual Value
  earlyYearDiscountPercent?: number;   // usually 10
  earlyQuarterDiscountPercent?: number; // usually 5
  warrantSurchargePercent?: number;
  sourceUrl: string;       // gazette PDF preferred
  asOf: string;            // ISO date of verification
  notes?: string;
};
```

---

## Live checks (this research)

| Check | Result |
|-------|--------|
| Galle MC `/node/106` | **200** — rates table in HTML |
| DMMC `/rate-tax/` | **200** — rates table in HTML |
| CMC eServices | Portal copy confirms rates payment types; no public API |
| LoGoMIS `/downloads` | **200** — PFM ZIP UI, not rates API |
| `documents.gov.lk` gazette archive | **200** — year index + Part IV-B PDFs |
| CMC 2026 IV-B PDF | Confirmed **35 / 25 / 15** bands |
| Jaffna / Chilaw / Pannala 2025 IV-B | Confirmed rate % in English text |
| Kalmunai 2026 e-gazette | Confirmed **15 / 8** bands |
| induwara calculator | **200** — table stale vs gazette/council probes |
| `data.gov.lk` CKAN `package_search` | Connection reset / 403 from research env |

---

## Do not

- Present third-party calculator tables as official without gazette year match  
- Scrape CMC/eLG/Nekfa balances or personal assessment accounts  
- Promise address → rates amount without AV  
- Conflate **assessment rates** with IRD income tax, stamp duty, CGT, or VAT RAMIS APIs  
- Wait for 2027 national property-tax / SPRR before shipping a gazette-seeded strip  
