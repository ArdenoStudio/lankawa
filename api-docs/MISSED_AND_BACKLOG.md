# Missed surfaces & backlog (added in staging pass)

After the initial Tier A/B scaffold, these packages were added from Lankawa research that was not in the first 30-slug list:

| Slug | Tier | Why it was missing |
|------|------|--------------------|
| `amana-union-cargills-bank-docs` | B | Covered in NTB/Amana/Union/Cargills deep-dive, not first-pass list |
| `sc-hsbc-offers-park-docs` | B | Explicit parks (expired SC JSON, HSBC sold to NTB) |
| `lk-flood-api-docs` | A | nuuuwan flood JSON used by flood adapter |
| `litro-laugfs-lpg-docs` | B | LPG HTML siblings of Octane fuel |
| `promise-lk-tenders-docs` | B | Tender directory integration |
| `openaq-lk-docs` | A | OpenAQ used by AQI adapter (alongside Open-Meteo) |
| `softlogic-emi-park-docs` | B | Park vs Singer EMI |
| `mypromo-park-docs` | B | ToS park |
| `sdb-rates-docs` | B | SANASA / SDB from Amana/PABC/SDB research |
| `gold-retail-rates-docs` | B | Gold retail research pack |

## Still optional / not packaged yet

These remain research-only or low-ROI for a dedicated `*-api-docs` repo unless demand appears:

- Stock broker unofficial APIs (`STOCK_BROKER_APIS_RESEARCH.md`)
- Pharmacy / hospital EMI offers
- Wallet / mobile money offer scrapes
- Fuel loyalty (CPC apps) beyond Octane
- LankaPay / JustPay / LankaQR (payments research — mostly PDF/partner)
- Telco packs / PickMe / GTFS (consumer survey parks)
- Softlogic ONE authenticated loyalty

Document them in consumer survey deep-dives; promote to a package only when a public machine surface is confirmed.

## Enrichment still useful inside existing packages

- HNB: `get_rates_contents_web`, debit `cardType`, categories list
- CSE: `getAnnouncementByCompany`, GICS valuations
- Irrigation: `Flood_Map`, `hydrostations`
- FoodLK: full OpenAPI path inventory from `FOODLK_OPENAPI_EXHAUST.md`
- Octane: history + world compare freshness notes; park stale sentiment/AI forecast
