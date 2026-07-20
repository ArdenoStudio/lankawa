# HTML scrape vs API — `sc-hsbc-offers-park-docs`

**Standard Chartered + HSBC LK offers (park notes)** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| Parked (do not scrape / stale) (`parked`) | 2 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `sc_tgl_offers_json_parked` | `parked` | GET | `/lk/offers.json` | PARK — TGL offers.json mostly expired on probe. |
| `hsbc_retail_parked` | `parked` | GET | `/` | PARK — HSBC LK retail sold to NTB; offer URLs dead. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
