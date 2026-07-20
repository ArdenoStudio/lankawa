import changelogJson from "./api-docs-changelog.json";

export type ChangelogPackage = {
  slug: string;
  endpoint_count: number;
  sha256: string;
  changelog: string;
  fingerprint: string;
  workflow: string;
  action: string;
};

export type ChangelogRecentUpdate = {
  slug: string;
  date: string;
  added: string[];
  removed: string[];
  changed: string[];
  endpoint_count: number;
  bootstrap: boolean;
};

export type ChangelogDoc = {
  version: number;
  generated: string;
  packages: ChangelogPackage[];
  recent_updates: ChangelogRecentUpdate[];
};

export const changelogDoc = changelogJson as unknown as ChangelogDoc;
