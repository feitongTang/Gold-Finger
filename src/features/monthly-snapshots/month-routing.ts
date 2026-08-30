import { resolveSelectedMonth } from "@/features/monthly-snapshots/form-data";

export type MonthAwarePath = "/" | "/records" | "/portfolio" | "/trends";
export type MonthQuery = { month?: string | string[] };

export function currentMonth(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${year} 年 ${Number(monthNumber)} 月`;
}

export function resolveMonthQuery(query: MonthQuery, fallback: string) {
  return resolveSelectedMonth(
    typeof query.month === "string" ? query.month : undefined,
    fallback,
  );
}

export function monthHref(path: MonthAwarePath, month: string) {
  return `${path}?month=${encodeURIComponent(month)}`;
}
