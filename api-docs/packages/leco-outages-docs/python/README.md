# Python helper — LECO Outage Notices

> Unofficial · not affiliated · polite public reads only.

Installable package `leco-outages-docs-unofficial` (module `leco_outages_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from leco_outages_docs import LecoOutagesDocsClient

with LecoOutagesDocsClient(default_delay_seconds=1.0) as client:
    data = client.interruption_notices()
    print(data)
```

## Methods

- `interruption_notices()` — GET `/pages_e.php?id=45` — LECO interruption notices HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
