import seedData from "../../data/ceb-outages-seed.json" with { type: "json" };

export const CEB_OUTAGES_API_SOURCE_ID = "ceb_outages_api" as const;
export const CEB_OUTAGES_SEED_SOURCE_ID = "ceb_outages_seed" as const;
export const SEED_FALLBACK_DISCLAIMER = "Seed fallback — live API unavailable" as const;

const CEB_BASE = "https://cebcare.ceb.lk";
const OUTAGE_MAP_URL = `${CEB_BASE}/Incognito/OutageMap`;
const SCHEDULE_URL = `${CEB_BASE}/Incognito/DemandMgmtSchedule`;
const FETCH_TIMEOUT_MS = 10_000;
const REVALIDATE_SECONDS = 3600;

export interface LiveOutageItem {
  id: string;
  province: string;
  area: string;
  interruptionType: string;
  affectedCustomers: number;
  timestamp: string;
}

export interface LiveOutagesResult {
  outages: LiveOutageItem[];
  totalAffectedAreas: number;
  totalCustomersAffected: number;
  asOf: string;
  isFallback: boolean;
  disclaimer: typeof SEED_FALLBACK_DISCLAIMER | null;
  sourceId: typeof CEB_OUTAGES_API_SOURCE_ID | typeof CEB_OUTAGES_SEED_SOURCE_ID;
}

export interface LoadSheddingGroupSchedule {
  group: string;
  startTime: string;
  endTime: string;
  date: string;
  durationMinutes: number;
  status: "scheduled" | "active" | "completed" | "none";
  affectedAreas: string[];
  customerCount: number;
  description?: string;
}

export interface LoadSheddingScheduleResult {
  groups: LoadSheddingGroupSchedule[];
  totalGroups: number;
  asOf: string;
  isFallback: boolean;
  disclaimer: typeof SEED_FALLBACK_DISCLAIMER | null;
  sourceId: typeof CEB_OUTAGES_API_SOURCE_ID | typeof CEB_OUTAGES_SEED_SOURCE_ID;
}

interface SeedFile {
  asOf: string;
  sourceId: string;
  disclaimer: string;
  outages: LiveOutageItem[];
  schedules: LoadSheddingGroupSchedule[];
}

const seed = seedData as SeedFile;

function buildTimeoutSignal(ms: number = FETCH_TIMEOUT_MS): AbortSignal | undefined {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  return undefined;
}

function extractRequestVerificationToken(html: string): string | null {
  const match = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
  return match?.[1] ?? null;
}

function buildCookieHeader(setCookieHeaders: string[]): string {
  const pairs: string[] = [];
  for (const header of setCookieHeaders) {
    const segment = header.split(";")[0]?.trim();
    if (segment) {
      pairs.push(segment);
    }
  }
  return pairs.join("; ");
}

interface CebSession {
  token: string;
  cookieHeader: string;
}

