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
    "id": "foodlk_openapi",
    "method": "GET",
    "url": "https://food-platform-backend.fly.dev/openapi.json",
    "path": "food-platform-backend.fly.dev/openapi.json",
    "summary": "FoodLK OpenAPI.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "octane_prices",
    "method": "GET",
    "url": "https://octane-api.fly.dev/v1/prices/latest",
    "path": "octane-api.fly.dev/v1/prices/latest",
    "summary": "Octane latest prices.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "life_health",
    "method": "GET",
    "url": "https://life-platform-api.fly.dev/health",
    "path": "life-platform-api.fly.dev/health",
    "summary": "Life platform health (host may vary).",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
