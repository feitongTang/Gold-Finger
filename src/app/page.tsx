import { resolveSelectedMonth } from "@/features/monthly-snapshots/form-data";
import { loadMonthlyEntry } from "@/features/monthly-snapshots/data";
import {
  MonthlyHistory,
  MonthlyReview,
} from "@/features/monthly-snapshots/monthly-review";
import { MonthlySnapshotForm } from "@/features/monthly-snapshots/monthly-snapshot-form";

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
  const { snapshot, fundTemplate, snapshots, categories } =
    loadMonthlyEntry(month);

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <p className="brand">Gold-Finger</p>
          <span className="header-divider" aria-hidden="true" />
          <h1 className="header-context">月度财务记录</h1>
        </div>
      </header>
      <main className="page-content">
        <MonthlyReview
          categories={categories}
          month={month}
          snapshot={snapshot}
        />

        <MonthlyHistory snapshots={snapshots} />

        <MonthlySnapshotForm
          categories={categories}
          initialFunds={snapshot?.funds ?? fundTemplate}
          key={month}
          month={month}
          snapshot={snapshot}
        />
      </main>
    </>
  );
}