async function bootstrapCebSession(pageUrl: string): Promise<CebSession> {
  const signal = buildTimeoutSignal(FETCH_TIMEOUT_MS);
  const response = await fetch(pageUrl, {
    headers: {
      "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal,
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`CEB session bootstrap failed with HTTP ${response.status}`);
  }

  const html = await response.text();
  const token = extractRequestVerificationToken(html);
  if (!token) {
    throw new Error("CEB anti-forgery token missing from response");
  }

  const setCookie =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  return {
    token,
    cookieHeader: buildCookieHeader(setCookie),
  };
}

function cebHeaders(session: CebSession): HeadersInit {
  return {
    "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)",
    Accept: "application/json, text/plain, */*",
    Cookie: session.cookieHeader,
    RequestVerificationToken: session.token,
    "X-Requested-With": "XMLHttpRequest",
  };
}

function buildSeedOutagesFallback(): LiveOutagesResult {
  const outages = seed.outages ?? [];
  const totalCustomersAffected = outages.reduce(
    (sum, o) => sum + (o.affectedCustomers || 0),
    0,
  );
  return {
    outages,
    totalAffectedAreas: outages.length,
    totalCustomersAffected,
    asOf: seed.asOf,
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: CEB_OUTAGES_SEED_SOURCE_ID,
  };
}

function buildSeedScheduleFallback(groupFilter?: string): LoadSheddingScheduleResult {
  let groups = seed.schedules ?? [];
  if (groupFilter && groupFilter.trim()) {
    const targetGroup = groupFilter.trim().toUpperCase();
    groups = groups.filter((g) => g.group.toUpperCase() === targetGroup);
  }
  return {
    groups,
    totalGroups: groups.length,
    asOf: seed.asOf,
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: CEB_OUTAGES_SEED_SOURCE_ID,
  };
}

/**
 * Fetches live power breakdown outages from CEB Care Incognito Outage Map.
 * Falls back cleanly to seed data if network call times out or fails.
 */
export async function getLiveOutages(): Promise<LiveOutagesResult> {
  try {
    const session = await bootstrapCebSession(OUTAGE_MAP_URL);
    const signal = buildTimeoutSignal(FETCH_TIMEOUT_MS);

    const provRes = await fetch(`${CEB_BASE}/Incognito/GetProvinces`, {
      headers: cebHeaders(session),
      signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!provRes.ok) {
      return buildSeedOutagesFallback();
    }

    const provinces = await provRes.json();
    if (!Array.isArray(provinces) || provinces.length === 0) {
      return buildSeedOutagesFallback();
    }

    const liveOutages: LiveOutageItem[] = [];

    for (const prov of provinces.slice(0, 3)) {
      const provinceId = prov.ProvinceId ?? prov.id;
      const provinceName = prov.ProvinceName ?? prov.name ?? "CEB Province";
      if (!provinceId) continue;

      const areaRes = await fetch(
        `${CEB_BASE}/Incognito/GetAreasByProvince?provinceId=${encodeURIComponent(provinceId)}`,
        {
          headers: cebHeaders(session),
          signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
          next: { revalidate: REVALIDATE_SECONDS },
        },
      );

      if (!areaRes.ok) continue;
      const areas = await areaRes.json();
      if (!Array.isArray(areas)) continue;

      for (const area of areas.slice(0, 2)) {
        const areaId = area.AreaId ?? area.id;
        const areaName = area.AreaName ?? area.name ?? "CEB Area";
        if (!areaId) continue;

        const locRes = await fetch(
          `${CEB_BASE}/Incognito/GetOutageLocationsInArea?areaId=${encodeURIComponent(areaId)}`,
          {
            headers: cebHeaders(session),
            signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
            next: { revalidate: REVALIDATE_SECONDS },
          },
        );

        if (!locRes.ok) continue;
        const locations = await locRes.json();
        if (!Array.isArray(locations)) continue;

        for (const loc of locations) {
          liveOutages.push({
            id: String(loc.Id ?? loc.id ?? `OUT-${provinceId}-${areaId}-${liveOutages.length + 1}`),
            province: String(provinceName),
            area: String(areaName),
            interruptionType: String(loc.InterruptionTypeName ?? loc.type ?? "Active Outage"),
            affectedCustomers: Number(loc.NumberOfCustomers ?? loc.customers ?? 0),
            timestamp: String(loc.TimeStamp ?? new Date().toISOString()),
          });
        }
      }
    }

    if (liveOutages.length === 0) {
      return buildSeedOutagesFallback();
    }

    const totalCustomersAffected = liveOutages.reduce((sum, o) => sum + o.affectedCustomers, 0);

    return {
      outages: liveOutages,
      totalAffectedAreas: liveOutages.length,
      totalCustomersAffected,
      asOf: new Date().toISOString(),
      isFallback: false,
      disclaimer: null,
      sourceId: CEB_OUTAGES_API_SOURCE_ID,
    };
  } catch {
    return buildSeedOutagesFallback();
  }
}

/**
 * Fetches published CEB demand-management load-shedding schedules for letter groups A–Y.
 * Filterable by group ID (e.g. "A" through "Y").
 * Falls back cleanly to seed data if network call times out or fails.
 */
export async function getLoadSheddingSchedule(
  group?: string,
): Promise<LoadSheddingScheduleResult> {
  try {
    const session = await bootstrapCebSession(SCHEDULE_URL);
    const signal = buildTimeoutSignal(FETCH_TIMEOUT_MS);

    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const endDate = new Date(now.getTime() + 86_400_000).toISOString().slice(0, 10);

    const body = new URLSearchParams({
      StartTime: startDate,
      EndTime: endDate,
    });

    const res = await fetch(`${CEB_BASE}/Incognito/GetLoadSheddingEvents`, {
      method: "POST",
      headers: {
        ...cebHeaders(session),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return buildSeedScheduleFallback(group);
    }

    const events = await res.json();
    if (!Array.isArray(events) || events.length === 0) {
      return buildSeedScheduleFallback(group);
    }

    const liveGroups: LoadSheddingGroupSchedule[] = events.map((evt, idx) => ({
      group: String(evt.loadShedGroupId ?? evt.group ?? String.fromCharCode(65 + (idx % 25))).toUpperCase(),
      startTime: String(evt.startTime ?? "08:00"),
      endTime: String(evt.endTime ?? "10:30"),
      date: String(evt.date ?? startDate),
      durationMinutes: Number(evt.durationMinutes ?? 150),
      status: "scheduled",
      affectedAreas: Array.isArray(evt.affectedAreas) ? evt.affectedAreas : ["Group Rotation"],
      customerCount: Number(evt.customerCount ?? 150000),
      description: evt.description ? String(evt.description) : undefined,
    }));

    let filtered = liveGroups;
    if (group && group.trim()) {
      const targetGroup = group.trim().toUpperCase();
      filtered = liveGroups.filter((g) => g.group === targetGroup);
    }

    if (filtered.length === 0) {
      return buildSeedScheduleFallback(group);
    }

    return {
      groups: filtered,
      totalGroups: filtered.length,
      asOf: new Date().toISOString(),
      isFallback: false,
      disclaimer: null,
      sourceId: CEB_OUTAGES_API_SOURCE_ID,
    };
  } catch {
    return buildSeedScheduleFallback(group);
  }
}
