export const TREND_CHART = {
  width: 760,
  height: 236,
  left: 56,
  right: 704,
  top: 24,
  bottom: 212,
} as const;

type TrendSeriesInput = {
  values: ReadonlyArray<bigint>;
};

export function calculateRecentAverageCents(
  values: ReadonlyArray<bigint>,
  limit: number,
) {
  if (values.length === 0 || limit <= 0) return null;

  const recentValues = values.slice(-limit);
  const total = recentValues.reduce((sum, value) => sum + value, BigInt(0));
  const count = BigInt(recentValues.length);
  return (total + count / BigInt(2)) / count;
}

function scaleBigInt(
  value: bigint,
  minimum: bigint,
  maximum: bigint,
  start: number,
  end: number,
) {
  const range = maximum - minimum;
  if (range === BigInt(0)) return (start + end) / 2;

  const precision = BigInt(1_000);
  const scaled = ((value - minimum) * BigInt(end - start) * precision) / range;
  return start + Number(scaled) / Number(precision);
}

export function createTrendChartLayout(
  inputs: ReadonlyArray<TrendSeriesInput>,
) {
  const values = inputs.flatMap((series) => series.values);
  const minimum = values.reduce(
    (lowest, value) => (value < lowest ? value : lowest),
    values[0] ?? BigInt(0),
  );
  const maximum = values.reduce(
    (highest, value) => (value > highest ? value : highest),
    values[0] ?? BigInt(0),
  );
  const pointCount = Math.max(
    0,
    ...inputs.map((series) => series.values.length),
  );
  const xForIndex = (index: number) =>
    pointCount <= 1
      ? (TREND_CHART.left + TREND_CHART.right) / 2
      : TREND_CHART.left +
        (index * (TREND_CHART.right - TREND_CHART.left)) / (pointCount - 1);
  const yForValue = (value: bigint) =>
    scaleBigInt(
      maximum - value,
      BigInt(0),
      maximum - minimum,
      TREND_CHART.top,
      TREND_CHART.bottom,
    );

  if (minimum === maximum) {
    const y = (TREND_CHART.top + TREND_CHART.bottom) / 2;
    return {
      series: inputs.map((series) => ({
        points: series.values.map((_, index) => ({ x: xForIndex(index), y })),
      })),
      ticks: [{ value: minimum, y }],
      zeroY: minimum === BigInt(0) ? y : null,
    };
  }

  const tickSteps = BigInt(4);
  const ticks = Array.from({ length: 5 }, (_, index) => {
    const step = BigInt(index);
    const value = maximum - ((maximum - minimum) * step) / tickSteps;
    return { value, y: yForValue(value) };
  });

  return {
    series: inputs.map((series) => ({
      points: series.values.map((value, index) => ({
        x: xForIndex(index),
        y: yForValue(value),
      })),
    })),
    ticks,
    zeroY:
      minimum <= BigInt(0) && maximum >= BigInt(0)
        ? yForValue(BigInt(0))
        : null,
  };
}

export type TrendCurvePoint = { x: number; y: number };

export type TrendCurveSegment = {
  start: TrendCurvePoint;
  control1: TrendCurvePoint;
  control2: TrendCurvePoint;
  end: TrendCurvePoint;
};

function sameSign(left: number, right: number) {
  return left === 0 || right === 0 || Math.sign(left) === Math.sign(right);
}

function endpointSlope(
  firstWidth: number,
  secondWidth: number,
  firstSlope: number,
  secondSlope: number,
) {
  let slope =
    ((2 * firstWidth + secondWidth) * firstSlope - firstWidth * secondSlope) /
    (firstWidth + secondWidth);

  if (!sameSign(slope, firstSlope)) slope = 0;
  else if (
    !sameSign(firstSlope, secondSlope) &&
    Math.abs(slope) > Math.abs(3 * firstSlope)
  ) {
    slope = 3 * firstSlope;
  }
  return slope;
}

function createTangents(points: ReadonlyArray<TrendCurvePoint>) {
  const widths = points.slice(0, -1).map((point, index) => {
    return points[index + 1].x - point.x;
  });
  const slopes = points.slice(0, -1).map((point, index) => {
    return (points[index + 1].y - point.y) / widths[index];
  });
  const tangents = Array<number>(points.length).fill(0);

  tangents[0] = endpointSlope(widths[0], widths[1], slopes[0], slopes[1]);
  tangents[points.length - 1] = endpointSlope(
    widths[widths.length - 1],
    widths[widths.length - 2],
    slopes[slopes.length - 1],
    slopes[slopes.length - 2],
  );

  for (let index = 1; index < points.length - 1; index += 1) {
    const before = slopes[index - 1];
    const after = slopes[index];
    if (!sameSign(before, after) || before === 0 || after === 0) {
      tangents[index] = 0;
      continue;
    }
    const beforeWidth = widths[index - 1];
    const afterWidth = widths[index];
    const beforeWeight = 2 * afterWidth + beforeWidth;
    const afterWeight = afterWidth + 2 * beforeWidth;
    tangents[index] =
      (beforeWeight + afterWeight) /
      (beforeWeight / before + afterWeight / after);
  }

  return tangents;
}

export function createMonotoneCurveSegments(
  points: ReadonlyArray<TrendCurvePoint>,
): ReadonlyArray<TrendCurveSegment> {
  if (points.length < 3) return [];
  const tangents = createTangents(points);
  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const width = end.x - start.x;
    const low = Math.min(start.y, end.y);
    const high = Math.max(start.y, end.y);
    const clampY = (value: number) => Math.min(high, Math.max(low, value));
    return {
      start,
      control1: {
        x: start.x + width / 3,
        y: clampY(start.y + (tangents[index] * width) / 3),
      },
      control2: {
        x: end.x - width / 3,
        y: clampY(end.y - (tangents[index + 1] * width) / 3),
      },
      end,
    };
  });
}

function coordinate(value: number) {
  return Number(value.toFixed(3)).toString();
}

export function createMonotoneCurvePath(
  points: ReadonlyArray<TrendCurvePoint>,
) {
  if (points.length === 0) return "";
  const first = points[0];
  if (points.length === 1)
    return `M ${coordinate(first.x)} ${coordinate(first.y)}`;
  const second = points[1];
  if (points.length === 2) {
    return `M ${coordinate(first.x)} ${coordinate(first.y)} L ${coordinate(second.x)} ${coordinate(second.y)}`;
  }
  const curves = createMonotoneCurveSegments(points)
    .map(({ control1, control2, end }) => {
      return `C ${coordinate(control1.x)} ${coordinate(control1.y)} ${coordinate(control2.x)} ${coordinate(control2.y)} ${coordinate(end.x)} ${coordinate(end.y)}`;
    })
    .join(" ");
  return `M ${coordinate(first.x)} ${coordinate(first.y)} ${curves}`;
}
