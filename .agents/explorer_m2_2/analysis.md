# Milestone 2 (R2): UI Integration & Source Registration Analysis

## Executive Summary
This analysis details the UI integration, component design, source registration, and fallback disclaimer display for Milestone 2 (Utilities & Energy Outage Monitoring).

- **Scope**: `/economy` page, `/disaster` page, scheduled load-shedding breakdown (letter groups A–Y), source registration in `src/lib/sources.ts` (`ceb_outages_api`, `ceb_outages_seed`), and explicit seed fallback handling (`"Seed fallback — live API unavailable"`).
- **Core Strategy**: Enhance existing page structures with interactive, high-polish (UI/UX Pro Max) outage components powered by `ceb-outages.ts` adapter, linking all displayed metrics to `/sources/[id]` with full provenance honesty.

---

## 1. Examination of Existing `/economy` and `/disaster` Pages

### 1.1 `/economy` Page Structure (`src/app/[locale]/economy/page.tsx`)
- **Current Role**: Serves as the central living-cost, macroeconomic, and household energy dashboard.
- **Power & Energy Layout**:
  - `HouseholdEnergySection`: Combines retail fuel prices (Petrol 92, Auto Diesel), LPG cylinder prices (Litro, LAUGFS), PUCSL domestic electricity tariff teaser (90 kWh slab estimate), and accepts `clustersStrip={<DemandMgmtClustersStrip />}`.
  - `DemandMgmtClustersStrip`: Calls `fetchDemandMgmtClustersSnapshot()` to show letter group tiles (A–Y) with customer counts and cluster counts.
  - `PucslTariffCard`: Progressive domestic electricity tariff block calculator and slab breakdown.
  - `PucslGenerationMixSpark`: Hydro/thermal/renewable generation mix shares.
- **Gaps Identified**:
  - `DemandMgmtClustersStrip` only displays aggregate customer/cluster numbers without schedule time slots (e.g. 08:30–11:30) or active load-shedding status per group.
  - Does not currently connect live power status with letter group schedule windows.

### 1.2 `/disaster` Page Structure (`src/app/[locale]/disaster/page.tsx`)
- **Current Role**: Serves as the real-time hazard, emergency monitoring, and disaster risk dashboard.
- **Power Outage Layout**:
  - Calls `fetchPowerStatus()` (`sourceId: "ceb_power"`) and `fetchLECOOutages()` (`sourceId: "leco_power"`).
  - Renders a 2-column Power Supply Status grid:
    - **CEB Power Card**: Shows `status` (`normal`, `scheduled`, `outage`, `unknown`), observed timestamp, summary text, and affected areas list.
    - **LECO Interruption Notices Card**: Shows `status`, freshness badge, summary text, seed warning, affected areas list, and link to `/sources/leco_power`.
  - Renders **Power Outage Concentration Section**: Calls `powerConcentrationByDistrict(...)` to group affected areas by district and link to `/districts/[slug]`.
- **Gaps Identified**:
  - CEB card uses legacy `ceb_power` source ID without letter group schedule context.
  - Missing load-shedding letter group breakdown (A–Y) on `/disaster` for emergency responders and citizens.
  - Needs explicit seed fallback disclaimer (`"Seed fallback — live API unavailable"`) when CEB Care Incognito endpoints are down.

---

## 2. Component Integration Design (Live Power Status & Load-Shedding Groups A–Y)

### 2.1 Component Hierarchy
```
src/components/
├── CebLoadSheddingCard.tsx       # Interactive scheduled load-shedding group breakdown (A–Y)
├── CebLiveOutageStatusCard.tsx   # Live power supply status card with active area tags
└── HouseholdEnergySection.tsx    # Extended to host CebLoadSheddingCard
```

### 2.2 `CebLoadSheddingCard` Component Design
- **Target Location**: `/economy` (inside `HouseholdEnergySection`) and `/disaster` (Power Outage Hub).
- **Features & UI/UX Pro Max Polish**:
  - **Header & Provenance**: Title, subtitle, `FreshnessBadge`, and source link to `/sources/ceb_outages_api` (or `/sources/ceb_outages_seed` when in seed fallback mode).
  - **Fallback Banner**: When `snapshot.isSeed === true`, displays a prominent alert banner: `"Seed fallback — live API unavailable"`.
  - **Summary Metrics**: Total active group windows, total upcoming group windows, total affected customers (formatted with `formatCustomerCount`).
  - **Letter Group Grid (A–Y)**: A 5x5 responsive letter group matrix.
    - Tile states:
      - 🔴 **Active Outage**: Group currently in an active load-shedding window (`bg-rose-500/10 border-rose-500/30 text-rose-300`).
      - 🟡 **Scheduled Today**: Group with upcoming scheduled window (`bg-amber-500/10 border-amber-500/30 text-amber-300`).
      - 🟢 **Normal / Clear**: No scheduled cuts today (`bg-emerald-500/10 border-emerald-500/30 text-emerald-300`).
      - ⚪ **Seed / Unknown**: (`bg-white/5 border-white/10 text-slate-400`).
  - **Group Drawer (Framer Motion)**: Clicking a letter group tile expands a spring-animated detail drawer showing:
    - Scheduled time slots (e.g. `08:30 – 11:30 (Daytime)`, `17:30 – 19:30 (Peak)`).
    - Affected Feeding Areas / Substation names (e.g. `Kolonnawa GSS`, `Kelaniya Feeder 04`).
    - District mapping links to `/districts/[slug]`.

