import { describe, expect, it } from "vitest";

import * as formModel from "@/features/monthly-snapshots/form-model";
import { canAddFund } from "@/features/monthly-snapshots/form-model";
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
  it("allows adding funds below the limit and stops at the limit", () => {
    expect(canAddFund(49)).toBe(true);
    expect(canAddFund(50)).toBe(false);
  });

  it("prefills a new month from the closest earlier fund holdings and resets monthly investment", () => {
    const createFundTemplate = (
      formModel as unknown as {
        createFundTemplate?: (
          month: string,
          snapshots: MonthlySnapshot[],
        ) => MonthlySnapshot["funds"];
      }
    ).createFundTemplate;
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
      createFundTemplate?.("2026-09", [
        snapshot(3, "2026-10", []),
        snapshot(1, "2026-06", [juneFund]),
        snapshot(2, "2026-08", [augustFund]),
      ]),
    ).toEqual([{ ...augustFund, monthlyInvestmentCents: 0 }]);
  });
});
