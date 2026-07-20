# Python helper — Softlogic EMI (park — heavy crawl)

> Unofficial · not affiliated · polite public reads only.

Installable package `softlogic-emi-park-docs-unofficial` (module `softlogic_emi_park_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from softlogic_emi_park_docs import SoftlogicEmiParkDocsClient

with SoftlogicEmiParkDocsClient(default_delay_seconds=1.0) as client:
    data = client.variation_detail_parked()
    print(data)
```

## Methods

- `variation_detail_parked()` — GET `/variation-detail/{id}` — PARK — per-SKU EMI crawl too heavy vs Singer json-get-emi.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
