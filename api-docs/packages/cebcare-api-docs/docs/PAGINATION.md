# Pagination lab — CEB Care API

Endpoints with `pagination.lab: true`:

## `get_demand_mgmt_clusters`

- **Style:** `group_id`
- **URL:** `https://cebcare.ceb.lk/Incognito/GetDemandMgmtClusters?LoadShedGroupId=A`
- **Params:** `{'LoadShedGroupId': 'A-Y'}`
- **Notes:** —

### curl (page / offset variants)

```bash
curl -sS -A 'LankawaApiDocsBot/1.0' 'https://cebcare.ceb.lk/Incognito/GetDemandMgmtClusters?LoadShedGroupId=A' | head
```
