export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Lankawa Public API",
    version: "0.8.0",
    description:
      "Public civic intelligence API for Sri Lanka. Every metric includes source provenance and freshness tiers.",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/news": {
      get: {
        summary: "Sri Lanka news pulse",
        responses: {
          "200": {
            description:
              "Recent RSS headlines from EN/SI/TA outlets with freshness provenance",
          },
        },
      },
    },
    "/cse": {
      get: {
        summary: "Colombo Stock Exchange snapshot",
        responses: {
          "200": { description: "ASPI/S&P SL20, movers, and market summary" },
        },
      },
    },
    "/brief": {
      get: {
        summary: "Trilingual morning brief",
        parameters: [
          {
            name: "locale",
            in: "query",
            schema: { type: "string", enum: ["en", "si", "ta"] },
          },
        ],
        responses: {
          "200": {
            description: "Quality-gated morning brief bullets derived from news pulse",
          },
        },
      },
    },
    "/health": {
      get: {
        summary: "Source health and freshness",
        responses: { "200": { description: "Health snapshot" } },
      },
    },
    "/pulse": {
      get: {
        summary: "Live pulse metrics",
        responses: { "200": { description: "Pulse snapshot" } },
      },
    },
    "/districts": {
      get: {
        summary: "List all districts",
        responses: { "200": { description: "District list" } },
      },
    },
    "/districts/{slug}": {
      get: {
        summary: "Get district by slug",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "District profile" },
          "404": { description: "Not found" },
        },
      },
    },
    "/provinces": {
      get: {
        summary: "List all provinces",
        responses: { "200": { description: "Province list" } },
      },
    },
    "/provinces/{slug}": {
      get: {
        summary: "Get province by slug",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Province profile with districts" },
          "404": { description: "Not found" },
        },
      },
    },
    "/elections": {
      get: {
        summary: "Presidential election 2024 summary",
        responses: { "200": { description: "Election data snapshot" } },
      },
    },
    "/elections/parliamentary": {
      get: {
        summary: "Parliamentary election 2024 summary",
        responses: { "200": { description: "Parliamentary election snapshot" } },
      },
    },
    "/elections/parliamentary/{slug}": {
      get: {
        summary: "Parliamentary district seats",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Electoral district result" },
          "404": { description: "Not found" },
        },
      },
    },
    "/services": {
      get: {
        summary: "Public services directory",
        parameters: [
          { name: "district", in: "query", schema: { type: "string" } },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["hospital", "school", "gn_office", "police_station", "moh_office", "divisional_hospital"] },
          },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Filtered facilities list" } },
      },
    },
    "/services/{id}": {
      get: {
        summary: "Single public service facility",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Facility detail" },
          "404": { description: "Not found" },
        },
      },
    },
    "/flood/history": {
      get: {
        summary: "Flood station level history",
        parameters: [
          { name: "station", in: "query", required: true, schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 24 } },
        ],
        responses: { "200": { description: "Historical water levels with freshness tier" } },
      },
    },
    "/fuel/history": {
      get: {
        summary: "CPC fuel price history",
        parameters: [
          { name: "days", in: "query", schema: { type: "integer", default: 90 } },
        ],
        responses: { "200": { description: "Petrol 92 and auto diesel price series" } },
      },
    },
    "/budget": {
      get: {
        summary: "National budget snapshot",
        responses: { "200": { description: "FY 2024/25 and 2025/26 budget seed data" } },
      },
    },
    "/environment": {
      get: {
        summary: "Air quality snapshot",
        responses: { "200": { description: "District AQI and PM2.5 readings with live OpenAQ overlay when available" } },
      },
    },
    "/tenders": {
      get: {
        summary: "Government procurement tender notices",
        parameters: [
          { name: "district", in: "query", schema: { type: "string" } },
          { name: "province", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string", enum: ["goods", "works", "services"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["open", "closing_soon", "closed"] } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Filtered tender notices with live PROMISe fallback provenance" } },
      },
    },
    "/health/dengue": {
      get: {
        summary: "Weekly dengue statistics",
        responses: {
          "200": {
            description:
              "District-level dengue case counts with Epidemiology Unit live parse when available",
          },
        },
      },
    },
    "/analytics/event": {
      post: {
        summary: "Retention analytics event (no PII)",
        responses: { "200": { description: "Accepted retention event" } },
      },
    },
    "/property": {
      get: {
        summary: "District property price bands",
        responses: { "200": { description: "Median land price bands by district" } },
      },
    },
    "/elections/history": {
      get: {
        summary: "Multi-cycle election history",
        responses: { "200": { description: "Presidential 2010–2024 and parliamentary summaries" } },
      },
    },
    "/local-government": {
      get: {
        summary: "Local government directory",
        parameters: [
          { name: "district", in: "query", schema: { type: "string" } },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["MC", "UC", "PS"] },
          },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Filtered local bodies list" } },
      },
    },
    "/transport": {
      get: {
        summary: "Transport directory",
        parameters: [
          { name: "district", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Bus routes, railway stations, and airports" } },
      },
    },
    "/cost-of-living": {
      get: {
        summary: "District cost of living index",
        responses: { "200": { description: "Composite index from fuel, property, and food basket seeds" } },
      },
    },
    "/vehicles": {
      get: {
        summary: "Vehicle market snapshot",
        responses: { "200": { description: "District median used-vehicle prices and popular makes" } },
      },
    },
    "/food": {
      get: {
        summary: "Food price snapshot",
        responses: { "200": { description: "Staple prices and district meal-cost bands" } },
      },
    },
    "/life": {
      get: {
        summary: "Life platform overview",
        responses: { "200": { description: "Unified living-cost domain health from Ariva Life Platform" } },
      },
    },
    "/export/{dataset}": {
      get: {
        summary: "Dataset export",
        parameters: [
          {
            name: "dataset",
            in: "path",
            required: true,
            schema: { type: "string", enum: ["districts", "elections", "services"] },
          },
        ],
        responses: {
          "200": { description: "GeoJSON or JSON download" },
          "404": { description: "Unknown dataset" },
        },
      },
    },
    "/status": {
      get: {
        summary: "Platform health (DB, sources, version)",
        responses: { "200": { description: "Platform status snapshot" } },
      },
    },
    "/pulse/history": {
      get: {
        summary: "Pulse snapshot history (last 30 days, requires DB)",
        responses: {
          "200": { description: "Historical pulse snapshots" },
          "503": { description: "Database not configured" },
        },
      },
    },
    "/assistant": {
      post: {
        summary: "Civic assistant Q&A grounded on Lankawa data",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { question: { type: "string" } },
                required: ["question"],
              },
            },
          },
        },
        responses: { "200": { description: "Answer with citations" } },
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
    path: "/api/v1/provinces",
    summaryKey: "provincesSummary" as const,
    descriptionKey: "provincesDescription" as const,
    example: `{ "count": 9, "provinces": [{ "slug": "western", "name": "Western", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/provinces/{slug}",
    summaryKey: "provinceSummary" as const,
    descriptionKey: "provinceDescription" as const,
    example: `{ "slug": "western", "districtCount": 3, "population": 5846400, ... }`,
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
    path: "/api/v1/elections/parliamentary",
    summaryKey: "parliamentarySummary" as const,
    descriptionKey: "parliamentaryDescription" as const,
    example: `{ "election": { "id": "parliamentary-2024", ... }, "districts": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/elections/parliamentary/{slug}",
    summaryKey: "parliamentaryDistrictSummary" as const,
    descriptionKey: "parliamentaryDistrictDescription" as const,
    example: `{ "slug": "colombo", "totalSeats": 18, "seats": { "npp": 14, ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/services?district=colombo&type=hospital",
    summaryKey: "servicesSummary" as const,
    descriptionKey: "servicesDescription" as const,
    example: `{ "count": 2, "facilities": [{ "id": "colombo-national-hospital", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/services/{id}",
    summaryKey: "serviceSummary" as const,
    descriptionKey: "serviceDescription" as const,
    example: `{ "id": "colombo-national-hospital", "type": "hospital", ... }`,
  },
  {
    method: "GET",
    path: "/api/v1/flood/history?station=Peradeniya&limit=24",
    summaryKey: "floodHistorySummary" as const,
    descriptionKey: "floodHistoryDescription" as const,
    example: `{ "points": [{ "timestamp": "...", "waterLevel": 1.39 }], "tier": "fresh" }`,
  },
  {
    method: "GET",
    path: "/api/v1/fuel/history?days=90",
    summaryKey: "fuelHistorySummary" as const,
    descriptionKey: "fuelHistoryDescription" as const,
    example: `{ "days": 90, "series": [{ "fuelType": "petrol_92", "points": [...] }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/budget",
    summaryKey: "budgetSummary" as const,
    descriptionKey: "budgetDescription" as const,
    example: `{ "fiscalYears": [{ "id": "fy2025-26", "revenue": 4580, ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/health/dengue",
    summaryKey: "dengueSummary" as const,
    descriptionKey: "dengueDescription" as const,
    example: `{ "nationalTotal": 3842, "districts": [{ "slug": "colombo", "cases": 612 }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/property",
    summaryKey: "propertySummary" as const,
    descriptionKey: "propertyDescription" as const,
    example: `{ "districts": [{ "slug": "colombo", "medianPerPerch": 9500000, ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/elections/history",
    summaryKey: "electionHistorySummary" as const,
    descriptionKey: "electionHistoryDescription" as const,
    example: `{ "presidential": { "cycles": [{ "year": 2024, ... }] }, "parliamentary": { ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/local-government?district=colombo&type=MC",
    summaryKey: "localGovernmentSummary" as const,
    descriptionKey: "localGovernmentDescription" as const,
    example: `{ "totalCount": 327, "count": 1, "bodies": [{ "id": "...", "type": "MC" }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/transport?district=colombo",
    summaryKey: "transportSummary" as const,
    descriptionKey: "transportDescription" as const,
    example: `{ "busRoutes": [...], "railwayStations": [...], "airports": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/cost-of-living",
    summaryKey: "costOfLivingSummary" as const,
    descriptionKey: "costOfLivingDescription" as const,
    example: `{ "nationalIndex": 72, "districts": [{ "slug": "colombo", "index": 98 }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/vehicles",
    summaryKey: "vehiclesSummary" as const,
    descriptionKey: "vehiclesDescription" as const,
    example: `{ "totalListings": 112609, "districts": [{ "slug": "colombo", "medianPriceLkr": 9314924 }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/food",
    summaryKey: "foodSummary" as const,
    descriptionKey: "foodDescription" as const,
    example: `{ "essentialsBasketLkr": 8650, "stapleItems": [{ "name": "Rice", "priceLkr": 320 }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/life",
    summaryKey: "lifeSummary" as const,
    descriptionKey: "lifeDescription" as const,
    example: `{ "headline": "...", "domains": [{ "key": "food", "status": "degraded" }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/export/districts",
    summaryKey: "exportDistrictsSummary" as const,
    descriptionKey: "exportDistrictsDescription" as const,
    example: "GeoJSON FeatureCollection download",
  },
  {
    method: "GET",
    path: "/api/v1/export/elections",
    summaryKey: "exportElectionsSummary" as const,
    descriptionKey: "exportElectionsDescription" as const,
    example: `{ "presidential": {...}, "parliamentary": {...} }`,
  },
  {
    method: "GET",
    path: "/api/v1/export/services",
    summaryKey: "exportServicesSummary" as const,
    descriptionKey: "exportServicesDescription" as const,
    example: `{ "facilities": [...], "sourceId": "public_services_seed" }`,
  },
  {
    method: "GET",
    path: "/api/v1/openapi.json",
    summaryKey: "openApiSummary" as const,
    descriptionKey: "openApiDescription" as const,
    example: `{ "openapi": "3.1.0", "info": { ... }, "paths": { ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/status",
    summaryKey: "platformStatusSummary" as const,
    descriptionKey: "platformStatusDescription" as const,
    example: `{ "version": "0.6.0", "database": { "configured": true, "connected": true }, "sources": { "fresh": 3 } }`,
  },
  {
    method: "GET",
    path: "/api/v1/pulse/history",
    summaryKey: "pulseHistorySummary" as const,
    descriptionKey: "pulseHistoryDescription" as const,
    example: `{ "days": 30, "count": 42, "snapshots": [...] }`,
  },
  {
    method: "POST",
    path: "/api/v1/assistant",
    summaryKey: "assistantSummary" as const,
    descriptionKey: "assistantDescription" as const,
    example: `{ "question": "USD rate?", "answer": "...", "citations": [...], "mode": "rule" }`,
  },
] as const;
