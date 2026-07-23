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

/** Canonical fields — domain `weather_aqi` */
export type WeatherAqi = {
  tempC?: number | null;
  precipMm?: number | null;
  uvIndex?: number | null;
  pm25?: number | null;
  usAqi?: number | null;
  warningLevel?: string | null;
  capLanguage?: string | null;
  asOf?: string | null;
  latLon?: string | null;
};
