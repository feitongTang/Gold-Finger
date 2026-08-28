# Gold-Finger V2 Multi-Page Ice Crystal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Gold-Finger 单页 V1 改造成带共享文字侧栏的五页面 V2，并在不改变财务语义和数据格式的前提下落地克制的 Ice Crystal Finance UI。

**Architecture:** 使用 Next.js App Router Route Group `(dashboard)` 提供共享应用框架，五个页面仍由 Server Component 读取 SQLite 数据；仅侧栏路由状态、图表切换、表单和备份操作保留为 Client Component。月份通过 `?month=YYYY-MM` 跨业务页面传递，财务计算继续由 `src/features/monthly-snapshots` 中的纯 TypeScript model 提供。

**Tech Stack:** Node.js 24、npm、Next.js 16.3.1 App Router、React 19.2、严格 TypeScript、Tailwind CSS 4、原生 CSS Variables、SQLite/Drizzle、Vitest 4、Testing Library。

**Spec:** `docs/superpowers/specs/2026-08-28-v2-multi-page-ice-crystal-design.md`

## Global Constraints

- 当前 V2 分支必须是 `codex/v2-multi-page-dashboard`，工作目录必须是 `.worktrees/v2-multi-page-dashboard`。
- 当前 V1 标签 `v1.0.0` 指向 `73ec8b0`；不得移动标签、删除旧分支、合并或推送。
- 产品仍是本地单用户、桌面端月度财务复盘 MVP；不新增手机端导航、账户、预算、目标、资产管理独立页面或其他产品能力。
- 不改变 SQLite/Drizzle schema、月度记录语义、基金固定分类、备份 JSON 格式或现有财务公式。
- 不新增依赖；不得产生无业务原因的 `package-lock.json` 变化。
- 路由和 Client Component 不得导入 `src/db` 或服务端数据库模块。
- 月份只通过 `?month=YYYY-MM` 传递；`/data` 不携带月份。
- 视觉比例为 70% 干净浅色金融 UI、20% Ice Glass、10% Liquid Glass interaction。
- 禁止紫色科技风、Web3、Crypto、霓虹、高饱和渐变、明显 glow、大面积重 blur、glass-inside-glass 和跟随鼠标光效。
- `backdrop-filter` 只用于主要 Frosted Surface 和 Liquid Control；必须同时设置 `-webkit-backdrop-filter` 和不透明 fallback。
- 所有金额使用 tabular numerals；正负、错误和选中状态不能只依赖颜色。
- 动效限制为 160～220ms `ease-out`，最多 `translateY(-1px)` 和 active `scale(0.98)`；必须支持 `prefers-reduced-motion`。
- 实现前已阅读本地 Next.js 文档：Layouts and Pages、Linking and Navigating、Server and Client Components、Layout、Page、Route Groups、Redirecting。
- 每个任务遵循 RED → GREEN → REFACTOR；每个任务单独提交。

---

## Planned File Map

```text
src/app/
├── (dashboard)/
│   ├── layout.tsx                  # 五页面共享应用框架
│   ├── loading.tsx                 # 共享稳定加载状态
│   ├── error.tsx                   # 共享框架内的可恢复错误状态
│   ├── page.tsx                    # 月度复盘
│   ├── records/page.tsx            # 月度记录
│   ├── portfolio/page.tsx          # 投资组合
│   ├── trends/page.tsx             # 历史趋势
│   └── data/page.tsx               # 数据安全
├── app-shell.tsx                   # 侧栏与主内容几何结构
├── app-sidebar.tsx                 # 读取 pathname/search params 的客户端导航
├── app-sidebar.test.tsx
├── design-system.test.ts
├── error.tsx
├── globals.css
├── layout.tsx                      # 仅保留根 html/body/metadata
├── route-states.test.ts
└── page.tsx                        # 删除，首页移入 route group

src/features/monthly-snapshots/
├── month-routing.ts                # 月份解析与跨页 href 纯函数
├── month-routing.test.ts
├── month-switcher.tsx              # 页面级月份切换器
├── month-switcher.test.tsx
├── review-dashboard.tsx            # 方案 1 首页内容
├── review-dashboard.test.tsx
├── records-page.tsx                # 记录页服务端展示组合
├── records-page.test.tsx
├── portfolio-page.tsx              # 投资组合完整页面内容
├── portfolio-page.test.tsx
├── monthly-history.tsx             # 趋势页与数据表
├── monthly-history.test.tsx
├── monthly-review.tsx              # 完成迁移后删除
├── monthly-entry-trigger.tsx       # 路由替代事件后删除
├── monthly-snapshot-form.tsx       # 改为页面内常驻表单
├── monthly-record-actions.tsx      # 删除成功后路由回流
├── monthly-trend-charts.tsx        # 增加单图摘要模式并保留完整模式
├── investment-allocation.tsx       # 复盘摘要与完整配置共享
├── data-safety-panel.tsx           # 迁入 /data，恢复成功回首页
└── actions.ts                      # 重验证五个页面

audit/v2-multi-page-final-2026-08-28/
├── 01-review-1440.png
├── 02-records-1440.png
├── 03-portfolio-1440.png
├── 04-trends-1440.png
├── 05-data-1440.png
├── 06-review-1280.png
├── 07-review-1920.png
└── report.md
```

---

### Task 1: Month-Aware Navigation Primitives

**Files:**

