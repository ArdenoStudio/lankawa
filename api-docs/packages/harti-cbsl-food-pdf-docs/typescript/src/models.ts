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

/** Canonical fields — domain `food_prices` */
export type FoodPrice = {
  commodity?: string | null;
  unit?: string | null;
  priceLkr?: number | null;
  marketOrDistrict?: string | null;
  asOf?: string | null;
  currency?: string | null;
  sourceLag?: string | null;
  basketId?: string | null;
};
