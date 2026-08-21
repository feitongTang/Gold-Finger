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
        <section className="month-panel" aria-labelledby="month-panel-title">
          <div className="month-navigation">
            <form className="month-form" method="get">
              <div className="month-field">
                <label htmlFor="selected-month" id="month-panel-title">
                  记录月份
                </label>
                <input
                  defaultValue={month}
                  id="selected-month"
                  name="month"
                  required
                  type="month"
                />
              </div>
              <button className="load-button" type="submit">
                载入月份
              </button>
            </form>
            <form className="history-month-form" method="get">
              <label htmlFor="history-month">已有月份</label>
              <select
                defaultValue={snapshot ? month : ""}
                disabled={snapshots.length === 0}
                id="history-month"
                name="month"
                required
              >
                <option value="">选择历史记录</option>
                {snapshots.toReversed().map((savedSnapshot) => (
                  <option key={savedSnapshot.month} value={savedSnapshot.month}>
                    {savedSnapshot.month}
                  </option>
                ))}
              </select>
              <button
                className="history-load-button"
                disabled={snapshots.length === 0}
                type="submit"
              >
                查看复盘
              </button>
            </form>
          </div>
          <p className={`month-mode ${snapshot ? "" : "month-mode-new"}`}>
            <span className="month-mode-dot" aria-hidden="true">
              {snapshot ? "✓" : "＋"}
            </span>
            {snapshot
              ? "这个月份已有记录，可以继续修改"
              : "这个月份还没有记录，可以开始填写"}
          </p>
        </section>

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
