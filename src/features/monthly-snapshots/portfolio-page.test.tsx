import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { INVESTMENT_CATEGORIES } from "@/db/schema";
import { PortfolioPageView } from "@/features/monthly-snapshots/portfolio-page";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

const snapshot: MonthlySnapshot = {
  id: 1,
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

describe("PortfolioPageView", () => {
  it("renders the complete read-only allocation and fund holdings", () => {
    const markup = renderToStaticMarkup(
      createElement(PortfolioPageView, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-08",
        snapshot,
      }),
    );

    expect(markup).toContain("投资组合");
    expect(markup.match(/组合概览/g)).toHaveLength(1);
    expect(markup).not.toContain("投资状态");
    expect(markup).toContain("当前投资市值");
    expect(markup).toContain("本月净投入");
    expect(markup).toContain("资产配置");
    expect(markup).toContain("股票");
    expect(markup).toContain("美国市场");
    expect(markup).toContain("纳斯达克100");
    expect(markup).toContain("基金名称");
    expect(markup).toContain("固定分类");
    expect(markup).toContain("当前市值");
    expect(markup).toContain("纳指基金");
    expect(markup).toContain('href="/records?month=2026-08"');
    expect(markup).not.toContain("<input");
  });

  it("guides an empty month to its record page without an allocation tree", () => {
    const markup = renderToStaticMarkup(
      createElement(PortfolioPageView, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-08",
        snapshot: null,
      }),
    );

    expect(markup).toContain("这个月份还没有投资组合数据");
    expect(markup).toContain('href="/records?month=2026-08"');
    expect(markup).not.toContain('class="asset-allocation-tree"');
    expect(markup).not.toContain("基金名称");
  });
});
