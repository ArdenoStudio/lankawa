/**
 * Aviation Edge CMB Airport Flight Tracker
 *
 * Consumes Aviation Edge Timetable / Flight Schedules API for Bandaranaike
 * International Airport (IATA: CMB) and SriLankan Airlines fleet (IATA: UL).
 *
 * Aviation Edge free tier: https://aviation-edge.com/developers/
 * Endpoint pattern: https://aviation-edge.com/v2/public/timetable
 *   ?key=YOUR_KEY&iataCode=CMB&type=arrival|departure
 *
 * Falls back to a static seed when the API key is absent or the upstream
 * call times out / returns an error.
 */

import seedData from "../../data/aviation-seed.json" with { type: "json" };

export const AVIATION_EDGE_SOURCE_ID = "aviation_edge_cmb" as const;
export const AVIATION_SEED_SOURCE_ID = "aviation_seed_cmb" as const;
export const SEED_FALLBACK_DISCLAIMER = "Seed fallback — live API unavailable" as const;

const AVIATION_EDGE_BASE = "https://aviation-edge.com/v2/public";
const FETCH_TIMEOUT_MS = 10_000;
const REVALIDATE_SECONDS = 300; // 5 min

// ─── Type Definitions ────────────────────────────────────────────────────────

export type FlightStatus =
  | "scheduled"
  | "active"
  | "landed"
  | "cancelled"
  | "diverted"
  | "unknown";

export interface FlightRecord {
  flightNumber: string;
  airline: string;
  airlineIata: string;
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  scheduledTime: string; // ISO-8601
  estimatedTime: string | null;
  actualTime: string | null;
  terminal: string | null;
  gate: string | null;
  status: FlightStatus;
  delayMinutes: number | null;
}

