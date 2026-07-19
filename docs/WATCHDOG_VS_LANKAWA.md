# Watchdog vs Lankawa — what they do, what we do better

## What Team Watchdog does well

[Team Watchdog](https://github.com/team-watchdog) is an open-source research collective. Their relevant work:

| Project | Job | Strength |
|---------|-----|----------|
| **satellite2024** | Annual Sentinel-2 mosaics + ML land-cover grids for SL (2017–2024) | Deep research artifacts; journalism-ready full-country JPGs; MIT licence |
| **databank-sri-lanka** | GitHub-hosted curated civic CSVs | Transparent contribution via PRs; good for debt/health/transport tables |
| **colombo-skylines** | Cities: Skylines digital twin | Narrative / education, not an API |
| **Elixir / Kitchen** | Crisis-era mutual aid tools | Time-bound interventions |

Watchdog optimizes for **research publish + narrative**. Maps are large, annual, offline-first. Databank is a filing cabinet for datasets.

## What Lankawa already does better (keep)

| Axis | Watchdog | Lankawa |
|------|----------|---------|
| Cadence | Annual / static | Daily morning surface + freshness tiers |
| UX | Drive folders, GitHub, essays | Trilingual product UI, district atlas |
| Provenance | README / MIT credit | `/sources/{id}` + FreshnessBadge on every number |
| Live federation | Rarely | Octane, PropertyLK, CEB, Met, Life, flood… |
| Retention | N/A | D1/D7, home pin, share, PWA |

We should **not** try to out-map them with 27GB mosaics inside this Next.js app.

## How we reworked satellite2024 into *our* thing

**Their artifact:** beautiful full-island imagery for journalists to open in a browser.

**Our product:** **Land Change Pulse** — district-scale indices you can check in the morning next to AQI, with the same honesty contract as FX/fuel.

### Shipped

1. Curated **district greenery / built-up index** series (2018 → 2024) as small JSON — not their JPG tiles.
2. `/environment` national deltas, top movers, full district table, citation + PNG chart export.
3. District atlas cards (`DistrictLandPulse`) on every district page.
4. Methodology page `/environment/land-change` explaining Watchdog prior art vs Lankawa product job.
5. API `GET /api/v1/environment/land-change` + CSV/JSON export `GET /api/v1/export/land-change`.
6. Source registry `lankawa_land_pulse` with freshness + methodology.

### Later (year-2 ETL)

- Own Sentinel composite pipeline (or consume Watchdog grids via offline job) → write `observations` (`greenery_index`, `builtup_index` per district/year).
- Compare-year control on `/environment`.
- Still never host multi‑GB mosaics in git/Vercel.

## How we reworked databank into *our* thing

**Their artifact:** GitHub CSVs for researchers to download.

**Our product:** normalize chosen series into Lankawa seeds/APIs with `/sources` provenance.

### Shipped — Foreign Debt Pulse

1. Normalized Watchdog databank **Foreign Debt Composition (2004–2020)** into `src/data/foreign-debt-composition.json`.
2. Economy page chart (commercial vs concessionary) with citation + PNG export.
3. API `GET /api/v1/economy/debt` + export `GET /api/v1/export/foreign-debt`.
4. Source registry `lankawa_debt_pulse` — credits Watchdog discovery + CBSL primary figures.
5. Explicit honesty: historical share series, not a live post-restructuring debt dashboard.

### Next databank candidates

- Clean NCPI / debt / transport tables when fresher than our scrapes.
- Still re-host normalized JSON in Lankawa — never “go read the GitHub folder” as the UX.

## Explicit non-goals (Watchdog-adjacent)

- Protest tracker datasets in product UI  
- Skylines / digital-twin embeds  
- Claiming official land-use authority  
- Competing on full-res satellite gallery hosting  

## One-line positioning

> Watchdog publishes deep research maps and curated CSVs. Lankawa turns civic signals into a daily, trilingual, provenance-first morning check — land-change and debt pulses stay small, API-shaped, and district-addressable.
