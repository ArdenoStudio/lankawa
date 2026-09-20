/** Typed models for canonical Lankawa snapshot fields. */

export type PageResult<T = unknown> = {
  page: number;
  offset?: number;
  limit?: number;
  key?: string;
  items: T[];
  raw?: unknown;
  done?: boolean;
};

/** Canonical fields — domain `platform_misc` */
export type PlatformMisc = {
  tenderTitle?: string | null;
  closingDate?: string | null;
  district?: string | null;
  category?: string | null;
  healthOk?: boolean | null;
  openapiPath?: string | null;
};
