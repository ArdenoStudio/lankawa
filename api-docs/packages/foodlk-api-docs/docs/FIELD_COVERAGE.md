# Field coverage — `foodlk-api-docs`

From Lankawa staging matrix `api-docs/FIELD_COVERAGE_MATRIX.yaml`.

## Legend

- `Y` — Full machine-readable field (JSON or stable parse)
- `P` — Partial — HTML scrape, derived, or incomplete
- `N` — Not available on this surface
- `K` — Parked / out of scope for this package

## Food / staples prices

_Domain:_ `food_prices`

| Field | Coverage |
|---|---|
| `commodity` | `Y` |
| `unit` | `Y` |
| `priceLkr` | `Y` |
| `marketOrDistrict` | `P` |
| `asOf` | `Y` |
| `currency` | `Y` |
| `sourceLag` | `P` |
| `basketId` | `Y` |

Counts: Y=6 · P=2 · N=0 · K=0

## Platform / tenders / packs

_Domain:_ `platform_misc`

| Field | Coverage |
|---|---|
| `tenderTitle` | `N` |
| `closingDate` | `N` |
| `district` | `N` |
| `category` | `N` |
| `healthOk` | `Y` |
| `openapiPath` | `Y` |

Counts: Y=2 · P=0 · N=4 · K=0

