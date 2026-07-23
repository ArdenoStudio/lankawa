# Pagination lab — Pan Asia Bank Card Offers

Endpoints with `pagination.lab: true`:

## `card_offers_js`

- **Style:** `client_array`
- **URL:** `https://www.pabc.com/personal/cards/offers`
- **Params:** `None`
- **Notes:** Parse arr_offers after WAF cookie

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://www.pabc.com/personal/cards/offers' | head
```
