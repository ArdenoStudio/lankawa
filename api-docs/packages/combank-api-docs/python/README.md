# Python helper — Commercial Bank API

> Unofficial · not affiliated · polite public reads only.

Installable package `combank-api-docs-unofficial` (module `combank_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from combank_api_docs import CombankApiDocsClient

with CombankApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.exchange_rates()
    print(data)
```

## Methods

- `exchange_rates()` — GET `/api/exchange-rates` — Multi-currency TT/DD rates JSON (USD TT buy/sell).
- `interest_rates_fd()` — GET `/api/interest-rates-fd` — FD ladder array: paidIn, period (months), rate.
- `rewards_promotions_html()` — GET `/rewards-promotions` — HTML rewards list (~72); supermarket DOW scrape.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
