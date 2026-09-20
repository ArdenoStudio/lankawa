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
    "url": "https://www.ndbbank.com/rates-and-tariffs/exchange-rates",
    "path": "/rates-and-tariffs/exchange-rates",
    "summary": "FX rates HTML.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "deposit_interest",
    "method": "GET",
    "url": "https://www.ndbbank.com/rates-and-tariffs/interest-rates-for-deposits",
    "path": "/rates-and-tariffs/interest-rates-for-deposits",
    "summary": "Deposit interest HTML.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "card_offers",
    "method": "GET",
    "url": "https://www.ndbbank.com/cards/offers",
    "path": "/cards/offers",
    "summary": "Card offers HTML.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
