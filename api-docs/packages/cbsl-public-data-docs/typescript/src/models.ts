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

/** Canonical fields — domain `fd_deposits` */
export type FdDepositQuote = {
  tenorMonths?: number | null;
  paidIn?: string | null;
  ratePa?: number | null;
  aerPa?: number | null;
  effectiveFrom?: string | null;
  seniorCitizen?: boolean | null;
  productCode?: string | null;
  productName?: string | null;
  currency?: string | null;
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
