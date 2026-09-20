# Pagination lab — Visa LK Perks API

Endpoints with `pagination.lab: true`:

## `portal_perks`

- **Style:** `pageRequest`
- **URL:** `https://www.visa.com.lk/offers/api/portal/portal/perks/`
- **Params:** `{'pageRequest.index': '0-based', 'pageRequest.limit': 'page size'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://www.visa.com.lk/offers/api/portal/portal/perks/' | head
```
