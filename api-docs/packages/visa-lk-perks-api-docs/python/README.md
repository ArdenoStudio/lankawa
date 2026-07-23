# Python helper — Visa LK Perks API

> Unofficial · not affiliated · polite public reads only.

Installable package `visa-lk-perks-api-docs-unofficial` (module `visa_lk_perks_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from visa_lk_perks_api_docs import VisaLkPerksApiDocsClient

with VisaLkPerksApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.portal_perks()
    print(data)
```

## Methods

- `portal_perks()` — POST `/offers/api/portal/portal/perks/` — VMORC perks; needs siteId + perkTypeRequests body.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
