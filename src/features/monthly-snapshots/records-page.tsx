import {
  formatMonthLabel,
  monthHref,
} from "@/features/monthly-snapshots/month-routing";
import { MonthSwitcher } from "@/features/monthly-snapshots/month-switcher";
import { MonthlyRecordActions } from "@/features/monthly-snapshots/monthly-record-actions";
import {
  MonthlySnapshotForm,
  type MonthlySnapshotCategoryOption,
  type MonthlySnapshotFormFund,
} from "@/features/monthly-snapshots/monthly-snapshot-form";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

export function RecordsPageView({
  month,
  snapshot,
  initialFunds,
  categories,
}: {
  month: string;
  snapshot: MonthlySnapshot | null;
  initialFunds: ReadonlyArray<MonthlySnapshotFormFund>;
  categories: ReadonlyArray<MonthlySnapshotCategoryOption>;
}) {
  const successHref = monthHref("/", month);

  return (
    <section
      className="page-content records-page"
      aria-labelledby="records-title"
    >
      <header className="review-page-heading">
        <div>
          <p className="review-eyebrow">{formatMonthLabel(month)}</p>
          <h1 id="records-title">月度记录</h1>
        </div>
        <MonthSwitcher month={month} pathname="/records" />
      </header>

      <MonthlySnapshotForm
        categories={categories}
        initialFunds={initialFunds}
        key={month}
        month={month}
        snapshot={snapshot}
        successHref={successHref}
      />

      {snapshot ? (
        <MonthlyRecordActions month={month} successHref={successHref} />
      ) : null}
    </section>
  );
}
