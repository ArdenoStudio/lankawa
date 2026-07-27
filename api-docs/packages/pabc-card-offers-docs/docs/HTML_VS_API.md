# HTML scrape vs API — `pabc-card-offers-docs`

**Pan Asia Bank Card Offers** · Tier B

Unofficial classification of each catalog endpoint: machine JSON/API surfaces versus HTML scrape (or PDF/CSV/XML/park).

Regenerate: `python3 scripts/build-html-vs-api.py`

## Summary

| Access | Count |
|---|---:|
| PDF / document index (`pdf_document`) | 1 |
| HTML scrape (`html_scrape`) | 1 |

## Endpoints

| Id | Access | Method | Path / URL | Notes |
|---|---|---|---|---|
| `card_offers_js` | `html_scrape` | GET | `/personal/cards/offers` | Offers page; arr_offers JS after Sucuri cookie. |
| `senior_fd_html` | `pdf_document` | GET | `/personal/deposits/senior-citizens-fixed-deposit` | Senior FD HTML (main ladder may be PDF-only). |

## Guidance

- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.
- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists (see BOC: prefer rates-tariff HTML over parked stale JSON).
- **`parked`** means do not automate — document why in ETHICS / PARK notes.
- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.
