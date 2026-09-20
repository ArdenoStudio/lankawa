# Python helper — Singer Sri Lanka EMI API

> Unofficial · not affiliated · polite public reads only.

Installable package `singer-emi-api-docs-unofficial` (module `singer_emi_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from singer_emi_api_docs import SingerEmiApiDocsClient

with SingerEmiApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.json_get_emi()
    print(data)
```

## Methods

- `json_get_emi()` — GET `/json-get-emi` — Multi-bank EMI rows for a SKU.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
