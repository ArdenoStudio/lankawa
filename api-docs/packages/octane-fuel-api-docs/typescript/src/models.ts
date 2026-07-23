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
