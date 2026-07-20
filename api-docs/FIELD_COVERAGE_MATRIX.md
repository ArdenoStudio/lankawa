# Field coverage matrix — all Tier A/B api-docs packages

Machine source: [`FIELD_COVERAGE_MATRIX.yaml`](./FIELD_COVERAGE_MATRIX.yaml) · regenerate with `python3 scripts/build-field-coverage-matrix.py`.

## Legend

| Code | Meaning |
|------|---------|
| `Y` | Full machine-readable field (JSON or stable parse) |
| `P` | Partial — HTML scrape, derived, or incomplete |
| `N` | Not available on this surface |
| `K` | Parked / out of scope for this package |

## Notes

- Canonical fields follow Lankawa snapshot types (RemittanceBankQuote, BankDepositRateQuote, CardOffer, etc.).
- Aggregator packs (sl-bank-*) inherit best-of sibling coverage.
- Y/P/N/K is research-time judgment from deep-dives — re-probe after extraction.
- See docs/BANK_FD_API_SCHEMAS.md for FD field maps; this matrix covers all domains.

## FX / remittance TT (USD→LKR)

_Domain id:_ `fx_tt`

| Package | `buyLkr` | `sellLkr` | `asOf` | `spreadLkr` | `currency` | `ttBuy` | `ttSell` | `ddBuy` | `ddSell` | `chequeBuy` | `chequeSell` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `amana-union-cargills-bank-docs` | P | P | P | P | P | P | P | N | N | N | N | 0 | 7 |
| `boc-rates-docs` | P | P | P | P | P | P | P | N | N | N | N | 0 | 7 |
| `cbsl-public-data-docs` | P | P | Y | P | Y | P | P | N | N | N | N | 2 | 5 |
| `combank-api-docs` | Y | Y | P | P | Y | Y | Y | Y | Y | P | P | 7 | 4 |
| `dfcc-rates-docs` | P | P | P | P | P | P | P | N | N | N | N | 0 | 7 |
| `hnb-venus-api-docs` | Y | Y | Y | P | Y | Y | Y | N | N | N | N | 6 | 1 |
| `ndb-rates-docs` | P | P | P | P | P | P | P | N | N | N | N | 0 | 7 |
| `nsb-rates-docs` | P | P | P | P | P | P | P | N | N | N | N | 0 | 7 |
| `pabc-card-offers-docs` | K | K | K | K | K | K | K | K | K | K | K | 0 | 0 |
| `peoples-bank-rates-docs` | P | P | P | P | P | P | P | N | N | N | N | 0 | 7 |
| `sampath-api-docs` | Y | Y | P | P | Y | Y | Y | N | N | N | N | 5 | 2 |
| `sdb-rates-docs` | P | P | P | P | P | P | P | N | N | N | N | 0 | 7 |
| `seylan-api-docs` | Y | Y | N | P | Y | Y | Y | N | N | N | N | 5 | 1 |
| `sl-bank-remittance-tt-docs` | Y | Y | Y | Y | Y | Y | Y | P | P | N | N | 7 | 2 |

## Fixed deposits / interest rates

_Domain id:_ `fd_deposits`

| Package | `tenorMonths` | `paidIn` | `ratePa` | `aerPa` | `effectiveFrom` | `seniorCitizen` | `productCode` | `productName` | `currency` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `amana-union-cargills-bank-docs` | P | P | P | N | P | P | N | P | P | 0 | 7 |
| `boc-rates-docs` | P | P | P | N | P | P | K | P | P | 0 | 7 |
| `cbsl-public-data-docs` | N | N | P | N | Y | N | N | P | P | 1 | 3 |
| `combank-api-docs` | Y | Y | Y | N | N | N | P | P | P | 3 | 3 |
| `dfcc-rates-docs` | P | P | P | N | P | P | N | P | P | 0 | 7 |
| `hnb-venus-api-docs` | Y | Y | Y | Y | Y | Y | P | Y | P | 7 | 2 |
| `ndb-rates-docs` | P | P | P | N | P | P | N | P | P | 0 | 7 |
| `nsb-rates-docs` | P | P | P | N | P | P | N | P | P | 0 | 7 |
| `pabc-card-offers-docs` | P | P | P | N | P | Y | N | P | P | 1 | 6 |
| `peoples-bank-rates-docs` | P | P | P | N | P | P | N | P | P | 0 | 7 |
| `sampath-api-docs` | Y | Y | Y | Y | Y | Y | Y | Y | P | 8 | 1 |
| `sc-hsbc-offers-park-docs` | K | K | K | K | K | K | K | K | K | 0 | 0 |
| `sdb-rates-docs` | P | P | P | N | P | P | N | P | P | 0 | 7 |
| `seylan-api-docs` | Y | Y | Y | N | N | Y | Y | P | P | 5 | 2 |
| `sl-bank-fd-rates-docs` | Y | Y | Y | Y | Y | Y | Y | Y | Y | 9 | 0 |

## Supermarket / card offers

_Domain id:_ `card_offers`

