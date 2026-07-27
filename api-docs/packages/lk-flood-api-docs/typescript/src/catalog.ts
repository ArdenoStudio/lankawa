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
    "id": "flood_latest",
    "method": "GET",
    "url": "https://raw.githubusercontent.com/nuuuwan/lk_flood/data/lk_flood.json",
    "path": "/lk_flood.json",
    "summary": "Flood station levels JSON used by Lankawa flood adapter.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
