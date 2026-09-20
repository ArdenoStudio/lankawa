# Python helper — Litro + LAUGFS LPG price pages

> Unofficial · not affiliated · polite public reads only.

Installable package `litro-laugfs-lpg-docs-unofficial` (module `litro_laugfs_lpg_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from litro_laugfs_lpg_docs import LitroLaugfsLpgDocsClient

with LitroLaugfsLpgDocsClient(default_delay_seconds=1.0) as client:
    data = client.litro_prices()
    print(data)
```

## Methods

- `litro_prices()` — GET `litrogas.com/` — Litro cylinder price HTML scrape surface.
- `laugfs_prices()` — GET `laugfs.lk/` — LAUGFS LPG price HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
