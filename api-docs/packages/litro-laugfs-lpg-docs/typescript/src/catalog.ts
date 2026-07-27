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
    "id": "litro_prices",
    "method": "GET",
    "url": "https://litrogas.com/",
    "path": "litrogas.com/",
    "summary": "Litro cylinder price HTML scrape surface.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "laugfs_prices",
    "method": "GET",
    "url": "https://www.laugfs.lk/",
    "path": "laugfs.lk/",
    "summary": "LAUGFS LPG price HTML.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
