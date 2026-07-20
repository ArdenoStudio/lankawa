# Bank FD API schemas → `BankDepositRatesSnapshot`

**Status:** Live probe, 2026-07-20 (schema-only; no adapter yet)  
**UA:** `LankawaBot/1.0 (+https://lankawa.lk)` (ComBank also OK with browser UA)  
**Sister docs:** [`BANK_API_DEEP_DIVE_COMBANK.md`](./BANK_API_DEEP_DIVE_COMBANK.md), [`BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`](./BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md), [`BANK_API_DEEP_DIVE_HNB.md`](./BANK_API_DEEP_DIVE_HNB.md)

Indicative public quotes for adapter design — not advice.

---

## Target unified type (proposed)

```ts
type InterestPaidIn = "maturity" | "monthly" | "annually" | "quarterly" | "semi_annually";

interface BankDepositRateQuote {
  bankId: string;           // "combank" | "sampath" | "seylan" | "hnb"
  productCode: string;      // bank-native or synthetic, e.g. "FDNOR", "senior-below"
  productName: string;
  currency: "LKR";
  tenorMonths: number;      // normalize days→months when PeriodType=D
  paidIn: InterestPaidIn;
  ratePa: number;           // nominal % p.a.
  aerPa?: number;           // when bank publishes AER
  effectiveFrom?: string;   // ISO date if parseable
  seniorCitizen?: boolean;
  sourceUrl: string;
}

interface BankDepositRatesSnapshot {
  sourceId: string;
  asOf: string;             // fetch time ISO
  methodologyNote: string;
  quotes: BankDepositRateQuote[];
  liveCount: number;
  seedCount: number;
  isSeed: boolean;
}
```

Strip for UI: prefer `paidIn: "maturity"` at 3/6/12/24/36/60 months per bank, plus optional monthly.

---

## 1. Commercial Bank — exact shape

| | |
|--|--|
| **URL** | `GET https://www.combank.lk/api/interest-rates-fd` |
| **Content-Type** | `application/json` |
| **Root** | **JSON array** (no wrapper) — **19** rows live |

```json
[
  { "paidIn": "monthly", "period": "1", "rate": "8.00" },
  { "paidIn": "maturity", "period": "12", "rate": "10.00" }
]
```

| Field | Type | Notes |
|-------|------|--------|
| `paidIn` | string | `"monthly"` \| `"annually"` \| `"maturity"` |
| `period` | string | tenor in **months** (`"1"`…`"60"`) |
| `rate` | string | % p.a. (two decimals) |

**Live matrix (2026-07-20):** monthly 1–6,12,24–60; annually 24–60; maturity 12–60. No AER, no `effectiveFrom`.

### Field map → `BankDepositRateQuote`

| Snapshot | Source |
|----------|--------|
| `bankId` | `"combank"` |
| `productCode` / `productName` | `"standard-fd"` / `"Fixed Deposit"` |
| `tenorMonths` | `Number(period)` |
| `paidIn` | `paidIn` as-is |
| `ratePa` | `parseFloat(rate)` |
| `aerPa` | — |
| `effectiveFrom` | — |
| `seniorCitizen` | `false` |

---

## 2. Sampath — exact shape

| | |
|--|--|
| **URL** | `GET https://www.sampath.lk/api/rates-and-charges/external` |
| **Content-Type** | `application/json; charset=utf-8` |
| **Size** | ~42 KB |

```json
{
  "local": {
    "savings_rate": [ /* Product */ ],
    "term_and_deposite": [ /* Product — note misspelling */ ],
    "treasury_bills_and_repo_rates": [ /* … */ ]
  },
  "foreign": {}
}
```

**Product** (`local.term_and_deposite[]`):

| Field | Type | Example |
|-------|------|---------|
| `productHead` | string | `"Normal Fixed Deposit"` |
| `withEfectFrom` | string | `"Wednesday, June 10 2026"` (typo: Efect) |
| `productOrder` | string | `"200"` |
| `comment` | string | |
| `rateCode` | string | `"FDNOR"` \| `"FDKC"` \| `"FDCD"` \| `"FDSAN"` |
| `slabAmount` | array | tenor slabs |

**Slab** (useful keys; many empty strings):

| Field | Type | Use |
|-------|------|-----|
| `Period` / `PeriodType` | string | `"12"` + `"M"` \| `"D"` \| `"Y"` |
| `RateMat` / `AerMat` | string | maturity % / AER |
| `RateMon` / `AerMon` | string | monthly % / AER |
| `RateAnum` / `AerAnum` | string | annual (when set) |
| `NominalRate` / `EffectiveRate` | string | Kalin Cash (`FDKC`) prepaid style |
| `MinContractedMonths` / `MaxContractedMonths` | string | range hints |
| `InterestType` | string | e.g. `"S"` |
| `Order` | string | sort |

Live FD products: `FDKC`, `FDNOR` (primary), `FDCD`, `FDSAN` (senior). Example FDNOR 12M: `RateMat` `9.5`, `AerMat` `9.5`, `RateMon` `9.1`, `AerMon` `9.49`.

### Field map → `BankDepositRateQuote`

| Snapshot | Source |
|----------|--------|
| `bankId` | `"sampath"` |
| `productCode` | `rateCode` |
| `productName` | `productHead` |
| `tenorMonths` | `Period` if `PeriodType==="M"`; else convert D/Y |
| `paidIn` | emit one row per non-empty: `RateMat`→`maturity`, `RateMon`→`monthly`, `RateAnum`→`annually`; for `FDKC` use `NominalRate`→`maturity` (+ `EffectiveRate` as `aerPa`) |
| `ratePa` | `parseFloat` of chosen rate field |
| `aerPa` | matching `Aer*` / `EffectiveRate` |
| `effectiveFrom` | parse `withEfectFrom` |
| `seniorCitizen` | `rateCode === "FDSAN"` |

