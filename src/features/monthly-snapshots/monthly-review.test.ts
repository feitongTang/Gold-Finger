import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { INVESTMENT_CATEGORIES } from "@/db/schema";
import {
  MonthlyHistory,
  MonthlyReview,
} from "@/features/monthly-snapshots/monthly-review";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

const snapshots: MonthlySnapshot[] = [
  {
    id: 1,
    month: "2026-06",
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
  },
  {
    id: 2,
    month: "2026-07",
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
  },
];

describe("MonthlyReview", () => {
  it("puts month navigation before the current net worth summary", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-07",
        previousSnapshot: snapshots[0],
        snapshot: snapshots[1],
      }),
    );

    expect(markup).toContain("2026 年 7 月");
    expect(markup).toContain("月度复盘");
    expect(markup).toContain('<h1 id="review-title"');
    expect(markup.indexOf("切换记录月份")).toBeLessThan(
      markup.indexOf("当前净资产"),
    );
    expect(markup).toContain('class="review-summary');
  });

  it("renders a quiet empty summary without a decorative icon", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-08",
        snapshot: null,
      }),
    );

    expect(markup).toContain("暂无复盘结果");
    expect(markup).toContain("新建数据");
    expect(markup).not.toContain("review-empty-icon");
    expect(markup).not.toContain("<svg");
  });

  it("shows cash flow values with mathematical signs and clear labels", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-07",
        previousSnapshot: snapshots[0],
        snapshot: snapshots[1],
      }),
    );

    expect(markup).toContain("资金分配");
    expect(markup).toContain("收入");
    expect(markup).toContain("支出");
    expect(markup).toContain("月度结余");
    expect(markup).toContain("+¥7,000.00");
    expect(markup).toContain('class="consistency-list"');
    expect(markup).not.toContain("consistency-card");
  });

  it("shows the liability ratio only inside the liability summary card", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-07",
        snapshot: snapshots[1],
      }),
    );

    expect(markup).toContain("负债");
    expect(markup).toContain("相当于总资产的 5%");
    expect(markup).not.toContain("不计入上方总资产构成条");
  });

  it("renders one unified asset allocation view without the two legacy charts", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-07",
        snapshot: snapshots[1],
      }),
    );

    expect(markup).toContain('id="asset-allocation-title"');
    expect(markup).toContain("资产配置");
    expect(markup).toContain("股票");
    expect(markup).toContain("现金");
    expect(markup).toContain("总体 41.7%");
    expect(markup).toContain("总体 58.3%");
    expect(markup).not.toContain("总资产构成");
    expect(markup).not.toContain("投资组合分类");
  });

  it("shows an honest allocation empty state when all configurable assets are zero", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-07",
        snapshot: {
          ...snapshots[1],
          cash: {
            emergencyFundCents: 0,
            goalFundCents: 0,
            dailyCashCents: 0,
          },
          funds: [],
        },
      }),
    );

    expect(markup).toContain("这个月份还没有可用于计算资产配置的数据");
    expect(markup).not.toContain('class="asset-allocation-overview-bar"');
  });

  it("shows non-blocking reconciliation differences when a previous record exists", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-07",
        previousSnapshot: snapshots[0],
        snapshot: snapshots[1],
      }),
    );

    expect(markup).toContain("跨月一致性");
    expect(markup).toContain("净资产可解释差额");
    expect(markup).toContain("投资市值解释差额");
    expect(markup).toContain("仅作复核提示，不影响保存");
    expect(markup).toContain(
      'class="review-summary review-summary-with-consistency"',
    );
    expect(markup).toContain('<details class="consistency-review">');
    expect(markup).toContain('class="consistency-review-summary"');
    expect(markup).not.toContain('<details class="consistency-review" open=""');
  });

  it("does not show cross-month reconciliation for the first record", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-06",
        snapshot: snapshots[0],
      }),
    );

    expect(markup).not.toContain("跨月一致性");
    expect(markup).toContain('class="review-summary"');
    expect(markup).not.toContain("review-summary-with-consistency");
  });
});

describe("MonthlyHistory", () => {
  it("renders compact mathematical deltas without explanatory badges", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyHistory, { snapshots }),
    );

    expect(markup).toContain('class="history-delta history-delta-positive"');
    expect(markup).toContain('class="history-delta history-delta-negative"');
    expect(markup).not.toContain("较上次");
  });

  it("keeps mathematical signs while treating higher expenses and liabilities as unfavorable", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyHistory, { snapshots }),
    );

    expect(markup).toMatch(
      /¥9,000\.00<\/strong><span class="history-delta history-delta-negative">\+¥1,000\.00/,
    );
    expect(markup).toMatch(
      /¥1,200\.00<\/strong><span class="history-delta history-delta-negative">\+¥200\.00/,
    );
  });
});
