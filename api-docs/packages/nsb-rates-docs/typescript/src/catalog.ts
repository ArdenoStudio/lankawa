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
    "id": "deposit_rates_html",
    "method": "GET",
    "url": "https://www.nsb.lk/rates-tarriffs/deposit-rates/",
    "path": "/rates-tarriffs/deposit-rates/",
    "summary": "Deposit rates HTML (note path typo tarriffs).",
    "status": "live",
    "pagination": null
  },
  {
    "id": "exchange_rates_html",
    "method": "GET",
    "url": "https://www.nsb.lk/rates-tarriffs/exchange-rates/",
    "path": "/rates-tarriffs/exchange-rates/",
    "summary": "FX TT HTML board.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
