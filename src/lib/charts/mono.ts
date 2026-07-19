/** Shared geometry for monochrome SVG line charts (no chart library). */

export interface TimeValue {
  date: string;
  value: number;
}

export interface PlotPoint {
  x: number;
  y: number;
}

export function parseChartDay(iso: string): number {
  const day = iso.slice(0, 10);
  const ms = Date.parse(day);
  return Number.isFinite(ms) ? ms : 0;
}

export function niceValuePad(
  min: number,
  max: number,
  padFrac = 0.08,
): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 1];
  }
  if (min === max) {
    const pad = Math.abs(min) * padFrac || 1;
    return [min - pad, max + pad];
  }
  const span = max - min;
  const pad = span * padFrac;
  return [min - pad, max + pad];
}

export function linearScale(
  domain: [number, number],
  range: [number, number],
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

export function sharedTimeDomain(series: TimeValue[][]): [number, number] {
  const times = series.flatMap((points) =>
    points.map((point) => parseChartDay(point.date)),
  );
  if (times.length === 0) {
    return [0, 1];
  }
  return [Math.min(...times), Math.max(...times)];
}

export function sharedValueDomain(
  series: TimeValue[][],
  options?: { includeZero?: boolean; padFrac?: number },
): [number, number] {
  const values = series.flatMap((points) => points.map((point) => point.value));
  if (values.length === 0) {
    return [0, 1];
  }
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (options?.includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  return niceValuePad(min, max, options?.padFrac ?? 0.08);
}

export function projectSeries(
  points: TimeValue[],
  xOf: (t: number) => number,
  yOf: (v: number) => number,
): PlotPoint[] {
  return points
    .map((point) => ({
      x: xOf(parseChartDay(point.date)),
      y: yOf(point.value),
    }))
    .sort((a, b) => a.x - b.x);
}

export function toPolylinePoints(points: PlotPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

/** Step-after path: hold value until next observation (fuel revisions). */
export function toStepAfterPath(points: PlotPoint[]): string {
  if (points.length === 0) {
    return "";
  }
  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  for (const point of rest) {
    d += ` H ${point.x} V ${point.y}`;
  }
  return d;
}

/** Closed area under a polyline down to baselineY. */
export function areaUnderPolyline(
  points: PlotPoint[],
  baselineY: number,
): string {
  if (points.length === 0) {
    return "";
  }
  const head = points
    .map((point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `L ${point.x} ${point.y}`,
    )
    .join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  return `${head} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export function gridYs(
  count: number,
  top: number,
  bottom: number,
): number[] {
  if (count <= 1) {
    return [top];
  }
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    return top + (bottom - top) * t;
  });
}

/** Even spacing when observations lack a parseable calendar date. */
export function indexAsDate(index: number): string {
  const year = 2000 + Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}
