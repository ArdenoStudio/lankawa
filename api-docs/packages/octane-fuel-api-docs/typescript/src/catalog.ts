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
    "id": "prices_latest",
    "method": "GET",
    "url": "https://octane-api.fly.dev/v1/prices/latest",
    "path": "/v1/prices/latest",
    "summary": "Latest fuel prices.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "comparison_world",
    "method": "GET",
    "url": "https://octane-api.fly.dev/v1/comparison/world",
    "path": "/v1/comparison/world",
    "summary": "World pump compare.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
