import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { INVESTMENT_CATEGORIES } from "@/db/schema";
import { ReviewDashboard } from "@/features/monthly-snapshots/review-dashboard";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

const previousSnapshot: MonthlySnapshot = {
  id: 1,
  month: "2026-07",
  cashFlow: {
    incomeCents: 2_000_000,
    expenseCents: 800_000,
    investmentProfitLossCents: 30_000,
    investmentContributionCents: 200_000,
  },
  cash: {
    emergencyFundCents: 1_000_000,
    goalFundCents: 300_000,
    dailyCashCents: 200_000,
  },
  funds: [
    {
      name: "纳指基金",
      category: "us-nasdaq-100",
      marketValueCents: 900_000,
      monthlyInvestmentCents: 200_000,
    },
  ],
  liabilities: { huabeiBalanceCents: 100_000 },
};

const snapshot: MonthlySnapshot = {
  id: 2,
  month: "2026-08",
  cashFlow: {
    incomeCents: 1_900_000,
    expenseCents: 900_000,
    investmentProfitLossCents: -20_000,
    investmentContributionCents: 300_000,
  },
  cash: {
    emergencyFundCents: 900_000,
    goalFundCents: 300_000,
    dailyCashCents: 200_000,
  },
  funds: [
    {
      name: "纳指基金",
      category: "us-nasdaq-100",
      marketValueCents: 1_000_000,
      monthlyInvestmentCents: 300_000,
    },
  ],
  liabilities: { huabeiBalanceCents: 120_000 },
};

describe("ReviewDashboard", () => {
  it("renders the approved Option 1 hierarchy and page links", () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewDashboard, {
        categories: INVESTMENT_CATEGORIES,
        historySnapshots: [previousSnapshot, snapshot],
        month: "2026-08",
        previousSnapshot,
        snapshot,
      }),
    );

    expect(markup).toContain("当前净资产");
    expect(markup).toContain("现金");
    expect(markup).toContain("投资");
    expect(markup).toContain("负债");
    expect(markup).toContain("收入");
    expect(markup).toContain("支出");
    expect(markup).toContain("投资净投入");
    expect(markup).toContain("投资损益");
    expect(markup).toContain("月度结余");
    expect(markup).toContain('href="/records?month=2026-08"');
    expect(markup).toContain('href="/trends?month=2026-08"');
    expect(markup).toContain('href="/portfolio?month=2026-08"');
    expect(markup).not.toContain("删除本月");
    expect(markup.match(/class="monthly-flow-metric(?: |")/g)).toHaveLength(5);
    expect(markup).toContain(
      'class="monthly-flow-metric monthly-flow-metric-positive"',
    );
    expect(markup).toContain(
      'class="monthly-flow-metric monthly-flow-metric-negative"',
    );
    expect(markup).toContain("资产变化趋势，共 2 个已保存月份");
    expect(markup).not.toContain("review-analysis-placeholder");
    expect(markup).not.toContain("纳斯达克100");

    const toolbarIndex = markup.indexOf('class="review-toolbar"');
    const statusIndex = markup.indexOf('class="review-status-card');
    const flowIndex = markup.indexOf('class="monthly-flow-strip');
    const analysisIndex = markup.indexOf('class="review-analysis-grid"');

    expect(toolbarIndex).toBeGreaterThanOrEqual(0);
    expect(toolbarIndex).toBeLessThan(statusIndex);
    expect(statusIndex).toBeLessThan(flowIndex);
    expect(flowIndex).toBeLessThan(analysisIndex);
  });

  it("uses the same status geometry for an empty month", () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewDashboard, {
        categories: INVESTMENT_CATEGORIES,
        historySnapshots: [],
        month: "2026-08",
        previousSnapshot: null,
        snapshot: null,
      }),
    );

    expect(markup).toContain('class="review-status-card');
    expect(markup).toContain("当前净资产");
    expect(markup).toContain("—");
    expect(markup).toContain("新建数据");
    expect(markup).toContain('href="/records?month=2026-08"');
    expect(markup).not.toContain('class="monthly-flow-strip');
  });
});