- Create: `src/features/monthly-snapshots/month-routing.ts`
- Create: `src/features/monthly-snapshots/month-routing.test.ts`
- Create: `src/features/monthly-snapshots/month-switcher.tsx`
- Create: `src/features/monthly-snapshots/month-switcher.test.tsx`
- Modify: `src/features/monthly-snapshots/form-data.ts`

**Interfaces:**

- Consumes: existing `resolveSelectedMonth(requestedMonth: string | undefined, fallbackMonth: string): string` and `shiftMonth(month: string, amount: number): string` from `form-data.ts`.
- Produces:

```ts
export type MonthAwarePath = "/" | "/records" | "/portfolio" | "/trends";
export type MonthQuery = { month?: string | string[] };
export function currentMonth(now?: Date): string;
export function resolveMonthQuery(query: MonthQuery, fallback: string): string;
export function monthHref(path: MonthAwarePath, month: string): string;
export function MonthSwitcher(props: {
  month: string;
  pathname: MonthAwarePath;
}): React.JSX.Element;
```

- `MonthSwitcher` is a Server Component and must not import `next/navigation`.

- [ ] **Step 1: Write failing month-routing tests**

```ts
import { describe, expect, it } from "vitest";

import {
  currentMonth,
  monthHref,
  resolveMonthQuery,
} from "@/features/monthly-snapshots/month-routing";

describe("month routing", () => {
  it("resolves one string month and rejects array input", () => {
    expect(resolveMonthQuery({ month: "2026-08" }, "2026-07")).toBe("2026-08");
    expect(resolveMonthQuery({ month: ["2026-08"] }, "2026-07")).toBe(
      "2026-07",
    );
  });

  it("builds month-aware business links", () => {
    expect(monthHref("/portfolio", "2026-08")).toBe("/portfolio?month=2026-08");
  });

  it("derives the natural month from an injected date", () => {
    expect(currentMonth(new Date(2026, 7, 28))).toBe("2026-08");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/monthly-snapshots/month-routing.test.ts`

Expected: FAIL because `month-routing.ts` does not exist.

- [ ] **Step 3: Implement the pure routing helpers**

```ts
import { resolveSelectedMonth } from "@/features/monthly-snapshots/form-data";

export type MonthAwarePath = "/" | "/records" | "/portfolio" | "/trends";
export type MonthQuery = { month?: string | string[] };

export function currentMonth(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function resolveMonthQuery(query: MonthQuery, fallback: string) {
  return resolveSelectedMonth(
    typeof query.month === "string" ? query.month : undefined,
    fallback,
  );
}

export function monthHref(path: MonthAwarePath, month: string) {
  return `${path}?month=${encodeURIComponent(month)}`;
}
```

- [ ] **Step 4: Write the failing MonthSwitcher markup test**

```tsx
const markup = renderToStaticMarkup(
  createElement(MonthSwitcher, {
    month: "2026-08",
    pathname: "/portfolio",
  }),
);

expect(markup).toContain('href="/portfolio?month=2026-07"');
expect(markup).toContain('href="/portfolio?month=2026-09"');
expect(markup).toContain('<time dateTime="2026-08">2026-08</time>');
```

- [ ] **Step 5: Run the MonthSwitcher test and verify RED**

Run: `npm test -- src/features/monthly-snapshots/month-switcher.test.tsx`

Expected: FAIL because `MonthSwitcher` is not exported.

- [ ] **Step 6: Implement MonthSwitcher using Link and shiftMonth**

```tsx
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
```

- [ ] **Step 7: Run focused and existing form-data tests**

Run: `npm test -- src/features/monthly-snapshots/month-routing.test.ts src/features/monthly-snapshots/month-switcher.test.tsx src/features/monthly-snapshots/form-data.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

```bash
git add src/features/monthly-snapshots/month-routing.ts src/features/monthly-snapshots/month-routing.test.ts src/features/monthly-snapshots/month-switcher.tsx src/features/monthly-snapshots/month-switcher.test.tsx src/features/monthly-snapshots/form-data.ts
git commit -m "feat: add month-aware page navigation"
```

---

### Task 2: Shared Multi-Page App Shell

**Files:**

- Create: `src/app/app-shell.tsx`
- Create: `src/app/app-sidebar.tsx`
- Create: `src/app/app-sidebar.test.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/page.tsx`
- Create: `src/app/(dashboard)/records/page.tsx`
- Create: `src/app/(dashboard)/portfolio/page.tsx`
- Create: `src/app/(dashboard)/trends/page.tsx`
- Create: `src/app/(dashboard)/data/page.tsx`
- Delete: `src/app/page.tsx`
- Delete: `src/app/app-header.tsx`
- Modify: `src/app/app-header.test.tsx`
- Modify: `src/app/layout.test.ts`

**Interfaces:**

- Consumes: `monthHref(path, month)` from Task 1 and Next.js `usePathname()` / `useSearchParams()` in the sidebar only.
- Produces:

```ts
export const PRIMARY_NAV_ITEMS: ReadonlyArray<{
  href: MonthAwarePath;
  label: "月度复盘" | "月度记录" | "投资组合" | "历史趋势";
}>;
export function AppSidebar(): React.JSX.Element;
export function AppShell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element;
```

- The nested `(dashboard)/layout.tsx` renders `<AppShell>{children}</AppShell>` and does not contain `<html>` or `<body>`.
- Initial route pages may render their final page heading plus a short neutral loading-safe description; each is replaced by its real page in Tasks 4–8.

- [ ] **Step 1: Replace the obsolete header test with failing shell/sidebar tests**

```tsx
vi.mock("next/navigation", () => ({
  usePathname: () => "/portfolio",
  useSearchParams: () => new URLSearchParams("month=2026-08"),
}));

