import { getSource, getSourceProvenancePath } from "../sources";

const MET_DEPT_BASE_URL = "https://was.meteo.gov.lk";
const ADVISORIES_URL = `${MET_DEPT_BASE_URL}/dashboard-api/advisories`;
const CAP_RSS_URL = `${MET_DEPT_BASE_URL}/cap/en/rss.xml`;
const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";
const FETCH_TIMEOUT_MS = 5000;
const MAX_SUMMARY_BULLETS = 5;
const MAX_CAP_XML_FETCHES = 5;

export const MET_DEPT_WARNINGS_SOURCE_ID = "met_dept_warnings";

export type MetDeptWarningLevel = "none" | "yellow" | "amber" | "red" | "unknown";
export type MetDeptWarningSource = "advisory" | "cap" | "advisory+cap";
export type MetDeptFeedMode = "advisory" | "cap" | "advisory+cap";

export interface MetDeptWarning {
  id: string;
  dayKey: string;
  dayLabel: string;
  name: string;
  level: MetDeptWarningLevel;
  warningLabel: string | null;
  bulletinNo: string | null;
  validFrom: string | null;
  validTo: string | null;
  summary: string | null;
  summaryBullets: string[];
  actionRequired: string | null;
  damageExpected: string | null;
  areas: string[];
  districts: string[];
  divisions: string[];
  /** CAP urgency when available (Immediate / Expected / Future / …). */
  urgency: string | null;
  /** CAP severity when available (Minor / Moderate / Severe / …). */
  severity: string | null;
  /** CAP certainty when available (Possible / Likely / …). */
  certainty: string | null;
  headline: string | null;
  webUrl: string | null;
  capUrl: string | null;
  source: MetDeptWarningSource;
}

export interface MetDeptWarningsSnapshot {
  sourceId: typeof MET_DEPT_WARNINGS_SOURCE_ID;
  sourceName: string;
  title: string;
  agency: string;
  issuedAt: string | null;
  checkedAt: string;
  warnings: MetDeptWarning[];
  /** Always false — Met Dept never uses curated seed warnings. */
  isSeed: false;
  feedMode: MetDeptFeedMode;
  capAlertCount: number;
  provenancePath: string;
}

export interface CapRssItem {
  title: string | null;
  link: string | null;
  description: string | null;
  pubDate: string | null;
  guid: string | null;
}

export interface CapRssFeed {
  title: string | null;
  publishedAt: string | null;
  items: CapRssItem[];
}

export interface CapAlertInfo {
  language: string | null;
  category: string | null;
  event: string | null;
  urgency: string | null;
  severity: string | null;
  certainty: string | null;
  expires: string | null;
  effective: string | null;
  senderName: string | null;
  headline: string | null;
  description: string | null;
  instruction: string | null;
  actionRequired: string | null;
  damageExpected: string | null;
  web: string | null;
  areaDescs: string[];
}

export interface CapAlert {
  identifier: string | null;
  sender: string | null;
  sent: string | null;
  status: string | null;
  msgType: string | null;
  scope: string | null;
  info: CapAlertInfo[];
  sourceUrl: string | null;
}

interface MetDeptAdvisoryResponse {
  title?: unknown;
  agency?: unknown;
  days?: Array<{
    key?: unknown;
    label?: unknown;
    hazards?: MetDeptRawHazard[];
  }>;
}

interface MetDeptRawHazard {
  id?: unknown;
  bulletin_no?: unknown;
  name?: unknown;
  level?: unknown;
  published?: unknown;
  active?: unknown;
  warning_label?: unknown;
  valid_from?: unknown;
  valid_to?: unknown;
  summary?: unknown;
  summary_en?: unknown;
  summary_si?: unknown;
  summary_ta?: unknown;
  action_required?: unknown;
  action_required_en?: unknown;
  action_required_si?: unknown;
  action_required_ta?: unknown;
  damage_expected?: unknown;
  damage_expected_en?: unknown;
  damage_expected_si?: unknown;
  damage_expected_ta?: unknown;
  areas?: unknown;
  districts?: unknown;
  divisions?: unknown;
}

