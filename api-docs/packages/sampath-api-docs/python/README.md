# Python helper — Sampath Bank API

> Unofficial · not affiliated · polite public reads only.

Installable package `sampath-api-docs-unofficial` (module `sampath_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from sampath_api_docs import SampathApiDocsClient

with SampathApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.exchange_rates()
    print(data)
```

## Methods

- `exchange_rates()` — GET `/api/exchange-rates` — TTBUY/TTSEL FX JSON.
- `rates_and_charges_external()` — GET `/api/rates-and-charges/external` — local.term_and_deposite FD slabs + savings.
- `card_promotions_super_markets()` — GET `/api/card-promotions` — Supermarket card offers JSON.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
