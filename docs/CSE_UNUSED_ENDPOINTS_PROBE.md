# CSE unused endpoints — live probe + ship priority

**Probe date:** 2026-07-20 (Asia/Colombo, session open)  
**Base:** `https://www.cse.lk/api`  
**UA / headers:** `LankawaBot/1.0` + `Origin`/`Referer` `https://www.cse.lk/`  
**Session:** `POST /marketStatus` → `{"status":"Regular Trading"}`  
**Scope:** Confirm live responses for unused siblings listed in [`EXISTING_APIS_UNUSED_ENDPOINTS.md`](./EXISTING_APIS_UNUSED_ENDPOINTS.md) §2.3 — `topGainers`, `topLooses`, `sectorHighLow`, `52WeekSectors`, company announcements.  
**Related:** [`CSE_API_DOCS.md`](./CSE_API_DOCS.md) · adapter `src/lib/integrations/cse.ts`

Server-side only. Unofficial portal JSON — not CSE-affiliated, not advice.

---

## Ship priority (verdict)

| Pri | Endpoint | Ship? | Why |
|-----|----------|-------|-----|
| **P1** | `POST /52WeekSectors` (`sectorId=1`) | **Ship** | Unique ASPI 52w / YTD range not on `aspiData` — fills economy index context |
| **P1** | `POST /getAnnouncementByCompany` | **Ship** | Watchlist per-symbol disclosures; 11 JKH rows live with category labels |
| **P2** | `POST /topGainers` + `POST /topLooses` | **Ship next** | Clean top-10 movers; clearer than deriving from `tradeSummary` (no `name` field — join or show symbol) |
| **P2** | `POST /sectorHighLow` (`sectorId=1`) | **Ship as fallback** | Live open/high/low; **redundant** with `aspiData.highValue`/`lowValue` today — keep for open + sparse days |
| **P2** | `POST /getFinancialAnnouncement` | Optional | 10 recent financial PDFs → `cdn.cse.lk/{path}` link-out |
| **Skip** | Buy-in / new-listings / COVID dumps | No | Noise for morning economy card |

---

## Live confirmation matrix

All probes **HTTP 200** on 2026-07-20 ~12:50 IST unless noted.

| Endpoint | Method / body | Shape | Count / sample |
|----------|---------------|-------|----------------|
| `POST /topGainers` | JSON `{}` | `list[10]` | `#1 NTB.X0000` +14.89% @ 409.0 |
| `POST /topLooses` | JSON `{}` | `list[10]` | `#1 UCAR.N0000` −10.35% @ 2290.0 (CSE spelling) |
| `POST /sectorHighLow` | form `sectorId=1` **or** `?sectorId=1` + JSON `{}` | object | `lastValue` 21180.51 · open 21405.41 · low 21175.36 · high 21428.5 |
| `POST /52WeekSectors` | form `sectorId=1` | object | 52w high 23967.22 · YTD −6.38% · 52w +12.20% |
| `POST /getAnnouncementByCompany` | form `symbol` + `fromDate`/`toDate` (`YYYY-MM-DD`) | `{ reqCompanyAnnouncement[] }` | **11** rows for `JKH.N0000` (2026-01-01 → 2026-07-20) |
| `POST /getFinancialAnnouncement` | JSON `{}` | `{ reqFinancialAnnouncemnets[] }` *(typo)* | **10** PDF rows; BRR annual uploaded same day |

**Cross-check vs used `aspiData`:** `value`/`highValue`/`lowValue` match `sectorHighLow.lastValue`/`dailyHigh`/`dailyLow` exactly. `sectorHighLow.openValue` == `52WeekSectors.previousClose` (21405.41). So range helpers add **open + 52w/YTD**, not a better last/high/low during a healthy session.

---

## 1. `POST /topGainers` / `POST /topLooses`

**Call:** `Content-Type: application/json` body `{}`  
**HTTP:** 200 · ~1.4 KB each · ~0.7 s

