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
    "id": "top_gainers",
    "method": "POST",
    "url": "https://www.cse.lk/api/topGainers",
    "path": "/topGainers",
    "summary": "Dedicated top gainers board.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "top_looses",
    "method": "POST",
    "url": "https://www.cse.lk/api/topLooses",
    "path": "/topLooses",
    "summary": "Dedicated top losers (CSE spelling).",
    "status": "live",
    "pagination": null
  },
  {
    "id": "sector_52_week",
    "method": "POST",
    "url": "https://www.cse.lk/api/52WeekSectors",
    "path": "/52WeekSectors",
    "summary": "52-week / YTD sector ranges.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "trade_summary",
    "method": "POST",
    "url": "https://www.cse.lk/api/tradeSummary",
    "path": "/tradeSummary",
    "summary": "Full board — primary poller; client-side page in lab.",
    "status": "live",
    "pagination": {
      "style": "client_slice",
      "params": {
        "offset": "client",
        "limit": "client"
      },
      "lab": true
    }
  },
  {
    "id": "get_announcement_by_company",
    "method": "POST",
    "url": "https://www.cse.lk/api/getAnnouncementByCompany",
    "path": "/getAnnouncementByCompany",
    "summary": "Company announcements by symbol.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
