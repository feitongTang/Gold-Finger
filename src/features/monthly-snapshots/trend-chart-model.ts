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
