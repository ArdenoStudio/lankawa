# HTML scrape vs API — catalog index

Endpoint access classification for every Tier A/B staging package.

Regenerate: `python3 scripts/build-html-vs-api.py`

Per-package detail: `packages/<slug>/docs/HTML_VS_API.md` (also stamps `access:` on each endpoint in `catalog/endpoints.yaml`).

## Catalog totals

| Access | Count |
|---|---:|
| JSON / machine API (`json_api`) | 41 |
| ArcGIS FeatureServer / query API (`arcgis_api`) | 2 |
| XML / CAP feed (`xml_cap`) | 4 |
| CSV download (`csv_download`) | 2 |
| PDF / document index (`pdf_document`) | 4 |
| HTML scrape (`html_scrape`) | 27 |
| Hybrid (API bootstrap + HTML) (`hybrid`) | 4 |
| Parked (do not scrape / stale) (`parked`) | 5 |

## Packages

| Package | Tier | API-like | HTML/hybrid | Parked | Dominant |
|---|---|---:|---:|---:|---|
| [`amana-union-cargills-bank-docs`](./packages/amana-union-cargills-bank-docs/docs/HTML_VS_API.md) | B | 0 | 3 | 0 | `html_scrape` |
| [`ardeno-sister-backends-docs`](./packages/ardeno-sister-backends-docs/docs/HTML_VS_API.md) | B | 3 | 0 | 0 | `json_api` |
| [`boc-rates-docs`](./packages/boc-rates-docs/docs/HTML_VS_API.md) | B | 0 | 1 | 1 | `hybrid` |
| [`cbsl-public-data-docs`](./packages/cbsl-public-data-docs/docs/HTML_VS_API.md) | A | 2 | 3 | 0 | `html_scrape` |
| [`cebcare-api-docs`](./packages/cebcare-api-docs/docs/HTML_VS_API.md) | A | 1 | 1 | 0 | `json_api` |
| [`combank-api-docs`](./packages/combank-api-docs/docs/HTML_VS_API.md) | A | 2 | 1 | 0 | `json_api` |
| [`cse-api-docs-deepen`](./packages/cse-api-docs-deepen/docs/HTML_VS_API.md) | A | 5 | 0 | 0 | `json_api` |
| [`dfcc-rates-docs`](./packages/dfcc-rates-docs/docs/HTML_VS_API.md) | B | 0 | 3 | 0 | `html_scrape` |
| [`foodlk-api-docs`](./packages/foodlk-api-docs/docs/HTML_VS_API.md) | A | 4 | 0 | 0 | `json_api` |
| [`gdacs-firms-docs`](./packages/gdacs-firms-docs/docs/HTML_VS_API.md) | B | 2 | 0 | 0 | `xml_cap` |
| [`gold-retail-rates-docs`](./packages/gold-retail-rates-docs/docs/HTML_VS_API.md) | B | 0 | 1 | 0 | `html_scrape` |
| [`harti-cbsl-food-pdf-docs`](./packages/harti-cbsl-food-pdf-docs/docs/HTML_VS_API.md) | B | 0 | 0 | 0 | `pdf_document` |
| [`hnb-venus-api-docs`](./packages/hnb-venus-api-docs/docs/HTML_VS_API.md) | A | 7 | 0 | 0 | `json_api` |
| [`irrigation-arcgis-api-docs`](./packages/irrigation-arcgis-api-docs/docs/HTML_VS_API.md) | A | 2 | 0 | 0 | `arcgis_api` |
| [`leco-outages-docs`](./packages/leco-outages-docs/docs/HTML_VS_API.md) | B | 0 | 1 | 0 | `html_scrape` |
| [`litro-laugfs-lpg-docs`](./packages/litro-laugfs-lpg-docs/docs/HTML_VS_API.md) | B | 0 | 2 | 0 | `html_scrape` |
| [`lk-flood-api-docs`](./packages/lk-flood-api-docs/docs/HTML_VS_API.md) | A | 1 | 0 | 0 | `json_api` |
| [`metdept-cap-api-docs`](./packages/metdept-cap-api-docs/docs/HTML_VS_API.md) | B | 3 | 0 | 0 | `xml_cap` |
| [`mypromo-park-docs`](./packages/mypromo-park-docs/docs/HTML_VS_API.md) | B | 0 | 0 | 1 | `parked` |
| [`ndb-rates-docs`](./packages/ndb-rates-docs/docs/HTML_VS_API.md) | B | 0 | 3 | 0 | `html_scrape` |
| [`nsb-rates-docs`](./packages/nsb-rates-docs/docs/HTML_VS_API.md) | B | 0 | 2 | 0 | `html_scrape` |
| [`ntb-amex-offers-docs`](./packages/ntb-amex-offers-docs/docs/HTML_VS_API.md) | B | 0 | 2 | 0 | `html_scrape` |
| [`nwsdb-bill-api-docs`](./packages/nwsdb-bill-api-docs/docs/HTML_VS_API.md) | A | 2 | 0 | 0 | `json_api` |
| [`octane-fuel-api-docs`](./packages/octane-fuel-api-docs/docs/HTML_VS_API.md) | B | 2 | 0 | 0 | `json_api` |
| [`open-meteo-lk-docs`](./packages/open-meteo-lk-docs/docs/HTML_VS_API.md) | B | 3 | 0 | 0 | `json_api` |
| [`openaq-lk-docs`](./packages/openaq-lk-docs/docs/HTML_VS_API.md) | A | 1 | 0 | 0 | `json_api` |
| [`pabc-card-offers-docs`](./packages/pabc-card-offers-docs/docs/HTML_VS_API.md) | B | 0 | 1 | 0 | `pdf_document` |
| [`peoples-bank-rates-docs`](./packages/peoples-bank-rates-docs/docs/HTML_VS_API.md) | B | 0 | 3 | 0 | `html_scrape` |
| [`promise-lk-tenders-docs`](./packages/promise-lk-tenders-docs/docs/HTML_VS_API.md) | B | 0 | 1 | 0 | `html_scrape` |
| [`sampath-api-docs`](./packages/sampath-api-docs/docs/HTML_VS_API.md) | A | 3 | 0 | 0 | `json_api` |
| [`sc-hsbc-offers-park-docs`](./packages/sc-hsbc-offers-park-docs/docs/HTML_VS_API.md) | B | 0 | 0 | 2 | `parked` |
| [`sdb-rates-docs`](./packages/sdb-rates-docs/docs/HTML_VS_API.md) | B | 0 | 1 | 0 | `html_scrape` |
| [`seylan-api-docs`](./packages/seylan-api-docs/docs/HTML_VS_API.md) | A | 1 | 1 | 0 | `json_api` |
| [`singer-emi-api-docs`](./packages/singer-emi-api-docs/docs/HTML_VS_API.md) | B | 1 | 0 | 0 | `json_api` |
| [`sl-bank-card-offers-docs`](./packages/sl-bank-card-offers-docs/docs/HTML_VS_API.md) | B | 0 | 1 | 0 | `hybrid` |
| [`sl-bank-fd-rates-docs`](./packages/sl-bank-fd-rates-docs/docs/HTML_VS_API.md) | B | 1 | 0 | 0 | `json_api` |
| [`sl-bank-remittance-tt-docs`](./packages/sl-bank-remittance-tt-docs/docs/HTML_VS_API.md) | B | 1 | 0 | 0 | `json_api` |
| [`softlogic-emi-park-docs`](./packages/softlogic-emi-park-docs/docs/HTML_VS_API.md) | B | 0 | 0 | 1 | `parked` |
| [`visa-lk-perks-api-docs`](./packages/visa-lk-perks-api-docs/docs/HTML_VS_API.md) | A | 1 | 0 | 0 | `json_api` |
| [`wfp-hdx-lka-food-docs`](./packages/wfp-hdx-lka-food-docs/docs/HTML_VS_API.md) | A | 1 | 0 | 0 | `csv_download` |

## Legend

- **`json_api`** — JSON / machine API
- **`arcgis_api`** — ArcGIS FeatureServer / query API
- **`xml_cap`** — XML / CAP feed
- **`csv_download`** — CSV download
- **`pdf_document`** — PDF / document index
- **`html_scrape`** — HTML scrape
- **`hybrid`** — Hybrid (API bootstrap + HTML)
- **`parked`** — Parked (do not scrape / stale)
- **`unknown`** — Unknown / classify manually
