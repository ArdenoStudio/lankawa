# Python helper — HNB Venus API

> Unofficial · not affiliated · polite public reads only.

Installable package `hnb-venus-api-docs-unofficial` (module `hnb_venus_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from hnb_venus_api_docs import HnbVenusApiDocsClient

with HnbVenusApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.get_exchange_rates_contents_web()
    print(data)
```

## Methods

- `get_exchange_rates_contents_web()` — GET `/get_exchange_rates_contents_web` — FX contents for web.
- `get_all_web_card_promos()` — GET `/get_all_web_card_promos` — ~841 card promos paginated.
- `get_interest_rates_contents()` — GET `/get_interest_rates_contents` — Nested FD/savings/loans tables in table_data_approved.
- `get_web_card_promo()` — GET `/get_web_card_promo` — Single promo detail by id.
- `get_rates_contents_web()` — GET `/get_rates_contents_web` — FX + deposit teaser with updated_on stamp.
- `get_exchange_rate_last_update_date_contents()` — GET `/get_exchange_rate_last_update_date_contents` — As-of stamp for FX board.
- `get_all_web_card_promos_debit()` — GET `/get_all_web_card_promos` — Debit card promos (~93); includes Glomark supermarket.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
