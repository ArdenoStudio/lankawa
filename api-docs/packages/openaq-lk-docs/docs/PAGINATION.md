# Pagination lab — OpenAQ Sri Lanka

Endpoints with `pagination.lab: true`:

## `locations_lk`

- **Style:** `limit_page`
- **URL:** `https://api.openaq.org/v3/locations?countries_id=207&limit=100`
- **Params:** `{'limit': 'page size', 'page': '1-based'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://api.openaq.org/v3/locations?countries_id=207&limit=100' | head
```
