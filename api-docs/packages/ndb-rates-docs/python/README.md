# Python helper — NDB Rates

> Unofficial · not affiliated · polite public reads only.

Installable package `ndb-rates-docs-unofficial` (module `ndb_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from ndb_rates_docs import NdbRatesDocsClient

with NdbRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.exchange_rates()
    print(data)
```

## Methods

- `exchange_rates()` — GET `/rates-and-tariffs/exchange-rates` — FX rates HTML.
- `deposit_interest()` — GET `/rates-and-tariffs/interest-rates-for-deposits` — Deposit interest HTML.
- `card_offers()` — GET `/cards/offers` — Card offers HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
