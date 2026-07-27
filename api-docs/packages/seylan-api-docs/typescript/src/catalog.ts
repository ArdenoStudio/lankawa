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
    "id": "exchange_rates_usd",
    "method": "GET",
    "url": "https://www.seylan.lk/api/exchange-rates-get-value/USD",
    "path": "/api/exchange-rates-get-value/{CCY}",
    "summary": "Per-currency FX JSON.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_fd_data",
    "method": "GET",
    "url": "https://www.seylan.lk/get-fd-data",
    "path": "/get-fd-data",
    "summary": "FD calculator JSON (Content-Type may lie text/html).",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
