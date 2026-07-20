# Python helper — Bank of Ceylon Rates

> Unofficial · not affiliated · polite public reads only.

Installable package `boc-rates-docs-unofficial` (module `boc_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from boc_rates_docs import BocRatesDocsClient

with BocRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.rates_tariff_html()
    print(data)
```

## Methods

- `rates_tariff_html()` — GET `/rates-tariff` — Canonical FX + FD HTML — prefer over stale JSON.
- `interest_rates_fd_json_parked()` — GET `/api/interest-rates-fd` — PARK — live JSON but wrong vs rates-tariff HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
