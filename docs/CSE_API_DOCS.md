# CSE `cse.lk/api` — announcements, GICS, market status

Live-probed catalog of unofficial Colombo Stock Exchange JSON endpoints that Lankawa does **not** yet fully use (or uses with the wrong method/shape). Same spirit as [Cookie-Cat21/cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs): request shapes, response keys, failure modes, and a Lankawa call-path column.

**Probe date:** 2026-07-20 (Asia/Colombo session open — `marketStatus` = `Regular Trading`)  
**Base:** `https://www.cse.lk/api`  
**CDN for PDFs/logos:** `https://cdn.cse.lk/` + relative `path` / `logoUrl`  
**Not affiliated with CSE.** HTML/API can change without notice. Server-side fetch only.

Related: [`DATA_EXPANSION_RESEARCH.md`](./DATA_EXPANSION_RESEARCH.md) · [`STOCK_BROKER_APIS_RESEARCH.md`](./STOCK_BROKER_APIS_RESEARCH.md) · adapter `src/lib/integrations/cse.ts`

---

## Lankawa vs upstream (snapshot)

| Area | Already wired in `cse.ts` | Gap / deepen |
|------|---------------------------|--------------|
| Indices | `POST /aspiData`, `POST /snpData` | — |
| Board / movers | `POST /tradeSummary` (local top g/l) | Optional dedicated `topGainers` / `topLooses` / `mostActiveVolumes` |
| Session aggregates | `POST /marketSummery`, `POST /dailyMarketSummery` | — |
| Sectors (GICS UI) | `POST /allSectors` | Unused: `GICSSectorSummery`, `marketIndices`, `listAllSectors`, range helpers |
| Market status | `POST /marketStatus` → `status` string | Documented status vocabulary; WS `/topic/status` not used |
| Notices | `GET /notifications` + `POST /approvedAnnouncement` (seed fallback) | Optional per-symbol `getAnnouncementByCompany` for watchlist |
| Quotes | `POST /companyInfoSummery` (form `symbol`) via `/api/v1/cse/quotes` | — |

---

## Market status

### `POST /marketStatus` — **used**

| | |
|--|--|
| Body | `{}` JSON (empty) |
| Content-Type | `application/json` |
| HTTP | 200 |
| Shape | `{ "status": "<string>" }` |

**Live sample (2026-07-20):**

```json
{ "status": "Regular Trading" }
```

**Observed / documented status strings** (not a closed enum — treat as opaque UI copy):

| Status | Meaning (practical) |
|--------|---------------------|
| `Regular Trading` | Continuous session open |
| `Market Open` | Reported by older community docs |
| `Market Closed` | Outside session / holiday (Lankawa seed uses this) |

**Session context (CSE, not from this endpoint):** typically Mon–Fri ~09:30–14:30 IST (UTC+5:30). Prefer gating on `status` over hard-coded clocks.

**Companions (same poll cadence):**

| Endpoint | Method / body | Role | Lankawa |
|----------|---------------|------|---------|
| `POST /marketSummery` | JSON `{}` | Session `trades`, `shareVolume`, `tradeVolume` (turnover), `tradeDate` (ms) | **Used** |
| `POST /dailyMarketSummery` | JSON `{}` | Nested `[[row…]]` EOD history; foreign/domestic split | **Used** |
| STOMP `/topic/status` | WebSocket at `/api/ws` | Live status push | Not used (HTTP poll is enough) |

**`marketSummery` sample fields:** `id`, `tradeVolume`, `shareVolume`, `tradeDate`, `trades`.

**Product note:** Surface `marketStatus` as a badge next to ASPI (already on `CseMarketCard`). Do not invent open/closed if the endpoint fails — fall back to seed/`null` with provenance.

---

## GICS / sector indices

CSE moved to **GICS industry groups** + S&P/CSE co-branded sector indices (Jan 2020). There is **no** `/gics` path. Useful endpoints:

| Endpoint | Method | Body | HTTP (probe) | Role | Lankawa |
|----------|--------|------|--------------|------|---------|
| `POST /allSectors` | JSON `{}` | — | 200 | **22** rows: 20 GICS groups + `ASI` + `S&P SL20`; live index + today turnover | **Used** |
| `POST /marketIndices` | JSON `{}` or form | — | 200 | Nested `[[20 rows]]` — same GICS rows as `allSectors` **without** ASPI/SL20 | Unused (redundant with `allSectors`) |
| `POST /listAllSectors` | JSON `{}` or form | — | 200 | Master `{ status, content: [{ id, name, symbol, indexCode, indexCodeSp }] }` (22) | Unused |
| `POST /GICSSectorSummery` | JSON `{}` or form | — | 200 | **Valuation strip:** PER / PBV / DY + companies traded/listed (20 rows) | **Highest-ROI unused** |
| `POST /gics`, `/gicsData`, `/allGics`, … | — | — | 400 | `Could not find the POST method for URL /api/…` | Do not call |

