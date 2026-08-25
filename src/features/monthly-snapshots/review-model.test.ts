import { describe, expect, it } from "vitest";

import { INVESTMENT_CATEGORIES } from "@/db/schema";
import type { MonthlySnapshotInput } from "@/features/monthly-snapshots/repository";
import {
  calculateAssetAllocation,
  calculateInvestmentAllocation,
  calculateMonthlyReview,
  calculateMonthlyTrend,
} from "@/features/monthly-snapshots/review-model";

const snapshot: MonthlySnapshotInput = {
  month: "2026-08",
  cashFlow: {
    incomeCents: 3_000_000,
    expenseCents: 800_000,
    investmentProfitLossCents: 125_000,
    investmentContributionCents: 500_000,
  },
  cash: {
    emergencyFundCents: 1_500_000,
    goalFundCents: 600_000,
    dailyCashCents: 200_000,
  },
  funds: [
    {
      name: "纳指基金 A",
      category: "us-nasdaq-100",
      marketValueCents: 1_200_000,
      monthlyInvestmentCents: 900_000,
    },
    {
      name: "纳指基金 B",
      category: "us-nasdaq-100",
      marketValueCents: 300_000,
      monthlyInvestmentCents: 250_000,
    },
    {
      name: "黄金基金",
      category: "gold",
      marketValueCents: 500_000,
      monthlyInvestmentCents: 450_000,
    },
  ],
  liabilities: { huabeiBalanceCents: 100_000 },
};

describe("calculateMonthlyReview", () => {
  it("derives cash-flow investment contribution from the saved fund inputs", () => {
    const review = calculateMonthlyReview(snapshot);

    expect(review.cashFlow).toEqual({
      incomeCents: BigInt(3_000_000),
      expenseCents: BigInt(800_000),
      investmentProfitLossCents: BigInt(125_000),
      investmentContributionCents: BigInt(1_600_000),
      balanceCents: BigInt(600_000),
    });
    expect(review.assets).toEqual({
      cashCents: BigInt(2_300_000),
      investmentCents: BigInt(2_000_000),
      liabilityCents: BigInt(100_000),
      netWorthCents: BigInt(4_200_000),
    });
  });

  it("treats a negative net contribution as cash returned by a redemption", () => {
    const review = calculateMonthlyReview({
      ...snapshot,
      funds: [
        {
          ...snapshot.funds[0],
          monthlyInvestmentCents: -500_000,
        },
      ],
    });

    expect(review.cashFlow.investmentContributionCents).toBe(BigInt(-500_000));
    expect(review.cashFlow.balanceCents).toBe(BigInt(2_700_000));
  });

  it("groups multiple funds by their fixed investment category", () => {
    expect(calculateMonthlyReview(snapshot).investmentCategories).toEqual([
      {
        category: "us-nasdaq-100",
        marketValueCents: BigInt(1_500_000),
        monthlyInvestmentCents: BigInt(1_150_000),
        fundCount: 2,
      },
      {
        category: "gold",
        marketValueCents: BigInt(500_000),
        monthlyInvestmentCents: BigInt(450_000),
        fundCount: 1,
      },
    ]);
  });

  it("returns an empty category summary when the snapshot has no funds", () => {
    const review = calculateMonthlyReview({ ...snapshot, funds: [] });

    expect(review.assets.investmentCents).toBe(BigInt(0));
    expect(review.assets.netWorthCents).toBe(BigInt(2_200_000));
    expect(review.investmentCategories).toEqual([]);
  });

  it("keeps exact cents when valid saved amounts exceed a safe aggregate", () => {
    const maximum = Number.MAX_SAFE_INTEGER;
    const review = calculateMonthlyReview({
      ...snapshot,
      cash: {
        emergencyFundCents: maximum,
        goalFundCents: maximum,
        dailyCashCents: maximum,
      },
      funds: [
        {
          name: "大额基金",
          category: "gold",
          marketValueCents: maximum,
          monthlyInvestmentCents: maximum,
        },
      ],
      liabilities: { huabeiBalanceCents: maximum },
    });

    expect(review.assets.cashCents).toBe(BigInt("27021597764222973"));
    expect(review.assets.netWorthCents).toBe(BigInt("27021597764222973"));
  });
});

