import transportData from "@/data/transport-seed.json";
import type { Airport, BusRoute, RailwayStation, TransportCatalog } from "./types";

const catalog = transportData as TransportCatalog;

export function getTransportCatalog(): TransportCatalog {
  return catalog;
}

export function getAllBusRoutes(): BusRoute[] {
  return catalog.busRoutes;
}

export function getAllRailwayStations(): RailwayStation[] {
  return catalog.railwayStations;
}

export function getAllAirports(): Airport[] {
  return catalog.airports;
}

export function getMajorRailwayStations(): RailwayStation[] {
  return catalog.railwayStations.filter((station) => station.isMajor);
}

export function filterTransportByDistrict(districtSlug: string) {
  const routes = catalog.busRoutes.filter(
    (route) =>
      route.originDistrict === districtSlug ||
      route.destinationDistrict === districtSlug ||
      route.viaDistricts.includes(districtSlug),
  );
  const stations = catalog.railwayStations.filter(
    (station) => station.districtSlug === districtSlug,
  );
  const airports = catalog.airports.filter(
    (airport) => airport.districtSlug === districtSlug,
  );
  return { routes, stations, airports };
}

export function getTransportName(
  item: { name: string; nameSi?: string; nameTa?: string },
  locale: string,
): string {
  if (locale === "si" && item.nameSi) {
    return item.nameSi;
  }
  if (locale === "ta" && item.nameTa) {
    return item.nameTa;
  }
  return item.name;
}

export function searchTransport(query: string, district?: string) {
  const normalized = query.trim().toLowerCase();
  const districtFilter = district?.trim().toLowerCase();

  const routes = catalog.busRoutes.filter((route) => {
    if (districtFilter) {
      const inDistrict =
        route.originDistrict === districtFilter ||
        route.destinationDistrict === districtFilter ||
        route.viaDistricts.includes(districtFilter);
      if (!inDistrict) {
        return false;
      }
    }
    if (!normalized) {
      return true;
    }
    return [route.name, route.routeNumber, route.operator]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });

  const stations = catalog.railwayStations.filter((station) => {
    if (districtFilter && station.districtSlug !== districtFilter) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return [station.name, station.line].join(" ").toLowerCase().includes(normalized);
  });

  const airports = catalog.airports.filter((airport) => {
    if (districtFilter && airport.districtSlug !== districtFilter) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return [airport.name, airport.iata].join(" ").toLowerCase().includes(normalized);
  });

  return { routes, stations, airports };
}
