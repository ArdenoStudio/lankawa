# Client extras — typed models, pagination iterator, shard helper

Added to **every** package for Python, TypeScript, and JavaScript.

Regenerate: `python3 scripts/scaffold-client-extras.py`

| Package | Models | Lab endpoints |
|---|---|---|
| `amana-union-cargills-bank-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | — |
| `ardeno-sister-backends-docs` | `FoodPrice`, `FuelEnergy`, `PlatformMisc` | — |
| `boc-rates-docs` | `FxTtQuote`, `FdDepositQuote` | — |
| `cbsl-public-data-docs` | `FxTtQuote`, `FdDepositQuote`, `MacroCbsl` | — |
| `cebcare-api-docs` | `UtilityReading` | `get_demand_mgmt_clusters` |
| `combank-api-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | — |
| `cse-api-docs-deepen` | `CseQuote` | `trade_summary` |
| `dfcc-rates-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | — |
| `foodlk-api-docs` | `FoodPrice`, `PlatformMisc` | — |
| `gdacs-firms-docs` | `WeatherAqi` | `firms_csv_lk` |
| `gold-retail-rates-docs` | `MacroCbsl` | — |
| `harti-cbsl-food-pdf-docs` | `FoodPrice` | — |
| `hnb-venus-api-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | `get_all_web_card_promos`, `get_all_web_card_promos_debit` |
| `irrigation-arcgis-api-docs` | `UtilityReading` | `gauges_2_view_query`, `rainfall_24hr` |
| `leco-outages-docs` | `UtilityReading` | — |
| `litro-laugfs-lpg-docs` | `FuelEnergy` | — |
| `lk-flood-api-docs` | `UtilityReading` | — |
| `metdept-cap-api-docs` | `WeatherAqi` | — |
| `mypromo-park-docs` | `CardOffer` | — |
| `ndb-rates-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | — |
| `nsb-rates-docs` | `FxTtQuote`, `FdDepositQuote` | — |
| `ntb-amex-offers-docs` | `CardOffer` | — |
| `nwsdb-bill-api-docs` | `UtilityReading` | — |
| `octane-fuel-api-docs` | `FuelEnergy` | — |
| `open-meteo-lk-docs` | `WeatherAqi` | — |
| `openaq-lk-docs` | `WeatherAqi` | `locations_lk` |
| `pabc-card-offers-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | `card_offers_js` |
| `peoples-bank-rates-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | — |
| `promise-lk-tenders-docs` | `PlatformMisc` | `procurements_list` |
| `sampath-api-docs` | `FxTtQuote`, `FdDepositQuote`, `CardOffer` | `card_promotions_super_markets` |
| `sc-hsbc-offers-park-docs` | `FdDepositQuote`, `CardOffer` | — |
| `sdb-rates-docs` | `FxTtQuote`, `FdDepositQuote` | — |
| `seylan-api-docs` | `FxTtQuote`, `FdDepositQuote` | — |
| `singer-emi-api-docs` | `FuelEnergy` | — |
| `sl-bank-card-offers-docs` | `CardOffer` | `pack_overview` |
| `sl-bank-fd-rates-docs` | `FdDepositQuote` | — |
| `sl-bank-remittance-tt-docs` | `FxTtQuote` | — |
| `softlogic-emi-park-docs` | `FuelEnergy` | — |
| `visa-lk-perks-api-docs` | `CardOffer` | `portal_perks` |
| `wfp-hdx-lka-food-docs` | `FoodPrice` | `wfp_food_prices_lka_csv` |

## Modules

| Stack | Models | Pagination | Shard |
|---|---|---|---|
| Python | `python/<mod>/models.py` | `pagination.py` | `shard.py` |
| TypeScript | `typescript/src/models.ts` | `pagination.ts` | `shard.ts` |
| JavaScript | `javascript/models.mjs` | `pagination.mjs` | `shard.mjs` |

## APIs

- **Typed models** — dataclasses / TS types from field-coverage domains + `PageResult`
- **Pagination iterator** — `iter_pages` / `iter_lab_endpoint` (page_limit, page_number, arcgis, group_id, pageRequest, client_slice, …)
- **Shard helper** — `shard_groups`, `shard_page_numbers`, `shard_offsets`, `shard_range`, `shard_slice`, `plan_shards`
