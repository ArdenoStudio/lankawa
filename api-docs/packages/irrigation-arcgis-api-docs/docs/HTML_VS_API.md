# HTML scrape vs API — `irrigation-arcgis-api-docs`

**Irrigation ArcGIS Gauges** · Tier A

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| ArcGIS FeatureServer / query API (`arcgis_api`) | 2 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `gauges_2_view_query` | `arcgis_api` | GET | `/gauges_2_view/FeatureServer/0/query` | Latest river gauge readings. |
| `rainfall_24hr` | `arcgis_api` | GET | `/24hr_rainfall/FeatureServer/0/query` | 24-hour rainfall FeatureServer. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
