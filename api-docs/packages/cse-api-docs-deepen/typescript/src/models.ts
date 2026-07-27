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

/** Canonical fields — domain `markets_cse` */
export type CseQuote = {
  symbol?: string | null;
  name?: string | null;
  lastPrice?: number | null;
  change?: number | null;
  changePct?: number | null;
  volume?: number | null;
  sector?: string | null;
  asOf?: string | null;
  announcementTitle?: string | null;
};
