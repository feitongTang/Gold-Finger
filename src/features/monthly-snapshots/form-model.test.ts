import { describe, expect, it } from "vitest";

import {
  canAddFund,
  createFundTemplate,
  formatCentsAsYuan,
  formatMonthlyInvestmentLabel,
  getMonthlySnapshotErrorSummary,
} from "@/features/monthly-snapshots/form-model";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

function snapshot(
  id: number,
  month: string,
  funds: MonthlySnapshot["funds"],
): MonthlySnapshot {
  return {
    id,
    month,
    cashFlow: {
      incomeCents: 0,
      expenseCents: 0,
      investmentProfitLossCents: 0,
      investmentContributionCents: 0,
    },
    cash: {
      emergencyFundCents: 0,
      goalFundCents: 0,
      dailyCashCents: 0,
    },
    funds,
    liabilities: { huabeiBalanceCents: 0 },
  };
}

describe("monthly snapshot form model", () => {
  it("formats a negative contribution for editing without losing cents", () => {
    expect(formatCentsAsYuan(-120_008)).toBe("-1200.08");
  });

  it("allows adding funds below the limit and stops at the limit", () => {
    expect(canAddFund(49)).toBe(true);
    expect(canAddFund(50)).toBe(false);
  });

  it("labels fund net investment with the selected calendar month", () => {
    expect(formatMonthlyInvestmentLabel("2026-02")).toBe("2月净投入");
  });

  it("describes fund validation errors with the fund number and field", () => {
    expect(
      getMonthlySnapshotErrorSummary({
        "funds.1.category": "请选择有效分类",
        "funds.1.marketValue": "请输入有效金额",
      }),
    ).toEqual([
      {
        field: "funds.1.category",
        label: "基金 2 · 固定分类",
        message: "请选择有效分类",
      },
      {
        field: "funds.1.marketValue",
        label: "基金 2 · 当前市值",
        message: "请输入有效金额",
      },
    ]);
  });

  it("keeps server validation order so the first summary item is focusable first", () => {
    expect(
      getMonthlySnapshotErrorSummary({
        expense: "支出无效",
        "funds.0.name": "请输入基金名称",
      }),
    ).toEqual([
      { field: "expense", label: "支出", message: "支出无效" },
      {
        field: "funds.0.name",
        label: "基金 1 · 基金名称",
        message: "请输入基金名称",
      },
    ]);
  });

  it("prefills a new month from the closest earlier fund holdings without carrying over a purchase", () => {
    const juneFund: MonthlySnapshot["funds"][number] = {
      name: "黄金 ETF",
      category: "gold",
      marketValueCents: 10_000_00,
      monthlyInvestmentCents: 9_000_00,
    };
    const augustFund: MonthlySnapshot["funds"][number] = {
      name: "纳斯达克指数基金",
      category: "us-nasdaq-100",
      marketValueCents: 30_000_00,
      monthlyInvestmentCents: 24_000_00,
    };

    expect(
      createFundTemplate("2026-09", [
        snapshot(3, "2026-10", []),
        snapshot(1, "2026-06", [juneFund]),
        snapshot(2, "2026-08", [augustFund]),
      ]),
    ).toEqual([
      {
        name: "纳斯达克指数基金",
        category: "us-nasdaq-100",
        marketValueCents: null,
        monthlyInvestmentCents: 0,
      },
    ]);
  });

  it("does not carry over a redemption when prefilling a new month", () => {
    const fund: MonthlySnapshot["funds"][number] = {
      name: "中证 500 指数基金",
      category: "china-csi-500",
      marketValueCents: 20_000_00,
      monthlyInvestmentCents: -8_000_00,
    };

    expect(
      createFundTemplate("2026-09", [snapshot(1, "2026-08", [fund])]),
    ).toEqual([
      {
        name: "中证 500 指数基金",
        category: "china-csi-500",
        marketValueCents: null,
        monthlyInvestmentCents: 0,
      },
    ]);
  });
});
