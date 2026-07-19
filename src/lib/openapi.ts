export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Lankawa Public API",
    version: "0.1.0",
    description:
      "Public civic intelligence API for Sri Lanka. Every metric includes source provenance and freshness tiers.",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/health": {
      get: {
        summary: "Source health and freshness",
        description: "Returns freshness tiers and last-checked timestamps for all data sources.",
        responses: { "200": { description: "Health snapshot" } },
      },
    },
    "/pulse": {
      get: {
        summary: "Live pulse metrics",
        description:
          "Exchange rates, fuel prices, flood station counts, and source provenance paths.",
        responses: { "200": { description: "Pulse snapshot" } },
      },
    },
    "/districts": {
      get: {
        summary: "List all districts",
        description: "All 25 Sri Lankan districts with population, area, and province metadata.",
        responses: { "200": { description: "District list" } },
      },
    },
    "/districts/{slug}": {
      get: {
        summary: "Get district by slug",
        description: "Single district profile keyed by slug (e.g. colombo, kandy).",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "District profile" },
          "404": { description: "Not found" },
        },
      },
    },
    "/elections": {
      get: {
        summary: "Presidential election 2024 summary and district results",
        description:
          "National and district-level first-preference results with internal provenance paths.",
        responses: { "200": { description: "Election data snapshot" } },
      },
    },
  },
} as const;

export const apiEndpoints = [
  {
    method: "GET",
    path: "/api/v1/health",
    summaryKey: "healthSummary" as const,
    descriptionKey: "healthDescription" as const,
    example: `{ "generatedAt": "2026-07-19T06:00:00.000Z", "sources": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/pulse",
    summaryKey: "pulseSummary" as const,
    descriptionKey: "pulseDescription" as const,
    example: `{ "generatedAt": "...", "metrics": [...], "flood": [...], "sources": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/districts",
    summaryKey: "districtsSummary" as const,
    descriptionKey: "districtsDescription" as const,
    example: `{ "districts": [{ "slug": "colombo", "name": "Colombo", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/districts/{slug}",
    summaryKey: "districtSummary" as const,
    descriptionKey: "districtDescription" as const,
    example: `{ "slug": "colombo", "name": "Colombo", "population": 2427285, ... }`,
  },
  {
    method: "GET",
    path: "/api/v1/elections",
    summaryKey: "electionsSummary" as const,
    descriptionKey: "electionsDescription" as const,
    example: `{ "election": { "id": "presidential-2024", ... }, "districts": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/openapi.json",
    summaryKey: "openApiSummary" as const,
    descriptionKey: "openApiDescription" as const,
    example: `{ "openapi": "3.1.0", "info": { ... }, "paths": { ... } }`,
  },
] as const;