**Spelling:** path is `GICSSectorSummery` (capital GICS, CSE typo “Summery”). Lowercase `/gicsSectorSummery` → 400.

### Join keys

| Source | Sector key | Display name |
|--------|------------|--------------|
| `allSectors` / `marketIndices` | `indexCodeSp` (e.g. `SPCSEEIP`) + short `symbol` (`EGY`) | `name` / `indexName` |
| `GICSSectorSummery` | `sectorId` = same S&P code (`SPCSEEIP`) | Join to `allSectors.indexCodeSp` |
| `listAllSectors` | `id` (numeric, e.g. 223) = `allSectors.sectorId` | Static labels |

`allSectors` extras vs `marketIndices` / GICS summary: symbols `ASI` and `S&P SL20` (market indices, not GICS industry groups).

### `POST /allSectors` — sample row (truncated)

```json
{
  "symbol": "EGY",
  "name": "Energy",
  "indexName": "S&P/CSE Energy Industry Group Index",
  "indexCode": "1010",
  "indexCodeSp": "SPCSEEIP",
  "indexValue": 2901.18,
  "change": -1.39,
  "percentage": -0.0479,
  "sectorTurnoverToday": 17243126.75
}
```

### `POST /GICSSectorSummery` — sample (truncated)

```json
{
  "reqTradeDate": 1784226600000,
  "reqGICSSectorSummery": [
    {
      "sectorId": "SPCSEEIP",
      "priceIndex": 2902.57,
      "turnoverValue": 38565565.0,
      "turnoverVolume": 299166,
      "tradeVolume": 243,
      "per": 12.6,
      "pbv": 1.0,
      "dy": "2.9",
      "companiesTraded": 3,
      "companiesListed": 3
    }
  ]
}
```

Note: `priceIndex` / turnover on GICS summary can lag the live `allSectors.indexValue` (summary keyed by `reqTradeDate`). Prefer `allSectors` for intraday heat; use GICS summary for PER/PBV/DY and breadth (`companiesTraded`).

### Sector range helpers (ASPI = `sectorId=1`)

| Endpoint | Working call | Sample | Lankawa |
|----------|--------------|--------|---------|
| `POST /sectorHighLow` | form `sectorId=1` **or** JSON `{}` with `?sectorId=1` | `{ lastValue, openValue, dailyLow, dailyHigh }` | Unused — fills ASPI high/low if `aspiData` omits them |
| `POST /52WeekSectors` | form `sectorId=1` **or** query `?sectorId=1` | `{ previousClose, week52High, ytdHigh, ytdChange, week52Change }` | Unused |
| GET on either | — | **405** | — |

JSON body `{"sectorId":1}` alone: works for `52WeekSectors`, **fails** for `sectorHighLow` (`sectorId parameter is missing`) — prefer form or query string.

### GICS short symbols (20 industry groups)

`EGY` Energy · `MAT` Materials · `CG` Capital Goods · `CPS` Commercial & Professional Services · `TRP` Transportation · `A&C` Automobiles & Components · `CDA` Consumer Durables & Apparel · `CS` Consumer Services · `RET` Retailing · `FSR` Food & Staples Retailing · `FBT` Food, Beverage & Tobacco · `HPP` Household & Personal Products · `HES` Health Care Equipment & Services · `BNK` Banks · `DF` Diversified Financials · `INS` Insurance · `S&S` Software & Services · `TEL` Telecommunication Services · `UTI` Utilities · `RE` Real Estate

---

## Announcements / disclosures

Lankawa’s `fetchCseNotices()` currently tries, in order: `POST /notifications`, `POST /announcements`, `POST /marketAnnouncements`, `POST /news`. Live probe shows **all four miss** for a market-wide notices strip:

| Path tried | Result |
|------------|--------|
| `POST /notifications` | **405** Method Not Allowed (endpoint is **GET**) |
| `POST /announcements` + JSON `{}` | **400** `symbol parameter is missing` (form + `symbol` required) |
| `POST`/`GET /marketAnnouncements` | **400** no such method |
| `POST /news` | (not re-probed; use `GET /news/web` instead) |

`parseNotices` also looks for keys `notifications` / `announcements` / … but **not** `content` or `approvedAnnouncements` — so even a correct GET would need a parser tweak.

### Recommended feed endpoints