Skip empty rate fields and day-only promo slabs unless product UI needs them.

---

## 3. Seylan — exact shape

| | |
|--|--|
| **URL** | `GET https://www.seylan.lk/get-fd-data` |
| **Content-Type** | advertises `text/html; charset=UTF-8` — **body is JSON** |
| **Size** | ~1.5 KB |

```json
{
  "senior-below": [
    {
      "type": "Maturity",
      "stValue": 1,
      "endValue": 60,
      "interest": [{ "month": 12, "interest": 9 }]
    },
    { "type": "Monthly", "stValue": 12, "endValue": 60, "interest": [/* … */] },
    { "type": "Annually", "stValue": 48, "endValue": 60, "interest": [/* … */] }
  ],
  "senior-above": [ /* same block shape */ ]
}
```

| Field | Type | Notes |
|-------|------|--------|
| top keys | | `"senior-below"` (under 60) · `"senior-above"` (senior) |
| `type` | string | `"Maturity"` \| `"Monthly"` \| `"Annually"` |
| `stValue` / `endValue` | number | calculator tenor range (months) |
| `interest[].month` | number | tenor months |
| `interest[].interest` | number | % p.a. (not string) |

**Caveat:** senior-above Monthly/Annually include placeholder `interest: 0` for unused months — skip zeros.

### Field map → `BankDepositRateQuote`

| Snapshot | Source |
|----------|--------|
| `bankId` | `"seylan"` |
| `productCode` | `"senior-below"` \| `"senior-above"` |
| `productName` | `"Fixed Deposit"` / `"Senior Citizen Fixed Deposit"` |
| `tenorMonths` | `interest[].month` |
| `paidIn` | `type.toLowerCase()` → `maturity` \| `monthly` \| `annually` |
| `ratePa` | `interest[].interest` (number) |
| `aerPa` | — |
| `effectiveFrom` | — (HTML `/interest-rates` has w.e.f.; not in JSON) |
| `seniorCitizen` | key === `"senior-above"` |

---

## 4. HNB Venus — exact shape

| | |
|--|--|
| **URL** | `GET https://venus.hnb.lk/api/get_interest_rates_contents` |
| **Content-Type** | `application/json; charset=utf-8` |
| **Size** | ~46 KB |

```json
{
  "status": 200,
  "msg": "Success",
  "data": [
    {
      "id": 1,
      "name": "Savings",
      "interest_rate_sub_category": [
        {
          "id": 102,
          "interest_rate_category": { "id": 1, "name": "Savings" },
          "name": "Fixed Deposits",
          "order": 6,
          "sub_category_division_approved": [
            {
              "title": "Fixed Deposits Interest Rates",
              "last_reviewed_on": "2026-07-18",
              "description": "The minimum deposit requirement…",
              "only_description": 0,
              "table_condition": "…",
              "table_data_approved": [
                {
                  "id": 2092,
                  "sub_category_division_approved_id": …,
                  "data": "{\"columns\":[…],\"rows\":[[…]]}"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

`table_data_approved[].data` is a **stringified** JSON object `{ columns: string[], rows: string[][] }`. Parse with `JSON.parse`.

**FD divisions (live):** `Special Fixed Deposits` · `Fixed Deposits Interest Rates` (primary) · `Senior Citizen Fixed Deposits` · `Sathkara Fixed Deposits`.

**Primary board columns:** `Period`, `Monthly`, `Quarterly`, `Semi Annually`, `Annually`, `Maturity`, `Annual Effective Rate` — cells like `"10.00%"` or `"-"`.

### Field map → `BankDepositRateQuote`

| Snapshot | Source |
|----------|--------|
| `bankId` | `"hnb"` |
| `productCode` | slug of division `title` (e.g. `fixed-deposits-interest-rates`) |
| `productName` | division `title` |
| `tenorMonths` | parse `Period` cell (`"12 Months"` → `12`) |
| `paidIn` | each non-`"-"` payout column → `monthly` / `quarterly` / `semi_annually` / `annually` / `maturity` |
| `ratePa` | strip `%`, `parseFloat` |
| `aerPa` | row’s AER / Annual Effective Rate column (same for all paidIn on that row) |
| `effectiveFrom` | `last_reviewed_on` (`YYYY-MM-DD`) |
| `seniorCitizen` | title contains `"Senior"` |

Prefer division **Fixed Deposits Interest Rates** for the default strip; keep Special / Sathkara / Senior as extra products.

---

## Cross-bank adapter notes

| Concern | Guidance |
|---------|----------|
| Auth | None on all four GETs |
| Primary LKR FD | ComBank array · Sampath `FDNOR` · Seylan `senior-below` Maturity · HNB “Fixed Deposits Interest Rates” |
| Type coercion | ComBank/Sampath rates are **strings**; Seylan **numbers**; HNB **"%"-suffixed strings** in HTML tables |
| Missing as-of | ComBank/Seylan: use fetch time; Sampath/HNB: parse product/division dates |
| Content-Type trap | Seylan: parse JSON despite `text/html` |
| Key typos | Sampath `term_and_deposite`, `withEfectFrom` — do not “fix” in parsers |
| Out of scope here | Savings, FCY FD, T-bills, pawning (present in Sampath/HNB payloads) |

**Ship order (adapters later):** ComBank → Seylan → Sampath `FDNOR` → HNB primary FD table.
