# Python helper — Promise.lk tenders

> Unofficial · not affiliated · polite public reads only.

Installable package `promise-lk-tenders-docs-unofficial` (module `promise_lk_tenders_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from promise_lk_tenders_docs import PromiseLkTendersDocsClient

with PromiseLkTendersDocsClient(default_delay_seconds=1.0) as client:
    data = client.procurements_list()
    print(data)
```

## Methods

- `procurements_list()` — GET `/` — Public procurement listings (scrape/API as probed).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
