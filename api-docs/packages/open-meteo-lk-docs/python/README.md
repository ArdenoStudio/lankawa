# Python helper — Open-Meteo Sri Lanka Recipes

> Unofficial · not affiliated · polite public reads only.

Installable package `open-meteo-lk-docs-unofficial` (module `open_meteo_lk_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from open_meteo_lk_docs import OpenMeteoLkDocsClient

with OpenMeteoLkDocsClient(default_delay_seconds=1.0) as client:
    data = client.forecast_colombo()
    print(data)
```

## Methods

- `forecast_colombo()` — GET `/v1/forecast` — Colombo daily forecast.
- `air_quality_colombo()` — GET `/v1/air-quality` — Colombo air quality.
- `marine_colombo()` — GET `/v1/marine` — Colombo marine wave height.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
