export const MAX_FUNDS = 50;

export function canAddFund(currentCount: number) {
  return currentCount < MAX_FUNDS;
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
  const yuan = Math.floor(cents / 100);
  const remainder = cents % 100;
  return remainder === 0
    ? String(yuan)
    : `${yuan}.${String(remainder).padStart(2, "0")}`;
}
