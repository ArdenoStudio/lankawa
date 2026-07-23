# Python helper — Ardeno Sister Backends

> Unofficial · not affiliated · polite public reads only.

Installable package `ardeno-sister-backends-docs-unofficial` (module `ardeno_sister_backends_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from ardeno_sister_backends_docs import ArdenoSisterBackendsDocsClient

with ArdenoSisterBackendsDocsClient(default_delay_seconds=1.0) as client:
    data = client.foodlk_openapi()
    print(data)
```

## Methods

- `foodlk_openapi()` — GET `food-platform-backend.fly.dev/openapi.json` — FoodLK OpenAPI.
- `octane_prices()` — GET `octane-api.fly.dev/v1/prices/latest` — Octane latest prices.
- `life_health()` — GET `life-platform-api.fly.dev/health` — Life platform health (host may vary).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
