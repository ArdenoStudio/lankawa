import { DISTRICTS, getDistrict } from "./districts";
import { buildPulseSnapshot } from "./pulse";
import { getPresidentialElection2024 } from "./elections";
import { getPublicServicesCatalog } from "./services";
import type { PulseSnapshot } from "./types";

export interface AssistantCitation {
  label: string;
  path: string;
}

export interface AssistantAnswer {
  answer: string;
  citations: AssistantCitation[];
  mode: "rule" | "llm";
}

interface LankawaContext {
  pulse: PulseSnapshot;
  districts: typeof DISTRICTS;
  electionWinner: string;
  servicesCount: number;
}

async function buildContext(): Promise<LankawaContext> {
  const pulse = await buildPulseSnapshot();
  const election = getPresidentialElection2024();
  const services = getPublicServicesCatalog();

  return {
    pulse,
    districts: DISTRICTS,
    electionWinner: election.nationalWinner.toUpperCase(),
    servicesCount: services.facilities.length,
  };
}

function findDistrictInQuery(query: string): string | null {
  const normalized = query.toLowerCase();
  for (const district of DISTRICTS) {
    if (
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

function ruleBasedAnswer(query: string, ctx: LankawaContext): AssistantAnswer | null {
  const q = query.toLowerCase().trim();

  if (/usd|dollar|exchange|fx|lkr rate/.test(q)) {
    const fx = ctx.pulse.metrics.find((metric) => metric.id === "usd_lkr");
    if (fx) {
      return {
        answer: `The USD/LKR sell rate is ${fx.value} ${fx.unit ?? "LKR"} as of ${fx.observedAt ?? "unknown"}. ${fx.note ?? ""}`.trim(),
        citations: [{ label: "Live pulse", path: "/economy" }],
        mode: "rule",
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
      };
    }
  }

  if (/flood|river|disaster/.test(q)) {
    const floodMetric = ctx.pulse.metrics.find(
      (metric) => metric.id === "flood_stations",
    );
    return {
      answer: floodMetric
        ? `${floodMetric.value} river monitoring stations are active. ${floodMetric.note ?? ""}`.trim()
        : "Flood monitoring data is temporarily unavailable.",
      citations: [{ label: "Disaster dashboard", path: "/disaster" }],
      mode: "rule",
    };
  }

  if (/election|president|vote|2024/.test(q)) {
    return {
      answer: `The 2024 presidential election national winner code is ${ctx.electionWinner}. District-level results are available across all 25 districts.`,
      citations: [{ label: "Elections 2024", path: "/elections" }],
      mode: "rule",
    };
  }

  if (/district|population|province/.test(q)) {
    const slug = findDistrictInQuery(q);
    if (slug) {
      const district = getDistrict(slug);
      if (district) {
        return {
          answer: `${district.name} is in ${district.province} province with a population of ${district.population.toLocaleString()} and area of ${district.areaSqKm.toLocaleString()} km². Capital: ${district.capital}.`,
          citations: [
            { label: `${district.name} profile`, path: `/districts/${district.slug}` },
          ],
          mode: "rule",
        };
      }
    }
    return {
      answer: `Lankawa covers all ${ctx.districts.length} administrative districts of Sri Lanka. Ask about a specific district by name (e.g. Colombo, Kandy, Jaffna).`,
      citations: [{ label: "District atlas", path: "/districts" }],
      mode: "rule",
    };
  }

  if (/service|hospital|school|police|moh/.test(q)) {
    return {
      answer: `The public services directory lists ${ctx.servicesCount} facilities across all districts — hospitals, schools, GN offices, police stations, and MOH offices.`,
      citations: [{ label: "Public services", path: "/services" }],
      mode: "rule",
    };
  }

  if (/help|what can you|hello|hi/.test(q)) {
    return {
      answer:
        "I answer questions using Lankawa's own data only — exchange rates, fuel prices, flood status, districts, elections, and public services. Try: \"What's the USD rate?\", \"Tell me about Colombo\", or \"How many flood stations?\"",
      citations: [{ label: "Home pulse", path: "/" }],
      mode: "rule",
    };
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

  const contextJson = JSON.stringify(
    {
      pulse: ctx.pulse,
      districtCount: ctx.districts.length,
      electionWinner: ctx.electionWinner,
      servicesCount: ctx.servicesCount,
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
      messages: [
        {
          role: "system",
          content:
            "You are Lankawa civic assistant. Answer ONLY from the provided JSON context. If the context lacks data, say so. Never invent numbers. Keep answers concise. Do not mention external websites.",
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
    citations: [{ label: "Live pulse", path: "/" }],
    mode: "llm",
  };
}

export async function answerQuestion(query: string): Promise<AssistantAnswer> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      answer: "Please enter a question about Sri Lankan civic data.",
      citations: [],
      mode: "rule",
    };
  }

  const ctx = await buildContext();
  const ruleAnswer = ruleBasedAnswer(trimmed, ctx);
  if (ruleAnswer) {
    return ruleAnswer;
  }

  const llm = await llmAnswer(trimmed, ctx);
  if (llm) {
    return llm;
  }

  return {
    answer:
      "I couldn't find a matching answer in Lankawa data. Try asking about USD/LKR rates, fuel prices, a district name, elections, floods, or public services.",
    citations: [{ label: "Browse districts", path: "/districts" }],
    mode: "rule",
  };
}
