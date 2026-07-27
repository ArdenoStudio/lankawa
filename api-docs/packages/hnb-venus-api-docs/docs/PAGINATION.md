# Pagination lab — HNB Venus API

Endpoints with `pagination.lab: true`:

## `get_all_web_card_promos`

- **Style:** `page_limit`
- **URL:** `https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit`
- **Params:** `{'page': '1-based', 'limit': 'default 50', 'cardType': 'credit|debit'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit' | head
```
