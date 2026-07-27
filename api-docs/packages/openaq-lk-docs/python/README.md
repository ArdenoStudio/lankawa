# Python helper — OpenAQ Sri Lanka

> Unofficial · not affiliated · polite public reads only.

Installable package `openaq-lk-docs-unofficial` (module `openaq_lk_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from openaq_lk_docs import OpenaqLkDocsClient

with OpenaqLkDocsClient(default_delay_seconds=1.0) as client:
    data = client.locations_lk()
    print(data)
```

## Methods

- `locations_lk()` — GET `/v3/locations` — LK monitoring locations (country id may change).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
