# Pagination lab — WFP HDX Sri Lanka Food Prices

Endpoints with `pagination.lab: true`:

## `wfp_food_prices_lka_csv`

- **Style:** `full_download`
- **URL:** `https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices_lka.csv`
- **Params:** `None`
- **Notes:** No server pagination — client chunk/filter

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices_lka.csv' | head
```