describe("calculateAssetAllocation", () => {
  it("does not report a liability percentage without an asset base", () => {
    expect(
      calculateAssetAllocation(BigInt(0), BigInt(0), BigInt(120_000)),
    ).toEqual({
      cashPercent: 0,
      investmentPercent: 0,
      liabilityPercent: null,
    });
  });

  it("keeps rounded cash and investment shares at a combined 100 percent", () => {
    expect(calculateAssetAllocation(BigInt(1), BigInt(7), BigInt(0))).toEqual({
      cashPercent: 13,
      investmentPercent: 87,
      liabilityPercent: 0,
    });
  });
});

describe("calculateInvestmentAllocation", () => {
  it("builds drill-down shares for asset classes, markets, and fixed categories", () => {
    const review = calculateMonthlyReview({
      ...snapshot,
      funds: [
        ...snapshot.funds,
        {
          name: "标普基金",
          category: "us-sp-500",
          marketValueCents: 500_000,
          monthlyInvestmentCents: 0,
        },
        {
          name: "日本基金",
          category: "japan-market",
          marketValueCents: 500_000,
          monthlyInvestmentCents: 0,
        },
      ],
    });

    expect(
      calculateInvestmentAllocation(
        review.investmentCategories,
        INVESTMENT_CATEGORIES,
      ),
    ).toEqual([
      {
        id: "asset-class:权益类",
        label: "权益类",
        percentage: 83,
        children: [
          {
            id: "market:美国市场",
            label: "美国市场",
            percentage: 80,
            children: [
              {
                id: "category:us-nasdaq-100",
                label: "纳斯达克100",
                percentage: 75,
                children: [],
              },
              {
                id: "category:us-sp-500",
                label: "标普500",
                percentage: 25,
                children: [],
              },
            ],
          },
          {
            id: "category:japan-market",
            label: "日本市场",
            percentage: 20,
            children: [],
          },
        ],
      },
      {
        id: "asset-class:其他资产",
        label: "其他资产",
        percentage: 17,
        children: [
          {
            id: "category:gold",
            label: "黄金",
            percentage: 100,
            children: [],
          },
        ],
      },
    ]);
  });

  it("keeps zero-value holdings visible without inventing a percentage", () => {
    const review = calculateMonthlyReview({
      ...snapshot,
      funds: [
        {
          ...snapshot.funds[0],
          marketValueCents: 0,
        },
      ],
    });

    expect(
      calculateInvestmentAllocation(
        review.investmentCategories,
        INVESTMENT_CATEGORIES,
      ),
    ).toEqual([
      {
        id: "asset-class:权益类",
        label: "权益类",
        percentage: 0,
        children: [
          {
            id: "market:美国市场",
            label: "美国市场",
            percentage: 0,
            children: [
              {
                id: "category:us-nasdaq-100",
                label: "纳斯达克100",
                percentage: 0,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });
});

describe("calculateMonthlyTrend", () => {
  it("orders saved months and calculates every trend metric", () => {
    const trend = calculateMonthlyTrend([
      {
        ...snapshot,
        month: "2026-08",
        cashFlow: {
          incomeCents: 2_800_000,
          expenseCents: 900_000,
          investmentProfitLossCents: 75_000,
          investmentContributionCents: 600_000,
        },
      },
      {
        ...snapshot,
        month: "2026-06",
        cash: {
          emergencyFundCents: 1_000_000,
          goalFundCents: 500_000,
          dailyCashCents: 100_000,
        },
        funds: [],
        liabilities: { huabeiBalanceCents: 200_000 },
      },
    ]);

    expect(trend).toEqual([
      {
        month: "2026-06",
        netWorthCents: BigInt(1_400_000),
        incomeCents: BigInt(3_000_000),
        expenseCents: BigInt(800_000),
        cashFlowBalanceCents: BigInt(2_200_000),
        cashCents: BigInt(1_600_000),
        investmentCents: BigInt(0),
        liabilityCents: BigInt(200_000),
      },
      {
        month: "2026-08",
        netWorthCents: BigInt(4_200_000),
        incomeCents: BigInt(2_800_000),
        expenseCents: BigInt(900_000),
        cashFlowBalanceCents: BigInt(300_000),
        cashCents: BigInt(2_300_000),
        investmentCents: BigInt(2_000_000),
        liabilityCents: BigInt(100_000),
      },
    ]);
  });

  it("returns no trend points when no month has been saved", () => {
    expect(calculateMonthlyTrend([])).toEqual([]);
  });
});
