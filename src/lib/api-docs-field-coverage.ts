import coverageJson from "./api-docs-field-coverage.json";

export type CoverageCode = "Y" | "P" | "N" | "K" | string;

export type FieldCoverageDomain = {
  title: string;
  canonical_fields: string[];
  packages: Record<
    string,
    {
      coverage: Record<string, CoverageCode>;
      counts: Record<string, number>;
    }
  >;
};

export type FieldCoverageDoc = {
  version: number;
  title: string;
  legend: Record<string, string>;
  notes: string[];
  domains: Record<string, FieldCoverageDomain>;
  package_count_indexed: number;
  package_count_in_matrix: number;
  packages_without_domain_row: string[];
};

export const fieldCoverageDoc = coverageJson as FieldCoverageDoc;

export function listFieldCoverageDomains(): Array<{
  id: string;
  title: string;
  fieldCount: number;
  packageCount: number;
}> {
  return Object.entries(fieldCoverageDoc.domains).map(([id, domain]) => ({
    id,
    title: domain.title,
    fieldCount: domain.canonical_fields.length,
    packageCount: Object.keys(domain.packages).length,
  }));
}
