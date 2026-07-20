# Platform features master plan

**Status:** PF-0…PF-6 shipped in code (Jul 2026) — merge via `cursor/platform-features-build-3c69`  
**Inventory:** `docs/PLATFORM_FEATURES_50.md` (P01–P65)  
**News deep-dive:** `docs/NEWS_RSS_MASTER_PLAN.md` (NR-0…NR-6)  
**Parent:** `docs/MASTER_PLAN.md`  
**Merge order:** See §5 below.

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

## 5. Merge order (avoid oversights)

Already on `main` (do not re-merge): **#5–#16** (charts, data expansion, news RSS backlog/plan, platform feature docs).

**Ship next as one PR** from `cursor/platform-features-build-3c69` → `main` (covers PF-0…PF-6 / P01–P65 scaffolds). After CI green:

1. Merge that PR.  
2. Redeploy Vercel **Production** from `main`.  
3. Set ops env if missing: `NASA_FIRMS_MAP_KEY`, `TELEGRAM_OPS_BOT_TOKEN` + `TELEGRAM_OPS_CHAT_ID`, OpenAQ key if used, Resend for HTML brief.

If you ever **split** this mega-branch into smaller PRs, merge in this dependency order only:

| Order | Slice | Why first |
|------:|-------|-----------|
| 1 | Foundation: i18n CI (`check:i18n`), alert pins + tests, Data Saver gates | Protects every later UI change |
| 2 | News: feed health, 7d archive, `/news`, clusters, Atom `?since=` | Brief/retention cite headlines |
| 3 | Retention: HTML brief email, unsubscribe, `/brief/[date]`, embeds, morning OG | Depends on news + pulse |
| 4 | Home personalization: district pack, hazard toast, AQI Today, weather coords | Core habit loop |
| 5 | Economy: CSE notices/range/watchlist, LPG district, COL movers, energy, treasury, remittance path | Money deepen |
| 6 | Disaster: LECO, DMC strip, power concentration, GloFAS/GFM, cyclone, Met∩flood | Hazard harden |
| 7 | Atlas/civic: compare deepen, province pulse, tenders closing, research drops, district press | After home pin exists |
| 8 | Depth scaffolds: choropleth, marine, NDVI cron stub, election night, web push UI, webhooks, widget.js | Lowest urgency; seed-honest |

Do **not** merge depth (8) before foundation (1) or you lose the i18n CI safety net.
