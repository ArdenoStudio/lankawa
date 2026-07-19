export const EXPLAINER_SLUGS = [
  "fx-rates",
  "flood-levels",
  "freshness",
  "provenance",
  "seed-vs-live",
] as const;

export type ExplainerSlug = (typeof EXPLAINER_SLUGS)[number];

export type ExplainerTopic = "economy" | "disaster" | "platform";

export interface ExplainerDefinition {
  slug: ExplainerSlug;
  topic: ExplainerTopic;
  readMinutes: number;
  relatedPaths: string[];
}

export const EXPLAINERS: ExplainerDefinition[] = [
  {
    slug: "fx-rates",
    topic: "economy",
    readMinutes: 3,
    relatedPaths: ["/economy", "/"],
  },
  {
    slug: "flood-levels",
    topic: "disaster",
    readMinutes: 4,
    relatedPaths: ["/disaster", "/districts"],
  },
  {
    slug: "freshness",
    topic: "platform",
    readMinutes: 2,
    relatedPaths: ["/", "/status", "/sources"],
  },
  {
    slug: "provenance",
    topic: "platform",
    readMinutes: 3,
    relatedPaths: ["/sources", "/about"],
  },
  {
    slug: "seed-vs-live",
    topic: "platform",
    readMinutes: 4,
    relatedPaths: ["/about", "/explore"],
  },
];

const EXPLAINER_BY_SLUG = new Map(EXPLAINERS.map((item) => [item.slug, item]));

export function getExplainer(slug: string): ExplainerDefinition | undefined {
  return EXPLAINER_BY_SLUG.get(slug as ExplainerSlug);
}

export function isExplainerSlug(slug: string): slug is ExplainerSlug {
  return EXPLAINER_BY_SLUG.has(slug as ExplainerSlug);
}

/** Translation namespace key under `learn.items.*` */
export function explainerTranslationKey(slug: ExplainerSlug): string {
  const keys: Record<ExplainerSlug, string> = {
    "fx-rates": "fxRates",
    "flood-levels": "floodLevels",
    freshness: "freshness",
    provenance: "provenance",
    "seed-vs-live": "seedVsLive",
  };
  return keys[slug];
}
