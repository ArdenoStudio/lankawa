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

/** Canonical fields — domain `macro_cbsl` */
export type MacroCbsl = {
  opr?: number | null;
  sdfr?: number | null;
  slfr?: number | null;
  awpr?: number | null;
  tbillYield?: number | null;
  goldPrice?: number | null;
  asOf?: string | null;
  bulletinUrl?: string | null;
};
