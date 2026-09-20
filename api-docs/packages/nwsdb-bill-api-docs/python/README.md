# Python helper — NWSDB Bill Calculator API

> Unofficial · not affiliated · polite public reads only.

Installable package `nwsdb-bill-api-docs-unofficial` (module `nwsdb_bill_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from nwsdb_bill_api_docs import NwsdbBillApiDocsClient

with NwsdbBillApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.bill_calculator()
    print(data)
```

## Methods

- `bill_calculator()` — POST `/api_nwsdb/bill/BillCalculator` — Domestic bill estimate.
- `get_tariff_adjustment()` — GET `/api_nwsdb/bill/getTariffAdjustment` — Tariff adjustment metadata.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
