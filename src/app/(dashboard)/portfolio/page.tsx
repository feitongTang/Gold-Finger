import type { Metadata } from "next";

import { loadMonthlyEntry } from "@/features/monthly-snapshots/data";
import {
  currentMonth,
  resolveMonthQuery,
  type MonthQuery,
} from "@/features/monthly-snapshots/month-routing";
import { PortfolioPageView } from "@/features/monthly-snapshots/portfolio-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "投资组合" };

export default async function PortfolioRoute({
  searchParams,
}: {
  searchParams: Promise<MonthQuery>;
}) {
  const month = resolveMonthQuery(await searchParams, currentMonth());
  const { snapshot, categories } = loadMonthlyEntry(month);

  return (
    <PortfolioPageView
      categories={categories}
      month={month}
      snapshot={snapshot}
    />
  );
}