**Row keys:** `id`, `securityId`, `symbol`, `price`, `change`, `changePercentage`, `tradeDate` (ms)

No `name` / company string — UI must show ticker or join via `companyInfoSummery` / board.

### Live top 10 gainers

| # | Symbol | Price | Δ | Δ% | Trade time (IST) |
|---|--------|------:|--:|---:|------------------|
| 1 | NTB.X0000 | 409.0 | +53.0 | +14.89 | 11:16 |
| 2 | ONAL.N0000 | 48.5 | +3.3 | +7.30 | 12:17 |
| 3 | CALI.U0000 | 14.0 | +0.7 | +5.26 | 12:20 |
| 4 | KFP.N0000 | 178.0 | +8.0 | +4.71 | 10:45 |
| 5 | CERA.N0000 | 177.5 | +7.5 | +4.41 | 11:27 |
| 6 | HOPL.N0000 | 56.6 | +2.3 | +4.24 | 10:09 |
| 7 | KHC.N0000 | 14.0 | +0.5 | +3.70 | 12:17 |
| 8 | CWL.N0000 | 18.1 | +0.6 | +3.43 | 12:24 |
| 9 | CDB.N0000 | 41.5 | +1.3 | +3.23 | 09:57 |
| 10 | CABO.N0000 | 200.0 | +5.0 | +2.56 | 11:41 |

### Live top 10 losers (`topLooses`)

| # | Symbol | Price | Δ | Δ% | Trade time (IST) |
|---|--------|------:|--:|---:|------------------|
| 1 | UCAR.N0000 | 2290.0 | −264.5 | −10.35 | 11:04 |
| 2 | SEMB.N0000 | 0.9 | −0.1 | −10.00 | 12:53 |
| 3 | RICH.N0000 | 27.9 | −2.4 | −7.92 | 12:53 |
| 4 | RPBH.N0000 | 47.2 | −2.8 | −5.60 | 12:43 |
| 5 | MAL.X0000 | 37.2 | −2.1 | −5.34 | 11:05 |
| 6 | CHOT.N0000 | 30.2 | −1.7 | −5.33 | 12:49 |
| 7 | SINH.N0000 | 21.7 | −1.1 | −4.83 | 12:49 |
| 8 | CPRT.N0000 | 32.0 | −1.6 | −4.76 | 12:47 |
| 9 | GHLL.N0000 | 16.0 | −0.8 | −4.76 | 13:01 |
| 10 | EML.N0000 | 8.2 | −0.4 | −4.65 | 12:58 |

**Product fit:** Replace or backstop local movers currently derived from `tradeSummary` in `cse.ts`. Keep path spelling `topLooses`. Cap UI at 5 each for the economy card.

---

## 2. `POST /sectorHighLow` (`sectorId=1` = ASPI)

**Working calls:**
- form `sectorId=1` (`application/x-www-form-urlencoded`)
- JSON `{}` with query `?sectorId=1`

JSON body `{"sectorId":1}` alone → missing parameter (see [`CSE_API_DOCS.md`](./CSE_API_DOCS.md)). GET → 405.

**Live payload:**

```json
{
  "lastValue": 21180.51,
  "openValue": 21405.41,
  "dailyLow": 21175.36,
  "dailyHigh": 21428.5
}
```

**Ship note:** Wire only if `aspiData` omits high/low/open, or to expose **open** next to last. Do not double-fetch on every pulse when `aspiData` is healthy.

---

## 3. `POST /52WeekSectors` (`sectorId=1`)

**Working call:** form `sectorId=1` (JSON body `{"sectorId":1}` also works per prior docs; form preferred for parity with `sectorHighLow`).

**Live payload:**

```json
{
  "previousClose": 21405.41,
  "week52High": 23967.22,
  "ytdHigh": 23967.22,
  "ytdChange": -6.381633349151618,
  "week52Change": 12.203627397025551
}
```

**Ship note:** Highest unique value among range helpers — “ASPI 52w high / YTD %” chip on `/economy`. One extra POST; cache with CSE cadence (~15 min).

