# HTML scrape vs API — `cbsl-public-data-docs`

**CBSL Public Data** · Tier A

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 2 |
| PDF / document index (`pdf_document`) | 1 |
| HTML scrape (`html_scrape`) | 3 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `plrates_html` | `html_scrape` | GET | `/en/rates-and-indicators/policy-rates` | Policy rates page (OPR / corridor context). |
| `historical_policy_xlsx` | `html_scrape` | GET | `/historical_policy_interest_rates.xlsx` | Historical SDFR/SLFR/OPR Excel tip. |
| `eresearch_tbill_6169` | `json_api` | GET | `/eresearch/.../6169` | Secondary market T-bill yields (91/182/364). |
| `eresearch_awpr_6277` | `json_api` | GET | `/eresearch/.../6277` | Weekly AWPR series. |
| `payments_bulletin_index` | `pdf_document` | GET | `/en/payments-and-settlements/payments-bulletin` | Payments bulletin PDF index. |
| `fx_buying_selling_html` | `html_scrape` | GET | `/en/rates-and-indicators/exchange-rates` | CBSL indicative FX HTML tables. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
