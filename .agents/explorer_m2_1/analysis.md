# Analysis Report: CEB Outages Integration Adapter Design (`ceb-outages.ts`)

## Executive Summary
This document provides the complete technical design and architecture for the Ceylon Electricity Board (CEB) outages integration adapter (`src/lib/integrations/ceb-outages.ts`), static seed dataset (`src/data/ceb-outages-seed.json`), and unit test suite (`src/lib/integrations/ceb-outages.test.ts`).

---

## 1. Endpoints & Protocol Analysis: CEB Care Incognito Services

### 1.1 Service Architecture & Anti-Forgery Session Bootstrap
The CEB Care web application (`https://cebcare.ceb.lk`) exposes public (incognito) outage and load-shedding endpoints built on ASP.NET MVC. These endpoints require session bootstrapping to bypass anti-forgery protection.

* **Primary HTML Pages**:
  * Outage Map Page: `https://cebcare.ceb.lk/Incognito/OutageMap`
  * Demand Management Schedule Page: `https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule`

* **Session Bootstrap Flow**:
  1. `GET` request to HTML page with custom User-Agent (`LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)`).
  2. Extract `__RequestVerificationToken` from `<input type="hidden" name="__RequestVerificationToken" value="..." />`.
  3. Extract `Set-Cookie` response headers to form cookie string.
  4. Pass headers on API sub-requests:
     - `Cookie: <cookieHeader>`
     - `RequestVerificationToken: <token>`
     - `X-Requested-With: XMLHttpRequest`

### 1.2 Endpoint Specifications

| Endpoint Path | Method | Parameters | Payload / Response Structure |
|---|---|---|---|
| `/Incognito/GetProvinces` | GET / POST | None | Array of `{ ProvinceId: string, ProvinceName: string }` |
| `/Incognito/GetAreasByProvince` | GET / POST | `provinceId` (string) | Array of `{ AreaId: string, AreaName: string }` |
| `/Incognito/GetOutageLocationsInArea` | GET / POST | `areaId` (string) | Array of interruption objects containing `NumberOfCustomers`, `TimeStamp`, `InterruptionTypeName`, feeder/CSC details |
| `/Incognito/GetLoadSheddingEvents` | POST | `StartTime` (YYYY-MM-DD), `EndTime` (YYYY-MM-DD) | Array of `{ loadShedGroupId: string, startTime: string, endTime: string, description?: string }` |
| `/Incognito/GetDemandMgmtClusters` | GET / POST | `groupId` (string: "A"–"Y") | Array of `{ NumberOfCustomers: number, GeneratedTime: string, GroupId: string, Points: Array<{ Lat: number, Lng: number }> }` |
| `/Incognito/GetLoadSheddingGeoAreas` | GET / POST | `LoadShedGroupId` (string: "A"–"Y") | Array of feeder and distribution sub-areas (`{ GssName, FeederName, FeedingArea }`) |

### 1.3 Load-Shedding Letter Groups (A–Y)
* Total letter groups: **25** (`A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y`).
* Groups categorize island-wide grid feeder circuits for rotating demand-management windows.

---

## 2. Timeout, Caching & Fallback Design

### 2.1 Timeout Specification
* **AbortController Timeout**: `10_000` ms (10 seconds max per fetch).
* **Implementation Strategy**:
  ```typescript
  function buildTimeoutSignal(timeoutMs: number = 10_000): AbortSignal | undefined {
    if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
      return (AbortSignal as any).timeout(timeoutMs);
    }
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
  }
  ```

### 2.2 Revalidation Caching
* Cache TTL: `3600` seconds (1 hour revalidation window) for Next.js App Router data cache.
* Applied via `next: { revalidate: 3600 }` on fetch calls.

### 2.3 Static Seed Fallback (`src/data/ceb-outages-seed.json`)
* **Exact Disclaimer String**: `"Seed fallback — live API unavailable"` (Strict compliance requirement).
* **Source ID**: `ceb_outages_seed`.
* **Live API Source ID**: `ceb_outages_api`.
* **Seed Data Structure**:
  ```json
  {
    "sourceId": "ceb_outages_seed",
    "sourceName": "CEB Care — Outages Seed Snapshot",
    "asOf": "2026-08-01T00:00:00Z",
    "disclaimer": "Seed fallback — live API unavailable",
    "summary": "Static seed fallback dataset representing active outages and load-shedding schedules across CEB distribution areas",
    "liveOutages": [
      {
        "id": "ceb-outage-colombo-01",
        "province": "Western Province 1",
        "area": "Colombo City North",
        "cscName": "Kotahena CSC",
        "affectedCustomers": 1250,
        "interruptionType": "Unplanned Breakdown",
        "startTime": "2026-08-03T08:30:00+05:30",
        "estimatedRestoration": "2026-08-03T14:30:00+05:30",
        "reason": "Distribution transformer MV fuse replacement",
        "latitude": 6.9456,
        "longitude": 79.8633
      }
    ],
    "loadSheddingSchedules": [
      {
        "groupId": "A",
        "startTime": "2026-08-03T16:00:00+05:30",
        "endTime": "2026-08-03T18:00:00+05:30",
        "status": "upcoming",
        "affectedAreas": ["Colombo North", "Kelaniya", "Gampaha South"],
        "description": "Group A Evening Rotation Window"
      }
    ],
    "letterGroups": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"]
  }
  ```

---

## 3. Adapter Design (`src/lib/integrations/ceb-outages.ts`)

