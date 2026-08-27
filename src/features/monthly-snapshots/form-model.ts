import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

export const MAX_FUNDS = 50;

const FIELD_LABELS: Record<string, string> = {
  month: "记录月份",
  income: "收入",
  expense: "支出",
  investmentProfitLoss: "投资损益",
  emergencyFund: "应急备用金",
  goalFund: "目标准备金",
  dailyCash: "日常现金",
  huabeiBalance: "花呗余额",
  fundCount: "基金数量",
  fundInvestmentTotal: "基金净投入合计",
};

const FUND_FIELD_LABELS: Record<string, string> = {
  name: "基金名称",
  category: "固定分类",
  marketValue: "当前市值",
  monthlyInvestment: "本月净投入",
};

export type MonthlySnapshotErrorSummaryItem = {
  field: string;
  label: string;
  message: string;
};

function fieldErrorLabel(field: string) {
  const fundField = /^funds\.(\d+)\.(\w+)$/.exec(field);
  if (fundField) {
    const [, index, name] = fundField;
    return `基金 ${Number(index) + 1} · ${FUND_FIELD_LABELS[name] ?? name}`;
  }

  return FIELD_LABELS[field] ?? field;
}

export function getMonthlySnapshotErrorSummary(
  fieldErrors: Record<string, string>,
): MonthlySnapshotErrorSummaryItem[] {
  return Object.entries(fieldErrors).map(([field, message]) => ({
    field,
    label: fieldErrorLabel(field),
    message,
  }));
}

export function canAddFund(currentCount: number) {
  return currentCount < MAX_FUNDS;
}

export function formatMonthlyInvestmentLabel(month: string) {
  return `${Number(month.slice(5))}月净投入`;
}

export function createFundTemplate(
  month: string,
  snapshots: ReadonlyArray<MonthlySnapshot>,
) {
  const previousSnapshot = snapshots.findLast(
    (snapshot) => snapshot.month < month,
  );

  return (previousSnapshot?.funds ?? []).map((fund) => ({
    ...fund,
    marketValueCents: null,
    monthlyInvestmentCents: 0,
  }));
}

export type MonthlySnapshotFormState = {
  status: "idle" | "confirmation" | "error" | "success";
  message: string;
  fieldErrors: Record<string, string>;
  values?: Record<string, string>;
};

export const initialMonthlySnapshotFormState: MonthlySnapshotFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export function formatCentsAsYuan(cents: number) {
  const sign = cents < 0 ? "-" : "";
  const absoluteCents = Math.abs(cents);
  const yuan = Math.floor(absoluteCents / 100);
  const remainder = absoluteCents % 100;
  return remainder === 0
    ? `${sign}${yuan}`
    : `${sign}${yuan}.${String(remainder).padStart(2, "0")}`;
}
