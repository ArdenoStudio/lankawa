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
    "id": "harti_daily_prices_index",
    "method": "GET",
    "url": "https://www.harti.gov.lk/index.php/en/market-information/daily-prices",
    "path": "/market-information/daily-prices",
    "summary": "HARTI daily price PDF index.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "cbsl_weekly_food",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/en/statistics/economic-indicators",
    "path": "/en/statistics/economic-indicators",
    "summary": "CBSL food/economic indicator PDF entry points.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
