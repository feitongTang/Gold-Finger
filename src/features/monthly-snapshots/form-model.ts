import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

export const MAX_FUNDS = 50;

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
  }));
}

export type MonthlySnapshotFormState = {
  status: "idle" | "error" | "success";
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