const markup = renderToStaticMarkup(createElement(AppSidebar));
expect(markup).toContain("Gold-Finger");
expect(markup).toContain("月度财务复盘");
expect(markup).toContain('href="/?month=2026-08"');
expect(markup).toContain('href="/portfolio?month=2026-08"');
expect(markup).toContain('aria-current="page"');
expect(markup).toContain('href="/data"');
expect(markup).not.toContain("资产管理");
expect(markup).not.toContain("设置中心");
```

- [ ] **Step 2: Run sidebar tests and verify RED**

Run: `npm test -- src/app/app-sidebar.test.tsx src/app/app-header.test.tsx`

Expected: FAIL because `AppSidebar` and `AppShell` do not exist.

- [ ] **Step 3: Implement the client sidebar**

```tsx
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
```

- [ ] **Step 4: Implement AppShell with a Suspense fallback for useSearchParams**

```tsx
import { Suspense, type ReactNode } from "react";

import { AppSidebar } from "@/app/app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Suspense fallback={<aside aria-hidden="true" className="app-sidebar" />}>
        <AppSidebar />
      </Suspense>
      <main className="app-main">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Move the current home page into the route group and add real route entries**

Create `(dashboard)/layout.tsx` with `AppShell`. Move the current `src/app/page.tsx` implementation to `(dashboard)/page.tsx` without changing its data behavior yet. Create the four new page files with final `<h1>` values `月度记录`、`投资组合`、`历史趋势`、`数据安全`, and remove `AppHeader` usage because the shared sidebar now owns product identity.

- [ ] **Step 6: Add route-structure assertions**

```ts
const routes = [
  "src/app/(dashboard)/page.tsx",
  "src/app/(dashboard)/records/page.tsx",
  "src/app/(dashboard)/portfolio/page.tsx",
  "src/app/(dashboard)/trends/page.tsx",
  "src/app/(dashboard)/data/page.tsx",
];
for (const route of routes) expect(existsSync(route)).toBe(true);
expect(existsSync("src/app/page.tsx")).toBe(false);
```

- [ ] **Step 7: Run shell, layout, route-state and production build checks**

Run: `npm test -- src/app/app-sidebar.test.tsx src/app/layout.test.ts src/app/route-states.test.ts`

Expected: PASS.

Run: `npm run typecheck && npm run build`

Expected: PASS; routes `/`, `/records`, `/portfolio`, `/trends`, and `/data` appear in build output.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/app
git commit -m "feat: establish v2 multi-page app shell"
```

---

### Task 3: Ice Crystal Foundation And Shell Styling

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/app-sidebar.test.tsx`

**Interfaces:**

- Consumes: `.app-shell`, `.app-sidebar`, `.app-main`, `.sidebar-brand`, `.sidebar-utilities` from Task 2.
- Produces the required token roles:

```css
--bg-base
--ambient-blue
--ambient-violet
--ambient-mint
--surface-base
--surface-frosted
--surface-liquid
--border-soft
--border-glass
--border-frosted-secondary
--text-primary
--text-secondary
--text-muted
--positive
--negative
--shadow-card
--shadow-floating
--blur-frosted
--blur-liquid
```

- [ ] **Step 1: Rewrite the design-system test for the approved tokens and constraints**

```ts
expect(css).toContain("--bg-base: #f3f7fb");
expect(css).toContain("--ambient-blue: rgb(174 213 235 / 22%)");
expect(css).toContain("--surface-base: rgb(255 255 255 / 36%)");
expect(css).toContain("--surface-frosted: rgb(255 255 255 / 62%)");
expect(css).toContain("--surface-liquid: rgb(255 255 255 / 68%)");
expect(css).toContain("--text-primary: #182531");
expect(css).toContain("--positive: #477a69");
expect(css).toContain("--negative: #9a625e");
expect(css).toContain("--blur-frosted: 24px");
expect(css).toContain("--blur-liquid: 30px");
expect(css).toContain("@supports not ((backdrop-filter: blur(1px))");
expect(css).toContain("@media (prefers-reduced-motion: reduce)");
expect(css).not.toMatch(/filter:\s*drop-shadow\([^)]*#[0-9a-f]{6}/i);
```

- [ ] **Step 2: Run the design-system test and verify RED**

Run: `npm test -- src/app/design-system.test.ts`

Expected: FAIL against V1 palette and surface tokens.

- [ ] **Step 3: Establish the Ice Crystal token block and ambient background**

Use the exact token values from the spec. Apply the three radial gradients to `body` and ensure the fallback base is last. Add shared utility classes `.surface-base`, `.surface-frosted`, and `.surface-liquid`; only Frosted and Liquid set both standard and WebKit backdrop filters.

```css
.surface-frosted {
  background: var(--surface-frosted-fallback);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-card);
}

@supports (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .surface-frosted {
    background: var(--surface-frosted);
    backdrop-filter: blur(var(--blur-frosted)) saturate(115%);
    -webkit-backdrop-filter: blur(var(--blur-frosted)) saturate(115%);
  }
}
```

- [ ] **Step 4: Style the fixed desktop shell and text sidebar**

