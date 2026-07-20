# HTML scrape vs API — `open-meteo-lk-docs`

**Open-Meteo Sri Lanka Recipes** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 3 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `forecast_colombo` | `json_api` | GET | `/v1/forecast` | Colombo daily forecast. |
| `air_quality_colombo` | `json_api` | GET | `/v1/air-quality` | Colombo air quality. |
| `marine_colombo` | `json_api` | GET | `/v1/marine` | Colombo marine wave height. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
