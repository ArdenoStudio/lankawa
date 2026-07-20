# HARTI & CBSL food-price PDFs — research

**Status:** Research (probed 2026-07-20)  
**Product surface:** `/food` civic fresh-food / market quotes (not supermarket JSON)  
**Question:** Are there usable daily/weekly HARTI or CBSL PDF/HTML surfaces for Sri Lanka wholesale/retail food prices, and should Lankawa parse them directly or wait on FoodLK market sync?

---

## Verdict

| Source | Surface | Cadence | Trivial HTML prices? | Parse feasibility | Lankawa next step |
|--------|---------|---------|----------------------|-------------------|-------------------|
| **HARTI daily** | PDF index + dated English PDFs | Near-daily (incl. weekends in Jul 2026) | **No** — HTML is Date/Medium/Download only | Medium — table extract already in FoodLK | **Prefer FoodLK market sync** |
| **HARTI weekly** | Eng + Sin bulletin PDFs | Weekly (ISO week numbering; filenames messy) | No | Medium–hard (multi-page bulletin) | FoodLK only if needed |
| **HARTI monthly** | English monthly PDFs | Monthly; archive thin after mid-2024 | No | Low priority | Skip for morning check |
| **CBSL Daily Price Report** | Index page + dated PDFs | Business days (latest probe: Fri 17 Jul 2026) | **No** — listing links to PDFs | Medium — FoodLK parser active | **Prefer FoodLK market sync** |

**Bottom line:** Both agencies publish **stable, public PDF** feeds for civic fresh-food markets. Neither exposes a machine-readable HTML price table. FoodLK already scrapes both (`harti` + `cbsl` marked Active in Food Platform `DATA_SOURCES.md`). Lankawa should **not** ship in-process PDF parsers; fix/consume FoodLK `/api/v1/*` (or Life federation with honest labels). Keep WFP HDX + SPAR2U as temporary bypasses. A null stub documents the intentional non-wire.

---

## HARTI (Hector Kobbekaduwa Agrarian Research and Training Institute)

### Index URLs (current site)

| Bulletin | Index URL |
|----------|-----------|
| Daily | https://www.harti.gov.lk/daily-price.php |
| Weekly | https://www.harti.gov.lk/weekly-price.php |
| Monthly | https://www.harti.gov.lk/monthly-price.php |

Legacy Joomla paths (`/index.php/en/market-information/…`) still resolve for some hosts but are **not** the PDF catalog (homepage/shell). Prefer the `*.php` indexes above.

### Daily PDF pattern

```
https://www.harti.gov.lk/assets/pdf/food_price/daily/eng/{YYYY}/{MonthName}/{Filename}.pdf
```

**Example (probe tip):**  
https://www.harti.gov.lk/assets/pdf/food_price/daily/eng/2026/July/Vegetables%20Wholesale%20Prices%20(2026.07.19).pdf

Filename variants on the same index (do not hardcode one template):

- `Vegetables Wholesale Prices (YYYY.MM.DD).pdf`
- `Vegetable Pricenew ex1(YYYY.MM.DD).pdf`

Index HTML lists ~3k English daily links under `food_price/daily/eng/` (year folders in tables). Probe tip date: **2026-07-19** (PDF `Last-Modified` ~2026-07-20 UTC). July 2026 listed **19/19** calendar days — treat as near-daily including weekends, with occasional gaps historically.

### Weekly / monthly

| Cadence | Path pattern | Notes |
|---------|--------------|-------|
| Weekly | `/assets/pdf/food_price/weekly/{eng\|sin}/{YYYY}/…` | Eng + Sin pairs; tip week **25** of 2026; spaces/casing inconsistent |
| Monthly | `/assets/pdf/food_price/monthly/eng/{YYYY}/{Month}_{YYYY}.pdf` | Latest cluster ends ~Sep 2024 on index — stale for ops |

Example weekly tip:  
https://www.harti.gov.lk/assets/pdf/food_price/weekly/eng/2026/Final%20English%20Bulletin%20-%20week%2025.pdf

### What the HTML tables contain

Bootstrap tables: **Date · Medium · Download** → PDF hrefs. **No commodity price cells in HTML.** Discovering the latest PDF is a trivial regex on the index; ingesting prices is PDF table extraction.

### Content (daily PDF)

- ~2 pages; English market matrix + Sinhala mirror on page 2  
- Wholesale ranges (min–max LKR) by variety across markets: Peliyagoda, Kandy, Dambulla, Meegoda, Norochchole, Thambuththegama, Keppetipola, Nuwara Eliya, Bandarawela, Veyangoda  
- Sections: up-country / low-country vegetables, fruits, etc.  
- Civic **fresh produce**, not supermarket SKUs

