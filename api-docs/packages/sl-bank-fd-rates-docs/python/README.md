# Python helper — SL Bank Fixed Deposit Rates

> Unofficial · not affiliated · polite public reads only.

Installable package `sl-bank-fd-rates-docs-unofficial` (module `sl_bank_fd_rates_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from sl_bank_fd_rates_docs import SlBankFdRatesDocsClient

with SlBankFdRatesDocsClient(default_delay_seconds=1.0) as client:
    data = client.pack_overview()
    print(data)
```

## Methods

- `pack_overview()` — GET `(multi-host pack)` — Aggregator: ComBank/Sampath/Seylan/HNB FD JSON → unified ladder.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
