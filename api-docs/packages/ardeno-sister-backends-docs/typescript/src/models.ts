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

/** Canonical fields — domain `fuel_energy` */
export type FuelEnergy = {
  product?: string | null;
  priceLkr?: number | null;
  unit?: string | null;
  asOf?: string | null;
  worldCompare?: string | null;
  emiBank?: string | null;
  emiTenorMonths?: number | null;
  emiMonthlyLkr?: number | null;
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