### 3.1 Interface Contracts

```typescript
export const CEB_OUTAGES_API_SOURCE_ID = "ceb_outages_api" as const;
export const CEB_OUTAGES_SEED_SOURCE_ID = "ceb_outages_seed" as const;
export const SEED_FALLBACK_DISCLAIMER = "Seed fallback — live API unavailable" as const;

export const DEMAND_MGMT_GROUP_IDS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"
] as const;

export type DemandMgmtGroupId = (typeof DEMAND_MGMT_GROUP_IDS)[number];

export type OutageStatusType = "normal" | "scheduled" | "outage" | "unknown";

export interface OutageLocation {
  id: string;
  province: string;
  area: string;
  cscName?: string;
  affectedCustomers: number;
  interruptionType: string;
  startTime: string;
  estimatedRestoration?: string;
  reason?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoadSheddingWindow {
  groupId: DemandMgmtGroupId | string;
  startTime: string;
  endTime: string;
  status: "active" | "upcoming" | "completed";
  affectedAreas?: string[];
  description?: string;
}

export interface LiveOutagesResult {
  status: OutageStatusType;
  summary: string;
  totalOutages: number;
  totalAffectedCustomers: number;
  outages: OutageLocation[];
  observedAt: string;
  isFallback: boolean;
  disclaimer: string | null;
  sourceId: typeof CEB_OUTAGES_API_SOURCE_ID | typeof CEB_OUTAGES_SEED_SOURCE_ID;
}

export interface LoadSheddingScheduleResult {
  group: string;
  asOf: string;
  schedule: LoadSheddingWindow[];
  totalWindows: number;
  isFallback: boolean;
  disclaimer: string | null;
  sourceId: typeof CEB_OUTAGES_API_SOURCE_ID | typeof CEB_OUTAGES_SEED_SOURCE_ID;
}
```

### 3.2 Main Adapter Functions
1. `getLiveOutages(options?: { provinceId?: string; areaId?: string }): Promise<LiveOutagesResult>`
   - Fetches live outage data from CEB Incognito endpoints.
   - On error or timeout (>10s), returns seed fallback dataset with `isFallback: true` and `disclaimer: "Seed fallback — live API unavailable"`.

2. `getLoadSheddingSchedule(group?: string): Promise<LoadSheddingScheduleResult>`
   - Fetches active and upcoming demand management load-shedding schedules for a given letter group (A–Y) or all groups.
   - On error or timeout (>10s), returns seed schedule with `isFallback: true` and `disclaimer: "Seed fallback — live API unavailable"`.

---

## 4. Unit Test Suite Design (`src/lib/integrations/ceb-outages.test.ts`)

### 4.1 Execution Command
```bash
node --experimental-strip-types src/lib/integrations/ceb-outages.test.ts
```

### 4.2 Test Suite Structure
```typescript
import assert from "node:assert/strict";
import {
  getLiveOutages,
  getLoadSheddingSchedule,
  SEED_FALLBACK_DISCLAIMER,
  CEB_OUTAGES_API_SOURCE_ID,
  CEB_OUTAGES_SEED_SOURCE_ID,
  DEMAND_MGMT_GROUP_IDS,
} from "./ceb-outages.ts";

async function runTests() {
  // Test 1: Verify Exported Constants & Group Definitions
  assert.equal(SEED_FALLBACK_DISCLAIMER, "Seed fallback — live API unavailable");
  assert.equal(CEB_OUTAGES_API_SOURCE_ID, "ceb_outages_api");
  assert.equal(CEB_OUTAGES_SEED_SOURCE_ID, "ceb_outages_seed");
  assert.equal(DEMAND_MGMT_GROUP_IDS.length, 25);
  assert.equal(DEMAND_MGMT_GROUP_IDS[0], "A");
  assert.equal(DEMAND_MGMT_GROUP_IDS[24], "Y");

  // Test 2: Verify getLiveOutages Output Contract
  const outagesRes = await getLiveOutages();
  assert.ok(["normal", "scheduled", "outage", "unknown"].includes(outagesRes.status));
  assert.ok(typeof outagesRes.summary === "string");
  assert.ok(Array.isArray(outagesRes.outages));
  assert.ok(typeof outagesRes.totalOutages === "number");
  assert.ok(typeof outagesRes.totalAffectedCustomers === "number");
  assert.ok(outagesRes.sourceId === CEB_OUTAGES_API_SOURCE_ID || outagesRes.sourceId === CEB_OUTAGES_SEED_SOURCE_ID);

  // Test 3: Verify Disclaimer when in Fallback Mode
  if (outagesRes.isFallback) {
    assert.equal(outagesRes.disclaimer, "Seed fallback — live API unavailable");
    assert.equal(outagesRes.sourceId, CEB_OUTAGES_SEED_SOURCE_ID);
  }

  // Test 4: Verify getLoadSheddingSchedule for specific group 'A'
  const groupARes = await getLoadSheddingSchedule("A");
  assert.equal(groupARes.group, "A");
  assert.ok(Array.isArray(groupARes.schedule));
  assert.ok(groupARes.schedule.every((item) => item.groupId === "A"));

  // Test 5: Verify getLoadSheddingSchedule for all groups
  const allGroupsRes = await getLoadSheddingSchedule("all");
  assert.ok(allGroupsRes.totalWindows >= 0);

  console.log("ceb-outages.test.ts: ok");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
```

---
