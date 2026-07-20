# Python helper — CEB Care API

> Unofficial · not affiliated · polite public reads only.

Installable package `cebcare-api-docs-unofficial` (module `cebcare_api_docs`), matching the Cookie-Cat21/cse-api-docs `python/` layout.

## Install

```bash
cd python
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python smoke.py
```

## Usage

```python
from cebcare_api_docs import CebcareApiDocsClient

with CebcareApiDocsClient(default_delay_seconds=1.0) as client:
    data = client.demand_mgmt_schedule()
    print(data)
```

## Methods

- `demand_mgmt_schedule()` — GET `/Incognito/DemandMgmtSchedule` — HTML bootstrap for antiforgery token.
- `get_demand_mgmt_clusters()` — GET `/Incognito/GetDemandMgmtClusters` — Clusters for group A–Y; requires verification token.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).

## Regenerate

```bash
python3 scripts/scaffold-py-clients.py
```
