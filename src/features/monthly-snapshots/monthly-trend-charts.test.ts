import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MonthlyTrendCharts } from "@/features/monthly-snapshots/monthly-trend-charts";

describe("MonthlyTrendCharts", () => {
  it("gives every interactive data point a 40px SVG hit target", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyTrendCharts, {
        points: [
          {
            month: "2026-08",
            netWorthCents: "37360000",
            cashCents: "12640000",
            investmentCents: "25030000",
            liabilityCents: "310000",
            incomeCents: "3180000",
            expenseCents: "1370000",
          },
        ],
      }),
    );

    expect(markup.match(/class="trend-chart-hit-target"/g)).toHaveLength(4);
    expect(markup.match(/r="20"/g)).toHaveLength(4);
    expect(markup.match(/class="trend-chart-point"/g)).toHaveLength(4);
    expect(markup.match(/r="4"/g)).toHaveLength(4);
  });
});
