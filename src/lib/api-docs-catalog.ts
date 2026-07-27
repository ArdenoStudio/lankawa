import catalogJson from "./api-docs-catalog.json";

export type PaginationSpec = {
  style?: string;
  params?: Record<string, string>;
  notes?: string;
  lab?: boolean;
} | null;

export type CatalogEndpoint = {
  id: string;
  method: string;
  path: string;
  url?: string;
  summary: string;
  status?: string;
  pagination?: PaginationSpec;
  body_json?: unknown;
};

export type CatalogPackage = {
  slug: string;
  tier: "A" | "B" | string;
  title: string;
  host: string;
  category: string;
  status: string;
  summary: string;
  source_docs?: string[];
  extract_to?: string;
  endpoint_count: number;
  pagination_lab: string[];
  endpoints: CatalogEndpoint[];
};

export type ApiDocsCatalog = {
  version: number;
  title: string;
  description: string;
  pattern_repos: string[];
  tiers: Record<string, string>;
  categories: Record<string, string>;
  package_count: number;
  packages: CatalogPackage[];
};

export const apiDocsCatalog = catalogJson as ApiDocsCatalog;

export function getCatalogPackages(opts?: {
  tier?: string;
  category?: string;
  q?: string;
}): CatalogPackage[] {
  const q = opts?.q?.trim().toLowerCase();
  return apiDocsCatalog.packages.filter((pkg) => {
    if (opts?.tier && opts.tier !== "all" && pkg.tier !== opts.tier) return false;
    if (opts?.category && opts.category !== "all" && pkg.category !== opts.category)
      return false;
    if (!q) return true;
    const hay = [
      pkg.slug,
      pkg.title,
      pkg.summary,
      pkg.host,
      pkg.category,
      ...pkg.endpoints.map((e) => `${e.id} ${e.path} ${e.summary}`),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function getPaginationLabEndpoints(): Array<{
  pkg: CatalogPackage;
  endpoint: CatalogEndpoint;
}> {
  const out: Array<{ pkg: CatalogPackage; endpoint: CatalogEndpoint }> = [];
  for (const pkg of apiDocsCatalog.packages) {
    for (const endpoint of pkg.endpoints) {
      if (
        endpoint.pagination &&
        typeof endpoint.pagination === "object" &&
        endpoint.pagination.lab
      ) {
        out.push({ pkg, endpoint });
      }
    }
  }
  return out;
}

export function getPackageBySlug(slug: string): CatalogPackage | undefined {
  return apiDocsCatalog.packages.find((p) => p.slug === slug);
}
