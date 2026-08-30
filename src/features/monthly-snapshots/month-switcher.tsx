import Link from "next/link";

import { shiftMonth } from "@/features/monthly-snapshots/form-data";
import {
  formatMonthLabel,
  monthHref,
  type MonthAwarePath,
} from "@/features/monthly-snapshots/month-routing";

export function MonthSwitcher({
  month,
  pathname,
}: {
  month: string;
  pathname: MonthAwarePath;
}) {
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);

  return (
    <nav aria-label="切换记录月份" className="month-switcher">
      <Link
        aria-label={`查看 ${previous}`}
        className="month-switcher-arrow"
        href={monthHref(pathname, previous)}
      >
        ‹
      </Link>
      <time dateTime={month}>{formatMonthLabel(month)}</time>
      <Link
        aria-label={`查看 ${next}`}
        className="month-switcher-arrow"
        href={monthHref(pathname, next)}
      >
        ›
      </Link>
    </nav>
  );
}
