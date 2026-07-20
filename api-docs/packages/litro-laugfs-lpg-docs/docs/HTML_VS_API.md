# HTML scrape vs API — `litro-laugfs-lpg-docs`

**Litro + LAUGFS LPG price pages** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| HTML scrape (`html_scrape`) | 2 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `litro_prices` | `html_scrape` | GET | `litrogas.com/` | Litro cylinder price HTML scrape surface. |
| `laugfs_prices` | `html_scrape` | GET | `laugfs.lk/` | LAUGFS LPG price HTML. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