### Parse feasibility

| Approach | Effort | Notes |
|----------|--------|-------|
| Index scrape → latest PDF URL | Trivial | `href=…/assets/pdf/food_price/daily/eng/….pdf` |
| PDF → quotes | Medium | Needs `pdfplumber`/camelot-style tables; FoodLK `scrapers/harti.py` already does this |
| Weekly bulletin | Higher | Narrative + tables; filename chaos |
| Direct in Lankawa (Node) | High / fragile | Duplicate FoodLK; avoid |

FoodLK source page constant: `HARTI_DAILY_PRICE_URL = https://www.harti.gov.lk/daily-price.php`.

---

## CBSL Daily Price Report

### Index URL

https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report  

(Also linked from https://www.cbsl.gov.lk/en/statistics/economic-indicators under Price Report.)

### PDF pattern

```
https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/statistics/pricerpt/price_report_{YYYYMMDD}_e.pdf
```

**Example (probe tip):**  
https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/statistics/pricerpt/price_report_20260717_e.pdf

Index page lists dated entries with direct PDF hrefs (first page ~12 reports). Filter by year/month is Drupal UI only — for bots, scrape the listing or guess `YYYYMMDD` on business days.

### Cadence

- **Business days** (weekdays); tip on 2026-07-20 was **17 Jul 2026** (Friday)  
- ~2-page PDF (~200 KB), served via CloudFront  
- Page 1: narrative “yesterday vs today” for selected items  
- Page 2: wholesale/retail matrix for Pettah, Dambulla, Narahenpita (Last Friday / Today columns)

Covers selected vegetables, fish, grains, and other food items — narrower than HARTI’s multi-market veg board, but includes **retail** columns useful for household context.

### Parse feasibility

| Approach | Effort | Notes |
|----------|--------|-------|
| Index → latest `price_report_*_e.pdf` | Easy | Stable path under `statistics/pricerpt/` |
| PDF page-2 tables | Medium | Split OCR-like number artefacts (`5 00.00` → 500); FoodLK `scrapers/cbsl.py` documents 10-column layout |
| HTML prices | None | No embedded price table |

---

## Relation to FoodLK / Lankawa today

```
FoodLK official market sync (HARTI + CBSL + WFP + …)
        │
        ▼  /api/v1/*  (often HTTP 500 as of mid-2026)
Lankawa food.ts
        │
        ├─ WFP HDX CSV direct (food-direct.ts)
        ├─ SPAR2U retail JSON (food-spar.ts)   ← supermarket, not civic market
        ├─ Life food domain
        └─ seed
```

Food Platform marks **`harti` and `cbsl` Active** with PDF parsers. Lankawa UI copy already says HARTI ingest is planned via FoodLK and must not be claimed live.

Stub (intentional no-op): `src/lib/integrations/food-harti-cbsl.ts` — returns `null` so the chain never pretends HARTI/CBSL HTML is live.

---

## Recommended next step

1. **P0 — FoodLK market sync health**  
   Ensure FoodLK `run_official_market_sync` / HARTI+CBSL scrapers populate API metrics so Lankawa can stamp `live` / `food_platform_api` honestly.

2. **P1 — Do not add Lankawa PDF parsers**  
   Duplicating `pdfplumber` pipelines in Next.js is brittle (filename drift, layout changes, Sinhala pages). Keep PDF ownership on FoodLK.

3. **P2 — Optional later**  
   If FoodLK stays down for weeks: a Lankawa “latest PDF URL + asOf” badge (link-out only, no parse) is acceptable; still not “live HARTI prices.”

4. **Keep** WFP HDX for lagged staples and SPAR for retail shelf fallbacks; label clearly (not HARTI/NCPI).

---

## Compliance

- Server-side only; descriptive UA (`LankawaBot/1.0`)  
- Official `.gov.lk` publications — fine for attribution; respect robots/terms  
- Never label supermarket JSON or WFP as HARTI/CBSL  
- NCPI/CCPI remain DCS monthly indices — out of scope for this daily/weekly PDF pass

---

## Probe log (2026-07-20)

| Check | Result |
|-------|--------|
| HARTI `daily-price.php` | 200; PDF index tables; tip PDF 2026.07.19 |
| HARTI tip PDF HEAD | 200 `application/pdf` ~595 KB |
| HARTI weekly tip | week 25 / 2026 Eng + Sin |
| CBSL price-report index | 200; tip PDF `price_report_20260717_e.pdf` |
| CBSL tip PDF HEAD | 200 `application/pdf` ~210 KB |
| HTML commodity tables | **Absent** on both indexes |
| FoodLK scrapers | Present upstream (`harti.py`, `cbsl.py`) |