Use a 210px sticky sidebar and `minmax(0, 1fr)` main column. Keep the sidebar surface lighter than content Frosted cards. Provide 40px minimum nav targets, `aria-current` styling, visible focus, top brand, bottom utility group and no responsive hamburger behavior.

- [ ] **Step 5: Add numeric typography and motion boundaries**

```css
.financial-number,
.metric-card dd,
.asset-summary-card dd,
.history-table td {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

@media (prefers-reduced-motion: reduce) {
  .app-shell *,
  .app-shell *::before,
  .app-shell *::after {
    scroll-behavior: auto;
    transition-duration: 0.01ms;
  }
}
```

- [ ] **Step 6: Run focused tests and formatting**

Run: `npm test -- src/app/design-system.test.ts src/app/app-sidebar.test.tsx && npm run format:check && npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/app/globals.css src/app/design-system.test.ts src/app/app-sidebar.test.tsx
git commit -m "style: establish ice crystal application shell"
```

---

### Task 4: Dedicated Monthly Records Page

**Files:**

- Create: `src/features/monthly-snapshots/records-page.tsx`
- Create: `src/features/monthly-snapshots/records-page.test.tsx`
- Modify: `src/app/(dashboard)/records/page.tsx`
- Modify: `src/features/monthly-snapshots/monthly-snapshot-form.tsx`
- Modify: `src/features/monthly-snapshots/monthly-record-actions.tsx`
- Modify: `src/features/monthly-snapshots/actions.ts`
- Modify: `src/features/monthly-snapshots/monthly-review.test.ts`
- Delete: `src/features/monthly-snapshots/monthly-entry-trigger.tsx`

**Interfaces:**

- Consumes: `loadMonthlyEntry(month)`, `MonthSwitcher`, `monthHref`, `saveMonthlySnapshotAction`, `deleteMonthlySnapshotAction`.
- Produces:

```ts
export function RecordsPageView(props: {
  month: string;
  snapshot: MonthlySnapshot | null;
  initialFunds: ReadonlyArray<MonthlySnapshotFormFund>;
  categories: ReadonlyArray<MonthlySnapshotCategoryOption>;
}): React.JSX.Element;

export type MonthlySnapshotFormFund = {
  name: string;
  category: string;
  marketValueCents: number | null;
  monthlyInvestmentCents: number;
};

export type MonthlySnapshotCategoryOption = {
  id: string;
  assetClass: string;
  market?: string;
  label: string;
};

export function MonthlySnapshotForm(
  props: ExistingProps & {
    successHref: string;
  },
): React.JSX.Element;

export function MonthlyRecordActions(props: {
  month: string;
  successHref: string;
}): React.JSX.Element;
```

- The form is visible on page load; no collapsed entry trigger or global custom event remains.

- [ ] **Step 1: Write failing records-page and form behavior tests**

```tsx
expect(markup).toContain("月度记录");
expect(markup).toContain("本月现金流");
expect(markup).toContain("现金资产");
expect(markup).toContain("基金资产");
expect(markup).toContain("负债");
expect(markup).toContain('id="monthly-entry-form"');
expect(markup).not.toContain('hidden=""');
expect(markup).not.toContain("gold-finger:open-monthly-entry");
```

Add a Testing Library test that mocks `next/navigation` and asserts `router.replace("/?month=2026-08")` after a mocked successful action state.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/features/monthly-snapshots/records-page.test.tsx src/features/monthly-snapshots/monthly-review.test.ts`

Expected: FAIL because `RecordsPageView` does not exist and the form is still collapsed.

- [ ] **Step 3: Create the records route Server Component**

```tsx
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
```

- [ ] **Step 4: Convert MonthlySnapshotForm to a page-owned form**

Export `MonthlySnapshotFormFund` and `MonthlySnapshotCategoryOption` with the exact shapes above. Remove `isOpen`, `OPEN_MONTHLY_ENTRY_EVENT`, toggle markup and success focus back to `review-title`. Keep error focus, error summary, fund row state and zero confirmation. Add `useRouter`; on `state.status === "success"`, call `router.replace(successHref)` followed by `router.refresh()`.

- [ ] **Step 5: Route delete success back to the empty review**

Add `successHref` to `MonthlyRecordActions`; when the delete action state becomes success, call `router.replace(successHref)` and `router.refresh()`. Keep the existing explicit irreversible confirmation and all error messages.

- [ ] **Step 6: Revalidate every read route after mutations**

```ts
const MONTHLY_READ_PATHS = ["/", "/records", "/portfolio", "/trends"] as const;

function revalidateMonthlyPages() {
  for (const path of MONTHLY_READ_PATHS) revalidatePath(path);
}
```

Call the helper only after successful save or delete. Do not redirect inside the action because form validation and confirmation states must still return through `useActionState`.

- [ ] **Step 7: Remove the event trigger and update existing review tests**

Delete `monthly-entry-trigger.tsx`, remove its imports and replace dashboard action expectations with real `/records?month=...` links. Confirm `rg 'OPEN_MONTHLY_ENTRY_EVENT|gold-finger:open-monthly-entry' src` returns no matches.

- [ ] **Step 8: Run records, save and delete suites**

Run: `npm test -- src/features/monthly-snapshots/records-page.test.tsx src/features/monthly-snapshots/form-model.test.ts src/features/monthly-snapshots/form-data.test.ts src/features/monthly-snapshots/save.test.ts src/features/monthly-snapshots/delete.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit Task 4**

