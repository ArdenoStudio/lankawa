# HTML scrape vs API — `hnb-venus-api-docs`

**HNB Venus API** · Tier A

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 7 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `get_exchange_rates_contents_web` | `json_api` | GET | `/get_exchange_rates_contents_web` | FX contents for web. |
| `get_all_web_card_promos` | `json_api` | GET | `/get_all_web_card_promos` | ~841 card promos paginated. |
| `get_interest_rates_contents` | `json_api` | GET | `/get_interest_rates_contents` | Nested FD/savings/loans tables in table_data_approved. |
| `get_web_card_promo` | `json_api` | GET | `/get_web_card_promo` | Single promo detail by id. |
| `get_rates_contents_web` | `json_api` | GET | `/get_rates_contents_web` | FX + deposit teaser with updated_on stamp. |
| `get_exchange_rate_last_update_date_contents` | `json_api` | GET | `/get_exchange_rate_last_update_date_contents` | As-of stamp for FX board. |
| `get_all_web_card_promos_debit` | `json_api` | GET | `/get_all_web_card_promos` | Debit card promos (~93); includes Glomark supermarket. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
