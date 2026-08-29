import Link from "next/link";

import { shiftMonth } from "@/features/monthly-snapshots/form-data";
import {
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
        href={monthHref(pathname, previous)}
      >
        ‹
      </Link>
      <time dateTime={month}>{month}</time>
      <Link aria-label={`查看 ${next}`} href={monthHref(pathname, next)}>
        ›
      </Link>
    </nav>
  );
}
