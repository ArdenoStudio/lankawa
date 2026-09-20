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
