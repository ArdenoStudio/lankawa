import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { recordExportAudit } from "@/lib/db";
import { DISTRICTS } from "@/lib/districts";
import { getPresidentialElection2024 } from "@/lib/elections";
import { getParliamentaryElection2024 } from "@/lib/elections";
import { getFuelHistorySeries } from "@/lib/fuel";
import { getPublicServicesCatalog } from "@/lib/services";

const VALID_DATASETS = ["districts", "elections", "services", "fuel-history"] as const;
type ExportDataset = (typeof VALID_DATASETS)[number];
type ExportFormat = "csv" | "geojson" | "json";
type CsvValue = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvValue>;

function isValidDataset(value: string): value is ExportDataset {
  return (VALID_DATASETS as readonly string[]).includes(value);
}

function getDefaultFormat(dataset: ExportDataset): ExportFormat {
  return dataset === "districts" ? "geojson" : "json";
}

function parseFormat(value: string | null, dataset: ExportDataset): ExportFormat | null {
  if (value == null) {
    return getDefaultFormat(dataset);
  }

  if (value === "csv" || value === "geojson" || value === "json") {
    return value;
  }

  return null;
}

function csvCell(value: CsvValue): string {
  if (value == null) {
    return "";
  }

  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
}

function toCsv(headers: string[], rows: CsvRow[]): string {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
}

function csvResponse(dataset: ExportDataset, csv: string) {
  return new NextResponse(`${csv}\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lankawa-${dataset}.csv"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function buildDistrictsCsv(): string {
  const headers = [
    "slug",
    "name",
    "nameSi",
    "nameTa",
    "province",
    "capital",
    "population",
    "areaSqKm",
  ];
  const rows: CsvRow[] = DISTRICTS.map((district) => ({
    slug: district.slug,
    name: district.name,
    nameSi: district.nameSi,
    nameTa: district.nameTa,
    province: district.province,
    capital: district.capital,
    population: district.population,
    areaSqKm: district.areaSqKm,
  }));

  return toCsv(headers, rows);
}

function buildElectionsCsv(): string {
  const presidential = getPresidentialElection2024();
  const parliamentary = getParliamentaryElection2024();
  const headers = [
    "electionType",
    "electionId",
    "date",
    "districtSlug",
    "districtName",
    "winner",
    "turnout",
    "validVotes",
    "totalSeats",
    "akdVotes",
    "premadasaVotes",
    "wickremesingheVotes",
    "othersVotes",
    "nppVotes",
    "sjbVotes",
    "itakVotes",
    "ndfVotes",
    "slppVotes",
    "parliamentaryOthersVotes",
    "nppSeats",
    "sjbSeats",
    "itakSeats",
    "ndfSeats",
    "slppSeats",
    "parliamentaryOthersSeats",
  ];
  const rows: CsvRow[] = [
    ...presidential.districts.map((district) => ({
      electionType: presidential.type,
      electionId: presidential.id,
      date: presidential.date,
      districtSlug: district.slug,
      districtName: district.electoralDistrict ?? district.slug,
      winner: district.winner,
      turnout: district.turnout,
      validVotes: district.validVotes,
      akdVotes: district.results.akd,
      premadasaVotes: district.results.premadasa,
      wickremesingheVotes: district.results.wickremesinghe,
      othersVotes: district.results.others,
    })),
    ...parliamentary.districts.map((district) => ({
      electionType: parliamentary.type,
      electionId: parliamentary.id,
      date: parliamentary.date,
      districtSlug: district.slug,
      districtName: district.name,
      winner: district.winner,
      turnout: district.turnout,
      totalSeats: district.totalSeats,
      nppVotes: district.votes.npp,
      sjbVotes: district.votes.sjb,
      itakVotes: district.votes.itak,
      ndfVotes: district.votes.ndf,
      slppVotes: district.votes.slpp,
      parliamentaryOthersVotes: district.votes.others,
      nppSeats: district.seats.npp,
      sjbSeats: district.seats.sjb,
      itakSeats: district.seats.itak,
      ndfSeats: district.seats.ndf,
      slppSeats: district.seats.slpp,
      parliamentaryOthersSeats: district.seats.others,
    })),
  ];

  return toCsv(headers, rows);
}

function buildServicesCsv(): string {
  const catalog = getPublicServicesCatalog();
  const headers = [
    "id",
    "type",
    "name",
    "nameSi",
    "nameTa",
    "districtSlug",
    "address",
    "sourceId",
    "sourceName",
  ];
  const rows: CsvRow[] = catalog.facilities.map((facility) => ({
    id: facility.id,
    type: facility.type,
    name: facility.name,
    nameSi: facility.nameSi,
    nameTa: facility.nameTa,
    districtSlug: facility.districtSlug,
    address: facility.address,
    sourceId: catalog.sourceId,
    sourceName: catalog.sourceName,
  }));

  return toCsv(headers, rows);
}

async function buildFuelHistoryCsv(days: number): Promise<string> {
  const series = await getFuelHistorySeries(days);
  const headers = [
    "fuelType",
    "label",
    "recordedAt",
    "priceLkr",
    "sourceId",
    "provenancePath",
  ];
  const rows: CsvRow[] = series.flatMap((item) =>
    item.points.map((point) => ({
      fuelType: item.fuelType,
      label: item.label,
      recordedAt: point.recorded_at,
      priceLkr: point.price_lkr,
      sourceId: item.sourceId,
      provenancePath: item.provenancePath,
    })),
  );

  return toCsv(headers, rows);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ dataset: string }> },
) {
  const { dataset } = await context.params;

  if (!isValidDataset(dataset)) {
    return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = parseFormat(searchParams.get("format"), dataset);
  if (format == null) {
    return NextResponse.json({ error: "Unknown format" }, { status: 400 });
  }
  if (dataset !== "districts" && format === "geojson") {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  recordExportAudit({
    dataset,
    clientIp,
    format,
  }).catch(() => undefined);

  if (format === "csv") {
    switch (dataset) {
      case "districts":
        return csvResponse(dataset, buildDistrictsCsv());
      case "elections":
        return csvResponse(dataset, buildElectionsCsv());
      case "services":
        return csvResponse(dataset, buildServicesCsv());
      case "fuel-history": {
        const days = Number(searchParams.get("days") ?? "90");
        return csvResponse(dataset, await buildFuelHistoryCsv(days));
      }
      default: {
        const _exhaustive: never = dataset;
        return _exhaustive;
      }
    }
  }

  switch (dataset) {
    case "districts": {
      if (format === "json") {
        return NextResponse.json(
          {
            exportedAt: new Date().toISOString(),
            count: DISTRICTS.length,
            districts: DISTRICTS,
          },
          {
            headers: {
              "Content-Disposition": 'attachment; filename="lankawa-districts.json"',
              "Cache-Control": "public, max-age=86400",
            },
          },
        );
      }

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
    case "fuel-history": {
      const days = Number(searchParams.get("days") ?? "90");
      const series = await getFuelHistorySeries(days);
      return NextResponse.json(
        {
          exportedAt: new Date().toISOString(),
          days,
          series,
        },
        {
          headers: {
            "Content-Disposition": 'attachment; filename="lankawa-fuel-history.json"',
            "Cache-Control": "public, max-age=3600",
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
