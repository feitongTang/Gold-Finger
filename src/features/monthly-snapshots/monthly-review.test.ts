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
  it("keeps the monthly balance card neutral while coloring a positive amount", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyReview, {
        categories: INVESTMENT_CATEGORIES,
        month: "2026-07",
        snapshot: snapshots[1],
      }),
    );

    expect(markup).toContain(
      '<div class="metric-card metric-card-emphasis"><dt>月度结余</dt><dd class="metric-card-positive">',
    );
    expect(markup).not.toContain("metric-card-emphasis metric-card-positive");
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
  });
});

describe("MonthlyHistory", () => {
  it("renders changes as compact semantic badges", () => {
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
