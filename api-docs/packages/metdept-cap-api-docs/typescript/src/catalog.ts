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
    "id": "cap_en_rss",
    "method": "GET",
    "url": "https://www.meteo.gov.lk/images/XML/cap_en.xml",
    "path": "/images/XML/cap_en.xml",
    "summary": "CAP English warnings RSS/XML.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "cap_si_rss",
    "method": "GET",
    "url": "https://www.meteo.gov.lk/images/XML/cap_si.xml",
    "path": "/images/XML/cap_si.xml",
    "summary": "CAP Sinhala warnings.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "cap_ta_rss",
    "method": "GET",
    "url": "https://www.meteo.gov.lk/images/XML/cap_ta.xml",
    "path": "/images/XML/cap_ta.xml",
    "summary": "CAP Tamil warnings.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
