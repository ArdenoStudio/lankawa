# Pagination lab — CSE (cse.lk) API — deepen pack

Endpoints with `pagination.lab: true`:

## `trade_summary`

- **Style:** `client_slice`
- **URL:** `https://www.cse.lk/api/tradeSummary`
- **Params:** `{'offset': 'client', 'limit': 'client'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://www.cse.lk/api/tradeSummary' | head
```
