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
    "id": "plrates_html",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates",
    "path": "/en/rates-and-indicators/policy-rates",
    "summary": "Policy rates page (OPR / corridor context).",
    "status": "live",
    "pagination": null
  },
  {
    "id": "historical_policy_xlsx",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/statistics/sheets/historical_policy_interest_rates.xlsx",
    "path": "/historical_policy_interest_rates.xlsx",
    "summary": "Historical SDFR/SLFR/OPR Excel tip.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "eresearch_tbill_6169",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6169",
    "path": "/eresearch/.../6169",
    "summary": "Secondary market T-bill yields (91/182/364).",
    "status": "live",
    "pagination": null
  },
  {
    "id": "eresearch_awpr_6277",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6277",
    "path": "/eresearch/.../6277",
    "summary": "Weekly AWPR series.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "payments_bulletin_index",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/en/payments-and-settlements/payments-bulletin",
    "path": "/en/payments-and-settlements/payments-bulletin",
    "summary": "Payments bulletin PDF index.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "fx_buying_selling_html",
    "method": "GET",
    "url": "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates",
    "path": "/en/rates-and-indicators/exchange-rates",
    "summary": "CBSL indicative FX HTML tables.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
