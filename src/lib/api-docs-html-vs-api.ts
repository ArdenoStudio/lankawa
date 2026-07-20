import htmlVsApiJson from "./api-docs-html-vs-api.json";

export type HtmlVsApiEndpoint = {
  id: string;
  access: string;
  method: string;
  path: string;
  url: string;
  status: string;
  notes: string;
};

export type HtmlVsApiPackage = {
  slug: string;
  title: string;
  tier?: string;
  category?: string;
  counts: Record<string, number>;
  endpoints: HtmlVsApiEndpoint[];
  api_like: number;
  html_like: number;
  parked: number;
};

export type HtmlVsApiDoc = {
  version: number;
  access_labels: Record<string, string>;
  totals: Record<string, number>;
  packages: HtmlVsApiPackage[];
};

export const htmlVsApiDoc = htmlVsApiJson as unknown as HtmlVsApiDoc;