| Package | `bank` | `merchant` | `title` | `discountLabel` | `weekdayHint` | `validTo` | `cardType` | `sourceUrl` | `asOf` | `minSpend` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `amana-union-cargills-bank-docs` | Y | P | P | P | P | P | P | Y | P | N | 2 | 7 |
| `combank-api-docs` | Y | P | Y | P | P | P | P | Y | P | N | 3 | 6 |
| `dfcc-rates-docs` | Y | P | P | P | P | P | P | Y | P | N | 2 | 7 |
| `hnb-venus-api-docs` | Y | Y | Y | P | P | P | Y | Y | P | P | 5 | 5 |
| `mypromo-park-docs` | K | K | K | K | K | K | K | K | K | K | 0 | 0 |
| `ndb-rates-docs` | Y | P | P | P | P | P | P | Y | P | N | 2 | 7 |
| `ntb-amex-offers-docs` | Y | P | P | P | P | P | P | Y | P | N | 2 | 7 |
| `pabc-card-offers-docs` | Y | Y | Y | Y | P | P | P | Y | P | N | 5 | 4 |
| `peoples-bank-rates-docs` | Y | P | P | P | P | P | P | Y | P | N | 2 | 7 |
| `sampath-api-docs` | Y | Y | Y | Y | P | Y | P | Y | P | P | 6 | 4 |
| `sc-hsbc-offers-park-docs` | K | K | K | K | K | K | K | K | K | K | 0 | 0 |
| `sl-bank-card-offers-docs` | Y | Y | Y | Y | Y | Y | Y | Y | Y | P | 9 | 1 |
| `visa-lk-perks-api-docs` | P | Y | Y | Y | P | Y | P | Y | P | P | 5 | 5 |

## Food / staples prices

_Domain id:_ `food_prices`

| Package | `commodity` | `unit` | `priceLkr` | `marketOrDistrict` | `asOf` | `currency` | `sourceLag` | `basketId` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ardeno-sister-backends-docs` | Y | Y | Y | P | Y | Y | P | Y | 6 | 2 |
| `foodlk-api-docs` | Y | Y | Y | P | Y | Y | P | Y | 6 | 2 |
| `harti-cbsl-food-pdf-docs` | P | P | P | P | P | P | P | N | 0 | 7 |
| `wfp-hdx-lka-food-docs` | Y | Y | Y | Y | Y | Y | Y | P | 7 | 1 |

## CSE / markets

_Domain id:_ `markets_cse`

| Package | `symbol` | `name` | `lastPrice` | `change` | `changePct` | `volume` | `sector` | `asOf` | `announcementTitle` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cse-api-docs-deepen` | Y | Y | Y | Y | Y | Y | Y | Y | Y | 9 | 0 |

## Power / water / irrigation

_Domain id:_ `utilities`

| Package | `groupId` | `clusterName` | `scheduleWindow` | `billTotalLkr` | `consumption` | `gaugeLevel` | `alertStatus` | `rainfallMm` | `asOf` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cebcare-api-docs` | Y | Y | Y | N | N | N | P | N | P | 3 | 2 |
| `irrigation-arcgis-api-docs` | N | N | N | N | N | Y | Y | Y | Y | 4 | 0 |
| `leco-outages-docs` | N | P | P | N | N | N | P | N | P | 0 | 4 |
| `lk-flood-api-docs` | N | N | N | N | N | Y | Y | N | Y | 3 | 0 |
| `nwsdb-bill-api-docs` | N | N | N | Y | Y | N | N | N | P | 2 | 1 |

## Weather / air quality / warnings

_Domain id:_ `weather_aqi`

| Package | `tempC` | `precipMm` | `uvIndex` | `pm25` | `usAqi` | `warningLevel` | `capLanguage` | `asOf` | `latLon` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `gdacs-firms-docs` | N | N | N | N | N | Y | N | Y | Y | 3 | 0 |
| `metdept-cap-api-docs` | N | N | N | N | N | Y | Y | Y | P | 3 | 1 |
| `open-meteo-lk-docs` | Y | Y | Y | Y | Y | N | N | Y | Y | 7 | 0 |
| `openaq-lk-docs` | N | N | N | Y | P | N | N | Y | Y | 3 | 1 |

## Fuel / LPG / EMI retail

_Domain id:_ `fuel_energy`

| Package | `product` | `priceLkr` | `unit` | `asOf` | `worldCompare` | `emiBank` | `emiTenorMonths` | `emiMonthlyLkr` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ardeno-sister-backends-docs` | Y | Y | Y | Y | Y | N | N | N | 5 | 0 |
| `litro-laugfs-lpg-docs` | P | P | P | P | N | N | N | N | 0 | 4 |
| `octane-fuel-api-docs` | Y | Y | Y | Y | Y | N | N | N | 5 | 0 |
| `singer-emi-api-docs` | Y | Y | P | P | N | Y | Y | Y | 5 | 2 |
| `softlogic-emi-park-docs` | K | K | K | K | K | K | K | K | 0 | 0 |

## CBSL macro / policy / gold

_Domain id:_ `macro_cbsl`

