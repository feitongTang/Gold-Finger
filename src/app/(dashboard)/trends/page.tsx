import type { Metadata } from "next";

import { loadMonthlyEntry } from "@/features/monthly-snapshots/data";
import {
  currentMonth,
  resolveMonthQuery,
  type MonthQuery,
} from "@/features/monthly-snapshots/month-routing";
import { shiftMonth } from "@/features/monthly-snapshots/form-data";
import { MonthlyHistory } from "@/features/monthly-snapshots/monthly-history";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "历史趋势" };

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<MonthQuery>;
}) {
  const month = resolveMonthQuery(await searchParams, currentMonth());
  const startMonth = shiftMonth(month, -5);
  const { snapshots } = loadMonthlyEntry(month);
  const historySnapshots = snapshots.filter(
    (snapshot) => snapshot.month >= startMonth && snapshot.month <= month,
  );

  return <MonthlyHistory month={month} snapshots={historySnapshots} />;
}
