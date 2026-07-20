# Python helper — Pan Asia Bank Card Offers

> Unofficial · not affiliated · polite public reads only.

Installable package `pabc-card-offers-docs-unofficial` (module `pabc_card_offers_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from pabc_card_offers_docs import PabcCardOffersDocsClient

with PabcCardOffersDocsClient(default_delay_seconds=1.0) as client:
    data = client.card_offers_js()
    print(data)
```

## Methods

- `card_offers_js()` — GET `/personal/cards/offers` — Offers page; arr_offers JS after Sucuri cookie.
- `senior_fd_html()` — GET `/personal/deposits/senior-citizens-fixed-deposit` — Senior FD HTML (main ladder may be PDF-only).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
