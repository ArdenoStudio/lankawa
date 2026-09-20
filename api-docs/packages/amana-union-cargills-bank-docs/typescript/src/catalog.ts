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
    "id": "amana_rates",
    "method": "GET",
    "url": "https://www.amanabank.lk/rates/",
    "path": "amanabank.lk/rates/",
    "summary": "Amana rates pages (Islamic products).",
    "status": "live",
    "pagination": null
  },
  {
    "id": "union_bank_offers",
    "method": "GET",
    "url": "https://www.unionb.com/personal/cards/offers",
    "path": "unionb.com/.../offers",
    "summary": "Union Bank card offers HTML.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "cargills_bank_rates",
    "method": "GET",
    "url": "https://www.cargillsbank.com/rates-and-tariffs/",
    "path": "cargillsbank.com/rates-and-tariffs/",
    "summary": "Cargills Bank rates & tariffs.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
