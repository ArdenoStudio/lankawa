# Python helper — DFCC Rates & Card Offers

> Unofficial · not affiliated · polite public reads only.

Installable package `dfcc-rates-docs-unofficial` (module `dfcc_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from dfcc_rates_docs import DfccRatesDocsClient

with DfccRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.interest_rates_page()
    print(data)
```

## Methods

- `interest_rates_page()` — GET `/interest-rates/` — RSC-embedded deposit/loan rates.
- `exchange_rates_page()` — GET `/exchange-rates/` — FX rates page.
- `card_offers_supermarket()` — GET `/personal/cards/card-offers/` — Card offers hub (supermarket DOW scrape).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
