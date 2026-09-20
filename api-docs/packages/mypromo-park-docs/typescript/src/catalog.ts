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
    "id": "mypromo_parked",
    "method": "GET",
    "url": "https://mypromo.lk/",
    "path": "/",
    "summary": "PARK — ToS bans scrape; prefer bank first-party.",
    "status": "parked",
    "pagination": null
  }
] as EndpointSpec[];
