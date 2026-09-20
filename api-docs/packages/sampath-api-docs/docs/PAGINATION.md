# Pagination lab — Sampath Bank API

Endpoints with `pagination.lab: true`:

## `card_promotions_super_markets`

- **Style:** `page_number`
- **URL:** `https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20`
- **Params:** `{'page_number': '1-based', 'size': 'page size'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20' | head
```
