import { getCostOfLivingForDistrict } from "./cost-of-living";
import { DISTRICTS, getDistrict } from "./districts";
import { searchSriLankaPlaces } from "./integrations/geocode";
import {
  fetchDistrictWikipediaSummary,
  firstSentenceFromExtract,
} from "./integrations/wikipedia";
import { buildPulseSnapshot } from "./pulse";
import { getPresidentialElection2024 } from "./elections";
import { getPublicServicesCatalog, getPublicServicesForDistrict } from "./services";
import type { PulseSnapshot } from "./types";

export interface AssistantCitation {
  label: string;
  /** Internal path (`/districts/...`) or absolute Wikipedia URL. */
  path: string;
}

export interface AssistantAnswer {
  answer: string;
  citations: AssistantCitation[];
  mode: "rule" | "llm";
  districtSlug?: string | null;
}

export interface AnswerQuestionOptions {
  /** Explicit district slug scopes answers when provided. */
  districtSlug?: string | null;
}

interface LankawaContext {
  pulse: PulseSnapshot;
  districts: typeof DISTRICTS;
  electionWinner: string;
  servicesCount: number;
  scopedDistrictSlug: string | null;
}

async function buildContext(
  options?: AnswerQuestionOptions,
): Promise<LankawaContext> {
  const pulse = await buildPulseSnapshot();
  const election = getPresidentialElection2024();
  const services = getPublicServicesCatalog();
  const scoped =
    options?.districtSlug && getDistrict(options.districtSlug)
      ? options.districtSlug
      : null;

  return {
    pulse,
    districts: DISTRICTS,
    electionWinner: election.nationalWinner.toUpperCase(),
    servicesCount: services.facilities.length,
    scopedDistrictSlug: scoped,
  };
}

export function resolveDistrictSlug(
  query: string,
  preferredSlug?: string | null,
): string | null {
  if (preferredSlug && getDistrict(preferredSlug)) {
    return preferredSlug;
  }

  const normalized = query.toLowerCase();
  for (const district of DISTRICTS) {
    if (
      normalized.includes(district.slug) ||
      normalized.includes(district.slug.replace(/-/g, " ")) ||
      normalized.includes(district.name.toLowerCase()) ||
      normalized.includes(district.nameSi) ||
      normalized.includes(district.nameTa)
    ) {
      return district.slug;
    }
  }
  return null;
}

/**
 * Sync match first; if none, try Open-Meteo geocoding (LK only) and map to a district.
 * Empty / failed geocode returns null — never invents a district.
 */
export async function resolveDistrictSlugAsync(
  query: string,
  preferredSlug?: string | null,
): Promise<string | null> {
  const sync = resolveDistrictSlug(query, preferredSlug);
  if (sync) {
    return sync;
  }

  try {
    const hits = await searchSriLankaPlaces(query);
    for (const hit of hits) {
      if (hit.districtSlug && getDistrict(hit.districtSlug)) {
        return hit.districtSlug;
      }
    }
  } catch {
    // Geocode is optional — stay silent on failure.
  }
  return null;
}

async function scopedDistrictAnswer(slug: string): Promise<AssistantAnswer> {
  const district = getDistrict(slug);
  if (!district) {
    return {
      answer: "That district slug is not in the Lankawa atlas.",
      citations: [{ label: "District atlas", path: "/districts" }],
      mode: "rule",
      districtSlug: null,
    };
  }

  const services = getPublicServicesForDistrict(slug);
  const col = getCostOfLivingForDistrict(slug);
  const colLine = col
    ? ` COL index ${col.index} (food basket ~LKR ${col.foodBasketLkr.toLocaleString()}).`
    : "";

  let wikiLine = "";
  const citations: AssistantCitation[] = [
    { label: `${district.name} profile`, path: `/districts/${district.slug}` },
    { label: "Cost of living", path: "/cost-of-living" },
  ];

  try {
    const wiki = await fetchDistrictWikipediaSummary(slug);
    const sentence = wiki ? firstSentenceFromExtract(wiki.extract) : null;
    if (wiki && sentence) {
      wikiLine = ` ${sentence}`;
      citations.push({ label: "Wikipedia", path: wiki.url });
    }
  } catch {
    // Wikipedia is optional enrichment — never invent an extract.
  }

  return {
    answer: `${district.name} (${district.province}) — population ${district.population.toLocaleString()}, capital ${district.capital}, area ${district.areaSqKm.toLocaleString()} km². ${services.length} public facilities listed.${colLine}${wikiLine}`.trim(),
    citations,
    mode: "rule",
    districtSlug: slug,
  };
}

