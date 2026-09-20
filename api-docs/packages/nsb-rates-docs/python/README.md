# Python helper — NSB Rates Pages

> Unofficial · not affiliated · polite public reads only.

Installable package `nsb-rates-docs-unofficial` (module `nsb_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from nsb_rates_docs import NsbRatesDocsClient

with NsbRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.deposit_rates_html()
    print(data)
```

## Methods

- `deposit_rates_html()` — GET `/rates-tarriffs/deposit-rates/` — Deposit rates HTML (note path typo tarriffs).
- `exchange_rates_html()` — GET `/rates-tarriffs/exchange-rates/` — FX TT HTML board.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
