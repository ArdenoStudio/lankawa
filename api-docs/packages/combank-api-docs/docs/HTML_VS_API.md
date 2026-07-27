# HTML scrape vs API — `combank-api-docs`

**Commercial Bank API** · Tier A

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 2 |
| HTML scrape (`html_scrape`) | 1 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `exchange_rates` | `json_api` | GET | `/api/exchange-rates` | Multi-currency TT/DD rates JSON (USD TT buy/sell). |
| `interest_rates_fd` | `json_api` | GET | `/api/interest-rates-fd` | FD ladder array: paidIn, period (months), rate. |
| `rewards_promotions_html` | `html_scrape` | GET | `/rewards-promotions` | HTML rewards list (~72); supermarket DOW scrape. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