export interface AviationResult {
  arrivals: FlightRecord[];
  departures: FlightRecord[];
  totalArrivals: number;
  totalDepartures: number;
  delayedCount: number;
  cancelledCount: number;
  asOf: string;
  isFallback: boolean;
  disclaimer: typeof SEED_FALLBACK_DISCLAIMER | null;
  sourceId: typeof AVIATION_EDGE_SOURCE_ID | typeof AVIATION_SEED_SOURCE_ID;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

interface SeedFile {
  asOf: string;
  arrivals: FlightRecord[];
  departures: FlightRecord[];
}

const seed = seedData as SeedFile;

function buildSeedFallback(): AviationResult {
  const arrivals = seed.arrivals ?? [];
  const departures = seed.departures ?? [];
  const all = [...arrivals, ...departures];
  return {
    arrivals,
    departures,
    totalArrivals: arrivals.length,
    totalDepartures: departures.length,
    delayedCount: all.filter((f) => (f.delayMinutes ?? 0) > 0).length,
    cancelledCount: all.filter((f) => f.status === "cancelled").length,
    asOf: seed.asOf,
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: AVIATION_SEED_SOURCE_ID,
  };
}

// ─── Normaliser ───────────────────────────────────────────────────────────────

// Aviation Edge timetable response shape (abbreviated)
interface AviationEdgeRecord {
  flight?: { iataNumber?: string; icaoNumber?: string };
  airline?: { name?: string; iataCode?: string };
  departure?: {
    iataCode?: string;
    scheduledTime?: string;
    estimatedTime?: string;
    actualTime?: string;
    terminal?: string;
    gate?: string;
    delay?: number;
  };
  arrival?: {
    iataCode?: string;
    scheduledTime?: string;
    estimatedTime?: string;
    actualTime?: string;
    terminal?: string;
    gate?: string;
    delay?: number;
  };
  status?: string;
}

const AIRPORT_NAMES: Record<string, string> = {
  CMB: "Colombo (BIA)",
  DXB: "Dubai",
  SIN: "Singapore",
  LHR: "London Heathrow",
  DOH: "Doha",
  BOM: "Mumbai",
  DEL: "Delhi",
  KUL: "Kuala Lumpur",
  CDG: "Paris CDG",
  FRA: "Frankfurt",
  AUH: "Abu Dhabi",
  HKG: "Hong Kong",
  BKK: "Bangkok",
  SYD: "Sydney",
  PEK: "Beijing",
};

function iataName(code: string | undefined): string {
  if (!code) return "Unknown";
  return AIRPORT_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

function mapStatus(raw: string | undefined): FlightStatus {
  if (!raw) return "unknown";
  const s = raw.toLowerCase();
  if (s.includes("cancelled") || s.includes("cancel")) return "cancelled";
  if (s.includes("diverted")) return "diverted";
  if (s.includes("landed") || s.includes("arrived")) return "landed";
  if (s.includes("active") || s.includes("en-route") || s.includes("airborne")) return "active";
  if (s.includes("scheduled") || s.includes("unknown")) return "scheduled";
  return "unknown";
}

function normaliseRecord(
  raw: AviationEdgeRecord,
  direction: "arrival" | "departure",
): FlightRecord {
  const dep = raw.departure ?? {};
  const arr = raw.arrival ?? {};
  const refSide = direction === "arrival" ? arr : dep;

  return {
    flightNumber: raw.flight?.iataNumber ?? raw.flight?.icaoNumber ?? "?",
    airline: raw.airline?.name ?? "Unknown",
    airlineIata: raw.airline?.iataCode ?? "?",
    origin: iataName(dep.iataCode),
    originIata: dep.iataCode?.toUpperCase() ?? "?",
    destination: iataName(arr.iataCode),
    destinationIata: arr.iataCode?.toUpperCase() ?? "?",
    scheduledTime: refSide.scheduledTime ?? new Date().toISOString(),
    estimatedTime: refSide.estimatedTime ?? null,
    actualTime: refSide.actualTime ?? null,
    terminal: refSide.terminal ?? null,
    gate: refSide.gate ?? null,
    status: mapStatus(raw.status),
    delayMinutes: refSide.delay != null ? Number(refSide.delay) : null,
  };
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchTimetable(
  direction: "arrival" | "departure",
  apiKey: string,
): Promise<FlightRecord[]> {
  const url = `${AVIATION_EDGE_BASE}/timetable?key=${encodeURIComponent(apiKey)}&iataCode=CMB&type=${direction}`;
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);

  const res = await fetch(url, {
    signal,
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Aviation Edge ${direction} fetch failed: HTTP ${res.status}`);
  }

  const json = await res.json();

  // API returns either an array or an error object { error: "..." }
  if (!Array.isArray(json)) {
    throw new Error(
      `Aviation Edge unexpected response: ${JSON.stringify(json).slice(0, 120)}`,
    );
  }

  return json.map((r: AviationEdgeRecord) => normaliseRecord(r, direction));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches live CMB arrivals & departures from Aviation Edge.
 *
 * Requires AVIATION_EDGE_API_KEY env variable. Falls back to seed when:
 * - The env key is absent
 * - The upstream call times out or errors
 * - The response is not an array (e.g. quota exceeded)
 */
export async function getCMBFlights(): Promise<AviationResult> {
  const apiKey = process.env.AVIATION_EDGE_API_KEY;
  if (!apiKey) {
    return buildSeedFallback();
  }

  try {
    const [arrivals, departures] = await Promise.all([
      fetchTimetable("arrival", apiKey),
      fetchTimetable("departure", apiKey),
    ]);

    const all = [...arrivals, ...departures];
    const delayedCount = all.filter((f) => (f.delayMinutes ?? 0) > 15).length;
    const cancelledCount = all.filter((f) => f.status === "cancelled").length;

    return {
      arrivals,
      departures,
      totalArrivals: arrivals.length,
      totalDepartures: departures.length,
      delayedCount,
      cancelledCount,
      asOf: new Date().toISOString(),
      isFallback: false,
      disclaimer: null,
      sourceId: AVIATION_EDGE_SOURCE_ID,
    };
  } catch {
    return buildSeedFallback();
  }
}

/**
 * Returns only SriLankan Airlines (UL) flights from the full CMB schedule.
 */
export async function getSriLankanFlights(): Promise<AviationResult> {
  const result = await getCMBFlights();
  const arrivals = result.arrivals.filter((f) => f.airlineIata === "UL");
  const departures = result.departures.filter((f) => f.airlineIata === "UL");
  const all = [...arrivals, ...departures];
  return {
    ...result,
    arrivals,
    departures,
    totalArrivals: arrivals.length,
    totalDepartures: departures.length,
    delayedCount: all.filter((f) => (f.delayMinutes ?? 0) > 15).length,
    cancelledCount: all.filter((f) => f.status === "cancelled").length,
  };
}

/**
 * Quick summary stats for the /transport page pulse widget.
 */
export async function getAviationSummary(): Promise<{
  totalFlights: number;
  delayedCount: number;
  cancelledCount: number;
  asOf: string;
  isFallback: boolean;
  sourceId: typeof AVIATION_EDGE_SOURCE_ID | typeof AVIATION_SEED_SOURCE_ID;
}> {
  const result = await getCMBFlights();
  return {
    totalFlights: result.totalArrivals + result.totalDepartures,
    delayedCount: result.delayedCount,
    cancelledCount: result.cancelledCount,
    asOf: result.asOf,
    isFallback: result.isFallback,
    sourceId: result.sourceId,
  };
}
