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
    "id": "cbsl_gold_page",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates",
    "path": "(see GOLD_RETAIL_RATES_RESEARCH.md)",
    "summary": "CBSL + jeweller retail gold scrape notes.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
