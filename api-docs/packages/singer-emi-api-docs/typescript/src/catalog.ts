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
    "id": "json_get_emi",
    "method": "GET",
    "url": "https://www.singersl.com/json-get-emi?product_id=7884&product_price=53699",
    "path": "/json-get-emi",
    "summary": "Multi-bank EMI rows for a SKU.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