async function ruleBasedAnswer(
  query: string,
  ctx: LankawaContext,
): Promise<AssistantAnswer | null> {
  const q = query.toLowerCase().trim();
  const scopedSlug = resolveDistrictSlug(query, ctx.scopedDistrictSlug);

  if (/usd|dollar|exchange|fx|lkr rate/.test(q)) {
    const fx = ctx.pulse.metrics.find((metric) => metric.id === "usd_lkr");
    if (fx) {
      return {
        answer: `The USD/LKR sell rate is ${fx.value} ${fx.unit ?? "LKR"} as of ${fx.observedAt ?? "unknown"}. ${fx.note ?? ""}`.trim(),
        citations: [{ label: "Live pulse", path: "/economy" }],
        mode: "rule",
        districtSlug: scopedSlug,
      };
    }
  }

  if (/petrol|fuel|diesel|octane/.test(q)) {
    const fuelMetrics = ctx.pulse.metrics.filter((metric) =>
      metric.id.startsWith("fuel_"),
    );
    if (fuelMetrics.length > 0) {
      const lines = fuelMetrics.map(
        (metric) => `${metric.label}: ${metric.value} ${metric.unit ?? ""}`.trim(),
      );
      return {
        answer: `Current CPC fuel prices: ${lines.join("; ")}.`,
        citations: [{ label: "Economy pulse", path: "/economy" }],
        mode: "rule",
        districtSlug: scopedSlug,
      };
    }
  }

  if (/flood|river|disaster/.test(q)) {
    const floodMetric = ctx.pulse.metrics.find(
      (metric) => metric.id === "flood_stations",
    );
    const scopeNote =
      scopedSlug != null
        ? ` Scoped to ${getDistrict(scopedSlug)?.name ?? scopedSlug} — open the district page for station detail.`
        : "";
    return {
      answer: floodMetric
        ? `${floodMetric.value} river monitoring stations are active. ${floodMetric.note ?? ""}${scopeNote}`.trim()
        : `Flood monitoring data is temporarily unavailable.${scopeNote}`,
      citations: [
        { label: "Disaster dashboard", path: "/disaster" },
        ...(scopedSlug
          ? [
              {
                label: "District flood",
                path: `/districts/${scopedSlug}`,
              },
            ]
          : []),
      ],
      mode: "rule",
      districtSlug: scopedSlug,
    };
  }

  if (/election|president|vote|2024/.test(q)) {
    return {
      answer: `The 2024 presidential election national winner code is ${ctx.electionWinner}. District-level results are available across all 25 districts.`,
      citations: [{ label: "Elections 2024", path: "/elections" }],
      mode: "rule",
      districtSlug: scopedSlug,
    };
  }

  if (
    scopedSlug &&
    /district|population|province|col|cost of living|about|tell me/.test(q)
  ) {
    return scopedDistrictAnswer(scopedSlug);
  }

  if (/district|population|province/.test(q)) {
    const slug = resolveDistrictSlug(q, null);
    if (slug) {
      return scopedDistrictAnswer(slug);
    }
    return {
      answer: `Lankawa covers all ${ctx.districts.length} administrative districts of Sri Lanka. Ask about a specific district by name (e.g. Colombo, Kandy, Jaffna), or pass districtSlug.`,
      citations: [{ label: "District atlas", path: "/districts" }],
      mode: "rule",
      districtSlug: null,
    };
  }

  if (/service|hospital|school|police|moh/.test(q)) {
    if (scopedSlug) {
      const count = getPublicServicesForDistrict(scopedSlug).length;
      const name = getDistrict(scopedSlug)?.name ?? scopedSlug;
      return {
        answer: `${name} lists ${count} public facilities in the directory (hospitals, schools, GN offices, police, MOH).`,
        citations: [
          { label: "Public services", path: `/services?district=${scopedSlug}` },
        ],
        mode: "rule",
        districtSlug: scopedSlug,
      };
    }
    return {
      answer: `The public services directory lists ${ctx.servicesCount} facilities across all districts — hospitals, schools, GN offices, police stations, and MOH offices.`,
      citations: [{ label: "Public services", path: "/services" }],
      mode: "rule",
      districtSlug: null,
    };
  }

  if (/help|what can you|hello|hi/.test(q)) {
    return {
      answer:
        "I answer questions using Lankawa's own data only — exchange rates, fuel prices, flood status, districts, elections, and public services. Pass a districtSlug to scope answers. Try: \"What's the USD rate?\", \"Tell me about Colombo\", or \"How many flood stations?\"",
      citations: [{ label: "Home pulse", path: "/" }],
      mode: "rule",
      districtSlug: scopedSlug,
    };
  }

  if (scopedSlug && q.length > 0) {
    return scopedDistrictAnswer(scopedSlug);
  }

  return null;
}

