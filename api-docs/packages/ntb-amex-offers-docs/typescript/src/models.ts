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

/** Canonical fields — domain `card_offers` */
export type CardOffer = {
  bank?: string | null;
  merchant?: string | null;
  title?: string | null;
  discountLabel?: string | null;
  weekdayHint?: string | null;
  validTo?: string | null;
  cardType?: string | null;
  sourceUrl?: string | null;
  asOf?: string | null;
  minSpend?: number | null;
};
