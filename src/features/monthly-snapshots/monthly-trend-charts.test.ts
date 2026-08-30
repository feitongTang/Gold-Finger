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

  it("renders three or more months as smooth monotone paths", () => {
    const threePoints = [
      ...points,
      {
        ...points[1],
        month: "2026-09",
        netWorthCents: "2450000",
        cashCents: "1450000",
        investmentCents: "1120000",
      },
    ];
    const { container } = render(
      createElement(MonthlyTrendCharts, { points: threePoints }),
    );
    const lines = [...container.querySelectorAll(".trend-chart-line")];
    expect(lines).toHaveLength(4);
    for (const line of lines) expect(line.getAttribute("d")).toContain(" C ");
  });

  it("shows exactly one dashboard chart and switches its financial context", () => {
    const { container } = render(
      createElement(MonthlyTrendPreview, { points }),
    );

    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "资产" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("img", { name: /资产变化趋势/ })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /收入与支出趋势/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "收支" }));

    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "收支" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("img", { name: /收入与支出趋势/ })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /资产变化趋势/ })).toBeNull();
  });

  it("shows exactly one full-page chart and switches between asset and cash-flow trends", () => {
    const { container } = render(createElement(MonthlyTrendCharts, { points }));

    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "资产" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("img", { name: /资产变化趋势/ })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /收入与支出趋势/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "收支" }));

    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "收支" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("img", { name: /收入与支出趋势/ })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /资产变化趋势/ })).toBeNull();
  });

  it("uses the same full month labels as the business page headings", () => {
    const { container } = render(createElement(MonthlyTrendCharts, { points }));

    expect(
      [...container.querySelectorAll(".trend-chart-month")].map(
        (label) => label.textContent,
      ),
    ).toEqual(["2026 年 7 月", "2026 年 8 月"]);
  });
});
