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

/** Canonical fields — domain `utilities` */
export type UtilityReading = {
  groupId?: string | null;
  clusterName?: string | null;
  scheduleWindow?: string | null;
  billTotalLkr?: number | null;
  consumption?: number | null;
  gaugeLevel?: number | null;
  alertStatus?: string | null;
  rainfallMm?: number | null;
  asOf?: string | null;
};
