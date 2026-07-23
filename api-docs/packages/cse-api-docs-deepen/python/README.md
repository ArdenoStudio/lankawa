# Python helper — CSE (cse.lk) API — deepen pack

> Unofficial · not affiliated · polite public reads only.

Installable package `cse-api-docs-deepen-unofficial` (module `cse_api_docs_deepen`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from cse_api_docs_deepen import CseApiDocsDeepenClient

with CseApiDocsDeepenClient(default_delay_seconds=1.0) as client:
    data = client.top_gainers()
    print(data)
```

## Methods

- `top_gainers()` — POST `/topGainers` — Dedicated top gainers board.
- `top_looses()` — POST `/topLooses` — Dedicated top losers (CSE spelling).
- `sector_52_week()` — POST `/52WeekSectors` — 52-week / YTD sector ranges.
- `trade_summary()` — POST `/tradeSummary` — Full board — primary poller; client-side page in lab.
- `get_announcement_by_company()` — POST `/getAnnouncementByCompany` — Company announcements by symbol.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
