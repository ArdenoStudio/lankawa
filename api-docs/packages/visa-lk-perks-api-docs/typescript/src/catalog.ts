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
    "id": "portal_perks",
    "method": "POST",
    "url": "https://www.visa.com.lk/offers/api/portal/portal/perks/",
    "path": "/offers/api/portal/portal/perks/",
    "summary": "VMORC perks; needs siteId + perkTypeRequests body.",
    "status": "live",
    "pagination": {
      "style": "pageRequest",
      "params": {
        "pageRequest.index": "0-based",
        "pageRequest.limit": "page size"
      },
      "lab": true
    }
  }
] as EndpointSpec[];
