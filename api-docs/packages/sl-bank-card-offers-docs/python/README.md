# Python helper — SL Bank Supermarket Card Offers

> Unofficial · not affiliated · polite public reads only.

Installable package `sl-bank-card-offers-docs-unofficial` (module `sl_bank_card_offers_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from sl_bank_card_offers_docs import SlBankCardOffersDocsClient

with SlBankCardOffersDocsClient(default_delay_seconds=1.0) as client:
    data = client.pack_overview()
    print(data)
```

## Methods

- `pack_overview()` — GET `(multi-host pack)` — Aggregator pack: Sampath + HNB Venus + ComBank HTML + peers → supermarket DOW.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
