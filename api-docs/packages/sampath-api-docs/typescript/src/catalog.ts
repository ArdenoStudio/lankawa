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
    "id": "exchange_rates",
    "method": "GET",
    "url": "https://www.sampath.lk/api/exchange-rates",
    "path": "/api/exchange-rates",
    "summary": "TTBUY/TTSEL FX JSON.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "rates_and_charges_external",
    "method": "GET",
    "url": "https://www.sampath.lk/api/rates-and-charges/external",
    "path": "/api/rates-and-charges/external",
    "summary": "local.term_and_deposite FD slabs + savings.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "card_promotions_super_markets",
    "method": "GET",
    "url": "https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20",
    "path": "/api/card-promotions",
    "summary": "Supermarket card offers JSON.",
    "status": "live",
    "pagination": {
      "style": "page_number",
      "params": {
        "page_number": "1-based",
        "size": "page size"
      },
      "lab": true
    }
  }
] as EndpointSpec[];
