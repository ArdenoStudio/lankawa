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
    "id": "locations_lk",
    "method": "GET",
    "url": "https://api.openaq.org/v3/locations?countries_id=207&limit=100",
    "path": "/v3/locations",
    "summary": "LK monitoring locations (country id may change).",
    "status": "live",
    "pagination": {
      "style": "limit_page",
      "params": {
        "limit": "page size",
        "page": "1-based"
      },
      "lab": true
    }
  }
] as EndpointSpec[];
