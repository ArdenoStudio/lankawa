import {
  areaUnderPolyline,
  gridYs,
  linearScale,
  projectSeries,
  sharedTimeDomain,
  sharedValueDomain,
  toPolylinePoints,
  toStepAfterPath,
  type TimeValue,
} from "@/lib/charts/mono";

export interface MonoChartSeries {
  id: string;
  label?: string;
  values: TimeValue[];
  /** Tailwind text-* class driving currentColor stroke */
  className?: string;
  dasharray?: string;
  /** Hold price until next revision (fuel). */
  step?: boolean;
  /** Soft fill under the line (single-series sparklines). */
  area?: boolean;
  opacity?: number;
}

export function MonoLineChart({
  id,
  ariaLabel,
  series,
  width = 360,
  height = 128,
  padX = 36,
  padY = 14,
  showZeroLine = false,
  gridLines = 4,
  startLabel,
  endLabel,
  valueFormat = (value) => value.toFixed(1),
  className = "h-auto w-full max-w-2xl text-white",
}: {
  id: string;
  ariaLabel: string;
  series: MonoChartSeries[];
  width?: number;
  height?: number;
  padX?: number;
  padY?: number;
  showZeroLine?: boolean;
  gridLines?: number;
  startLabel?: string;
  endLabel?: string;
  valueFormat?: (value: number) => string;
  className?: string;
}) {
  const valid = series.filter((item) => item.values.length >= 2);
  if (valid.length === 0) {
    return null;
  }

  const innerLeft = padX;
  const innerRight = width - 12;
  const innerTop = padY;
  const innerBottom = height - padY - 12;
  const valueLists = valid.map((item) => item.values);
  const [tMin, tMax] = sharedTimeDomain(valueLists);
  const [vMin, vMax] = sharedValueDomain(valueLists, {
    includeZero: showZeroLine,
  });
  const xOf = linearScale([tMin, tMax], [innerLeft, innerRight]);
  const yOf = linearScale([vMin, vMax], [innerBottom, innerTop]);
  const zeroY = yOf(0);
  const ys = gridYs(gridLines, innerTop, innerBottom);
  const firstDate =
    startLabel ??
    valid
      .flatMap((item) => item.values)
      .map((point) => point.date.slice(0, 10))
      .sort()[0];
  const lastDate =
    endLabel ??
    valid
      .flatMap((item) => item.values)
      .map((point) => point.date.slice(0, 10))
      .sort()
      .at(-1);

  return (
    <svg
      id={id}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      {ys.map((y) => (
        <line
          key={`grid-${y}`}
          x1={innerLeft}
          y1={y}
          x2={innerRight}
          y2={y}
          stroke="currentColor"
          strokeOpacity={0.12}
        />
      ))}
      {showZeroLine && zeroY >= innerTop && zeroY <= innerBottom ? (
        <line
          x1={innerLeft}
          y1={zeroY}
          x2={innerRight}
          y2={zeroY}
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeDasharray="3 3"
        />
      ) : null}
      <text
        x={innerLeft - 6}
        y={innerTop + 4}
        textAnchor="end"
        className="fill-current text-[9px]"
        fill="currentColor"
        opacity={0.45}
      >
        {valueFormat(vMax)}
      </text>
      <text
        x={innerLeft - 6}
        y={innerBottom}
        textAnchor="end"
        className="fill-current text-[9px]"
        fill="currentColor"
        opacity={0.45}
      >
        {valueFormat(vMin)}
      </text>
      {valid.map((item) => {
        const plotted = projectSeries(item.values, xOf, yOf);
        const strokeClass = item.className ?? "text-white";
        const opacity = item.opacity ?? 1;
        return (
          <g key={item.id} className={strokeClass} opacity={opacity}>
            {item.area ? (
              <path
                d={areaUnderPolyline(plotted, innerBottom)}
                fill="currentColor"
                fillOpacity={0.12}
                stroke="none"
              />
            ) : null}
            {item.step ? (
              <path
                d={toStepAfterPath(plotted)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={item.dasharray}
                strokeLinejoin="round"
                strokeLinecap="square"
              />
            ) : (
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={item.dasharray}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={toPolylinePoints(plotted)}
              />
            )}
            {plotted.length > 0 ? (
              <circle
                cx={plotted[plotted.length - 1].x}
                cy={plotted[plotted.length - 1].y}
                r={2.5}
                fill="currentColor"
              />
            ) : null}
          </g>
        );
      })}
      {firstDate ? (
        <text
          x={innerLeft}
          y={height - 2}
          className="fill-current text-[9px]"
          fill="currentColor"
          opacity={0.45}
        >
          {firstDate}
        </text>
      ) : null}
      {lastDate ? (
        <text
          x={innerRight}
          y={height - 2}
          textAnchor="end"
          className="fill-current text-[9px]"
          fill="currentColor"
          opacity={0.45}
        >
          {lastDate}
        </text>
      ) : null}
    </svg>
  );
}
