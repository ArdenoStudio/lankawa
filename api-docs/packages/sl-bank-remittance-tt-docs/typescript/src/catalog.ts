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
    "url": "https://www.combank.lk/api/exchange-rates",
    "path": "(multi-host pack)",
    "summary": "Aggregator: ComBank/Sampath/HNB/Seylan/NSB/DFCC/BOC/People's/NDB TT boards.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
