# Python helper — HARTI + CBSL Food Price PDFs

> Unofficial · not affiliated · polite public reads only.

Installable package `harti-cbsl-food-pdf-docs-unofficial` (module `harti_cbsl_food_pdf_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from harti_cbsl_food_pdf_docs import HartiCbslFoodPdfDocsClient

with HartiCbslFoodPdfDocsClient(default_delay_seconds=1.0) as client:
    data = client.harti_daily_prices_index()
    print(data)
```

## Methods

- `harti_daily_prices_index()` — GET `/market-information/daily-prices` — HARTI daily price PDF index.
- `cbsl_weekly_food()` — GET `/en/statistics/economic-indicators` — CBSL food/economic indicator PDF entry points.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
