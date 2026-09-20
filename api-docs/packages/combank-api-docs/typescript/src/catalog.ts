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
    "url": "https://www.combank.lk/api/exchange-rates",
    "path": "/api/exchange-rates",
    "summary": "Multi-currency TT/DD rates JSON (USD TT buy/sell).",
    "status": "live",
    "pagination": null
  },
  {
    "id": "interest_rates_fd",
    "method": "GET",
    "url": "https://www.combank.lk/api/interest-rates-fd",
    "path": "/api/interest-rates-fd",
    "summary": "FD ladder array: paidIn, period (months), rate.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "rewards_promotions_html",
    "method": "GET",
    "url": "https://www.combank.lk/rewards-promotions",
    "path": "/rewards-promotions",
    "summary": "HTML rewards list (~72); supermarket DOW scrape.",
    "status": "live",
    "pagination": {
      "style": "html-list",
      "notes": "Full page list, not cursor pages"
    }
  }
] as EndpointSpec[];
