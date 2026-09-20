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
    "id": "exchange_rates_html",
    "method": "GET",
    "url": "https://www.peoplesbank.lk/exchange-rates/",
    "path": "/exchange-rates/",
    "summary": "FX TT HTML.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "interest_rates_html",
    "method": "GET",
    "url": "https://www.peoplesbank.lk/interest-rates/",
    "path": "/interest-rates/",
    "summary": "Deposit/loan interest HTML.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "offer_cards",
    "method": "GET",
    "url": "https://www.peoplesbank.lk/card-offers/",
    "path": "/card-offers/",
    "summary": "Card offer listing HTML.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
