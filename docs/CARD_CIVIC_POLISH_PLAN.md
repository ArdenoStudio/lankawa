# Card + civic polish plan (Jul 2026)

**Branch:** `cursor/card-civic-polish-3c69`  
**Product rule:** Thin morning civic strip — not a deals site. Monochrome B&W.

## Already shipped (from live-data wave)

| Item | Status |
|------|--------|
| Sampath / HNB / Visa JSON card offers | [x] Done |
| Pan Asia / DFCC / ComBank / People's / NTB MC HTML | [x] Done |
| Remittance JSON (ComBank/HNB/Seylan/Sampath) + People's/NDB/NSB HTML | [x] Done |
| Irrigation ArcGIS, CEB clusters, NWSDB bill, CSE deepen | [x] Done |
| Full `SupermarketCardDays` list UI | [x] Done |
| Live+seed merge + coverage honesty (`mergeTodaysLiveWithSeed`) | [x] Done |
| `card_day` alert pin + MorningDelta chip | [x] Done |
| Remittance board live/mixed/seed density tags | [x] Done |

## Gaps this wave closes

1. [x] **Compact “Today’s supermarket card days”** — `rankTopCardOffers` + compact strip on `/food`, `/cost-of-living`; economy fuller list (`limit=8`); home MorningDelta chip
2. [x] **BOC** supermarket HTML parser + fetch (browser UA; WAF → empty → seed)
3. [x] **NTB Amex** supermarket-offers hub — parsers + seed + wired (WAF → seed)
4. [x] **Amana** debit Glomark Wed (`data-ics`)
5. [x] **NDB** `/cards/card-offers` supermarket slice — parsers + seed + wired
6. [x] **CBSL payments bulletin** quarterly seed strip on `/economy`
7. [x] **Singer EMI** thin household chip on `/economy` (Softlogic per-SKU parked)
8. [x] **UI polish** — list-group compact rows, mono remittance stats, `lk-motion-*` fade/slide/underline (+ `prefers-reduced-motion`)
9. [x] **Park confirmed:** MyPromo, hotels/EMI hospitals, HSBC, telco packs, PickMe, GTFS, wallets-as-offers

## Component inspiration (patterns only — keep B&W)

| Source | Steal |
|--------|-------|
| HyperUI / shadcn list groups | Compact 1–3 row strip with merchant · bank · % |
| Tremor | Dense mono metric labels for remittance best buy/sell |
| React Bits / Animated Beam | Subtle underline/fade on strip enter (prefers-reduced-motion) |
| Cult UI / Watermelon | Avoid — too colorful; only density ideas |

## Ten improvement loops

Each loop: scan → implement → test → commit-ready.

1. [x] Compact strip + `rankTopCardOffers(3)` — **Done** (`formatCompactOfferLine`, top-3 civic rows)
2. [x] Wire compact on food/COL/home; economy `limit=8` — **Done**
3. [x] BOC + Amana parsers (wired into `getTodaysCardOffers`) — **Done** (WAF/empty → seed; Amana Wed Glomark)
4. [x] NTB Amex + NDB card parsers — **Done** (Amex hub/detail; NDB supermarket HTML)
5. [x] Dedupe merchants; prefer higher % / weekday match / live (`rankTopCardOffers` + `dedupeOffers`) — **Done**
6. [x] Remittance board Tremor-like density polish — **Done** (mono best buy/sell + coverage tags)
7. [x] CBSL payments bulletin seed — **Done** (`payments-bulletin.ts` + strip + unit test)
8. [x] Singer EMI optional chip (Softlogic SKU crawl parked) — **Done** (`HouseholdEmiStrip`)
9. [x] Motion + a11y + i18n sync (`lk-motion-*`, focus-visible, i18n compact strings) — **Done**
10. [x] Docs survey sync (§0) + live smoke — **Done** (see counts below)

## Loop 10 live smoke (2026-07-20, ~5.3s via tsx)

**Card days** (`getTodaysCardOffers`): partial live — **10 total** (9 live / 1 seed). Live: Sampath 1, HNB 1, ComBank 2, People's 1, NTB 4; seed gap: Pan Asia 1. BOC/Amana wired but no today-match this run (Amana is Wed Glomark; BOC WAF/empty). Visa/DFCC also no today-match.

**Remittance TT** (`fetchRemittanceTtSnapshot`): **9 banks** wired (ComBank/HNB/Seylan/Sampath JSON + People's/NDB/NSB/BOC/DFCC HTML). BOC uses `rates-tariff` HTML (POST FX API still 500). Earlier smoke was 7/7 before BOC/DFCC.
