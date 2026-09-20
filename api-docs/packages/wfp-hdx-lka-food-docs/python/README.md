# Python helper — WFP HDX Sri Lanka Food Prices

> Unofficial · not affiliated · polite public reads only.

Installable package `wfp-hdx-lka-food-docs-unofficial` (module `wfp_hdx_lka_food_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from wfp_hdx_lka_food_docs import WfpHdxLkaFoodDocsClient

with WfpHdxLkaFoodDocsClient(default_delay_seconds=1.0) as client:
    data = client.wfp_food_prices_lka_csv()
    print(data)
```

## Methods

- `wfp_food_prices_lka_csv()` — GET `/download/wfp_food_prices_lka.csv` — Full LKA CSV (~34k rows).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
