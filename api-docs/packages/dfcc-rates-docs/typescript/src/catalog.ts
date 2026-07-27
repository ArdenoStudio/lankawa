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
    "id": "interest_rates_page",
    "method": "GET",
    "url": "https://www.dfcc.lk/interest-rates/",
    "path": "/interest-rates/",
    "summary": "RSC-embedded deposit/loan rates.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "exchange_rates_page",
    "method": "GET",
    "url": "https://www.dfcc.lk/exchange-rates/",
    "path": "/exchange-rates/",
    "summary": "FX rates page.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "card_offers_supermarket",
    "method": "GET",
    "url": "https://www.dfcc.lk/personal/cards/card-offers/",
    "path": "/personal/cards/card-offers/",
    "summary": "Card offers hub (supermarket DOW scrape).",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
