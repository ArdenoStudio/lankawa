import { getSourceProvenancePath } from "@/lib/sources";

export const CRICKET_SOURCE_ID = "cricket_sl";

const CRICKET_API_BASE =
  process.env.CRICKETDATA_API_BASE ?? "https://api.cricapi.com/v1";
const FETCH_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 10 * 60_000;
const SRI_LANKA_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export interface SriLankaCricketMatch {
  sourceId: string;
  fetchedAt: string;
  name: string;
  status: "live" | "upcoming";
  statusText: string;
  startsAt: string | null;
  venue: string | null;
  competition: string | null;
  teams: string[];
  score: string | null;
  provenancePath: string;
}

interface CricketApiScore {
  inning?: string;
  r?: number;
  w?: number;
  o?: number;
}

interface CricketApiMatch {
  name?: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  teamInfo?: Array<{ name?: string; shortname?: string }>;
  score?: CricketApiScore[];
  matchStarted?: boolean;
  matchEnded?: boolean;
  series?: string;
}

interface CricketApiResponse {
  status?: string;
  data?: CricketApiMatch[];
  matches?: CricketApiMatch[];
}

let cachedMatch: { value: SriLankaCricketMatch | null; cachedAt: number } | null =
  null;

function getApiKey(): string | null {
  return process.env.CRICKETDATA_API_KEY ?? process.env.CRICAPI_API_KEY ?? null;
}

function sriLankaDateKey(date: Date): string {
  return new Date(date.getTime() + SRI_LANKA_OFFSET_MS).toISOString().slice(0, 10);
}

function isTodayInSriLanka(value: string | null): boolean {
  if (!value) {
    return false;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return sriLankaDateKey(parsed) === sriLankaDateKey(new Date());
}

function matchDate(match: CricketApiMatch): string | null {
  const raw = match.dateTimeGMT ?? match.date;
  if (!raw) {
    return null;
  }
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function matchTeams(match: CricketApiMatch): string[] {
  if (Array.isArray(match.teams) && match.teams.length > 0) {
    return match.teams.filter(Boolean);
  }
  return (
    match.teamInfo
      ?.map((team) => team.name ?? team.shortname ?? "")
      .filter(Boolean) ?? []
  );
}

function includesSriLanka(teams: string[]): boolean {
  return teams.some((team) => team.toLowerCase().includes("sri lanka"));
}

function matchStatus(match: CricketApiMatch): "live" | "upcoming" | null {
  const status = match.status?.toLowerCase() ?? "";
  if (
    match.matchStarted === true &&
    match.matchEnded !== true &&
    !status.includes("not started")
  ) {
    return "live";
  }
  if (
    status.includes("live") ||
    status.includes("innings") ||
    status.includes("stumps") ||
    status.includes("drinks") ||
    status.includes("lunch") ||
    status.includes("tea")
  ) {
    return "live";
  }
  if (match.matchEnded === true || status.includes("won by") || status.includes("draw")) {
    return null;
  }
  return "upcoming";
}

function formatScore(match: CricketApiMatch): string | null {
  const scores = match.score?.slice(0, 2) ?? [];
  if (scores.length === 0) {
    return null;
  }
  return scores
    .map((score) => {
      const wickets = typeof score.w === "number" ? `/${score.w}` : "";
      const overs = typeof score.o === "number" ? ` (${score.o} ov)` : "";
      return `${score.inning ?? "Innings"} ${score.r ?? 0}${wickets}${overs}`;
    })
    .join(" | ");
}

function normalizeMatch(match: CricketApiMatch): SriLankaCricketMatch | null {
  const teams = matchTeams(match);
  if (!includesSriLanka(teams)) {
    return null;
  }

  const startsAt = matchDate(match);
  const status = matchStatus(match);
  if (!status) {
    return null;
  }
  if (status !== "live" && !isTodayInSriLanka(startsAt)) {
    return null;
  }
  if (status === "live" && startsAt && !isTodayInSriLanka(startsAt)) {
    return null;
  }

  return {
    sourceId: CRICKET_SOURCE_ID,
    fetchedAt: new Date().toISOString(),
    name: match.name ?? teams.join(" vs "),
    status,
    statusText: match.status ?? (status === "live" ? "Live" : "Upcoming"),
    startsAt,
    venue: match.venue ?? null,
    competition: match.series ?? match.matchType ?? null,
    teams,
    score: formatScore(match),
    provenancePath: getSourceProvenancePath(CRICKET_SOURCE_ID),
  };
}

function pickSriLankaMatch(
  matches: CricketApiMatch[],
): SriLankaCricketMatch | null {
  const normalized = matches
    .map(normalizeMatch)
    .filter((match): match is SriLankaCricketMatch => match != null);

  return (
    normalized.find((match) => match.status === "live") ??
    normalized.sort(
      (a, b) =>
        new Date(a.startsAt ?? 0).getTime() -
        new Date(b.startsAt ?? 0).getTime(),
    )[0] ??
    null
  );
}

async function fetchCricketEndpoint(pathname: string): Promise<CricketApiMatch[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [];
  }

  const base = `${CRICKET_API_BASE.replace(/\/$/, "")}/`;
  const url = new URL(pathname.replace(/^\//, ""), base);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("offset", "0");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 600 },
      headers: {
        Accept: "application/json",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as CricketApiResponse | CricketApiMatch[];
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.data ?? payload.matches ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchSriLankaCricketMatch(): Promise<SriLankaCricketMatch | null> {
  if (cachedMatch && Date.now() - cachedMatch.cachedAt <= CACHE_TTL_MS) {
    return cachedMatch.value;
  }

  if (!getApiKey()) {
    cachedMatch = { value: null, cachedAt: Date.now() };
    return null;
  }

  const [currentMatches, upcomingMatches] = await Promise.all([
    fetchCricketEndpoint("currentMatches"),
    fetchCricketEndpoint("matches"),
  ]);
  const match = pickSriLankaMatch([...currentMatches, ...upcomingMatches]);
  cachedMatch = { value: match, cachedAt: Date.now() };
  return match;
}
