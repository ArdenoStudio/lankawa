# Python helper — lk-flood-api (nuuuwan)

> Unofficial · not affiliated · polite public reads only.

Installable package `lk-flood-api-docs-unofficial` (module `lk_flood_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from lk_flood_api_docs import LkFloodApiDocsClient

with LkFloodApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.flood_latest()
    print(data)
```

## Methods

- `flood_latest()` — GET `/lk_flood.json` — Flood station levels JSON used by Lankawa flood adapter.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
