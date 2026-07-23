# Field coverage — `ndb-rates-docs`

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
| `asOf` | `P` |
| `spreadLkr` | `P` |
| `currency` | `P` |
| `ttBuy` | `P` |
| `ttSell` | `P` |
| `ddBuy` | `N` |
| `ddSell` | `N` |
| `chequeBuy` | `N` |
| `chequeSell` | `N` |

Counts: Y=0 · P=7 · N=4 · K=0

## Fixed deposits / interest rates

_Domain:_ `fd_deposits`

| Field | Coverage |
|---|---|
| `tenorMonths` | `P` |
| `paidIn` | `P` |
| `ratePa` | `P` |
| `aerPa` | `N` |
| `effectiveFrom` | `P` |
| `seniorCitizen` | `P` |
| `productCode` | `N` |
| `productName` | `P` |
| `currency` | `P` |

Counts: Y=0 · P=7 · N=2 · K=0

## Supermarket / card offers

_Domain:_ `card_offers`

| Field | Coverage |
|---|---|
| `bank` | `Y` |
| `merchant` | `P` |
| `title` | `P` |
| `discountLabel` | `P` |
| `weekdayHint` | `P` |
| `validTo` | `P` |
| `cardType` | `P` |
| `sourceUrl` | `Y` |
| `asOf` | `P` |
| `minSpend` | `N` |

Counts: Y=2 · P=7 · N=1 · K=0

