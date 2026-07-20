# Python helper — SL Bank Remittance TT Rates

> Unofficial · not affiliated · polite public reads only.

Installable package `sl-bank-remittance-tt-docs-unofficial` (module `sl_bank_remittance_tt_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from sl_bank_remittance_tt_docs import SlBankRemittanceTtDocsClient

with SlBankRemittanceTtDocsClient(default_delay_seconds=1.0) as client:
    data = client.pack_overview()
    print(data)
```

## Methods

- `pack_overview()` — GET `(multi-host pack)` — Aggregator: ComBank/Sampath/HNB/Seylan/NSB/DFCC/BOC/People's/NDB TT boards.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