async function fetchWithTimeout(url: string, accept: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: accept,
        "User-Agent": BOT_USER_AGENT,
      },
      next: { revalidate: 900 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const stringValue = asString(value);
    if (stringValue) {
      return stringValue;
    }
  }

  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item))
    .filter((item): item is string => item != null);
}

export function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCharCode(n) : "";
    });
}

function richTextToPlainText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const text = decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || null;
}

function toSummaryBullets(value: string | null): string[] {
  if (!value) {
    return [];
  }

  const lines = value
    .split(/\n+|(?:\.\s+)/)
    .map((line) => line.replace(/^[•*\-\s]+/, "").trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0 && value.trim()) {
    return [value.trim()];
  }

  return lines.slice(0, MAX_SUMMARY_BULLETS);
}

function normalizeWarningLevel(value: unknown): MetDeptWarningLevel {
  const level = asString(value)?.toLowerCase();

  if (level === "none" || level === "yellow" || level === "amber" || level === "red") {
    return level;
  }

  return "unknown";
}

/** Map CAP severity (+ optional urgency hints) to Met Dept colour levels. */
export function capSeverityToLevel(
  severity: string | null,
  urgency?: string | null,
): MetDeptWarningLevel {
  const s = severity?.trim().toLowerCase() ?? "";
  if (s === "extreme" || s === "severe") {
    return "red";
  }
  if (s === "moderate") {
    return "amber";
  }
  if (s === "minor") {
    return "yellow";
  }
  if (s === "unknown" || !s) {
    const u = urgency?.trim().toLowerCase() ?? "";
    if (u === "immediate") {
      return "amber";
    }
  }
  return "unknown";
}

function isActiveHazard(raw: MetDeptRawHazard): boolean {
  if (typeof raw.published === "boolean") {
    return raw.published;
  }

  if (typeof raw.active === "boolean") {
    return raw.active;
  }

  return normalizeWarningLevel(raw.level) !== "none";
}

function emptyCapFields(): Pick<
  MetDeptWarning,
  | "urgency"
  | "severity"
  | "certainty"
  | "headline"
  | "webUrl"
  | "capUrl"
  | "source"
> {
  return {
    urgency: null,
    severity: null,
    certainty: null,
    headline: null,
    webUrl: null,
    capUrl: null,
    source: "advisory",
  };
}

function normalizeHazard(
  raw: MetDeptRawHazard,
  dayKey: string,
  dayLabel: string,
): MetDeptWarning | null {
  if (!isActiveHazard(raw)) {
    return null;
  }

  const name = firstString(raw.name, raw.warning_label);
  if (!name) {
    return null;
  }

  const summary = richTextToPlainText(
    firstString(raw.summary_en, raw.summary, raw.summary_si, raw.summary_ta),
  );
  const actionRequired = richTextToPlainText(
    firstString(
      raw.action_required_en,
      raw.action_required,
      raw.action_required_si,
      raw.action_required_ta,
    ),
  );
  const damageExpected = richTextToPlainText(
    firstString(
      raw.damage_expected_en,
      raw.damage_expected,
      raw.damage_expected_si,
      raw.damage_expected_ta,
    ),
  );

  return {
    id: firstString(raw.id, `${dayKey}-${name}`) ?? `${dayKey}-${name}`,
    dayKey,
    dayLabel,
    name,
    level: normalizeWarningLevel(raw.level),
    warningLabel: asString(raw.warning_label),
    bulletinNo: asString(raw.bulletin_no),
    validFrom: asString(raw.valid_from),
    validTo: asString(raw.valid_to),
    summary,
    summaryBullets: toSummaryBullets(summary),
    actionRequired,
    damageExpected,
    areas: asStringArray(raw.areas),
    districts: asStringArray(raw.districts),
    divisions: asStringArray(raw.divisions),
    ...emptyCapFields(),
  };
}

function xmlTagValue(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(re);
  if (!match?.[1]) {
    return null;
  }
  const raw = decodeEntities(
    match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim(),
  );
  return raw || null;
}

