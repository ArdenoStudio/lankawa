# HTML scrape vs API — `cse-api-docs-deepen`

**CSE (cse.lk) API — deepen pack** · Tier A

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 5 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `top_gainers` | `json_api` | POST | `/topGainers` | Dedicated top gainers board. |
| `top_looses` | `json_api` | POST | `/topLooses` | Dedicated top losers (CSE spelling). |
| `sector_52_week` | `json_api` | POST | `/52WeekSectors` | 52-week / YTD sector ranges. |
| `trade_summary` | `json_api` | POST | `/tradeSummary` | Full board — primary poller; client-side page in lab. |
| `get_announcement_by_company` | `json_api` | POST | `/getAnnouncementByCompany` | Company announcements by symbol. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
