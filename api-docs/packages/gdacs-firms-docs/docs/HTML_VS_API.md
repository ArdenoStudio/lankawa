# HTML scrape vs API — `gdacs-firms-docs`

**GDACS + NASA FIRMS** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| XML / CAP feed (`xml_cap`) | 1 |
| CSV download (`csv_download`) | 1 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `gdacs_events_rss` | `xml_cap` | GET | `/xml/rss.xml` | GDACS multi-hazard RSS. |
| `firms_csv_lk` | `csv_download` | GET | `/api/area/csv/.../VIIRS_SNPP_NRT/{bbox}/{days}` | FIRMS hotspot CSV for LK bbox (needs MAP_KEY). |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
