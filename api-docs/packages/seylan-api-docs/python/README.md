# Python helper — Seylan Bank API

> Unofficial · not affiliated · polite public reads only.

Installable package `seylan-api-docs-unofficial` (module `seylan_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from seylan_api_docs import SeylanApiDocsClient

with SeylanApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.exchange_rates_usd()
    print(data)
```

## Methods

- `exchange_rates_usd()` — GET `/api/exchange-rates-get-value/{CCY}` — Per-currency FX JSON.
- `get_fd_data()` — GET `/get-fd-data` — FD calculator JSON (Content-Type may lie text/html).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
