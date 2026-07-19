import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { recordExportAudit } from "@/lib/db";
import { getPresidentialElection2024 } from "@/lib/elections";
import { getParliamentaryElection2024 } from "@/lib/elections";
import { getPublicServicesCatalog } from "@/lib/services";

const VALID_DATASETS = ["districts", "elections", "services"] as const;
type ExportDataset = (typeof VALID_DATASETS)[number];

function isValidDataset(value: string): value is ExportDataset {
  return (VALID_DATASETS as readonly string[]).includes(value);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ dataset: string }> },
) {
  const { dataset } = await context.params;

  if (!isValidDataset(dataset)) {
    return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  recordExportAudit({
    dataset,
    clientIp,
    format: dataset === "districts" ? "geojson" : "json",
  }).catch(() => undefined);

  switch (dataset) {
    case "districts": {
      const geoPath = join(process.cwd(), "public/geo/districts.geojson");
      const body = readFileSync(geoPath, "utf8");
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/geo+json; charset=utf-8",
          "Content-Disposition": 'attachment; filename="lankawa-districts.geojson"',
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
    case "elections": {
      const payload = {
        exportedAt: new Date().toISOString(),
        presidential: getPresidentialElection2024(),
        parliamentary: getParliamentaryElection2024(),
      };
      return NextResponse.json(payload, {
        headers: {
          "Content-Disposition": 'attachment; filename="lankawa-elections.json"',
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
    case "services": {
      const catalog = getPublicServicesCatalog();
      return NextResponse.json(
        {
          exportedAt: new Date().toISOString(),
          ...catalog,
        },
        {
          headers: {
            "Content-Disposition": 'attachment; filename="lankawa-services.json"',
            "Cache-Control": "public, max-age=86400",
          },
        },
      );
    }
    default: {
      const _exhaustive: never = dataset;
      return _exhaustive;
    }
  }
}
