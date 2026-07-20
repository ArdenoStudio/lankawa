# Python helper — FoodLK / Food Platform API

> Unofficial · not affiliated · polite public reads only.

Installable package `foodlk-api-docs-unofficial` (module `foodlk_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from foodlk_api_docs import FoodlkApiDocsClient

with FoodlkApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.openapi()
    print(data)
```

## Methods

- `openapi()` — GET `/openapi.json` — Full OpenAPI (41 paths).
- `hub_manifest()` — GET `/api/v1/hub/manifest` — Often 200 when hub/summary is 500.
- `hub_summary()` — GET `/api/v1/hub/summary` — Preferred Lankawa surface — frequently 500.
- `basket_estimate()` — GET `/api/v1/basket/estimate` — Essentials staples preset.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