```bash
git add src/app/'(dashboard)'/records/page.tsx src/features/monthly-snapshots
git commit -m "feat: move monthly editing to records page"
```

---

### Task 5: Option 1 Monthly Review Dashboard

**Files:**

- Create: `src/features/monthly-snapshots/review-dashboard.tsx`
- Create: `src/features/monthly-snapshots/review-dashboard.test.tsx`
- Modify: `src/app/(dashboard)/page.tsx`
- Modify: `src/features/monthly-snapshots/monthly-trend-charts.tsx`
- Modify: `src/features/monthly-snapshots/monthly-trend-charts.test.ts`
- Modify: `src/features/monthly-snapshots/investment-allocation.tsx`
- Modify: `src/features/monthly-snapshots/investment-allocation.test.ts`
- Modify: `src/app/globals.css`
- Delete: `src/features/monthly-snapshots/monthly-review.tsx`
- Delete: `src/features/monthly-snapshots/monthly-review.test.ts`

**Interfaces:**

- Consumes: `calculateMonthlyReview`, `calculateMonthlyConsistency`, `calculateInvestmentAllocation`, `calculateMonthlyTrend`, `MonthSwitcher`, `monthHref`, `MonthlySnapshot`.
- Produces:

```ts
export function ReviewDashboard(props: {
  month: string;
  snapshot: MonthlySnapshot | null;
  previousSnapshot: MonthlySnapshot | null;
  historySnapshots: ReadonlyArray<MonthlySnapshot>;
  categories: ReadonlyArray<ReviewCategoryOption>;
}): React.JSX.Element;

export type ReviewCategoryOption = {
  id: InvestmentCategoryId;
  assetClass: "权益类" | "固定收益类" | "其他资产";
  market?: string;
  label: string;
};

export function MonthlyTrendPreview(props: {
  points: ReadonlyArray<SerializableMonthlyTrendPoint>;
}): React.JSX.Element;

export function AssetAllocation(
  props: ExistingProps & {
    density?: "summary" | "full";
  },
): React.JSX.Element;
```

- [ ] **Step 1: Write failing dashboard hierarchy tests**

```tsx
expect(markup).toContain("当前净资产");
expect(markup).toContain("现金");
expect(markup).toContain("投资");
expect(markup).toContain("负债");
expect(markup).toContain("收入");
expect(markup).toContain("支出");
expect(markup).toContain("投资净投入");
expect(markup).toContain("投资损益");
expect(markup).toContain("月度结余");
expect(markup).toContain('href="/records?month=2026-08"');
expect(markup).toContain('href="/trends?month=2026-08"');
expect(markup).toContain('href="/portfolio?month=2026-08"');
expect(markup).not.toContain("删除本月");
```

Also assert DOM order: toolbar → status card → five-metric strip → analysis grid.

- [ ] **Step 2: Run dashboard tests and verify RED**

Run: `npm test -- src/features/monthly-snapshots/review-dashboard.test.tsx`

Expected: FAIL because `ReviewDashboard` does not exist.

- [ ] **Step 3: Implement the empty and populated dashboard states**

The populated dashboard must calculate one `review` value and render exactly five cash-flow metrics. The empty state uses the same page toolbar and status-card geometry, displays `—` for net worth, and links `新建数据` to `/records?month=...`.

```tsx
<dl className="monthly-flow-strip surface-frosted">
  <Metric label="收入" value={formatMoney(review.cashFlow.incomeCents)} />
  <Metric label="支出" value={formatMoney(review.cashFlow.expenseCents)} />
  <Metric
    label="投资净投入"
    value={formatMoney(review.cashFlow.investmentContributionCents)}
  />
  <Metric
    label="投资损益"
    value={formatDelta(review.cashFlow.investmentProfitLossCents)}
  />
  <Metric label="月度结余" value={formatDelta(review.cashFlow.balanceCents)} />
</dl>
```

- [ ] **Step 4: Add a single-chart dashboard preview**

Refactor the existing internal `LineChart` so `MonthlyTrendPreview` can reuse it. The preview initially shows asset change and switches between `资产变化` and `收支变化`; it must never render both full charts simultaneously.

- [ ] **Step 5: Add summary density to AssetAllocation**

In `summary` density, show the allocation bar, legend and only the first useful hierarchy levels that fit the dashboard container, plus a real link to the portfolio page. In `full` density preserve all existing expansion behavior and percentages.

- [ ] **Step 6: Style the approved Option 1 geometry and Ice Crystal surfaces**

- Status card: strongest Frosted Surface with the exact specified inner highlight and `0 14px 45px rgb(65 95 120 / 6%)` shadow.
- Monthly flow: one five-column Frosted container; no nested metric cards.
- Analysis: 45:55 grid, trend on left, allocation on right.
- Controls: Liquid Surface; content rows: Base Surface/transparent.
- No permanent delete action, no decorative hero illustration, no changed control dimensions.

- [ ] **Step 7: Wire the home route to ReviewDashboard**

Keep the existing six-month filter and previous-snapshot calculation in the Server Component. Pass serializable/model data into the dashboard; do not import database modules into client chart components.

- [ ] **Step 8: Run dashboard, chart, allocation and model tests**

