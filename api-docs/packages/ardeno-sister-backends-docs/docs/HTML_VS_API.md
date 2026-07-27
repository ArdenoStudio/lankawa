# HTML scrape vs API — `ardeno-sister-backends-docs`

**Ardeno Sister Backends** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 3 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `foodlk_openapi` | `json_api` | GET | `food-platform-backend.fly.dev/openapi.json` | FoodLK OpenAPI. |
| `octane_prices` | `json_api` | GET | `octane-api.fly.dev/v1/prices/latest` | Octane latest prices. |
| `life_health` | `json_api` | GET | `life-platform-api.fly.dev/health` | Life platform health (host may vary). |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
