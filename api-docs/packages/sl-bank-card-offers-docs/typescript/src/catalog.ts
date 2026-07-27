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
    "id": "pack_overview",
    "method": "GET",
    "url": "https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20",
    "path": "(multi-host pack)",
    "summary": "Aggregator pack: Sampath + HNB Venus + ComBank HTML + peers → supermarket DOW.",
    "status": "live",
    "pagination": {
      "style": "multi_host",
      "lab": true,
      "notes": "See sibling bank packages for per-host pagination"
    }
  }
] as EndpointSpec[];
