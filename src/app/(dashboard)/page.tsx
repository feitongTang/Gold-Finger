import {
  resolveSelectedMonth,
  shiftMonth,
} from "@/features/monthly-snapshots/form-data";
import { loadMonthlyEntry } from "@/features/monthly-snapshots/data";
import { DataSafetyPanel } from "@/features/monthly-snapshots/data-safety-panel";
import {
  MonthlyHistory,
  MonthlyReview,
} from "@/features/monthly-snapshots/monthly-review";

export const dynamic = "force-dynamic";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedMonth =
    typeof query.month === "string" ? query.month : undefined;
  const month = resolveSelectedMonth(requestedMonth, currentMonth());
  const { snapshot, snapshots, categories } = loadMonthlyEntry(month);
  const historyStartMonth = shiftMonth(month, -5);
  const historySnapshots = snapshots.filter(
    (snapshot) =>
      snapshot.month >= historyStartMonth && snapshot.month <= month,
  );
  const previousSnapshot = snapshots.findLast(
    (snapshot) => snapshot.month < month,
  );

  return (
    <div className="page-content">
      <MonthlyReview
        categories={categories}
        month={month}
        previousSnapshot={previousSnapshot}
        snapshot={snapshot}
      />

      <MonthlyHistory snapshots={historySnapshots} />

      <DataSafetyPanel />
    </div>
  );
}
