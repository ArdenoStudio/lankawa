# HTML scrape vs API — `amana-union-cargills-bank-docs`

**Amana / Union / Cargills Bank rates & offers** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| HTML scrape (`html_scrape`) | 3 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `amana_rates` | `html_scrape` | GET | `amanabank.lk/rates/` | Amana rates pages (Islamic products). |
| `union_bank_offers` | `html_scrape` | GET | `unionb.com/.../offers` | Union Bank card offers HTML. |
| `cargills_bank_rates` | `html_scrape` | GET | `cargillsbank.com/rates-and-tariffs/` | Cargills Bank rates & tariffs. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
