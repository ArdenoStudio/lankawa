# HTML scrape vs API — `harti-cbsl-food-pdf-docs`

**HARTI + CBSL Food Price PDFs** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| PDF / document index (`pdf_document`) | 2 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `harti_daily_prices_index` | `pdf_document` | GET | `/market-information/daily-prices` | HARTI daily price PDF index. |
| `cbsl_weekly_food` | `pdf_document` | GET | `/en/statistics/economic-indicators` | CBSL food/economic indicator PDF entry points. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
