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
    "id": "wfp_food_prices_lka_csv",
    "method": "GET",
    "url": "https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices_lka.csv",
    "path": "/download/wfp_food_prices_lka.csv",
    "summary": "Full LKA CSV (~34k rows).",
    "status": "live",
    "pagination": {
      "style": "full_download",
      "notes": "No server pagination — client chunk/filter",
      "lab": true
    }
  }
] as EndpointSpec[];
