# Pagination lab — GDACS + NASA FIRMS

Endpoints with `pagination.lab: true`:

## `firms_csv_lk`

- **Style:** `time_window`
- **URL:** `https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/79,5.5,82,10/1`
- **Params:** `{'days': '1-10'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/79,5.5,82,10/1' | head
```