### 2.3 `CebLiveOutageStatusCard` Component Design
- **Target Location**: `/disaster` (Power Status grid) & Home page pulse.
- **Features**:
  - Status badge: `NORMAL`, `SCHEDULED_CUTS`, `ACTIVE_OUTAGES`, `UNKNOWN`.
  - Area Pills: List of affected areas with direct links to district profiles `/districts/[slug]`.
  - Source Link: Links directly to `/sources/ceb_outages_api` (or `/sources/ceb_outages_seed`).

---

## 3. Source Registration Plan in `src/lib/sources.ts`

To ensure full provenance tracking and compliance with Lankawa interface contracts, two new sources must be added to `SOURCES` in `src/lib/sources.ts`:

### 3.1 Live API Source Definition
```typescript
  {
    id: "ceb_outages_api",
    name: "Ceylon Electricity Board (CEB Care API)",
    category: "disaster",
    url: "https://cebcare.ceb.lk/Incognito/OutageMap",
    cadenceMinutes: 15,
    adapter: "api",
    description:
      "Live power outage map and scheduled load-shedding schedules (letter groups A–Y) from CEB Care.",
    methodology:
      "Server-side polling of CEB Care Incognito APIs (`GetLoadSheddingEvents`, `GetOutageLocationsInArea`, `GetDemandMgmtClusters`) with 10s AbortController timeout and 15-minute revalidate caching. Surfaces active breakdown locations, scheduled time slots for letter groups A–Y, and total affected customer counts on /disaster and /economy.",
    metrics: [
      "ceb_power_status",
      "ceb_load_shedding_groups",
      "ceb_outage_areas",
      "ceb_affected_customers",
    ],
  },
```

### 3.2 Static Seed Fallback Source Definition
```typescript
  {
    id: "ceb_outages_seed",
    name: "CEB Outages & Load-Shedding Seed Data",
    category: "disaster",
    url: "https://lankawa.vercel.app/disaster",
    cadenceMinutes: 10080,
    adapter: "seed",
    description:
      "Curated fallback dataset for CEB power outages and load-shedding group breakdowns (A–Y).",
    methodology:
      "Embedded static seed (`src/data/ceb-outages-seed.json`) used when CEB Care Incognito endpoints are unreachable or time out. Surfaces explicit disclaimer: 'Seed fallback — live API unavailable' across UI components and provenance detail pages.",
    metrics: [
      "ceb_power_status_seed",
      "ceb_load_shedding_groups_seed",
      "ceb_outage_areas_seed",
    ],
  },
```

### 3.3 Dynamic Route Integration (`/sources/[id]`)
- `generateStaticParams()` in `src/app/[locale]/sources/[id]/page.tsx` dynamically maps over `SOURCES`.
- Adding `ceb_outages_api` and `ceb_outages_seed` automatically registers static routes at:
  - `/sources/ceb_outages_api`
  - `/sources/ceb_outages_seed`
- `getSourceProvenancePath("ceb_outages_api")` resolves to `/sources/ceb_outages_api`.
- `getSourceProvenancePath("ceb_outages_seed")` resolves to `/sources/ceb_outages_seed`.

---

## 4. Fallback Disclaimer Display Plan

### 4.1 Verbatim Contract Compliance
- `PROJECT.md` contract requires: `"Seed fallback — live API unavailable"`.
- Shared constant export in adapter `src/lib/integrations/ceb-outages.ts`:
  ```typescript
  export const SEED_FALLBACK_DISCLAIMER = "Seed fallback — live API unavailable";
  ```

### 4.2 UI Component Rendering Logic
Whenever an outage snapshot has `isSeed === true`:
1. **Disclaimer Banner**:
   ```tsx
   {snapshot.isSeed && (
     <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
       <span className="font-semibold">⚠️</span>
       <span>{SEED_FALLBACK_DISCLAIMER}</span>
     </div>
   )}
   ```
2. **Provenance Target**:
   - `getSourceProvenancePath(snapshot.isSeed ? "ceb_outages_seed" : "ceb_outages_api")`
3. **Pulse & Health Metric**:
   - `health.error = snapshot.isSeed ? "Seed fallback — live API unavailable" : null`
   - `health.tier = snapshot.isSeed ? "stale" : computeFreshnessTier(...)`

---

## 5. Verification Plan

1. **Source Route Verification**:
   - Inspect `src/lib/sources.ts` for `ceb_outages_api` and `ceb_outages_seed`.
   - Verify `getSource("ceb_outages_api")` and `getSource("ceb_outages_seed")` return valid `SourceDefinition` objects.
2. **Page Integration Verification**:
   - Check `/economy` page imports and mounts `CebLoadSheddingCard` under `HouseholdEnergySection`.
   - Check `/disaster` page mounts `CebLiveOutageStatusCard` and letter group grid.
3. **Fallback Disclaimer Verification**:
   - Verify string constant matches `"Seed fallback — live API unavailable"` verbatim.
   - Test seed fallback mode to ensure disclaimer banner renders properly on UI components.
