# Python helper — Amana / Union / Cargills Bank rates & offers

> Unofficial · not affiliated · polite public reads only.

Installable package `amana-union-cargills-bank-docs-unofficial` (module `amana_union_cargills_bank_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from amana_union_cargills_bank_docs import AmanaUnionCargillsBankDocsClient

with AmanaUnionCargillsBankDocsClient(default_delay_seconds=1.0) as client:
    data = client.amana_rates()
    print(data)
```

## Methods

- `amana_rates()` — GET `amanabank.lk/rates/` — Amana rates pages (Islamic products).
- `union_bank_offers()` — GET `unionb.com/.../offers` — Union Bank card offers HTML.
- `cargills_bank_rates()` — GET `cargillsbank.com/rates-and-tariffs/` — Cargills Bank rates & tariffs.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
