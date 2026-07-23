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
    "id": "ntb_promotions_hub",
    "method": "GET",
    "url": "https://www.ntb.lk/personal/cards/promotions",
    "path": "/personal/cards/promotions",
    "summary": "NTB card promotions hub HTML.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "amex_supermarket_offers",
    "method": "GET",
    "url": "https://www.americanexpress.lk/en-lk/benefits/consumer/supermarket-offers/",
    "path": "/benefits/consumer/supermarket-offers/",
    "summary": "Amex LK supermarket offers HTML.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
