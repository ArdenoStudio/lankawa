# Python helper — Met Dept CAP / Advisories

> Unofficial · not affiliated · polite public reads only.

Installable package `metdept-cap-api-docs-unofficial` (module `metdept_cap_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from metdept_cap_api_docs import MetdeptCapApiDocsClient

with MetdeptCapApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.cap_en_rss()
    print(data)
```

## Methods

- `cap_en_rss()` — GET `/images/XML/cap_en.xml` — CAP English warnings RSS/XML.
- `cap_si_rss()` — GET `/images/XML/cap_si.xml` — CAP Sinhala warnings.
- `cap_ta_rss()` — GET `/images/XML/cap_ta.xml` — CAP Tamil warnings.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
