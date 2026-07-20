# Python helper — GDACS + NASA FIRMS

> Unofficial · not affiliated · polite public reads only.

Installable package `gdacs-firms-docs-unofficial` (module `gdacs_firms_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from gdacs_firms_docs import GdacsFirmsDocsClient

with GdacsFirmsDocsClient(default_delay_seconds=1.0) as client:
    data = client.gdacs_events_rss()
    print(data)
```

## Methods

- `gdacs_events_rss()` — GET `/xml/rss.xml` — GDACS multi-hazard RSS.
- `firms_csv_lk()` — GET `/api/area/csv/.../VIIRS_SNPP_NRT/{bbox}/{days}` — FIRMS hotspot CSV for LK bbox (needs MAP_KEY).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
