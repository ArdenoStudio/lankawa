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
    "id": "sc_tgl_offers_json_parked",
    "method": "GET",
    "url": "https://www.sc.com/lk/offers.json",
    "path": "/lk/offers.json",
    "summary": "PARK — TGL offers.json mostly expired on probe.",
    "status": "parked",
    "pagination": null
  },
  {
    "id": "hsbc_retail_parked",
    "method": "GET",
    "url": "https://www.hsbc.lk/",
    "path": "/",
    "summary": "PARK — HSBC LK retail sold to NTB; offer URLs dead.",
    "status": "parked",
    "pagination": null
  }
] as EndpointSpec[];