function xmlTagValues(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const values: string[] = [];
  for (const match of xml.matchAll(re)) {
    const raw = decodeEntities(
      (match[1] ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim(),
    );
    if (raw) {
      values.push(raw);
    }
  }
  return values;
}

function parseRssDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const timestamp = new Date(decodeEntities(value.trim())).getTime();
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

/** Parse MetDept CAP RSS channel (+ items when published). */
export function parseCapRss(xml: string): CapRssFeed {
  const channelMatch = xml.match(/<channel\b[\s\S]*?<\/channel>/i);
  const channel = channelMatch?.[0] ?? xml;
  const publishedAt =
    parseRssDate(xmlTagValue(channel, "pubDate")) ??
    parseRssDate(xmlTagValue(channel, "lastBuildDate"));

  const items: CapRssItem[] = [];
  for (const itemMatch of xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)) {
    const block = itemMatch[0];
    items.push({
      title: xmlTagValue(block, "title"),
      link: xmlTagValue(block, "link"),
      description: richTextToPlainText(xmlTagValue(block, "description")),
      pubDate: parseRssDate(xmlTagValue(block, "pubDate")),
      guid: xmlTagValue(block, "guid"),
    });
  }

  return {
    title: xmlTagValue(channel, "title"),
    publishedAt,
    items,
  };
}

/**
 * Split MetDept CAP instruction text that prefixes Action Required / Damage Expected.
 */
export function splitCapInstruction(instruction: string | null): {
  actionRequired: string | null;
  damageExpected: string | null;
  remainder: string | null;
} {
  if (!instruction) {
    return { actionRequired: null, damageExpected: null, remainder: null };
  }

  const lines = instruction
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  let actionRequired: string | null = null;
  let damageExpected: string | null = null;
  const remainder: string[] = [];

  for (const line of lines) {
    const action = line.match(/^Action Required\s*:\s*(.+)$/i);
    if (action?.[1]) {
      actionRequired = action[1].trim();
      continue;
    }
    const damage = line.match(/^Damage Expected\s*:\s*(.+)$/i);
    if (damage?.[1]) {
      damageExpected = damage[1].trim();
      continue;
    }
    remainder.push(line);
  }

  return {
    actionRequired,
    damageExpected,
    remainder: remainder.length > 0 ? remainder.join("\n") : null,
  };
}

function stripLabeledPrefix(value: string | null, labels: RegExp): string | null {
  if (!value) {
    return null;
  }
  const stripped = value.replace(labels, "").trim();
  return stripped || null;
}

/** Parse a CAP 1.1 alert XML document (MetDept template shape). */
export function parseCapXml(xml: string, sourceUrl: string | null = null): CapAlert | null {
  if (!/<alert\b/i.test(xml)) {
    return null;
  }

  const infoBlocks = [...xml.matchAll(/<info\b[\s\S]*?<\/info>/gi)].map((match) => {
    const block = match[0];
    const rawInstruction = richTextToPlainText(xmlTagValue(block, "instruction"));
    const split = splitCapInstruction(rawInstruction);
    const description = stripLabeledPrefix(
      richTextToPlainText(xmlTagValue(block, "description")),
      /^Warning Description\s*:\s*/i,
    );

    return {
      language: xmlTagValue(block, "language"),
      category: xmlTagValue(block, "category"),
      event: xmlTagValue(block, "event"),
      urgency: xmlTagValue(block, "urgency"),
      severity: xmlTagValue(block, "severity"),
      certainty: xmlTagValue(block, "certainty"),
      expires: xmlTagValue(block, "expires"),
      effective: xmlTagValue(block, "effective"),
      senderName: xmlTagValue(block, "senderName"),
      headline: richTextToPlainText(xmlTagValue(block, "headline")),
      description,
      instruction: split.remainder ?? rawInstruction,
      actionRequired: split.actionRequired,
      damageExpected: split.damageExpected,
      web: xmlTagValue(block, "web"),
      areaDescs: xmlTagValues(block, "areaDesc").map((area) =>
        decodeEntities(area).replace(/\s+/g, " ").trim(),
      ),
    } satisfies CapAlertInfo;
  });

  return {
    identifier: xmlTagValue(xml, "identifier"),
    sender: xmlTagValue(xml, "sender"),
    sent: xmlTagValue(xml, "sent"),
    status: xmlTagValue(xml, "status"),
    msgType: xmlTagValue(xml, "msgType"),
    scope: xmlTagValue(xml, "scope"),
    info: infoBlocks,
    sourceUrl,
  };
}

