# Python helper — Octane Fuel API

> Unofficial · not affiliated · polite public reads only.

Installable package `octane-fuel-api-docs-unofficial` (module `octane_fuel_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from octane_fuel_api_docs import OctaneFuelApiDocsClient

with OctaneFuelApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.prices_latest()
    print(data)
```

## Methods

- `prices_latest()` — GET `/v1/prices/latest` — Latest fuel prices.
- `comparison_world()` — GET `/v1/comparison/world` — World pump compare.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
