export type EndpointSpec = {
  id: string;
  method: string;
  url?: string;
  path?: string;
  summary?: string;
  status?: string;
  pagination?: unknown;
};

/** Mirror of catalog/endpoints.yaml for runtime discovery. */
export const ENDPOINTS: EndpointSpec[] = [
  {
    "id": "demand_mgmt_schedule",
    "method": "GET",
    "url": "https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule",
    "path": "/Incognito/DemandMgmtSchedule",
    "summary": "HTML bootstrap for antiforgery token.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_demand_mgmt_clusters",
    "method": "GET",
    "url": "https://cebcare.ceb.lk/Incognito/GetDemandMgmtClusters?LoadShedGroupId=A",
    "path": "/Incognito/GetDemandMgmtClusters",
    "summary": "Clusters for group A–Y; requires verification token.",
    "status": "live",
    "pagination": {
      "style": "group_id",
      "params": {
        "LoadShedGroupId": "A-Y"
      },
      "lab": true
    }
  }
] as EndpointSpec[];
