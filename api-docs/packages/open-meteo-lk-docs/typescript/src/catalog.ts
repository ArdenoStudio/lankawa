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
    "id": "forecast_colombo",
    "method": "GET",
    "url": "https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&daily=uv_index_max,precipitation_sum&timezone=Asia%2FColombo",
    "path": "/v1/forecast",
    "summary": "Colombo daily forecast.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "air_quality_colombo",
    "method": "GET",
    "url": "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=6.9271&longitude=79.8612&hourly=pm2_5,us_aqi",
    "path": "/v1/air-quality",
    "summary": "Colombo air quality.",
    "status": "live",
    "pagination": null
  },
  {
    "id": "marine_colombo",
    "method": "GET",
    "url": "https://marine-api.open-meteo.com/v1/marine?latitude=6.9271&longitude=79.8612&hourly=wave_height",
    "path": "/v1/marine",
    "summary": "Colombo marine wave height.",
    "status": "live",
    "pagination": null
  }
] as EndpointSpec[];
