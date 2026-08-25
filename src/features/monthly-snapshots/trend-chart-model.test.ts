import { describe, expect, it } from "vitest";

import {
  calculateRecentAverageCents,
  createTrendChartLayout,
} from "@/features/monthly-snapshots/trend-chart-model";

describe("calculateRecentAverageCents", () => {
  it("averages only the six most recent saved values", () => {
    expect(
      calculateRecentAverageCents(
        [100, 200, 300, 400, 500, 600, 700, 800].map(BigInt),
        6,
      ),
    ).toBe(BigInt(550));
  });

  it("rounds a fractional cent to the nearest cent", () => {
    expect(calculateRecentAverageCents([BigInt(1), BigInt(2)], 6)).toBe(
      BigInt(2),
    );
  });

  it("returns null when there are no saved values", () => {
    expect(calculateRecentAverageCents([], 6)).toBeNull();
  });
});

describe("createTrendChartLayout", () => {
  it("keeps negative and positive values inside the plot area", () => {
    const layout = createTrendChartLayout([
      { values: [BigInt(-500), BigInt(500)] },
      { values: [BigInt(0), BigInt(250)] },
    ]);

    expect(layout.series[0].points[0]).toEqual({ x: 56, y: 212 });
    expect(layout.series[0].points[1]).toEqual({ x: 704, y: 24 });
    expect(layout.zeroY).toBe(118);
    expect(layout.ticks.map((tick) => tick.value)).toEqual([
      BigInt(500),
      BigInt(250),
      BigInt(0),
      BigInt(-250),
      BigInt(-500),
    ]);
  });

  it("renders a flat single-point series without invalid coordinates", () => {
    const layout = createTrendChartLayout([{ values: [BigInt(120_000)] }]);

    expect(layout.series[0].points).toEqual([{ x: 380, y: 118 }]);
    expect(layout.zeroY).toBeNull();
    expect(layout.ticks).toHaveLength(1);
    expect(layout.ticks[0]).toEqual({ value: BigInt(120_000), y: 118 });
  });

  it("preserves geometry for aggregates beyond Number.MAX_SAFE_INTEGER", () => {
    const huge = BigInt(Number.MAX_SAFE_INTEGER) * BigInt(4);
    const layout = createTrendChartLayout([
      { values: [huge, huge + BigInt(100)] },
    ]);

    expect(layout.series[0].points).toEqual([
      { x: 56, y: 212 },
      { x: 704, y: 24 },
    ]);
  });
});
