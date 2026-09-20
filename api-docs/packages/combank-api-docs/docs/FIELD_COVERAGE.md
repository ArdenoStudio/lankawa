# Field coverage — `combank-api-docs`

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
| `ddBuy` | `Y` |
| `ddSell` | `Y` |
| `chequeBuy` | `P` |
| `chequeSell` | `P` |

Counts: Y=7 · P=4 · N=0 · K=0

## Fixed deposits / interest rates

_Domain:_ `fd_deposits`

| Field | Coverage |
|---|---|
| `tenorMonths` | `Y` |
| `paidIn` | `Y` |
| `ratePa` | `Y` |
| `aerPa` | `N` |
| `effectiveFrom` | `N` |
| `seniorCitizen` | `N` |
| `productCode` | `P` |
| `productName` | `P` |
| `currency` | `P` |

Counts: Y=3 · P=3 · N=3 · K=0

## Supermarket / card offers

_Domain:_ `card_offers`

| Field | Coverage |
|---|---|
| `bank` | `Y` |
| `merchant` | `P` |
| `title` | `Y` |
| `discountLabel` | `P` |
| `weekdayHint` | `P` |
| `validTo` | `P` |
| `cardType` | `P` |
| `sourceUrl` | `Y` |
| `asOf` | `P` |
| `minSpend` | `N` |

Counts: Y=3 · P=6 · N=1 · K=0

