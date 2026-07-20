# Python helper — MyPromo.lk (park — ToS)

> Unofficial · not affiliated · polite public reads only.

Installable package `mypromo-park-docs-unofficial` (module `mypromo_park_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from mypromo_park_docs import MypromoParkDocsClient

with MypromoParkDocsClient(default_delay_seconds=1.0) as client:
    data = client.mypromo_parked()
    print(data)
```

## Methods

- `mypromo_parked()` — GET `/` — PARK — ToS bans scrape; prefer bank first-party.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
