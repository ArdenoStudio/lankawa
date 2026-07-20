# Field coverage — `cbsl-public-data-docs`

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
| `buyLkr` | `P` |
| `sellLkr` | `P` |
| `asOf` | `Y` |
| `spreadLkr` | `P` |
| `currency` | `Y` |
| `ttBuy` | `P` |
| `ttSell` | `P` |
| `ddBuy` | `N` |
| `ddSell` | `N` |
| `chequeBuy` | `N` |
| `chequeSell` | `N` |

Counts: Y=2 · P=5 · N=4 · K=0

## Fixed deposits / interest rates

_Domain:_ `fd_deposits`

| Field | Coverage |
|---|---|
| `tenorMonths` | `N` |
| `paidIn` | `N` |
| `ratePa` | `P` |
| `aerPa` | `N` |
| `effectiveFrom` | `Y` |
| `seniorCitizen` | `N` |
| `productCode` | `N` |
| `productName` | `P` |
| `currency` | `P` |

Counts: Y=1 · P=3 · N=5 · K=0

## CBSL macro / policy / gold

_Domain:_ `macro_cbsl`

| Field | Coverage |
|---|---|
| `opr` | `Y` |
| `sdfr` | `Y` |
| `slfr` | `Y` |
| `awpr` | `Y` |
| `tbillYield` | `Y` |
| `goldPrice` | `P` |
| `asOf` | `Y` |
| `bulletinUrl` | `Y` |

Counts: Y=7 · P=1 · N=0 · K=0

