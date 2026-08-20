import { resolveSelectedMonth } from "@/features/monthly-snapshots/form-data";
import { loadMonthlyEntry } from "@/features/monthly-snapshots/data";
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
  const { snapshot, categories } = loadMonthlyEntry(month);

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
          <p className={`month-mode ${snapshot ? "" : "month-mode-new"}`}>
            <span className="month-mode-dot" aria-hidden="true">
              {snapshot ? "✓" : "＋"}
            </span>
            {snapshot
              ? "这个月份已有记录，可以继续修改"
              : "这个月份还没有记录，可以开始填写"}
          </p>
        </section>

        <MonthlySnapshotForm
          categories={categories}
          key={month}
          month={month}
          snapshot={snapshot}
        />
      </main>
    </>
  );
}