Run: `npm test -- src/features/monthly-snapshots/review-dashboard.test.tsx src/features/monthly-snapshots/monthly-trend-charts.test.ts src/features/monthly-snapshots/investment-allocation.test.ts src/features/monthly-snapshots/review-model.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit Task 5**

```bash
git add src/app/'(dashboard)'/page.tsx src/app/globals.css src/features/monthly-snapshots
git commit -m "feat: build v2 monthly review dashboard"
```

---

### Task 6: Full Investment Portfolio Page

**Files:**

- Create: `src/features/monthly-snapshots/portfolio-page.tsx`
- Create: `src/features/monthly-snapshots/portfolio-page.test.tsx`
- Modify: `src/app/(dashboard)/portfolio/page.tsx`
- Modify: `src/features/monthly-snapshots/investment-allocation.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: `loadMonthlyEntry`, `calculateMonthlyReview`, `calculateInvestmentAllocation`, `AssetAllocation density="full"`, `MonthSwitcher`, `monthHref`.
- Produces:

```ts
export function PortfolioPageView(props: {
  month: string;
  snapshot: MonthlySnapshot | null;
  categories: ReadonlyArray<PortfolioCategoryOption>;
}): React.JSX.Element;

export type PortfolioCategoryOption = {
  id: InvestmentCategoryId;
  assetClass: "权益类" | "固定收益类" | "其他资产";
  market?: string;
  label: string;
};
```

- [ ] **Step 1: Write failing portfolio page tests**

```tsx
expect(markup).toContain("投资组合");
expect(markup).toContain("当前投资市值");
expect(markup).toContain("本月净投入");
expect(markup).toContain("资产配置");
expect(markup).toContain("股票");
expect(markup).toContain("美国市场");
expect(markup).toContain("纳斯达克100");
expect(markup).toContain('href="/records?month=2026-08"');
```

For an empty snapshot, assert the hierarchy is absent and the record-entry link is present.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/monthly-snapshots/portfolio-page.test.tsx`

Expected: FAIL because `PortfolioPageView` does not exist.

- [ ] **Step 3: Implement the portfolio Server Component route and view**

Resolve the month from search params, load the snapshot/categories, calculate the same allocation model used on the dashboard, and render a read-only page. Show cash, investment, liability, investment profit/loss, total investment market value and total monthly contribution without adding edit controls. Below the allocation hierarchy, render one read-only holdings table from `snapshot.funds` with columns `基金名称`、`固定分类`、`当前市值`、`本月净投入`; this is where individual fund values remain visible without creating a second editor.

- [ ] **Step 4: Preserve row semantics and avoid nested glass**

The allocation outer container uses `.surface-frosted`. `.allocation-row` remains transparent, has horizontal dividers, no shadow, no backdrop filter and a hover background of `rgb(255 255 255 / 34%)`. Keep disclosure buttons, total percentages and parent percentages keyboard accessible.

- [ ] **Step 5: Run portfolio, allocation and model tests**

Run: `npm test -- src/features/monthly-snapshots/portfolio-page.test.tsx src/features/monthly-snapshots/investment-allocation.test.ts src/features/monthly-snapshots/review-model.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 6**

```bash
git add src/app/'(dashboard)'/portfolio/page.tsx src/features/monthly-snapshots/portfolio-page.tsx src/features/monthly-snapshots/portfolio-page.test.tsx src/features/monthly-snapshots/investment-allocation.tsx src/app/globals.css
git commit -m "feat: add investment portfolio page"
```

---

### Task 7: Full Historical Trends Page

**Files:**

- Create: `src/features/monthly-snapshots/monthly-history.tsx`
- Create: `src/features/monthly-snapshots/monthly-history.test.tsx`
- Modify: `src/app/(dashboard)/trends/page.tsx`
- Modify: `src/features/monthly-snapshots/monthly-trend-charts.tsx`
- Modify: `src/features/monthly-snapshots/monthly-trend-charts.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: `loadMonthlyEntry`, `calculateMonthlyTrend`, `MonthlyTrendCharts`, `MonthSwitcher`.
- Produces:

```ts
export function MonthlyHistory(props: {
  month: string;
  snapshots: ReadonlyArray<MonthlySnapshot>;
}): React.JSX.Element;
```

- [ ] **Step 1: Write failing history page tests**

```tsx
expect(markup).toContain("历史趋势");
expect(markup).toContain("资产变化");
expect(markup).toContain("收支变化");
expect(markup).toContain("2026-08");
expect(markup).toContain("月度财务趋势数据表");
expect(markup).toContain("月度结余");
```

Add a window test proving snapshots after the selected end month are excluded and at most six months are passed to the chart.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/features/monthly-snapshots/monthly-history.test.tsx`

Expected: FAIL because the page-owned `MonthlyHistory` does not exist.

- [ ] **Step 3: Move history markup into its own feature component**

Preserve mathematical signs and business color direction from the existing table. Keep the exact columns: month, net worth, income, expense, monthly balance, cash, investment and liability. Refactor `MonthlyTrendCharts` so its `资产变化 / 收支变化` segmented control displays exactly one chart at a time on the full trends page as well as the dashboard preview. The empty state links to `/records?month=...`.

- [ ] **Step 4: Implement the trends Server Component route**

Resolve the end month, load all snapshots, filter from `shiftMonth(month, -5)` through `month`, and pass the filtered list to `MonthlyHistory`.

- [ ] **Step 5: Apply low-glass chart styling**

- Chart region uses Base Surface or transparent background and no backdrop filter.
- Grid lines use `rgb(80 110 130 / 10%)`.
- Axis text uses `var(--text-muted)`.
- Lines use low-saturation steel/slate/sage roles.
- Tooltip alone uses Liquid Surface with 28px blur and `0 10px 30px rgb(60 90 110 / 8%)`.
- Data nodes keep 40px hit targets and no glow.

