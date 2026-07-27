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

/** Canonical fields — domain `fx_tt` */
export type FxTtQuote = {
  buyLkr?: number | null;
  sellLkr?: number | null;
  asOf?: string | null;
  spreadLkr?: number | null;
  currency?: string | null;
  ttBuy?: number | null;
  ttSell?: number | null;
  ddBuy?: number | null;
  ddSell?: number | null;
  chequeBuy?: number | null;
  chequeSell?: number | null;
};
