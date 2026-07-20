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
    "id": "gdacs_events_rss",
    "method": "GET",
    "url": "https://www.gdacs.org/xml/rss.xml",
    "path": "/xml/rss.xml",
    "summary": "GDACS multi-hazard RSS.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "firms_csv_lk",
    "method": "GET",
    "url": "https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/79,5.5,82,10/1",
    "path": "/api/area/csv/.../VIIRS_SNPP_NRT/{bbox}/{days}",
    "summary": "FIRMS hotspot CSV for LK bbox (needs MAP_KEY).",
    "status": "live",
    "pagination": {
      "style": "time_window",
      "params": {
        "days": "1-10"
      },
      "lab": true
    }
  }
] as EndpointSpec[];
