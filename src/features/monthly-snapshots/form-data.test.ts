import { describe, expect, it } from "vitest";

import * as formDataModel from "@/features/monthly-snapshots/form-data";
import { formatCentsAsYuan } from "@/features/monthly-snapshots/form-model";

function validFormData() {
  const formData = new FormData();
  formData.set("month", "2026-08");
  formData.set("income", "25000");
  formData.set("expense", "8000.50");
  formData.set("investmentProfitLoss", "358.42");
  formData.set("emergencyFund", "50000");
  formData.set("goalFund", "20000");
  formData.set("dailyCash", "8000");
  formData.set("huabeiBalance", "1200.08");
  formData.set("fundCount", "2");
  formData.set("funds.0.name", "  纳斯达克指数基金  ");
  formData.set("funds.0.category", "us-nasdaq-100");
  formData.set("funds.0.marketValue", "30000.01");
  formData.set("funds.0.monthlyInvestment", "24000");
  formData.set("funds.1.name", "黄金 ETF");
  formData.set("funds.1.category", "gold");
  formData.set("funds.1.marketValue", "10000");
  formData.set("funds.1.monthlyInvestment", "9000.99");
  return formData;
}

describe("monthly snapshot form data", () => {
  it.each([
    ["2026-08", "2026-08"],
    [undefined, "2026-07"],
    ["2026-13", "2026-07"],
  ])("resolves requested month %s to %s", (requestedMonth, expectedMonth) => {
    expect(formDataModel.resolveSelectedMonth(requestedMonth, "2026-07")).toBe(
      expectedMonth,
    );
  });

  it.each([
    ["2026-01", -1, "2025-12"],
    ["2026-12", 1, "2027-01"],
  ])("moves %s by %i month to %s", (month, offset, expectedMonth) => {
    const shiftMonth = (
      formDataModel as typeof formDataModel & {
        shiftMonth?: (value: string, amount: number) => string;
      }
    ).shiftMonth;

    expect(shiftMonth?.(month, offset)).toBe(expectedMonth);
  });

  it.each([
    [0, "0"],
    [120_000, "1200"],
    [120_008, "1200.08"],
    [120_010, "1200.10"],
  ])("formats %d cents as an editable yuan value", (cents, yuan) => {
    expect(formatCentsAsYuan(cents)).toBe(yuan);
  });

  it("parses yuan amounts exactly and keeps funds in input order", () => {
    expect(formDataModel.parseMonthlySnapshotFormData(validFormData())).toEqual(
      {
        ok: true,
        value: {
          month: "2026-08",
          cashFlow: {
            incomeCents: 2_500_000,
            expenseCents: 800_050,
            investmentProfitLossCents: 35_842,
            investmentContributionCents: 3_300_099,
          },
          cash: {
            emergencyFundCents: 5_000_000,
            goalFundCents: 2_000_000,
            dailyCashCents: 800_000,
          },
          funds: [
            {
              name: "纳斯达克指数基金",
              category: "us-nasdaq-100",
              marketValueCents: 3_000_001,
              monthlyInvestmentCents: 2_400_000,
            },
            {
              name: "黄金 ETF",
              category: "gold",
              marketValueCents: 1_000_000,
              monthlyInvestmentCents: 900_099,
            },
          ],
          liabilities: { huabeiBalanceCents: 120_008 },
        },
      },
    );
  });

  it("evaluates addition and subtraction for the requested monthly amount fields", () => {
    const formData = validFormData();
    formData.set("income", "25000 + 3000.50 - 500");
    formData.set("expense", "8000-500.25+20");
    formData.set("dailyCash", "8000 + 1200 - 300.08");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: true,
      value: {
        cashFlow: {
          incomeCents: 2_750_050,
          expenseCents: 751_975,
        },
        cash: { dailyCashCents: 889_992 },
      },
    });
  });

  it("rejects an amount expression outside the safe integer range", () => {
    const formData = validFormData();
    formData.set("income", "90071992547409.91+0.01");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: {
        income: "请输入金额或加减算式，结果须不小于 0，每项最多保留两位小数",
      },
    });
  });

  it.each([
    ["income", "1000--200"],
    ["expense", "500-600"],
    ["dailyCash", "(1000+200)-100"],
  ])("rejects invalid amount expression in %s", (field, expression) => {
    const formData = validFormData();
    formData.set(field, expression);

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: {
        [field]: "请输入金额或加减算式，结果须不小于 0，每项最多保留两位小数",
      },
    });
  });

  it("keeps other non-negative amount fields limited to a single amount", () => {
    const formData = validFormData();
    formData.set("emergencyFund", "50000+1000");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: {
        emergencyFund: "请输入不小于 0 的金额，最多保留两位小数",
      },
    });
  });

  it("derives cash-flow investment contribution from the fund inputs", () => {
    const formData = validFormData();
    const result = formDataModel.parseMonthlySnapshotFormData(formData);

    expect(result).toMatchObject({
      ok: true,
      value: {
        cashFlow: { investmentContributionCents: 3_300_099 },
      },
    });
  });

  it("accepts negative investment profit and loss as a monthly loss", () => {
    const formData = validFormData();
    formData.set("investmentProfitLoss", "-358.42");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: true,
      value: {
        cashFlow: { investmentProfitLossCents: -35_842 },
      },
    });
  });

  it("treats a redemption as a negative fund contribution and nets it with purchases", () => {
    const formData = validFormData();
    formData.set("funds.0.monthlyInvestment", "-12000.34");
    formData.set("funds.1.monthlyInvestment", "9000.99");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: true,
      value: {
        cashFlow: { investmentContributionCents: -299_935 },
        funds: [
          { monthlyInvestmentCents: -1_200_034 },
          { monthlyInvestmentCents: 900_099 },
        ],
      },
    });
  });

  it("rejects a fund investment total that exceeds the safe integer range", () => {
    const formData = validFormData();
    formData.set("funds.0.monthlyInvestment", "90071992547409.91");
    formData.set("funds.1.monthlyInvestment", "0.01");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: { fundInvestmentTotal: "本月净投入合计金额过大" },
    });
  });

  it("rejects a negative fund investment total outside the safe integer range", () => {
    const formData = validFormData();
    formData.set("funds.0.monthlyInvestment", "-90071992547409.91");
    formData.set("funds.1.monthlyInvestment", "-0.01");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: { fundInvestmentTotal: "本月净投入合计金额过大" },
    });
  });

  it("accepts zero amounts and an empty fund list", () => {
    const formData = validFormData();
    for (const field of [
      "income",
      "expense",
      "investmentProfitLoss",
      "emergencyFund",
      "goalFund",
      "dailyCash",
      "huabeiBalance",
    ]) {
      formData.set(field, "0");
    }
    formData.set("fundCount", "0");

    const result = formDataModel.parseMonthlySnapshotFormData(formData);

    expect(result).toMatchObject({ ok: true, value: { funds: [] } });
  });

  it.each([
    ["month", "2026-13", "请选择有效月份"],
    [
      "expense",
      "-1",
      "请输入金额或加减算式，结果须不小于 0，每项最多保留两位小数",
    ],
    [
      "income",
      "1.234",
      "请输入金额或加减算式，结果须不小于 0，每项最多保留两位小数",
    ],
    ["goalFund", "not-money", "请输入不小于 0 的金额，最多保留两位小数"],
  ])("reports an error for invalid %s", (field, value, message) => {
    const formData = validFormData();
    formData.set(field, value);

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: { [field]: message },
    });
  });

  it("reports blank fund names and unknown fixed categories", () => {
    const formData = validFormData();
    formData.set("funds.0.name", "   ");
    formData.set("funds.1.category", "crypto");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: {
        "funds.0.name": "请输入基金名称",
        "funds.1.category": "请选择有效分类",
      },
    });
  });

  it("rejects an invalid fund count without attempting an oversized parse", () => {
    const formData = validFormData();
    formData.set("fundCount", "999999999");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toEqual({
      ok: false,
      errors: { fundCount: "基金数量无效，请刷新后重试" },
    });
  });

  it("keeps other field errors when the fund count is invalid", () => {
    const formData = validFormData();
    formData.set("month", "2026-13");
    formData.set("expense", "-1");
    formData.set("fundCount", "999999999");

    expect(formDataModel.parseMonthlySnapshotFormData(formData)).toEqual({
      ok: false,
      errors: {
        month: "请选择有效月份",
        expense: "请输入金额或加减算式，结果须不小于 0，每项最多保留两位小数",
        fundCount: "基金数量无效，请刷新后重试",
      },
    });
  });
});
