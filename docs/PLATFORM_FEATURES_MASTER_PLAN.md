# Platform features master plan

**Status:** Active (Jul 2026)  
**Inventory:** `docs/PLATFORM_FEATURES_50.md` (P01–P65)  
**News deep-dive:** `docs/NEWS_RSS_MASTER_PLAN.md` (NR-0…NR-6)  
**Parent:** `docs/MASTER_PLAN.md`

This plan sequences **whole-product** features (economy, disaster, atlas, household, health, civic, retention, news slice). The inventory file wins on *what*; **this file wins on order**.

---

## 0. North star

A pinned district + money + hazard + one honest news cluster — every morning — with provenance. Features below exist to serve that habit, not to become a second government portal.

---

## 1. Phase map

| Phase | Name | Waves | Exit gate |
|-------|------|-------|-----------|
| **PF-0** | Personal morning | P-A | Home uses district pin for weather + 1 district metric; Data Saver + i18n CI green |
| **PF-1** | Money deepen | P-B | CSE notices/range + LPG district + remittance scrape path or honest seed; fuel revision pin |
| **PF-2** | Hazard harden | P-C | LECO or CEB concentration; Met∩flood pin; DMC strip; dengue WoW pin |
| **PF-3** | News foundation | P-D | Per-feed health; 7d headline store; `/news` page (see NEWS NR-1/2) |
| **PF-4** | Come back tomorrow | P-E | HTML brief + unsubscribe + archive; share OG or embed |
| **PF-5** | Atlas & civic | P-F | Compare deepen; province pulse; tenders closing-soon; research drops |
| **PF-6** | Depth | P-G | Watchlists, flood extent, COL choropleth, election night, assistant locale |

```
PF-0 ──► PF-1 ──► PF-2
  │                 │
  └────► PF-3 ◄─────┘   (news parallel after PF-0)
              │
              ▼
            PF-4 ──► PF-5 ──► PF-6
```

---

## 2. Phase detail

### PF-0 — Personal morning
**IDs:** P16, P18, P21, P07, P29, P37, P51, P55, P64  
**Why first:** Home pin is already shipped but underused; this makes Lankawa *feel* local.  
**Done when:** With a district pinned, Today shows local-ish weather and at least one of COL/AQI/dengue; new alert pin types tested; missing SI/TA keys fail CI.

### PF-1 — Money deepen
**IDs:** P01, P02, P06, P35, P10, P31  
**Done when:** Economy page answers “what moved overnight?” for FX/fuel/CSE/LPG without leaving `/economy`.

### PF-2 — Hazard harden
**IDs:** P11, P13, P19, P36, P12  
**Done when:** Power + flood + dengue signals can fire as pins with district context; DMC bulletins visible on `/disaster`.

### PF-3 — News foundation
**IDs:** P56–P58 (full NR-0…NR-2 in news master plan)  
**Done when:** Outlet-level health; durable headlines; `/news` browseable.  
**Rule:** Do not expand to 20 feeds before PF-3 store exists.

### PF-4 — Retention
**IDs:** P48–P50, P52, P54  
**Done when:** Email loop is complete (HTML + unsubscribe + archive); partners can embed brief or CSE.

### PF-5 — Atlas & civic
**IDs:** P22–P24, P27, P42, P47  
**Done when:** Compare and province pages carry household/health signals; tenders and research drops are useful weekly.

### PF-6 — Depth
**IDs:** remaining P03, P14–P15, P33, P40, P43, P46, P53, P61+  
**Gate:** PF-0…PF-2 green for 14 days (Today layers not regressing) before satellite/ETL-heavy items.

---

## 3. Cross-links

| If you are building… | Read |
|----------------------|------|
| News feeds/clusters/brief | `NEWS_RSS_MASTER_PLAN.md` |
| Satellite / weather APIs | `DATA_EXPANSION_RESEARCH.md` |
| UI brand rules | `BRAND.md` |
| Whole platform gates | `MASTER_PLAN.md` |

---

## 4. Definition of done (program)

1. PF-0 personalization live for pinned district.  
2. PF-1–PF-2 money + hazard pins useful without news.  
3. PF-3 news store + `/news` (not source-page dump).  
4. PF-4 email unsubscribe + archive.  
5. Inventory P01–P65 marked as shipped/deferred with links to PRs.  
6. Parked list in `PLATFORM_FEATURES_50.md` still parked.

---

## 5. Immediate next build (suggested)

```
1 P64 i18n CI gate          (cheap, protects all waves)
2 P16 + P21 personal weather/pack
3 P51 alert pin expansion
4 P01 + P02 CSE deepen
5 P56 + P57 news canary + store   (start PF-3)
```
