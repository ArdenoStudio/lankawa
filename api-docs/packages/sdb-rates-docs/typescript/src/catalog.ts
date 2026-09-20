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
    "id": "rates_page",
    "method": "GET",
    "url": "https://www.sdb.lk/rates/",
    "path": "/rates/",
    "summary": "SDB rates HTML surfaces.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
