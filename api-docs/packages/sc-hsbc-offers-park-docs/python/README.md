# Python helper — Standard Chartered + HSBC LK offers (park notes)

> Unofficial · not affiliated · polite public reads only.

Installable package `sc-hsbc-offers-park-docs-unofficial` (module `sc_hsbc_offers_park_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from sc_hsbc_offers_park_docs import ScHsbcOffersParkDocsClient

with ScHsbcOffersParkDocsClient(default_delay_seconds=1.0) as client:
    data = client.sc_tgl_offers_json_parked()
    print(data)
```

## Methods

- `sc_tgl_offers_json_parked()` — GET `/lk/offers.json` — PARK — TGL offers.json mostly expired on probe.
- `hsbc_retail_parked()` — GET `/` — PARK — HSBC LK retail sold to NTB; offer URLs dead.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
