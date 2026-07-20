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
    "id": "get_exchange_rates_contents_web",
    "method": "GET",
    "url": "https://venus.hnb.lk/api/get_exchange_rates_contents_web",
    "path": "/get_exchange_rates_contents_web",
    "summary": "FX contents for web.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_all_web_card_promos",
    "method": "GET",
    "url": "https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit",
    "path": "/get_all_web_card_promos",
    "summary": "~841 card promos paginated.",
    "status": "live",
    "pagination": {
      "style": "page_limit",
      "params": {
        "page": "1-based",
        "limit": "default 50",
        "cardType": "credit|debit"
      },
      "lab": true
    }
  },
  {
    "id": "get_interest_rates_contents",
    "method": "GET",
    "url": "https://venus.hnb.lk/api/get_interest_rates_contents",
    "path": "/get_interest_rates_contents",
    "summary": "Nested FD/savings/loans tables in table_data_approved.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_web_card_promo",
    "method": "GET",
    "url": "https://venus.hnb.lk/api/get_web_card_promo?id=1",
    "path": "/get_web_card_promo",
    "summary": "Single promo detail by id.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_rates_contents_web",
    "method": "GET",
    "url": "https://venus.hnb.lk/api/get_rates_contents_web",
    "path": "/get_rates_contents_web",
    "summary": "FX + deposit teaser with updated_on stamp.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_exchange_rate_last_update_date_contents",
    "method": "GET",
    "url": "https://venus.hnb.lk/api/get_exchange_rate_last_update_date_contents",
    "path": "/get_exchange_rate_last_update_date_contents",
    "summary": "As-of stamp for FX board.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_all_web_card_promos_debit",
    "method": "GET",
    "url": "https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=debit",
    "path": "/get_all_web_card_promos",
    "summary": "Debit card promos (~93); includes Glomark supermarket.",
    "status": "live",
    "pagination": {
      "style": "page_limit",
      "params": {
        "page": "1-based",
        "limit": "page size",
        "cardType": "debit"
      },
      "lab": true
    }
  }
] as EndpointSpec[];
