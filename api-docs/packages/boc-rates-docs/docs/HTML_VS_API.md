# HTML scrape vs API — `boc-rates-docs`

**Bank of Ceylon Rates** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| Hybrid (API bootstrap + HTML) (`hybrid`) | 1 |
| Parked (do not scrape / stale) (`parked`) | 1 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `rates_tariff_html` | `hybrid` | GET | `/rates-tariff` | Canonical FX + FD HTML — prefer over stale JSON. |
| `interest_rates_fd_json_parked` | `parked` | GET | `/api/interest-rates-fd` | PARK — live JSON but wrong vs rates-tariff HTML. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