| Endpoint | Method / body | Response key | Count (probe) | Best for | Lankawa |
|----------|---------------|--------------|---------------|----------|---------|
| `GET /notifications` | none | `content[]` → `title`, `body`, `status` | 50 | Halt / auction / site banners | **Wire first** (fix POST→GET + parse `content`) |
| `POST /approvedAnnouncement` | JSON `{}` | `approvedAnnouncements[]` | 50 | Homepage corporate disclosures | **Wire second** (economy notices strip) |
| `POST /getAnnouncementByCompany` | form `symbol`, `fromDate`, `toDate` (`YYYY-MM-DD`) | `reqCompanyAnnouncement[]` | 11 (JKH) | Watchlist per-symbol | Unused |
| `POST /announcements` | form `symbol=JKH.N0000` | `infoAnnouncement[]` (PDF archive) | 162 | Legacy per-name PDF list | Unused (not market-wide) |
| `POST /getFinancialAnnouncement` | form empty / JSON | `reqFinancialAnnouncemnets` (**typo**) | 10 | Annual/quarterly report PDFs | Unused |
| `POST /circularAnnouncement` | JSON `{}` | `reqCircularAnnouncement[]` | 5 | CSE circulars | Unused |
| `POST /directiveAnnouncement` | JSON `{}` | `reqDirectiveAnnouncement[]` | 5 | Directives | Unused |
| `POST /getNonComplianceAnnouncements` | JSON `{}` | `nonComplianceAnnouncements[]` | 1 | Non-compliance | Unused |
| `POST /getNewListingsRelatedNoticesAnnouncements` | JSON `{}` | `newListingRelatedAnnouncements[]` | 262 | Listings / related | Unused (noisy) |
| `POST /getBuyInBoardAnnouncements` | JSON `{}` | `buyInBoardAnnouncements[]` | 210 | Buy-in board | Unused |
| `POST /getCOVIDAnnouncements` | JSON `{}` | `covidAnnouncements[]` | 217 | Historical COVID notices | Skip for product UI |
| `GET /corporateAnnouncementCategory` | none | array (~53) | 53 | Category metadata / `methodName` | Unused |
| `GET /smd/categories` | none | string[] (~57) | 57 | Filter dictionary | Unused |
| `GET /news/web?top=true&type=CN&numberOfRecord=3` | query | `{ CN: [...] }` | 3 | Press teaser | Unused |
| `POST /getGeneralAnnouncementById` | form `announcementId` | `reqBaseAnnouncement` + docs | — | Detail by id | Unused |
| `POST /getAnnouncementById` | form `announcementId` | often **204** empty | — | Unreliable | Avoid |

Date formats for `getAnnouncementByCompany`: use `YYYY-MM-DD`. `DD/MM/YYYY` → 500 (per cse-api-docs).

### `GET /notifications` — sample row

```json
{
  "id": "a190afac53d99d146a5fec793bca61ee",
  "title": "NOTICE",
  "body": "The Opening Market Auction Call has been further extended…",
  "status": "I"
}
```

### `POST /approvedAnnouncement` — sample row

```json
{
  "id": 31896,
  "createdDate": 1784520882000,
  "dateOfAnnouncement": "20 Jul 2026",
  "announcementId": 38081,
  "announcementCategory": "TRADING HALT LIFTED",
  "company": "BANSEI ROYAL RESORTS HIKKADUWA PLC",
  "symbol": null
}
```

`symbol` is often `null` — match via `company` name. PDF/detail: `POST /getGeneralAnnouncementById` with `announcementId` (live id `38081` returned title + remarks; companion `getAnnouncementById` → 204).

### Financial PDF URL

`path` from `getFinancialAnnouncement` → `https://cdn.cse.lk/{path}`  
e.g. `cmt/upload_report_file/1322_….pdf`

---

## curl examples

```bash
BASE=https://www.cse.lk/api
H=(-H 'Origin: https://www.cse.lk' -H 'Referer: https://www.cse.lk/' -H 'Accept: application/json')

# Market status
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/marketStatus"

# GICS live heat (already used by Lankawa)
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/allSectors"

# GICS valuation / breadth (not wired)
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/GICSSectorSummery"

# Notices that actually work
curl -sS "${H[@]}" "$BASE/notifications"
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/approvedAnnouncement"

# Per-symbol disclosures
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'symbol=JKH.N0000&fromDate=2026-01-01&toDate=2026-07-20' \
  "$BASE/getAnnouncementByCompany"
```

---

## Highest-ROI next steps for Lankawa

1. ~~**Fix notices ingest**~~ — wired: `GET /notifications` (`content`) + `POST /approvedAnnouncement` (`approvedAnnouncements`); economy strip below CSE card; seed fallback.
2. ~~**Per-symbol quotes**~~ — wired: `POST /companyInfoSummery` via `/api/v1/cse/quotes` for the home watchlist.
3. **Optional GICS deepen** — join `GICSSectorSummery` onto existing sector rows for PER/PBV/DY + traded/listed counts (one extra POST).
4. **Optional ASPI range** — `POST /sectorHighLow?sectorId=1` if `aspiData` high/low sparse.
5. **Do not** add COVID / buy-in / new-listings dumps to the economy card — keep the strip short (halt notices + recent approved disclosures).

Cite Cookie-Cat docs as a **catalog**, not an SLA. Keep polite delays (≥300 ms between probes); descriptive UA; no auth/account automation.
