"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  monthHref,
  type MonthAwarePath,
} from "@/features/monthly-snapshots/month-routing";

export const PRIMARY_NAV_ITEMS = [
  { href: "/", label: "月度复盘" },
  { href: "/records", label: "月度记录" },
  { href: "/portfolio", label: "投资组合" },
  { href: "/trends", label: "历史趋势" },
] as const satisfies ReadonlyArray<{
  href: MonthAwarePath;
  label: string;
}>;

export function AppSidebar() {
  const pathname = usePathname();
  const month = useSearchParams().get("month");

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <strong>Gold-Finger</strong>
        <span>月度财务复盘</span>
      </div>
      <nav aria-label="主要功能">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <Link
            aria-current={pathname === item.href ? "page" : undefined}
            href={month ? monthHref(item.href, month) : item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-utilities">
        <Link
          aria-current={pathname === "/data" ? "page" : undefined}
          href="/data"
        >
          数据安全
        </Link>
        <span>V2</span>
      </div>
    </aside>
  );
}
