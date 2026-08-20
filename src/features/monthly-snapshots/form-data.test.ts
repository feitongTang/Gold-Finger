import { describe, expect, it } from "vitest";

import {
  parseMonthlySnapshotFormData,
  resolveSelectedMonth,
} from "@/features/monthly-snapshots/form-data";
import { formatCentsAsYuan } from "@/features/monthly-snapshots/form-model";

function validFormData() {
  const formData = new FormData();
  formData.set("month", "2026-08");
  formData.set("income", "25000");
  formData.set("expense", "8000.50");
  formData.set("investmentContribution", "6000");
  formData.set("emergencyFund", "50000");
  formData.set("goalFund", "20000");
  formData.set("dailyCash", "8000");
  formData.set("huabeiBalance", "1200.08");
  formData.set("fundCount", "2");
  formData.set("funds.0.name", "  纳斯达克指数基金  ");
  formData.set("funds.0.category", "us-nasdaq-100");
  formData.set("funds.0.marketValue", "30000.01");
  formData.set("funds.0.cumulativeInvestment", "24000");
  formData.set("funds.1.name", "黄金 ETF");
  formData.set("funds.1.category", "gold");
  formData.set("funds.1.marketValue", "10000");
  formData.set("funds.1.cumulativeInvestment", "9000.99");
  return formData;
}

describe("monthly snapshot form data", () => {
  it.each([
    ["2026-08", "2026-08"],
    [undefined, "2026-07"],
    ["2026-13", "2026-07"],
  ])("resolves requested month %s to %s", (requestedMonth, expectedMonth) => {
    expect(resolveSelectedMonth(requestedMonth, "2026-07")).toBe(expectedMonth);
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
    expect(parseMonthlySnapshotFormData(validFormData())).toEqual({
      ok: true,
      value: {
        month: "2026-08",
        cashFlow: {
          incomeCents: 2_500_000,
          expenseCents: 800_050,
          investmentContributionCents: 600_000,
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
            cumulativeInvestmentCents: 2_400_000,
          },
          {
            name: "黄金 ETF",
            category: "gold",
            marketValueCents: 1_000_000,
            cumulativeInvestmentCents: 900_099,
          },
        ],
        liabilities: { huabeiBalanceCents: 120_008 },
      },
    });
  });

  it("accepts zero amounts and an empty fund list", () => {
    const formData = validFormData();
    for (const field of [
      "income",
      "expense",
      "investmentContribution",
      "emergencyFund",
      "goalFund",
      "dailyCash",
      "huabeiBalance",
    ]) {
      formData.set(field, "0");
    }
    formData.set("fundCount", "0");

    const result = parseMonthlySnapshotFormData(formData);

    expect(result).toMatchObject({ ok: true, value: { funds: [] } });
  });

  it.each([
    ["month", "2026-13", "请选择有效月份"],
    ["expense", "-1", "请输入不小于 0 的金额，最多保留两位小数"],
    ["income", "1.234", "请输入不小于 0 的金额，最多保留两位小数"],
    ["goalFund", "not-money", "请输入不小于 0 的金额，最多保留两位小数"],
  ])("reports an error for invalid %s", (field, value, message) => {
    const formData = validFormData();
    formData.set(field, value);

    expect(parseMonthlySnapshotFormData(formData)).toMatchObject({
      ok: false,
      errors: { [field]: message },
    });
  });

  it("reports blank fund names and unknown fixed categories", () => {
    const formData = validFormData();
    formData.set("funds.0.name", "   ");
    formData.set("funds.1.category", "crypto");

    expect(parseMonthlySnapshotFormData(formData)).toMatchObject({
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

    expect(parseMonthlySnapshotFormData(formData)).toEqual({
      ok: false,
      errors: { fundCount: "基金数量无效，请刷新后重试" },
    });
  });

  it("keeps other field errors when the fund count is invalid", () => {
    const formData = validFormData();
    formData.set("month", "2026-13");
    formData.set("expense", "-1");
    formData.set("fundCount", "999999999");

    expect(parseMonthlySnapshotFormData(formData)).toEqual({
      ok: false,
      errors: {
        month: "请选择有效月份",
        expense: "请输入不小于 0 的金额，最多保留两位小数",
        fundCount: "基金数量无效，请刷新后重试",
      },
    });
  });
});
