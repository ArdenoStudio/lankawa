import extrasJson from "./api-docs-client-extras.json";

export type ClientExtrasPackage = {
  slug: string;
  domains: string[];
  labEndpoints: string[];
  models: string[];
  hasPaginationLab: boolean;
};

export type ClientExtrasDoc = {
  version: number;
  packages: ClientExtrasPackage[];
};

export const clientExtrasDoc = extrasJson as ClientExtrasDoc;
