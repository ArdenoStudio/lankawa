# Python helper — People's Bank Rates

> Unofficial · not affiliated · polite public reads only.

Installable package `peoples-bank-rates-docs-unofficial` (module `peoples_bank_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from peoples_bank_rates_docs import PeoplesBankRatesDocsClient

with PeoplesBankRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.exchange_rates_html()
    print(data)
```

## Methods

- `exchange_rates_html()` — GET `/exchange-rates/` — FX TT HTML.
- `interest_rates_html()` — GET `/interest-rates/` — Deposit/loan interest HTML.
- `offer_cards()` — GET `/card-offers/` — Card offer listing HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
