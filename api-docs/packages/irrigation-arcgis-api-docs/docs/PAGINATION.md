# Pagination lab — Irrigation ArcGIS Gauges

Endpoints with `pagination.lab: true`:

## `gauges_2_view_query`

- **Style:** `arcgis`
- **URL:** `https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0/query?where=1%3D1&outFields=*&orderByFields=EditDate%20DESC&resultRecordCount=50&f=json`
- **Params:** `{'resultOffset': 'offset', 'resultRecordCount': 'page size'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0/query?where=1%3D1&outFields=*&orderByFields=EditDate%20DESC&resultRecordCount=50&f=json' | head
```

## `rainfall_24hr`

- **Style:** `arcgis`
- **URL:** `https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/24hr_rainfall/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=50&f=json`
- **Params:** `None`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/24hr_rainfall/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=50&f=json' | head
```
