import type { Metadata } from "next";

import { loadMonthlyEntry } from "@/features/monthly-snapshots/data";
import {
  currentMonth,
  resolveMonthQuery,
  type MonthQuery,
} from "@/features/monthly-snapshots/month-routing";
import { shiftMonth } from "@/features/monthly-snapshots/form-data";
import { ReviewDashboard } from "@/features/monthly-snapshots/review-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "月度复盘" };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<MonthQuery>;
}) {
  const month = resolveMonthQuery(await searchParams, currentMonth());
  const { snapshot, snapshots, categories } = loadMonthlyEntry(month);
  const historyStartMonth = shiftMonth(month, -5);
  const historySnapshots = snapshots.filter(
    (snapshot) =>
      snapshot.month >= historyStartMonth && snapshot.month <= month,
  );
  const previousSnapshot =
    snapshots.findLast((snapshot) => snapshot.month < month) ?? null;

  return (
    <div className="page-content">
      <ReviewDashboard
        categories={categories}
        historySnapshots={historySnapshots}
        month={month}
        previousSnapshot={previousSnapshot}
        snapshot={snapshot}
      />
    </div>
  );
}
