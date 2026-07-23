# Field coverage — `seylan-api-docs`

From Lankawa staging matrix `api-docs/FIELD_COVERAGE_MATRIX.yaml`.

## Legend

- `Y` — Full machine-readable field (JSON or stable parse)
- `P` — Partial — HTML scrape, derived, or incomplete
- `N` — Not available on this surface
- `K` — Parked / out of scope for this package

## FX / remittance TT (USD→LKR)

_Domain:_ `fx_tt`

| Field | Coverage |
|---|---|
| `buyLkr` | `Y` |
| `sellLkr` | `Y` |
| `asOf` | `N` |
| `spreadLkr` | `P` |
| `currency` | `Y` |
| `ttBuy` | `Y` |
| `ttSell` | `Y` |
| `ddBuy` | `N` |
| `ddSell` | `N` |
| `chequeBuy` | `N` |
| `chequeSell` | `N` |

Counts: Y=5 · P=1 · N=5 · K=0

## Fixed deposits / interest rates

_Domain:_ `fd_deposits`

| Field | Coverage |
|---|---|
| `tenorMonths` | `Y` |
| `paidIn` | `Y` |
| `ratePa` | `Y` |
| `aerPa` | `N` |
| `effectiveFrom` | `N` |
| `seniorCitizen` | `Y` |
| `productCode` | `Y` |
| `productName` | `P` |
| `currency` | `P` |

Counts: Y=5 · P=2 · N=2 · K=0

