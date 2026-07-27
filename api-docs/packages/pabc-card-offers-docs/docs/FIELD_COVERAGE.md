# Field coverage — `pabc-card-offers-docs`

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
| `buyLkr` | `K` |
| `sellLkr` | `K` |
| `asOf` | `K` |
| `spreadLkr` | `K` |
| `currency` | `K` |
| `ttBuy` | `K` |
| `ttSell` | `K` |
| `ddBuy` | `K` |
| `ddSell` | `K` |
| `chequeBuy` | `K` |
| `chequeSell` | `K` |

Counts: Y=0 · P=0 · N=0 · K=11

## Fixed deposits / interest rates

_Domain:_ `fd_deposits`

| Field | Coverage |
|---|---|
| `tenorMonths` | `P` |
| `paidIn` | `P` |
| `ratePa` | `P` |
| `aerPa` | `N` |
| `effectiveFrom` | `P` |
| `seniorCitizen` | `Y` |
| `productCode` | `N` |
| `productName` | `P` |
| `currency` | `P` |

Counts: Y=1 · P=6 · N=2 · K=0

## Supermarket / card offers

_Domain:_ `card_offers`

| Field | Coverage |
|---|---|
| `bank` | `Y` |
| `merchant` | `Y` |
| `title` | `Y` |
| `discountLabel` | `Y` |
| `weekdayHint` | `P` |
| `validTo` | `P` |
| `cardType` | `P` |
| `sourceUrl` | `Y` |
| `asOf` | `P` |
| `minSpend` | `N` |

Counts: Y=5 · P=4 · N=1 · K=0

