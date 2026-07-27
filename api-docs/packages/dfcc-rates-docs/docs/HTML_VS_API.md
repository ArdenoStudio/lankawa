# HTML scrape vs API — `dfcc-rates-docs`

**DFCC Rates & Card Offers** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| HTML scrape (`html_scrape`) | 3 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `interest_rates_page` | `html_scrape` | GET | `/interest-rates/` | RSC-embedded deposit/loan rates. |
| `exchange_rates_page` | `html_scrape` | GET | `/exchange-rates/` | FX rates page. |
| `card_offers_supermarket` | `html_scrape` | GET | `/personal/cards/card-offers/` | Card offers hub (supermarket DOW scrape). |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
