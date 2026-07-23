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
    "id": "interruption_notices",
    "method": "GET",
    "url": "https://www.leco.lk/pages_e.php?id=45",
    "path": "/pages_e.php?id=45",
    "summary": "LECO interruption notices HTML.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
