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
    "id": "openapi",
    "method": "GET",
    "url": "https://food-platform-backend.fly.dev/openapi.json",
    "path": "/openapi.json",
    "summary": "Full OpenAPI (41 paths).",
    "status": "live",
    "pagination": null
  },
  {
    "id": "hub_manifest",
    "method": "GET",
    "url": "https://food-platform-backend.fly.dev/api/v1/hub/manifest",
    "path": "/api/v1/hub/manifest",
    "summary": "Often 200 when hub/summary is 500.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "hub_summary",
    "method": "GET",
    "url": "https://food-platform-backend.fly.dev/api/v1/hub/summary",
    "path": "/api/v1/hub/summary",
    "summary": "Preferred Lankawa surface — frequently 500.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "basket_estimate",
    "method": "GET",
    "url": "https://food-platform-backend.fly.dev/api/v1/basket/estimate?preset=essentials",
    "path": "/api/v1/basket/estimate",
    "summary": "Essentials staples preset.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
