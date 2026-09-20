# Field coverage — `sampath-api-docs`

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
| `asOf` | `P` |
| `spreadLkr` | `P` |
| `currency` | `Y` |
| `ttBuy` | `Y` |
| `ttSell` | `Y` |
| `ddBuy` | `N` |
| `ddSell` | `N` |
| `chequeBuy` | `N` |
| `chequeSell` | `N` |

Counts: Y=5 · P=2 · N=4 · K=0

## Fixed deposits / interest rates

_Domain:_ `fd_deposits`

| Field | Coverage |
|---|---|
| `tenorMonths` | `Y` |
| `paidIn` | `Y` |
| `ratePa` | `Y` |
| `aerPa` | `Y` |
| `effectiveFrom` | `Y` |
| `seniorCitizen` | `Y` |
| `productCode` | `Y` |
| `productName` | `Y` |
| `currency` | `P` |

Counts: Y=8 · P=1 · N=0 · K=0

## Supermarket / card offers

_Domain:_ `card_offers`

| Field | Coverage |
|---|---|
| `bank` | `Y` |
| `merchant` | `Y` |
| `title` | `Y` |
| `discountLabel` | `Y` |
| `weekdayHint` | `P` |
| `validTo` | `Y` |
| `cardType` | `P` |
| `sourceUrl` | `Y` |
| `asOf` | `P` |
| `minSpend` | `P` |

Counts: Y=6 · P=4 · N=0 · K=0

