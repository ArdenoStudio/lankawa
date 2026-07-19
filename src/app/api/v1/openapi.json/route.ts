import { NextResponse } from "next/server";

const openApi = {
  openapi: "3.1.0",
  info: {
    title: "Lankawa Public API",
    version: "0.1.0",
    description:
      "Public civic intelligence API for Sri Lanka. Every metric includes source provenance and freshness tiers.",
  },
  servers: [{ url: "https://lankawa.vercel.app" }],
  paths: {
    "/api/v1/health": {
      get: {
        summary: "Source health and freshness",
        responses: { "200": { description: "Health snapshot" } },
      },
    },
    "/api/v1/pulse": {
      get: {
        summary: "Live pulse metrics",
        responses: { "200": { description: "Pulse snapshot" } },
      },
    },
    "/api/v1/districts": {
      get: {
        summary: "List all districts",
        responses: { "200": { description: "District list" } },
      },
    },
    "/api/v1/districts/{slug}": {
      get: {
        summary: "Get district by slug",
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
    "/api/v1/elections": {
      get: {
        summary: "Presidential election 2024 summary and district results",
        responses: { "200": { description: "Election data snapshot" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApi);
}