async function llmAnswer(
  query: string,
  ctx: LankawaContext,
): Promise<AssistantAnswer | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const scoped = ctx.scopedDistrictSlug
    ? getDistrict(ctx.scopedDistrictSlug)
    : null;
  const scopedServices = ctx.scopedDistrictSlug
    ? getPublicServicesForDistrict(ctx.scopedDistrictSlug).length
    : null;
  const scopedCol = ctx.scopedDistrictSlug
    ? getCostOfLivingForDistrict(ctx.scopedDistrictSlug)
    : null;

  const contextJson = JSON.stringify(
    {
      pulse: ctx.pulse,
      districtCount: ctx.districts.length,
      electionWinner: ctx.electionWinner,
      servicesCount: ctx.servicesCount,
      scopedDistrict: scoped
        ? {
            slug: scoped.slug,
            name: scoped.name,
            province: scoped.province,
            population: scoped.population,
            servicesCount: scopedServices,
            colIndex: scopedCol?.index ?? null,
          }
        : null,
    },
    null,
    2,
  );

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are Lankawa civic assistant. Answer ONLY from the provided JSON context. If a scopedDistrict is present, prefer district-local facts. If the context lacks data, say so. Never invent numbers. Keep answers concise. Do not mention external websites.",
        },
        {
          role: "user",
          content: `Context:\n${contextJson}\n\nQuestion: ${query}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return null;
  }

  return {
    answer: content,
    citations: [
      { label: "Live pulse", path: "/" },
      ...(ctx.scopedDistrictSlug
        ? [
            {
              label: "District profile",
              path: `/districts/${ctx.scopedDistrictSlug}`,
            },
          ]
        : []),
    ],
    mode: "llm",
    districtSlug: ctx.scopedDistrictSlug,
  };
}

export async function answerQuestion(
  query: string,
  options?: AnswerQuestionOptions,
): Promise<AssistantAnswer> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      answer: "Please enter a question about Sri Lankan civic data.",
      citations: [],
      mode: "rule",
      districtSlug: options?.districtSlug ?? null,
    };
  }

  const ctx = await buildContext(options);
  const syncSlug = resolveDistrictSlug(trimmed, ctx.scopedDistrictSlug);
  let scopedSlug = syncSlug ?? ctx.scopedDistrictSlug;

  // Geocode only when sync missed and the question looks place-scoped —
  // avoids an Open-Meteo round-trip on every FX/fuel/election query.
  if (
    !syncSlug &&
    /district|population|province|flood|about|near|in |at |col|cost of living|hospital|school|police|tell me|ගම|මාවත|மாவட்டம்/i.test(
      trimmed,
    )
  ) {
    const geoSlug = await resolveDistrictSlugAsync(trimmed, null);
    if (geoSlug) {
      scopedSlug = geoSlug;
    }
  }

  const scopedCtx: LankawaContext =
    scopedSlug && scopedSlug !== ctx.scopedDistrictSlug
      ? { ...ctx, scopedDistrictSlug: scopedSlug }
      : ctx;
  const ruleAnswer = await ruleBasedAnswer(trimmed, scopedCtx);
  if (ruleAnswer) {
    return ruleAnswer;
  }

  const llm = await llmAnswer(trimmed, scopedCtx);
  if (llm) {
    return llm;
  }

  return {
    answer:
      "I couldn't find a matching answer in Lankawa data. Try asking about USD/LKR rates, fuel prices, a district name, elections, floods, or public services. You can also pass districtSlug to scope answers.",
    citations: [{ label: "Browse districts", path: "/districts" }],
    mode: "rule",
    districtSlug: scopedCtx.scopedDistrictSlug,
  };
}
