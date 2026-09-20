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
    "id": "procurements_list",
    "method": "GET",
    "url": "https://promise.lk/",
    "path": "/",
    "summary": "Public procurement listings (scrape/API as probed).",
    "status": "live",
    "pagination": {
      "style": "html_list",
      "lab": true
    }
  }
] as EndpointSpec[];
