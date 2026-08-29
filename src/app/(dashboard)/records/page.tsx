import { loadMonthlyEntry } from "@/features/monthly-snapshots/data";
import {
  currentMonth,
  resolveMonthQuery,
  type MonthQuery,
} from "@/features/monthly-snapshots/month-routing";
import { RecordsPageView } from "@/features/monthly-snapshots/records-page";

export const dynamic = "force-dynamic";

export default async function RecordsRoute({
  searchParams,
}: {
  searchParams: Promise<MonthQuery>;
}) {
  const month = resolveMonthQuery(await searchParams, currentMonth());
  const { snapshot, fundTemplate, categories } = loadMonthlyEntry(month);

  return (
    <RecordsPageView
      categories={categories}
      initialFunds={snapshot?.funds ?? fundTemplate}
      month={month}
      snapshot={snapshot}
    />
  );
}
