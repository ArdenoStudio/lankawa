# TypeScript + JavaScript clients — all packages

Each staging package ships:

- `typescript/` — typed client (`@cookie-cat21/<slug>-client`), build with `tsc`
- `javascript/` — zero-build ESM twin (`client.mjs`, Node ≥18)

Pattern mirrors Cookie-Cat21/cse-api-docs `python/` helpers (thin fetch wrappers + ethics).

Regenerate: `python3 scripts/scaffold-ts-clients.py`

| Package | npm name | Class | Methods | TypeScript | JavaScript |
|---|---|---|---|---|---|
| `amana-union-cargills-bank-docs` | `@cookie-cat21/amana-union-cargills-bank-docs-client` | `AmanaUnionCargillsBankDocsClient` | 3 | `api-docs/packages/amana-union-cargills-bank-docs/typescript` | `api-docs/packages/amana-union-cargills-bank-docs/javascript` |
| `ardeno-sister-backends-docs` | `@cookie-cat21/ardeno-sister-backends-docs-client` | `ArdenoSisterBackendsDocsClient` | 3 | `api-docs/packages/ardeno-sister-backends-docs/typescript` | `api-docs/packages/ardeno-sister-backends-docs/javascript` |
| `boc-rates-docs` | `@cookie-cat21/boc-rates-docs-client` | `BocRatesDocsClient` | 2 | `api-docs/packages/boc-rates-docs/typescript` | `api-docs/packages/boc-rates-docs/javascript` |
| `cbsl-public-data-docs` | `@cookie-cat21/cbsl-public-data-docs-client` | `CbslPublicDataDocsClient` | 6 | `api-docs/packages/cbsl-public-data-docs/typescript` | `api-docs/packages/cbsl-public-data-docs/javascript` |
| `cebcare-api-docs` | `@cookie-cat21/cebcare-api-docs-client` | `CebcareApiDocsClient` | 2 | `api-docs/packages/cebcare-api-docs/typescript` | `api-docs/packages/cebcare-api-docs/javascript` |
| `combank-api-docs` | `@cookie-cat21/combank-api-docs-client` | `CombankApiDocsClient` | 3 | `api-docs/packages/combank-api-docs/typescript` | `api-docs/packages/combank-api-docs/javascript` |
| `cse-api-docs-deepen` | `@cookie-cat21/cse-api-docs-deepen-client` | `CseApiDocsDeepenClient` | 5 | `api-docs/packages/cse-api-docs-deepen/typescript` | `api-docs/packages/cse-api-docs-deepen/javascript` |
| `dfcc-rates-docs` | `@cookie-cat21/dfcc-rates-docs-client` | `DfccRatesDocsClient` | 3 | `api-docs/packages/dfcc-rates-docs/typescript` | `api-docs/packages/dfcc-rates-docs/javascript` |
| `foodlk-api-docs` | `@cookie-cat21/foodlk-api-docs-client` | `FoodlkApiDocsClient` | 4 | `api-docs/packages/foodlk-api-docs/typescript` | `api-docs/packages/foodlk-api-docs/javascript` |
| `gdacs-firms-docs` | `@cookie-cat21/gdacs-firms-docs-client` | `GdacsFirmsDocsClient` | 2 | `api-docs/packages/gdacs-firms-docs/typescript` | `api-docs/packages/gdacs-firms-docs/javascript` |
| `gold-retail-rates-docs` | `@cookie-cat21/gold-retail-rates-docs-client` | `GoldRetailRatesDocsClient` | 1 | `api-docs/packages/gold-retail-rates-docs/typescript` | `api-docs/packages/gold-retail-rates-docs/javascript` |
| `harti-cbsl-food-pdf-docs` | `@cookie-cat21/harti-cbsl-food-pdf-docs-client` | `HartiCbslFoodPdfDocsClient` | 2 | `api-docs/packages/harti-cbsl-food-pdf-docs/typescript` | `api-docs/packages/harti-cbsl-food-pdf-docs/javascript` |
| `hnb-venus-api-docs` | `@cookie-cat21/hnb-venus-api-docs-client` | `HnbVenusApiDocsClient` | 7 | `api-docs/packages/hnb-venus-api-docs/typescript` | `api-docs/packages/hnb-venus-api-docs/javascript` |
| `irrigation-arcgis-api-docs` | `@cookie-cat21/irrigation-arcgis-api-docs-client` | `IrrigationArcgisApiDocsClient` | 2 | `api-docs/packages/irrigation-arcgis-api-docs/typescript` | `api-docs/packages/irrigation-arcgis-api-docs/javascript` |
| `leco-outages-docs` | `@cookie-cat21/leco-outages-docs-client` | `LecoOutagesDocsClient` | 1 | `api-docs/packages/leco-outages-docs/typescript` | `api-docs/packages/leco-outages-docs/javascript` |
| `litro-laugfs-lpg-docs` | `@cookie-cat21/litro-laugfs-lpg-docs-client` | `LitroLaugfsLpgDocsClient` | 2 | `api-docs/packages/litro-laugfs-lpg-docs/typescript` | `api-docs/packages/litro-laugfs-lpg-docs/javascript` |
| `lk-flood-api-docs` | `@cookie-cat21/lk-flood-api-docs-client` | `LkFloodApiDocsClient` | 1 | `api-docs/packages/lk-flood-api-docs/typescript` | `api-docs/packages/lk-flood-api-docs/javascript` |
| `metdept-cap-api-docs` | `@cookie-cat21/metdept-cap-api-docs-client` | `MetdeptCapApiDocsClient` | 3 | `api-docs/packages/metdept-cap-api-docs/typescript` | `api-docs/packages/metdept-cap-api-docs/javascript` |
| `mypromo-park-docs` | `@cookie-cat21/mypromo-park-docs-client` | `MypromoParkDocsClient` | 1 | `api-docs/packages/mypromo-park-docs/typescript` | `api-docs/packages/mypromo-park-docs/javascript` |
| `ndb-rates-docs` | `@cookie-cat21/ndb-rates-docs-client` | `NdbRatesDocsClient` | 3 | `api-docs/packages/ndb-rates-docs/typescript` | `api-docs/packages/ndb-rates-docs/javascript` |
| `nsb-rates-docs` | `@cookie-cat21/nsb-rates-docs-client` | `NsbRatesDocsClient` | 2 | `api-docs/packages/nsb-rates-docs/typescript` | `api-docs/packages/nsb-rates-docs/javascript` |
| `ntb-amex-offers-docs` | `@cookie-cat21/ntb-amex-offers-docs-client` | `NtbAmexOffersDocsClient` | 2 | `api-docs/packages/ntb-amex-offers-docs/typescript` | `api-docs/packages/ntb-amex-offers-docs/javascript` |
| `nwsdb-bill-api-docs` | `@cookie-cat21/nwsdb-bill-api-docs-client` | `NwsdbBillApiDocsClient` | 2 | `api-docs/packages/nwsdb-bill-api-docs/typescript` | `api-docs/packages/nwsdb-bill-api-docs/javascript` |
| `octane-fuel-api-docs` | `@cookie-cat21/octane-fuel-api-docs-client` | `OctaneFuelApiDocsClient` | 2 | `api-docs/packages/octane-fuel-api-docs/typescript` | `api-docs/packages/octane-fuel-api-docs/javascript` |
| `open-meteo-lk-docs` | `@cookie-cat21/open-meteo-lk-docs-client` | `OpenMeteoLkDocsClient` | 3 | `api-docs/packages/open-meteo-lk-docs/typescript` | `api-docs/packages/open-meteo-lk-docs/javascript` |
| `openaq-lk-docs` | `@cookie-cat21/openaq-lk-docs-client` | `OpenaqLkDocsClient` | 1 | `api-docs/packages/openaq-lk-docs/typescript` | `api-docs/packages/openaq-lk-docs/javascript` |
| `pabc-card-offers-docs` | `@cookie-cat21/pabc-card-offers-docs-client` | `PabcCardOffersDocsClient` | 2 | `api-docs/packages/pabc-card-offers-docs/typescript` | `api-docs/packages/pabc-card-offers-docs/javascript` |
| `peoples-bank-rates-docs` | `@cookie-cat21/peoples-bank-rates-docs-client` | `PeoplesBankRatesDocsClient` | 3 | `api-docs/packages/peoples-bank-rates-docs/typescript` | `api-docs/packages/peoples-bank-rates-docs/javascript` |
| `promise-lk-tenders-docs` | `@cookie-cat21/promise-lk-tenders-docs-client` | `PromiseLkTendersDocsClient` | 1 | `api-docs/packages/promise-lk-tenders-docs/typescript` | `api-docs/packages/promise-lk-tenders-docs/javascript` |
| `sampath-api-docs` | `@cookie-cat21/sampath-api-docs-client` | `SampathApiDocsClient` | 3 | `api-docs/packages/sampath-api-docs/typescript` | `api-docs/packages/sampath-api-docs/javascript` |
| `sc-hsbc-offers-park-docs` | `@cookie-cat21/sc-hsbc-offers-park-docs-client` | `ScHsbcOffersParkDocsClient` | 2 | `api-docs/packages/sc-hsbc-offers-park-docs/typescript` | `api-docs/packages/sc-hsbc-offers-park-docs/javascript` |
| `sdb-rates-docs` | `@cookie-cat21/sdb-rates-docs-client` | `SdbRatesDocsClient` | 1 | `api-docs/packages/sdb-rates-docs/typescript` | `api-docs/packages/sdb-rates-docs/javascript` |
| `seylan-api-docs` | `@cookie-cat21/seylan-api-docs-client` | `SeylanApiDocsClient` | 2 | `api-docs/packages/seylan-api-docs/typescript` | `api-docs/packages/seylan-api-docs/javascript` |
| `singer-emi-api-docs` | `@cookie-cat21/singer-emi-api-docs-client` | `SingerEmiApiDocsClient` | 1 | `api-docs/packages/singer-emi-api-docs/typescript` | `api-docs/packages/singer-emi-api-docs/javascript` |
| `sl-bank-card-offers-docs` | `@cookie-cat21/sl-bank-card-offers-docs-client` | `SlBankCardOffersDocsClient` | 1 | `api-docs/packages/sl-bank-card-offers-docs/typescript` | `api-docs/packages/sl-bank-card-offers-docs/javascript` |
| `sl-bank-fd-rates-docs` | `@cookie-cat21/sl-bank-fd-rates-docs-client` | `SlBankFdRatesDocsClient` | 1 | `api-docs/packages/sl-bank-fd-rates-docs/typescript` | `api-docs/packages/sl-bank-fd-rates-docs/javascript` |
| `sl-bank-remittance-tt-docs` | `@cookie-cat21/sl-bank-remittance-tt-docs-client` | `SlBankRemittanceTtDocsClient` | 1 | `api-docs/packages/sl-bank-remittance-tt-docs/typescript` | `api-docs/packages/sl-bank-remittance-tt-docs/javascript` |
| `softlogic-emi-park-docs` | `@cookie-cat21/softlogic-emi-park-docs-client` | `SoftlogicEmiParkDocsClient` | 1 | `api-docs/packages/softlogic-emi-park-docs/typescript` | `api-docs/packages/softlogic-emi-park-docs/javascript` |
| `visa-lk-perks-api-docs` | `@cookie-cat21/visa-lk-perks-api-docs-client` | `VisaLkPerksApiDocsClient` | 1 | `api-docs/packages/visa-lk-perks-api-docs/typescript` | `api-docs/packages/visa-lk-perks-api-docs/javascript` |
| `wfp-hdx-lka-food-docs` | `@cookie-cat21/wfp-hdx-lka-food-docs-client` | `WfpHdxLkaFoodDocsClient` | 1 | `api-docs/packages/wfp-hdx-lka-food-docs/typescript` | `api-docs/packages/wfp-hdx-lka-food-docs/javascript` |

## Quick start (TypeScript)

```bash
cd api-docs/packages/combank-api-docs/typescript
npm install
npm run typecheck
# npm run smoke   # live network
```

## Quick start (JavaScript, no build)

```bash
cd api-docs/packages/combank-api-docs/javascript
node examples/smoke.mjs
```

## Notes

- Node ≥18 (native `fetch`)
- Default delay 1000ms between calls
- Parked endpoints throw instead of fetching
- Pagination-lab endpoints accept page/limit/offset/group helpers
- After extraction, publish from each repo’s `typescript/` and/or `javascript/` folder
