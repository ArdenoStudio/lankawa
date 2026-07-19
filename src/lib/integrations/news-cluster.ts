import type { NewsHeadline } from "./news";

export interface NewsCluster {
  topic: string;
  headlines: NewsHeadline[];
  score: number;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "sri",
  "lanka",
  "the",
  "to",
  "with",
]);

function tokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\u0d80-\u0dff\u0b80-\u0bff\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Lightweight title clustering (E2 without pgvector). Threshold ~0.35 Jaccard. */
export function clusterHeadlines(
  headlines: NewsHeadline[],
  threshold = 0.35,
): NewsCluster[] {
  const clusters: Array<{ tokens: Set<string>; headlines: NewsHeadline[] }> = [];

  for (const headline of headlines) {
    const headlineTokens = tokens(headline.title);
    let bestIndex = -1;
    let bestScore = 0;

    for (let index = 0; index < clusters.length; index++) {
      const score = jaccard(headlineTokens, clusters[index].tokens);
      if (score >= threshold && score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }

    if (bestIndex >= 0) {
      const cluster = clusters[bestIndex];
      cluster.headlines.push(headline);
      for (const token of headlineTokens) {
        cluster.tokens.add(token);
      }
    } else {
      clusters.push({ tokens: headlineTokens, headlines: [headline] });
    }
  }

  return clusters
    .map((cluster) => {
      const topic =
        [...cluster.tokens].slice(0, 4).join(" ") ||
        cluster.headlines[0]?.title.slice(0, 48) ||
        "topic";
      return {
        topic,
        headlines: cluster.headlines,
        score: cluster.headlines.length,
      };
    })
    .sort((a, b) => b.score - a.score);
}
