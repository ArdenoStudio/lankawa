# Field coverage — `singer-emi-api-docs`

From Lankawa staging matrix `api-docs/FIELD_COVERAGE_MATRIX.yaml`.

## Legend

- `Y` — Full machine-readable field (JSON or stable parse)
- `P` — Partial — HTML scrape, derived, or incomplete
- `N` — Not available on this surface
- `K` — Parked / out of scope for this package

## Fuel / LPG / EMI retail

_Domain:_ `fuel_energy`

| Field | Coverage |
|---|---|
| `product` | `Y` |
| `priceLkr` | `Y` |
| `unit` | `P` |
| `asOf` | `P` |
| `worldCompare` | `N` |
| `emiBank` | `Y` |
| `emiTenorMonths` | `Y` |
| `emiMonthlyLkr` | `Y` |

Counts: Y=5 · P=2 · N=1 · K=0

