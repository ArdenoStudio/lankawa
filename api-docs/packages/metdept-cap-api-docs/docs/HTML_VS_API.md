# HTML scrape vs API — `metdept-cap-api-docs`

**Met Dept CAP / Advisories** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| XML / CAP feed (`xml_cap`) | 3 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `cap_en_rss` | `xml_cap` | GET | `/images/XML/cap_en.xml` | CAP English warnings RSS/XML. |
| `cap_si_rss` | `xml_cap` | GET | `/images/XML/cap_si.xml` | CAP Sinhala warnings. |
| `cap_ta_rss` | `xml_cap` | GET | `/images/XML/cap_ta.xml` | CAP Tamil warnings. |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
