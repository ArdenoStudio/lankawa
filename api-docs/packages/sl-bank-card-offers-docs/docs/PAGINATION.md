# Pagination lab — SL Bank Supermarket Card Offers

Endpoints with `pagination.lab: true`:

## `pack_overview`

- **Style:** `multi_host`
- **URL:** `https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20`
- **Params:** `None`
- **Notes:** See sibling bank packages for per-host pagination

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20' | head
```
