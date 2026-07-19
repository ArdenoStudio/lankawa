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

## How we rework satellite2024 into *our* thing

**Their artifact:** beautiful full-island imagery for journalists to open in a browser.

**Our product:** a **Land Change Pulse** — district-scale indices you can check in the morning next to AQI, with the same honesty contract as FX/fuel.

### Lankawa Land Pulse (ship now)

1. Curated **district greenery / built-up index** series (2018 → 2024) as small JSON in-repo — not their JPG tiles.
2. Methodology inspired by public Sentinel LULC practice (and credit Watchdog as prior art / inspiration).
3. Environment page section:
   - National greenery Δ and built-up Δ
   - Top districts losing greenery / gaining built-up
   - Freshness = seed/curated until we run our own yearly ETL
4. Attribution footer: “Land-cover research inspired by Team Watchdog satellite2024 (MIT). Lankawa indices are our own district aggregation for civic pulse use — not official Survey Dept land use.”

### Later (year-2 ETL)

- Own Sentinel composite pipeline (or consume Watchdog grids via offline job) → write `observations` (`greenery_index`, `builtup_index` per district/year).
- Compare-year control on `/environment`.
- Still never host multi‑GB mosaics in git/Vercel.

## How we rework databank into *our* thing

Use databank as a **discovery index**, then:

1. Normalize chosen series into Lankawa `src/data/*` or cron observations.
2. Surface on economy/health/transport with our source registry.
3. Prefer Lankawa APIs (`/api/v1/...`) over “go read the GitHub folder.”

## Explicit non-goals (Watchdog-adjacent)

- Protest tracker datasets in product UI  
- Skylines / digital-twin embeds  
- Claiming official land-use authority  
- Competing on full-res satellite gallery hosting  

## One-line positioning

> Watchdog publishes deep research maps. Lankawa turns civic signals into a daily, trilingual, provenance-first morning check — including a land-change pulse that stays small, live-shaped, and district-addressable.
