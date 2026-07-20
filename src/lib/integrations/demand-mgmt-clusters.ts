import seedData from "@/data/demand-mgmt-clusters-seed.json";

const CEB_BASE = "https://cebcare.ceb.lk";
const CEB_SCHEDULE_URL = `${CEB_BASE}/Incognito/DemandMgmtSchedule`;
const CEB_CLUSTERS_URL = `${CEB_BASE}/Incognito/GetDemandMgmtClusters`;

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";

const FETCH_REVALIDATE_SECONDS = 900;
const FETCH_TIMEOUT_MS = 10_000;
const GROUP_CONCURRENCY = 8;

/** CEB Care demand-management load-shed groups exposed on the public schedule map. */
export const DEMAND_MGMT_GROUP_IDS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
] as const;

export type DemandMgmtGroupId = (typeof DEMAND_MGMT_GROUP_IDS)[number];

export interface DemandMgmtGroupSummary {
  groupId: string;
  clusterCount: number;
  customerCount: number;
  generatedTime: string | null;
}

export interface DemandMgmtClustersSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  methodologyNote: string;
  groups: DemandMgmtGroupSummary[];
  totalClusters: number;
  totalCustomers: number;
}

type SeedFile = {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  groups: DemandMgmtGroupSummary[];
};

const seed = seedData as SeedFile;

interface CebSession {
  token: string;
  cookieHeader: string;
}

interface CebClusterRow {
  NumberOfCustomers?: number;
  GeneratedTime?: string;
  GroupId?: string;
  Points?: unknown[];
}

export function formatCustomerCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) {
    return "—";
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}k`;
  }
  return String(count);
}

export function summarizeClusters(
  groupId: string,
  clusters: CebClusterRow[],
): DemandMgmtGroupSummary | null {
  if (!Array.isArray(clusters) || clusters.length === 0) {
    return null;
  }

  let customerCount = 0;
  let generatedTime: string | null = null;

  for (const cluster of clusters) {
    const n = cluster.NumberOfCustomers;
    if (typeof n === "number" && Number.isFinite(n)) {
      customerCount += n;
    }
    if (!generatedTime && typeof cluster.GeneratedTime === "string") {
      generatedTime = cluster.GeneratedTime;
    }
  }

  return {
    groupId: groupId.toUpperCase(),
    clusterCount: clusters.length,
    customerCount,
    generatedTime,
  };
}

/** CEB sometimes returns a JSON string payload that itself needs a second parse. */
export function parseCebJsonPayload<T>(raw: string): T {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("CEB returned an empty response body");
  }

  const parsed: unknown = JSON.parse(trimmed);
  if (typeof parsed === "string") {
    return JSON.parse(parsed) as T;
  }

  return parsed as T;
}

function totals(groups: DemandMgmtGroupSummary[]): {
  totalClusters: number;
  totalCustomers: number;
} {
  return {
    totalClusters: groups.reduce((sum, g) => sum + g.clusterCount, 0),
    totalCustomers: groups.reduce((sum, g) => sum + g.customerCount, 0),
  };
}

function buildSeedSnapshot(): DemandMgmtClustersSnapshot {
  const groups = seed.groups.map((group) => ({ ...group }));
  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    isSeed: true,
    methodologyNote: seed.methodologyNote,
    groups,
    ...totals(groups),
  };
}

function extractRequestVerificationToken(html: string): string | null {
  const match = html.match(
    /name="__RequestVerificationToken"[^>]*value="([^"]+)"/,
  );
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

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function bootstrapCebSession(): Promise<CebSession> {
  const response = await fetchWithTimeout(CEB_SCHEDULE_URL, {
    headers: {
      "User-Agent": BOT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`CEB session bootstrap failed with ${response.status}`);
  }

  const html = await response.text();
  const token = extractRequestVerificationToken(html);
  if (!token) {
    throw new Error("CEB anti-forgery token missing from schedule page");
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

async function fetchGroupClusters(
  session: CebSession,
  groupId: string,
): Promise<DemandMgmtGroupSummary | null> {
  const url = `${CEB_CLUSTERS_URL}?LoadShedGroupId=${encodeURIComponent(groupId)}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": BOT_USER_AGENT,
      Accept: "application/json, text/plain, */*",
      Cookie: session.cookieHeader,
      RequestVerificationToken: session.token,
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  if (!response.ok) {
    return null;
  }

  const text = await response.text();
  if (!text.trim() || text.trim() === "{}") {
    return null;
  }

  try {
    const clusters = parseCebJsonPayload<CebClusterRow[]>(text);
    return summarizeClusters(groupId, Array.isArray(clusters) ? clusters : []);
  } catch {
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]!);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/**
 * Live CEB Care `GetDemandMgmtClusters` summaries for groups A–Y, with seed
 * fallback. Polygon geometry is discarded — only customer/cluster counts.
 */
export async function fetchDemandMgmtClustersSnapshot(): Promise<DemandMgmtClustersSnapshot> {
  try {
    const session = await bootstrapCebSession();
    const summaries = await mapWithConcurrency(
      DEMAND_MGMT_GROUP_IDS,
      GROUP_CONCURRENCY,
      (groupId) => fetchGroupClusters(session, groupId),
    );

    const groups = summaries.filter(
      (row): row is DemandMgmtGroupSummary => row !== null,
    );

    if (groups.length === 0) {
      return buildSeedSnapshot();
    }

    // Prefer live rows; fill gaps from seed so the strip stays complete.
    const byId = new Map(groups.map((g) => [g.groupId, g]));
    const merged = DEMAND_MGMT_GROUP_IDS.map((id) => {
      const live = byId.get(id);
      if (live) {
        return live;
      }
      const seeded = seed.groups.find((g) => g.groupId === id);
      return seeded
        ? { ...seeded }
        : {
            groupId: id,
            clusterCount: 0,
            customerCount: 0,
            generatedTime: null,
          };
    });

    const allLive = groups.length === DEMAND_MGMT_GROUP_IDS.length;
    const latestGenerated = merged
      .map((g) => g.generatedTime)
      .filter((t): t is string => Boolean(t))
      .sort()
      .at(-1);

    return {
      sourceId: seed.sourceId,
      sourceName: allLive
        ? "CEB Care — Demand management clusters"
        : "CEB Care — Demand management clusters (partial live)",
      asOf: latestGenerated?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      isSeed: false,
      methodologyNote: allLive
        ? "Live summaries from CEB Care Incognito GetDemandMgmtClusters (groups A–Y) after antiforgery bootstrap on DemandMgmtSchedule. Customer counts are indicative — confirm on cebcare.ceb.lk."
        : "Partial live CEB Care GetDemandMgmtClusters; missing groups filled from curated seed. Customer counts are indicative — confirm on cebcare.ceb.lk.",
      groups: merged,
      ...totals(merged),
    };
  } catch {
    return buildSeedSnapshot();
  }
}

export function getDemandMgmtClustersSeedSnapshot(): DemandMgmtClustersSnapshot {
  return buildSeedSnapshot();
}
