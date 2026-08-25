import {
  INVESTMENT_CATEGORY_IDS,
  type InvestmentCategoryId,
} from "@/db/schema";
import { MAX_FUNDS } from "@/features/monthly-snapshots/form-model";
import type { MonthlySnapshotInput } from "@/features/monthly-snapshots/repository";

const MONEY_ERROR = "请输入不小于 0 的金额，最多保留两位小数";
const MONEY_EXPRESSION_ERROR =
  "请输入金额或加减算式，结果须不小于 0，每项最多保留两位小数";
const PROFIT_LOSS_ERROR =
  "请输入金额，收益填正数、亏损填负数，最多保留两位小数";
const NET_CONTRIBUTION_ERROR =
  "请输入金额，申购填正数、赎回填负数，最多保留两位小数";
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const categoryIds = new Set<string>(INVESTMENT_CATEGORY_IDS);

export type ParseResult =
  | { ok: true; value: MonthlySnapshotInput }
  | { ok: false; errors: Record<string, string> };

export function resolveSelectedMonth(
  requestedMonth: string | undefined,
  currentMonth: string,
) {
  return requestedMonth && MONTH_PATTERN.test(requestedMonth)
    ? requestedMonth
    : currentMonth;
}

export function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const shiftedDate = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));

  return `${shiftedDate.getUTCFullYear()}-${String(shiftedDate.getUTCMonth() + 1).padStart(2, "0")}`;
}

function stringValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parseUnsignedYuanCents(value: string) {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;

  return (
    BigInt(match[1]) * BigInt(100) + BigInt((match[2] ?? "").padEnd(2, "0"))
  );
}

function parseYuan(value: string) {
  const cents = parseUnsignedYuanCents(value);
  if (cents === null) return null;

  return cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) : null;
}

function parseYuanExpression(value: string) {
  const expression = value.replaceAll(/\s/g, "");
  if (
    !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?(?:[+-](?:0|[1-9]\d*)(?:\.\d{1,2})?)*$/.test(
      expression,
    )
  ) {
    return null;
  }

  let total = BigInt(0);
  for (const term of expression.match(/[+-]?[^+-]+/g) ?? []) {
    const hasOperator = term[0] === "+" || term[0] === "-";
    const operator = term[0] === "-" ? "-" : "+";
    const amount = parseUnsignedYuanCents(hasOperator ? term.slice(1) : term);
    if (amount === null) return null;
    total += operator === "-" ? -amount : amount;
  }

  return total >= BigInt(0) && total <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(total)
    : null;
}

function parseSignedYuan(value: string) {
  const match = /^(-?)(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;

  const absoluteCents =
    BigInt(match[2]) * BigInt(100) + BigInt((match[3] ?? "").padEnd(2, "0"));
  if (absoluteCents > BigInt(Number.MAX_SAFE_INTEGER)) return null;

  return Number(match[1] === "-" ? -absoluteCents : absoluteCents);
}

function isInvestmentCategory(value: string): value is InvestmentCategoryId {
  return categoryIds.has(value);
}

export function parseMonthlySnapshotFormData(formData: FormData): ParseResult {
  const errors: Record<string, string> = {};
  const month = stringValue(formData, "month");

  if (!MONTH_PATTERN.test(month)) {
    errors.month = "请选择有效月份";
  }

  const moneyFields = {
    emergencyFund: stringValue(formData, "emergencyFund"),
    goalFund: stringValue(formData, "goalFund"),
    huabeiBalance: stringValue(formData, "huabeiBalance"),
  };
  const expressionMoneyFields = {
    income: stringValue(formData, "income"),
    expense: stringValue(formData, "expense"),
    dailyCash: stringValue(formData, "dailyCash"),
  };
  const parsedMoney: Record<
    keyof typeof moneyFields | keyof typeof expressionMoneyFields,
    number
  > = {
    income: 0,
    expense: 0,
    emergencyFund: 0,
    goalFund: 0,
    dailyCash: 0,
    huabeiBalance: 0,
  };

  for (const [field, value] of Object.entries(moneyFields) as Array<
    [keyof typeof moneyFields, string]
  >) {
    const cents = parseYuan(value);
    if (cents === null) errors[field] = MONEY_ERROR;
    else parsedMoney[field] = cents;
  }

  for (const [field, value] of Object.entries(expressionMoneyFields) as Array<
    [keyof typeof expressionMoneyFields, string]
  >) {
    const cents = parseYuanExpression(value);
    if (cents === null) errors[field] = MONEY_EXPRESSION_ERROR;
    else parsedMoney[field] = cents;
  }

  const investmentProfitLoss = parseSignedYuan(
    stringValue(formData, "investmentProfitLoss"),
  );
  if (investmentProfitLoss === null) {
    errors.investmentProfitLoss = PROFIT_LOSS_ERROR;
  }

  const fundCountValue = stringValue(formData, "fundCount");
  const fundCount = Number(fundCountValue);
  const fundCountIsValid =
    /^\d+$/.test(fundCountValue) &&
    Number.isSafeInteger(fundCount) &&
    fundCount >= 0 &&
    fundCount <= MAX_FUNDS;
  if (!fundCountIsValid) {
    errors.fundCount = "基金数量无效，请刷新后重试";
  }

  const funds: MonthlySnapshotInput["funds"] = [];
  const parsedFundCount = fundCountIsValid ? fundCount : 0;
  for (let index = 0; index < parsedFundCount; index += 1) {
    const prefix = `funds.${index}`;
    const name = stringValue(formData, `${prefix}.name`);
    const category = stringValue(formData, `${prefix}.category`);
    const marketValue = parseYuan(
      stringValue(formData, `${prefix}.marketValue`),
    );
    const monthlyInvestment = parseSignedYuan(
      stringValue(formData, `${prefix}.monthlyInvestment`),
    );

    if (!name) errors[`${prefix}.name`] = "请输入基金名称";
    if (!isInvestmentCategory(category))
      errors[`${prefix}.category`] = "请选择有效分类";
    if (marketValue === null) errors[`${prefix}.marketValue`] = MONEY_ERROR;
    if (monthlyInvestment === null)
      errors[`${prefix}.monthlyInvestment`] = NET_CONTRIBUTION_ERROR;

    if (
      name &&
      isInvestmentCategory(category) &&
      marketValue !== null &&
      monthlyInvestment !== null
    ) {
      funds.push({
        name,
        category,
        marketValueCents: marketValue,
        monthlyInvestmentCents: monthlyInvestment,
      });
    }
  }

  const investmentContribution = funds.reduce(
    (total, fund) => total + BigInt(fund.monthlyInvestmentCents),
    BigInt(0),
  );
  if (
    investmentContribution > BigInt(Number.MAX_SAFE_INTEGER) ||
    investmentContribution < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    errors.fundInvestmentTotal = "本月净投入合计金额过大";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      month,
      cashFlow: {
        incomeCents: parsedMoney.income,
        expenseCents: parsedMoney.expense,
        investmentProfitLossCents: investmentProfitLoss ?? 0,
        investmentContributionCents: Number(investmentContribution),
      },
      cash: {
        emergencyFundCents: parsedMoney.emergencyFund,
        goalFundCents: parsedMoney.goalFund,
        dailyCashCents: parsedMoney.dailyCash,
      },
      funds,
      liabilities: { huabeiBalanceCents: parsedMoney.huabeiBalance },
    },
  };
}