---

## 4. Company announcements

### 4a. `POST /getAnnouncementByCompany` — **P1 watchlist**

```bash
curl -sS -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'symbol=JKH.N0000&fromDate=2026-01-01&toDate=2026-07-20' \
  'https://www.cse.lk/api/getAnnouncementByCompany'
```

**Response key:** `reqCompanyAnnouncement[]`  
**Live count (JKH):** 11  
**Row keys:** `id`, `announcementId`, `announcementCategory`, `company`, `dateOfAnnouncement`, `createdDate`, `type`, `symbol` (often `null`), dividend/AGM date fields, `logoUrl`, `remarks`

**JKH categories (probe window):** CORPORATE DISCLOSURE ×3 · RESIGNATION OF DIRECTORS ×2 · CASH DIVIDEND ×2 · DEALINGS BY DIRECTORS · AGM APPROVED/INITIAL · CIRCULAR TO SHAREHOLDERS

**Sample row:**

```json
{
  "id": 31637,
  "createdDate": 1782816663000,
  "dateOfAnnouncement": "30 Jun 2026",
  "announcementId": 37747,
  "announcementCategory": "CORPORATE DISCLOSURE",
  "company": "JOHN KEELLS HOLDINGS PLC",
  "type": "new",
  "symbol": null
}
```

**Dates:** use `YYYY-MM-DD` only (`DD/MM/YYYY` → 500). Match company via `company` name when `symbol` is null. Detail/PDF: `POST /getGeneralAnnouncementById` with `announcementId` (companion `getAnnouncementById` often 204).

**Ship:** On watchlist expand / `/api/v1/cse/quotes` deepen — last N disclosures per symbol (default window 90–180d). Do not replace market-wide `GET /notifications` + `POST /approvedAnnouncement`.

### 4b. `POST /getFinancialAnnouncement` — optional PDF strip

**Live:** 10 rows under typo key `reqFinancialAnnouncemnets`.  
**Sample:** BRR · “Annual Report as at 31st March 2026” · path `cmt/upload_report_file/1322_….pdf` → `https://cdn.cse.lk/{path}`  
Also LIOC / SOY / AMF / LFIN interim/annual uploads in the last few days.

**Ship:** P2 link-out for major names; keep off the primary economy card unless user opens a company panel.

---

## Recommended adapter wiring order

1. **`52WeekSectors`** → attach `week52High` / `ytdChange` / `week52Change` onto ASPI snapshot (seed-safe).
2. **`getAnnouncementByCompany`** → watchlist notices (form POST; date window; parse `reqCompanyAnnouncement`).
3. **`topGainers` / `topLooses`** → prefer over `tradeSummary` local sort when both succeed; fall back to current derivation.
4. **`sectorHighLow`** → fill `open` / high / low only when `aspiData` sparse.
5. **`getFinancialAnnouncement`** → optional company PDF teaser.

---

## curl cookbook

```bash
BASE=https://www.cse.lk/api
H=(-H 'User-Agent: Mozilla/5.0 (compatible; LankawaBot/1.0; +https://lankawa.lk)' \
   -H 'Origin: https://www.cse.lk' -H 'Referer: https://www.cse.lk/' \
   -H 'Accept: application/json')

curl -sS "${H[@]}" -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/topGainers"
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/topLooses"
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sectorId=1' "$BASE/sectorHighLow"
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sectorId=1' "$BASE/52WeekSectors"
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'symbol=JKH.N0000&fromDate=2026-01-01&toDate=2026-07-20' \
  "$BASE/getAnnouncementByCompany"
curl -sS "${H[@]}" -X POST -H 'Content-Type: application/json' -d '{}' \
  "$BASE/getFinancialAnnouncement"
```

---

## What this doc is not

- Not a claim of SLA or official CSE support.
- Not a license to scrape authenticated broker/trading sessions.
- Not a substitute for the fuller catalog in [`CSE_API_DOCS.md`](./CSE_API_DOCS.md).
