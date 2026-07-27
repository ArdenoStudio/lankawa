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
    "id": "card_offers_js",
    "method": "GET",
    "url": "https://www.pabc.com/personal/cards/offers",
    "path": "/personal/cards/offers",
    "summary": "Offers page; arr_offers JS after Sucuri cookie.",
    "status": "live",
    "pagination": {
      "style": "client_array",
      "lab": true,
      "notes": "Parse arr_offers after WAF cookie"
    }
  },
  {
    "id": "senior_fd_html",
    "method": "GET",
    "url": "https://www.pabc.com/personal/deposits/senior-citizens-fixed-deposit",
    "path": "/personal/deposits/senior-citizens-fixed-deposit",
    "summary": "Senior FD HTML (main ladder may be PDF-only).",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
