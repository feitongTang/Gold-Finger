// @vitest-environment jsdom

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  MonthlyTrendCharts,
  MonthlyTrendPreview,
} from "@/features/monthly-snapshots/monthly-trend-charts";

const points = [
  {
    month: "2026-07",
    netWorthCents: "2300000",
    cashCents: "1500000",
    investmentCents: "900000",
    liabilityCents: "100000",
    incomeCents: "2000000",
    expenseCents: "800000",
  },
  {
    month: "2026-08",
    netWorthCents: "2280000",
    cashCents: "1400000",
    investmentCents: "1000000",
    liabilityCents: "120000",
    incomeCents: "1900000",
    expenseCents: "900000",
  },
];

afterEach(cleanup);

describe("MonthlyTrendCharts", () => {
  it("gives every interactive data point a 40px SVG hit target", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyTrendCharts, {
        points: [points[1]],
      }),
    );

    expect(markup.match(/class="trend-chart-hit-target"/g)).toHaveLength(4);
    expect(markup.match(/r="20"/g)).toHaveLength(4);
    expect(markup.match(/class="trend-chart-point"/g)).toHaveLength(4);
    expect(markup.match(/r="4"/g)).toHaveLength(4);
  });

  it("shows exactly one dashboard chart and switches its financial context", () => {
    const { container } = render(
      createElement(MonthlyTrendPreview, { points }),
    );

    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(
      screen
        .getByRole("button", { name: "资产变化" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("img", { name: /资产变化趋势/ })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /收入与支出趋势/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "收支变化" }));

    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(
      screen
        .getByRole("button", { name: "收支变化" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("img", { name: /收入与支出趋势/ })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /资产变化趋势/ })).toBeNull();
  });
});
