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
    "id": "rates_tariff_html",
    "method": "GET",
    "url": "https://www.boc.lk/rates-tariff",
    "path": "/rates-tariff",
    "summary": "Canonical FX + FD HTML — prefer over stale JSON.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "interest_rates_fd_json_parked",
    "method": "GET",
    "url": "https://www.boc.lk/api/interest-rates-fd",
    "path": "/api/interest-rates-fd",
    "summary": "PARK — live JSON but wrong vs rates-tariff HTML.",
    "status": "parked",
    "pagination": null
  }
] as EndpointSpec[];