| Package | `opr` | `sdfr` | `slfr` | `awpr` | `tbillYield` | `goldPrice` | `asOf` | `bulletinUrl` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cbsl-public-data-docs` | Y | Y | Y | Y | Y | P | Y | Y | 7 | 1 |
| `gold-retail-rates-docs` | N | N | N | N | N | P | P | N | 0 | 2 |

## Platform / tenders / packs

_Domain id:_ `platform_misc`

| Package | `tenderTitle` | `closingDate` | `district` | `category` | `healthOk` | `openapiPath` | Y | P |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| `ardeno-sister-backends-docs` | N | N | N | N | Y | Y | 2 | 0 |
| `foodlk-api-docs` | N | N | N | N | Y | Y | 2 | 0 |
| `promise-lk-tenders-docs` | P | P | P | P | N | N | 0 | 4 |

## Package rollup (all domains)

| Package | Domains | ΣY | ΣP | ΣN | ΣK |
|---|---|---|---|---|---|
| `amana-union-cargills-bank-docs` | fx_tt, fd_deposits, card_offers | 2 | 21 | 7 | 0 |
| `ardeno-sister-backends-docs` | food_prices, fuel_energy, platform_misc | 13 | 2 | 7 | 0 |
| `boc-rates-docs` | fx_tt, fd_deposits | 0 | 14 | 5 | 1 |
| `cbsl-public-data-docs` | fx_tt, fd_deposits, macro_cbsl | 10 | 9 | 9 | 0 |
| `cebcare-api-docs` | utilities | 3 | 2 | 4 | 0 |
| `combank-api-docs` | fx_tt, fd_deposits, card_offers | 13 | 13 | 4 | 0 |
| `cse-api-docs-deepen` | markets_cse | 9 | 0 | 0 | 0 |
| `dfcc-rates-docs` | fx_tt, fd_deposits, card_offers | 2 | 21 | 7 | 0 |
| `foodlk-api-docs` | food_prices, platform_misc | 8 | 2 | 4 | 0 |
| `gdacs-firms-docs` | weather_aqi | 3 | 0 | 6 | 0 |
| `gold-retail-rates-docs` | macro_cbsl | 0 | 2 | 6 | 0 |
| `harti-cbsl-food-pdf-docs` | food_prices | 0 | 7 | 1 | 0 |
| `hnb-venus-api-docs` | fx_tt, fd_deposits, card_offers | 18 | 8 | 4 | 0 |
| `irrigation-arcgis-api-docs` | utilities | 4 | 0 | 5 | 0 |
| `leco-outages-docs` | utilities | 0 | 4 | 5 | 0 |
| `litro-laugfs-lpg-docs` | fuel_energy | 0 | 4 | 4 | 0 |
| `lk-flood-api-docs` | utilities | 3 | 0 | 6 | 0 |
| `metdept-cap-api-docs` | weather_aqi | 3 | 1 | 5 | 0 |
| `mypromo-park-docs` | card_offers | 0 | 0 | 0 | 10 |
| `ndb-rates-docs` | fx_tt, fd_deposits, card_offers | 2 | 21 | 7 | 0 |
| `nsb-rates-docs` | fx_tt, fd_deposits | 0 | 14 | 6 | 0 |
| `ntb-amex-offers-docs` | card_offers | 2 | 7 | 1 | 0 |
| `nwsdb-bill-api-docs` | utilities | 2 | 1 | 6 | 0 |
| `octane-fuel-api-docs` | fuel_energy | 5 | 0 | 3 | 0 |
| `open-meteo-lk-docs` | weather_aqi | 7 | 0 | 2 | 0 |
| `openaq-lk-docs` | weather_aqi | 3 | 1 | 5 | 0 |
| `pabc-card-offers-docs` | fx_tt, fd_deposits, card_offers | 6 | 10 | 3 | 11 |
| `peoples-bank-rates-docs` | fx_tt, fd_deposits, card_offers | 2 | 21 | 7 | 0 |
| `promise-lk-tenders-docs` | platform_misc | 0 | 4 | 2 | 0 |
| `sampath-api-docs` | fx_tt, fd_deposits, card_offers | 19 | 7 | 4 | 0 |
| `sc-hsbc-offers-park-docs` | fd_deposits, card_offers | 0 | 0 | 0 | 19 |
| `sdb-rates-docs` | fx_tt, fd_deposits | 0 | 14 | 6 | 0 |
| `seylan-api-docs` | fx_tt, fd_deposits | 10 | 3 | 7 | 0 |
| `singer-emi-api-docs` | fuel_energy | 5 | 2 | 1 | 0 |
| `sl-bank-card-offers-docs` | card_offers | 9 | 1 | 0 | 0 |
| `sl-bank-fd-rates-docs` | fd_deposits | 9 | 0 | 0 | 0 |
| `sl-bank-remittance-tt-docs` | fx_tt | 7 | 2 | 2 | 0 |
| `softlogic-emi-park-docs` | fuel_energy | 0 | 0 | 0 | 8 |
| `visa-lk-perks-api-docs` | card_offers | 5 | 5 | 0 | 0 |
| `wfp-hdx-lka-food-docs` | food_prices | 7 | 1 | 0 | 0 |
