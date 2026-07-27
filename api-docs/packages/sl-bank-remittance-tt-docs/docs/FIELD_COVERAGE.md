# Field coverage — `sl-bank-remittance-tt-docs`

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
| `asOf` | `Y` |
| `spreadLkr` | `Y` |
| `currency` | `Y` |
| `ttBuy` | `Y` |
| `ttSell` | `Y` |
| `ddBuy` | `P` |
| `ddSell` | `P` |
| `chequeBuy` | `N` |
| `chequeSell` | `N` |

Counts: Y=7 · P=2 · N=2 · K=0

