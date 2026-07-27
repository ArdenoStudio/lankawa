# Python helper — Gold retail rates research pack

> Unofficial · not affiliated · polite public reads only.

Installable package `gold-retail-rates-docs-unofficial` (module `gold_retail_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from gold_retail_rates_docs import GoldRetailRatesDocsClient

with GoldRetailRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.cbsl_gold_page()
    print(data)
```

## Methods

- `cbsl_gold_page()` — GET `(see GOLD_RETAIL_RATES_RESEARCH.md)` — CBSL + jeweller retail gold scrape notes.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
