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
    "id": "gauges_2_view_query",
    "method": "GET",
    "url": "https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0/query?where=1%3D1&outFields=*&orderByFields=EditDate%20DESC&resultRecordCount=50&f=json",
    "path": "/gauges_2_view/FeatureServer/0/query",
    "summary": "Latest river gauge readings.",
    "status": "live",
    "pagination": {
      "style": "arcgis",
      "params": {
        "resultOffset": "offset",
        "resultRecordCount": "page size"
      },
      "lab": true
    }
  },
  {
    "id": "rainfall_24hr",
    "method": "GET",
    "url": "https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/24hr_rainfall/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=50&f=json",
    "path": "/24hr_rainfall/FeatureServer/0/query",
    "summary": "24-hour rainfall FeatureServer.",
    "status": "live",
    "pagination": {
      "style": "arcgis",
      "lab": true
    }
  }
] as EndpointSpec[];
