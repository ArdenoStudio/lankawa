# HTML scrape vs API — `foodlk-api-docs`

**FoodLK / Food Platform API** · Tier A

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 4 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `openapi` | `json_api` | GET | `/openapi.json` | Full OpenAPI (41 paths). |
| `hub_manifest` | `json_api` | GET | `/api/v1/hub/manifest` | Often 200 when hub/summary is 500. |
| `hub_summary` | `json_api` | GET | `/api/v1/hub/summary` | Preferred Lankawa surface — frequently 500. |
| `basket_estimate` | `json_api` | GET | `/api/v1/basket/estimate` | Essentials staples preset. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
