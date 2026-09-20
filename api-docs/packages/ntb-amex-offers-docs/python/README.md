# Python helper — NTB Mastercard + Amex Offers

> Unofficial · not affiliated · polite public reads only.

Installable package `ntb-amex-offers-docs-unofficial` (module `ntb_amex_offers_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from ntb_amex_offers_docs import NtbAmexOffersDocsClient

with NtbAmexOffersDocsClient(default_delay_seconds=1.0) as client:
    data = client.ntb_promotions_hub()
    print(data)
```

## Methods

- `ntb_promotions_hub()` — GET `/personal/cards/promotions` — NTB card promotions hub HTML.
- `amex_supermarket_offers()` — GET `/benefits/consumer/supermarket-offers/` — Amex LK supermarket offers HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
