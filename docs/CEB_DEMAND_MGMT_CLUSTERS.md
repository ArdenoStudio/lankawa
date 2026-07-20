# CEB Care — GetDemandMgmtClusters

**Status:** Shipped (Jul 2026) — live adapter + seed fallback on `/economy` household energy  
**Adapter:** `src/lib/integrations/demand-mgmt-clusters.ts`  
**Provenance:** `ceb_demand_mgmt_clusters`

## Endpoint

```
GET https://cebcare.ceb.lk/Incognito/GetDemandMgmtClusters?LoadShedGroupId={groupId}
```

| Detail | Value |
|--------|--------|
| Bootstrap page | `https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule` |
| Auth | `.AspNetCore.Antiforgery.*` cookie + `RequestVerificationToken` header |
| Method | GET only (POST → 405) |
| Group ids | Letter groups **A–Y** return cluster arrays; numeric `1–5` return `{}` |
| Payload | Often a JSON **string** that needs a second `JSON.parse` (same quirk as other CEB Incognito APIs) |

## Row shape (observed)

```json
{
  "NumberOfCustomers": 20725,
  "OutageTypeId": 3,
  "StartTime": "0001-01-01T00:00:00",
  "EndTime": "0001-01-01T00:00:00",
  "GeneratedTime": "2026-07-20T10:35:33.2171271+05:30",
  "GroupId": "A",
  "Points": [{ "Lat": 6.26, "Lon": 80.06, "...": "..." }]
}
```

Lankawa **discards** `Points` (polygon geometry) and keeps per-group `clusterCount` + `customerCount`.

## Honesty

Indicative public map counts — **confirm on cebcare.ceb.lk**. Not a live outage alert and not a substitute for CEB Care’s schedule UI.

## Related

- Pulse/disaster power status: `src/lib/integrations/power.ts` (`ceb_power`)
- Survey row: [`CONSUMER_OFFERS_AND_DATA_SURVEY.md`](./CONSUMER_OFFERS_AND_DATA_SURVEY.md) §4
- Integration summary: [`INTEGRATIONS.md`](./INTEGRATIONS.md)
