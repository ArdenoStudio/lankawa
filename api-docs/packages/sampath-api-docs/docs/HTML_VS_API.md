# HTML scrape vs API — `sampath-api-docs`

**Sampath Bank API** · Tier A

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 3 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `exchange_rates` | `json_api` | GET | `/api/exchange-rates` | TTBUY/TTSEL FX JSON. |
| `rates_and_charges_external` | `json_api` | GET | `/api/rates-and-charges/external` | local.term_and_deposite FD slabs + savings. |
| `card_promotions_super_markets` | `json_api` | GET | `/api/card-promotions` | Supermarket card offers JSON. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