function pickCapInfo(alert: CapAlert): CapAlertInfo | null {
  if (alert.info.length === 0) {
    return null;
  }
  return (
    alert.info.find((info) => (info.language ?? "").toLowerCase().startsWith("en")) ??
    alert.info[0] ??
    null
  );
}

function areasFromCapDesc(areaDescs: string[]): {
  areas: string[];
  districts: string[];
  divisions: string[];
} {
  const districts: string[] = [];
  const divisions: string[] = [];
  const areas: string[] = [];

  for (const desc of areaDescs) {
    const districtMatch = desc.match(/^Districts\s*:\s*(.+)$/i);
    if (districtMatch?.[1]) {
      districts.push(
        ...districtMatch[1]
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
      );
      continue;
    }
    const divisionMatch = desc.match(/^(?:Divisions|DS Divisions)\s*:\s*(.+)$/i);
    if (divisionMatch?.[1]) {
      divisions.push(
        ...divisionMatch[1]
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
      );
      continue;
    }
    for (const part of desc.split(/[,\n]+/)) {
      const trimmed = part.trim();
      if (trimmed) {
        areas.push(trimmed);
      }
    }
  }

  return { areas, districts, divisions };
}

export function capAlertToWarning(alert: CapAlert): MetDeptWarning | null {
  const status = alert.status?.toLowerCase();
  if (status && status !== "actual" && status !== "exercise" && status !== "system") {
    return null;
  }

  const info = pickCapInfo(alert);
  if (!info) {
    return null;
  }

  const name = firstString(info.event, info.headline);
  if (!name) {
    return null;
  }

  const summary = info.description;
  const { areas, districts, divisions } = areasFromCapDesc(info.areaDescs);
  const level = capSeverityToLevel(info.severity, info.urgency);
  const id =
    alert.identifier ??
    alert.sourceUrl ??
    `cap-${name}-${info.expires ?? alert.sent ?? "unknown"}`;

  return {
    id,
    dayKey: "cap",
    dayLabel: "CAP alert",
    name,
    level,
    warningLabel: info.headline,
    bulletinNo: alert.identifier,
    validFrom: info.effective ?? alert.sent,
    validTo: info.expires,
    summary,
    summaryBullets: toSummaryBullets(summary),
    actionRequired: info.actionRequired ?? info.instruction,
    damageExpected: info.damageExpected,
    areas,
    districts,
    divisions,
    urgency: info.urgency,
    severity: info.severity,
    certainty: info.certainty,
    headline: info.headline,
    webUrl: info.web,
    capUrl: alert.sourceUrl,
    source: "cap",
  };
}

function warningMatchKey(warning: MetDeptWarning): string {
  return [warning.name, warning.level, warning.validTo ?? "", warning.validFrom ?? ""]
    .join("|")
    .toLowerCase();
}

function namesOverlap(a: string, b: string): boolean {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  return left.includes(right) || right.includes(left);
}

/** Prefer advisory rows; enrich from CAP; fall back to CAP-only when advisories empty. */
export function mergeAdvisoryAndCapWarnings(
  advisoryWarnings: MetDeptWarning[],
  capWarnings: MetDeptWarning[],
): { warnings: MetDeptWarning[]; feedMode: MetDeptFeedMode } {
  if (advisoryWarnings.length === 0 && capWarnings.length === 0) {
    return { warnings: [], feedMode: "advisory" };
  }

  if (advisoryWarnings.length === 0) {
    return { warnings: capWarnings, feedMode: "cap" };
  }

  if (capWarnings.length === 0) {
    return { warnings: advisoryWarnings, feedMode: "advisory" };
  }

  const usedCap = new Set<string>();
  const merged = advisoryWarnings.map((advisory) => {
    const match =
      capWarnings.find((cap) => {
        if (usedCap.has(cap.id)) {
          return false;
        }
        if (warningMatchKey(advisory) === warningMatchKey(cap)) {
          return true;
        }
        return (
          namesOverlap(advisory.name, cap.name) &&
          (advisory.level === cap.level ||
            advisory.level === "unknown" ||
            cap.level === "unknown")
        );
      }) ?? null;

    if (!match) {
      return advisory;
    }

    usedCap.add(match.id);
    return {
      ...advisory,
      summary: advisory.summary ?? match.summary,
      summaryBullets:
        advisory.summaryBullets.length > 0
          ? advisory.summaryBullets
          : match.summaryBullets,
      actionRequired: advisory.actionRequired ?? match.actionRequired,
      damageExpected: advisory.damageExpected ?? match.damageExpected,
      areas: advisory.areas.length > 0 ? advisory.areas : match.areas,
      districts: advisory.districts.length > 0 ? advisory.districts : match.districts,
      divisions: advisory.divisions.length > 0 ? advisory.divisions : match.divisions,
      urgency: match.urgency,
      severity: match.severity,
      certainty: match.certainty,
      headline: match.headline ?? advisory.warningLabel,
      webUrl: match.webUrl,
      capUrl: match.capUrl,
      source: "advisory+cap" as const,
    };
  });

  return { warnings: merged, feedMode: "advisory+cap" };
}

