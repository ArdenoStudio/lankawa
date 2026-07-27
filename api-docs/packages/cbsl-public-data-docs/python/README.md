# Python helper — CBSL Public Data

> Unofficial · not affiliated · polite public reads only.

Installable package `cbsl-public-data-docs-unofficial` (module `cbsl_public_data_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from cbsl_public_data_docs import CbslPublicDataDocsClient

with CbslPublicDataDocsClient(default_delay_seconds=1.0) as client:
    data = client.plrates_html()
    print(data)
```

## Methods

- `plrates_html()` — GET `/en/rates-and-indicators/policy-rates` — Policy rates page (OPR / corridor context).
- `historical_policy_xlsx()` — GET `/historical_policy_interest_rates.xlsx` — Historical SDFR/SLFR/OPR Excel tip.
- `eresearch_tbill_6169()` — GET `/eresearch/.../6169` — Secondary market T-bill yields (91/182/364).
- `eresearch_awpr_6277()` — GET `/eresearch/.../6277` — Weekly AWPR series.
- `payments_bulletin_index()` — GET `/en/payments-and-settlements/payments-bulletin` — Payments bulletin PDF index.
- `fx_buying_selling_html()` — GET `/en/rates-and-indicators/exchange-rates` — CBSL indicative FX HTML tables.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
