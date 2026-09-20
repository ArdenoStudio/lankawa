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
    "id": "variation_detail_parked",
    "method": "GET",
    "url": "https://www.softlogic.lk/",
    "path": "/variation-detail/{id}",
    "summary": "PARK — per-SKU EMI crawl too heavy vs Singer json-get-emi.",
    "status": "parked",
    "pagination": null
  }
] as EndpointSpec[];
