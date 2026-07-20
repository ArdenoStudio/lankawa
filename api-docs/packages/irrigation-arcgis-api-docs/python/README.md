# Python helper — Irrigation ArcGIS Gauges

> Unofficial · not affiliated · polite public reads only.

Installable package `irrigation-arcgis-api-docs-unofficial` (module `irrigation_arcgis_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from irrigation_arcgis_api_docs import IrrigationArcgisApiDocsClient

with IrrigationArcgisApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.gauges_2_view_query()
    print(data)
```

## Methods

- `gauges_2_view_query()` — GET `/gauges_2_view/FeatureServer/0/query` — Latest river gauge readings.
- `rainfall_24hr()` — GET `/24hr_rainfall/FeatureServer/0/query` — 24-hour rainfall FeatureServer.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
