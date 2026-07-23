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
    "id": "bill_calculator",
    "method": "POST",
    "url": "https://ebis.waterboard.lk/api_nwsdb/bill/BillCalculator",
    "path": "/api_nwsdb/bill/BillCalculator",
    "summary": "Domestic bill estimate.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "get_tariff_adjustment",
    "method": "GET",
    "url": "https://ebis.waterboard.lk/api_nwsdb/bill/getTariffAdjustment",
    "path": "/api_nwsdb/bill/getTariffAdjustment",
    "summary": "Tariff adjustment metadata.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