async function fetchCapAlertsFromRss(): Promise<{
  feed: CapRssFeed | null;
  alerts: CapAlert[];
}> {
  try {
    const response = await fetchWithTimeout(CAP_RSS_URL, "application/rss+xml, text/xml");
    if (!response.ok) {
      return { feed: null, alerts: [] };
    }

    const feed = parseCapRss(await response.text());
    const links = feed.items
      .map((item) => item.link)
      .filter((link): link is string => Boolean(link))
      .filter((link) => /\.xml(\?|$)/i.test(link) || /\/cap\//i.test(link))
      .slice(0, MAX_CAP_XML_FETCHES);

    const alerts: CapAlert[] = [];
    await Promise.all(
      links.map(async (link) => {
        try {
          const capResponse = await fetchWithTimeout(link, "application/xml, text/xml");
          if (!capResponse.ok) {
            return;
          }
          const alert = parseCapXml(await capResponse.text(), link);
          if (alert) {
            alerts.push(alert);
          }
        } catch {
          // Individual CAP XML failures must not sink the advisory snapshot.
        }
      }),
    );

    return { feed, alerts };
  } catch {
    return { feed: null, alerts: [] };
  }
}

export async function fetchMetDeptWarnings(): Promise<MetDeptWarningsSnapshot | null> {
  try {
    const [response, capBundle] = await Promise.all([
      fetchWithTimeout(ADVISORIES_URL, "application/json"),
      fetchCapAlertsFromRss(),
    ]);

    if (!response.ok) {
      // No curated seed fallback — callers show an unavailable state.
      return null;
    }

    const payload = (await response.json()) as MetDeptAdvisoryResponse;
    const advisoryWarnings = (payload.days ?? []).flatMap((day) => {
      const dayKey = asString(day.key) ?? "today";
      const dayLabel = asString(day.label) ?? dayKey;
      return (day.hazards ?? [])
        .map((hazard) => normalizeHazard(hazard, dayKey, dayLabel))
        .filter((hazard): hazard is MetDeptWarning => hazard != null);
    });

    const capWarnings = capBundle.alerts
      .map((alert) => capAlertToWarning(alert))
      .filter((warning): warning is MetDeptWarning => warning != null);

    const { warnings, feedMode } = mergeAdvisoryAndCapWarnings(
      advisoryWarnings,
      capWarnings,
    );

    const issuedAt =
      capBundle.feed?.publishedAt ??
      firstString(...capBundle.alerts.map((alert) => alert.sent)) ??
      null;

    const source = getSource(MET_DEPT_WARNINGS_SOURCE_ID);

    return {
      sourceId: MET_DEPT_WARNINGS_SOURCE_ID,
      sourceName: source?.name ?? "Department of Meteorology",
      title: asString(payload.title) ?? "Weather Advisory System",
      agency: asString(payload.agency) ?? "Department of Meteorology, Sri Lanka",
      issuedAt,
      checkedAt: new Date().toISOString(),
      warnings,
      isSeed: false,
      feedMode,
      capAlertCount: capWarnings.length,
      provenancePath: getSourceProvenancePath(MET_DEPT_WARNINGS_SOURCE_ID),
    };
  } catch {
    return null;
  }
}
