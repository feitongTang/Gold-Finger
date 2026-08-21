import {
  INVESTMENT_CATEGORY_IDS,
  type InvestmentCategoryId,
} from "@/db/schema";
import { MAX_FUNDS } from "@/features/monthly-snapshots/form-model";
import type { MonthlySnapshotInput } from "@/features/monthly-snapshots/repository";

const MONEY_ERROR = "请输入不小于 0 的金额，最多保留两位小数";
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

function stringValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parseYuan(value: string) {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;

  const cents =
    BigInt(match[1]) * BigInt(100) + BigInt((match[2] ?? "").padEnd(2, "0"));
  return cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) : null;
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
    income: stringValue(formData, "income"),
    expense: stringValue(formData, "expense"),
    emergencyFund: stringValue(formData, "emergencyFund"),
    goalFund: stringValue(formData, "goalFund"),
    dailyCash: stringValue(formData, "dailyCash"),
    huabeiBalance: stringValue(formData, "huabeiBalance"),
  };
  const parsedMoney: Record<keyof typeof moneyFields, number> = {
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
    const monthlyInvestment = parseYuan(
      stringValue(formData, `${prefix}.monthlyInvestment`),
    );

    if (!name) errors[`${prefix}.name`] = "请输入基金名称";
    if (!isInvestmentCategory(category))
      errors[`${prefix}.category`] = "请选择有效分类";
    if (marketValue === null) errors[`${prefix}.marketValue`] = MONEY_ERROR;
    if (monthlyInvestment === null)
      errors[`${prefix}.monthlyInvestment`] = MONEY_ERROR;

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
  if (investmentContribution > BigInt(Number.MAX_SAFE_INTEGER)) {
    errors.fundInvestmentTotal = "本月投入合计金额过大";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      month,
      cashFlow: {
        incomeCents: parsedMoney.income,
        expenseCents: parsedMoney.expense,
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
