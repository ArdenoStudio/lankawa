# Python helper — SANASA Development Bank rates

> Unofficial · not affiliated · polite public reads only.

Installable package `sdb-rates-docs-unofficial` (module `sdb_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from sdb_rates_docs import SdbRatesDocsClient

with SdbRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.rates_page()
    print(data)
```

## Methods

- `rates_page()` — GET `/rates/` — SDB rates HTML surfaces.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
