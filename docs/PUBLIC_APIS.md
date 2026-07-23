# Public APIs research (July 2026)

Catalog pass against [public-apis](https://github.com/public-apis/public-apis) and related free civic/finance feeds for Sri Lanka coverage. Goal: honest adapters with LankawaBot UA, short timeouts, and **null/empty on failure** — never invent live numbers.

## Adopted

| Source | Adapter | Why |
|--------|---------|-----|
| **fawazahmed0 currency-api** | `src/lib/integrations/market-fx.ts` | Free USD→LKR mid, no key; jsDelivr + Pages.dev mirror. Complements CBSL official band. |
| **World Bank WDI** | `src/lib/integrations/world-bank.ts` | LKA GDP growth, CPI, population via `mrnev=1`. Weekly cadence; null if all indicators fail. |
| **Open-Meteo Geocoding** | `src/lib/integrations/geocode.ts` | LK place search → district slug for assistant fallback. |
| **CoinGecko (optional)** | `src/lib/integrations/coingecko.ts` | BTC→LKR chip beside remittance — omit UI when down. |

API routes: `GET /api/v1/economy/market-fx`, `GET /api/v1/economy/world-bank`. Provenance: `/sources/market_fx_fawaz`, `/sources/world_bank_lka`, `/sources/open_meteo_geocoding`, `/sources/coingecko_btc_lkr`.

## Rejected (and why)

| Candidate | Reason |
|-----------|--------|
| **Frankfurter** | No LKR in the ECB-derived set. |
| **VATComply** | No LKR in rates payload. |
| **Nager.Date** | No Sri Lanka public-holiday country code (`AvailableCountries` empty for LK). |
| **REST Countries** | Upstream deprecated / returns deprecation JSON — not production-safe. |
| **HPB COVID Tracker (LK)** | Endpoints 404 — abandoned post-pandemic. |
| **exchangerate.host** | Now requires `access_key` (no longer free anonymous). |
| **LibreTranslate** | No Sinhala / Tamil language support. |
| **TransitLand / OpenSky / city GTFS APIs** | No usable Sri Lanka GTFS coverage; keep seed transport directory. |
| **Open Food Facts** | Packaged SKUs ≠ household staples / COL basket. |
| **IQAir / PurpleAir** | Key / paid; OpenAQ + Open-Meteo AQ already cover the gap. |
| **US Data.gov / FRED-only / city 311** | Geography mismatch for a Sri Lanka civic surface. |
| **fixer.io / currencyapi.com** | Paid / key-required for reliable LKR. |

## Already covered in Lankawa

These public feeds were already integrated before this pass:

- Open-Meteo forecast / flood / marine / air quality
- OpenAQ (LK overlay)
- USGS earthquakes
- GDACS multi-hazard
- NASA FIRMS hotspots

## Next candidates

| Candidate | Notes |
|-----------|-------|
| **Calendarific** | Holidays — needs key; evaluate paid vs seed calendar. |
| **Nominatim (OSM)** | Geocode alternative; heavier ToS / rate limits than Open-Meteo. |
| **CoinGecko** | Shipped as optional BTC/LKR chip; could extend to USDT/LKR later. |
| **Wikipedia / Wikidata** | District intros — attribution + staleness care. |
| **IMF / ADB open data** | Macro complements; heavier XML/CSV pipelines. |

## Honesty rules

1. Prefer `null` / empty arrays over curated fake “live” tips for these free feeds.
2. Label market FX and World Bank as **not CBSL official**.
3. Register every source in `src/lib/sources.ts` with methodology + catalog-health probe URLs.