- [ ] **Step 6: Run history, chart and review-model tests**

Run: `npm test -- src/features/monthly-snapshots/monthly-history.test.tsx src/features/monthly-snapshots/monthly-trend-charts.test.ts src/features/monthly-snapshots/trend-chart-model.test.ts src/features/monthly-snapshots/review-model.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 7**

```bash
git add src/app/'(dashboard)'/trends/page.tsx src/features/monthly-snapshots/monthly-history.tsx src/features/monthly-snapshots/monthly-history.test.tsx src/features/monthly-snapshots/monthly-trend-charts.tsx src/features/monthly-snapshots/monthly-trend-charts.test.ts src/app/globals.css
git commit -m "feat: add historical trends page"
```

---

### Task 8: Dedicated Data Safety Page

**Files:**

- Modify: `src/app/(dashboard)/data/page.tsx`
- Modify: `src/features/monthly-snapshots/data-safety-panel.tsx`
- Modify: `src/features/monthly-snapshots/data-safety-panel.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: existing `/api/backup` GET/POST contract and `DataSafetyPanel` client logic.
- Produces:

```ts
export function DataSafetyPanel(props?: {
  restoreSuccessHref?: "/";
}): React.JSX.Element;
```

- [ ] **Step 1: Extend the data-safety test with route and recovery expectations**

```tsx
expect(markup).toContain("数据仅保存在这台电脑");
expect(markup).toContain("导出全部数据");
expect(markup).toContain("从备份恢复");
expect(markup).not.toContain("month=");
```

In a client interaction test, select a valid JSON `File`, click `恢复备份`, assert the confirmation text `这会永久替换当前全部月度记录`, then mock a successful restore response and assert `router.replace("/")` followed by `router.refresh()`.

- [ ] **Step 2: Run data-safety tests and verify RED**

Run: `npm test -- src/features/monthly-snapshots/data-safety-panel.test.ts`

Expected: FAIL on the new restore navigation expectation.

- [ ] **Step 3: Implement the dedicated route and restore navigation**

Render one page heading and `DataSafetyPanel restoreSuccessHref="/"`. Preserve file size checks, JSON validation, irreversible confirmation, current-data rollback and live-region messages. On success, navigate to `/` without a month query.

- [ ] **Step 4: Apply restrained data-safety surfaces**

Use one Frosted outer container with Base Surface internal groups. Export remains the primary action; restore stays secondary until confirmation, when the existing danger semantics appear. Do not apply backdrop filter to file rows or confirmation children.

- [ ] **Step 5: Run panel, API and backup tests**

Run: `npm test -- src/features/monthly-snapshots/data-safety-panel.test.ts src/app/api/backup/route.test.ts src/features/monthly-snapshots/backup.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 8**

```bash
git add src/app/'(dashboard)'/data/page.tsx src/features/monthly-snapshots/data-safety-panel.tsx src/features/monthly-snapshots/data-safety-panel.test.ts src/app/globals.css
git commit -m "feat: add local data safety page"
```

---

### Task 9: Route States, Accessibility And Surface Guardrails

**Files:**

- Create: `src/app/(dashboard)/loading.tsx`
- Create: `src/app/(dashboard)/error.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/route-states.test.ts`
- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: shared AppShell classes and final page class names from Tasks 2–8.
- Produces test-enforced invariants for route-state containment, focus visibility, reduced motion, fallback backgrounds and blur boundaries.

- [ ] **Step 1: Write failing route-state and CSS guardrail tests**

```ts
expect(loadingMarkup).toContain("正在载入");
expect(loadingMarkup).not.toContain("Gold-Finger"); // shared layout already owns identity
expect(dashboardErrorMarkup).toContain("暂时无法读取财务记录");
expect(dashboardErrorMarkup).toContain("重新载入");

expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid/);
expect(css).toMatch(/@supports not \(\(backdrop-filter:/);
expect(css).not.toMatch(/\.allocation-row\s*\{[^}]*backdrop-filter/s);
expect(css).not.toMatch(/\.trend-chart-canvas\s*\{[^}]*backdrop-filter/s);
expect(css).not.toMatch(/box-shadow:\s*0 20px 60px/s);
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/app/route-states.test.ts src/app/design-system.test.ts`

Expected: FAIL because loading/error still duplicate V1 product shell and final guardrails are absent.

- [ ] **Step 3: Implement loading and error states that cooperate with the shared layout**

The nested loading file renders only stable page-content placeholders. Create `(dashboard)/error.tsx` as a Client Component so the shared dashboard layout and sidebar remain visible around its recovery panel. Keep the existing database-safety explanation and reset button. Retain the root `src/app/error.tsx` as a minimal last-resort boundary for failures outside the dashboard group; it must not import the dashboard sidebar.

- [ ] **Step 4: Add final accessibility and performance CSS boundaries**

- `focus-visible` remains visible on ambient and frosted backgrounds.
- `@supports not` raises Frosted/Liquid fallback opacity to readable near-solid values.
- Allocation rows and chart canvases contain no backdrop filter.
- No shadow exceeds the spec roles.
- All interactive controls remain at least 40px tall.
- `@media (prefers-reduced-motion: reduce)` removes hover translation and active scaling.

- [ ] **Step 5: Run all route, shell, design and accessibility-focused tests**

Run: `npm test -- src/app/layout.test.ts src/app/app-sidebar.test.tsx src/app/route-states.test.ts src/app/design-system.test.ts src/features/monthly-snapshots/monthly-trend-charts.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 9**

```bash
git add src/app/'(dashboard)'/loading.tsx src/app/'(dashboard)'/error.tsx src/app/error.tsx src/app/route-states.test.ts src/app/design-system.test.ts src/app/globals.css
git commit -m "fix: harden v2 route states and accessibility"
```

---

### Task 10: Full Verification And Desktop Visual QA

**Files:**

- Create: `audit/v2-multi-page-final-2026-08-28/report.md`
- Create: `audit/v2-multi-page-final-2026-08-28/01-review-1440.png`
- Create: `audit/v2-multi-page-final-2026-08-28/02-records-1440.png`
- Create: `audit/v2-multi-page-final-2026-08-28/03-portfolio-1440.png`
- Create: `audit/v2-multi-page-final-2026-08-28/04-trends-1440.png`
- Create: `audit/v2-multi-page-final-2026-08-28/05-data-1440.png`
- Create: `audit/v2-multi-page-final-2026-08-28/06-review-1280.png`
- Create: `audit/v2-multi-page-final-2026-08-28/07-review-1920.png`
- Modify: only files required to fix defects found by the checks below.

**Interfaces:**

- Consumes: the complete V2 application and all automated tests.
- Produces: reproducible automated verification plus inspected browser evidence for all five pages and width boundaries.

- [ ] **Step 1: Run the complete regular check suite**

Run: `npm run format:check`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with no warnings.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm test`

Expected: all test files and tests PASS.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: PASS; build output contains `/`, `/records`, `/portfolio`, `/trends`, `/data`, `/api/backup`, and `/api/launcher`.

- [ ] **Step 3: Start the application with a test-safe database**

Use an explicit temporary SQLite path and `npm run dev`. Do not use or overwrite the user's real database. Record the exact command and path in the QA report.

- [ ] **Step 4: Verify the five-page workflow in the in-app Browser**

At 1440px width:

1. Open `/?month=2026-08`; confirm sidebar selection, current-status card, five metrics and 45:55 analysis grid.
2. Use `更新数据`; confirm `/records?month=2026-08`, form visibility, validation focus and save return.
3. Open `/portfolio?month=2026-08`; confirm full hierarchy and no editable fields.
4. Open `/trends?month=2026-08`; confirm both trend modes and data table.
5. Open `/data`; confirm no month query, export, file selection and restore confirmation.

Before every click, inspect the latest browser DOM. After each navigation or state change, capture and inspect the screenshot before accepting it.

- [ ] **Step 5: Verify width, zoom, fallback and motion boundaries**

- Capture review page at 1280 and 1920px.
- Inspect all specified acceptance widths: 1280, 1366, 1440, 1512, 1600, 1920px.
- Verify no horizontal overflow and stable sidebar/main proportions.
- Verify 125% and 200% browser zoom for readable text, reachable controls and no clipped financial numbers.
- Emulate `prefers-reduced-motion: reduce` and confirm no translation/scale animation.
- Disable `backdrop-filter` in browser styles and confirm Frosted/Liquid surfaces retain readable fallback opacity.

- [ ] **Step 6: Judge the Ice Crystal visual criteria**

Record PASS/FAIL for each statement:

- Ambient gradients cannot be recognized as colored circles at first glance.
- Page reads as clean finance UI before it reads as glass.
- Frosted cards are thin, light and low elevation.
- Liquid controls are stronger than content surfaces but do not become primary decoration.
- No purple-tech, Web3, Crypto, neon, glow or high-saturation gradient impression.
- Allocation rows and charts are data-first and free of nested blur.
- Text, amounts, labels, focus and business states remain clear.
- Scrolling shows no obvious blur-related performance degradation.

- [ ] **Step 7: Fix any defect and rerun the smallest relevant test plus full checks**

For each defect, first add or tighten a regression test when the issue is structural or behavioral. After the focused test passes, rerun `npm run check && npm run build`. Re-capture only the affected screenshots and re-inspect them.

- [ ] **Step 8: Write the QA report**

The report must list environment, temporary database path, tested URLs, viewport/zoom matrix, interaction results, accessibility limits, visual criteria results, performance observations, screenshot paths and exact command outcomes. It must clearly separate confirmed evidence from screenshot-only limitations.

- [ ] **Step 9: Commit Task 10**

```bash
git add audit/v2-multi-page-final-2026-08-28 src
git commit -m "test: verify v2 multi-page dashboard"
```

Do not create `v2.0.0`, merge, push or remove the worktree in this task. Those actions require explicit user approval after final review.

---

## Plan Completion Checklist

- [ ] Tasks 1–10 were executed in order with one commit per task.
- [ ] No production dependency or database migration was added.
- [ ] `rg 'OPEN_MONTHLY_ENTRY_EVENT|gold-finger:open-monthly-entry' src` returns no matches.
- [ ] `/data` links and redirects never include a month query.
- [ ] Only `/records` provides asset editing and deletion.
- [ ] Full checks and build pass after the final code change.
- [ ] All required screenshots exist and were visually inspected.
- [ ] The final QA report contains no unresolved failure.
- [ ] Branch remains `codex/v2-multi-page-dashboard`; no merge, push or V2 tag occurred.
