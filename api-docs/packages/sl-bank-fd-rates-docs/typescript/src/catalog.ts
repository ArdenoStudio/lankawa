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
    "url": "https://www.combank.lk/api/interest-rates-fd",
    "path": "(multi-host pack)",
    "summary": "Aggregator: ComBank/Sampath/Seylan/HNB FD JSON → unified ladder.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
