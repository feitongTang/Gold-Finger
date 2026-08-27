# Gold-Finger UI System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing multi-theme, card-heavy interface with the approved fixed Warm Editorial Finance design system while preserving every financial workflow and data behavior.

**Architecture:** Keep the current Next.js App Router server/client boundary: the async page remains responsible for loading snapshot data, pure TypeScript models continue to perform financial calculations, and interactive feature components remain client components. Remove the theme feature completely, add one shared static `AppHeader` for the page and route states, reorganize monthly review markup only where hierarchy requires it, and implement the remaining visual system through one semantic token layer in `globals.css` without new dependencies.

**Tech Stack:** Node.js 24, npm, Next.js 16.3 App Router, React 19.2, strict TypeScript, Tailwind CSS 4 global CSS, SQLite/Drizzle, Vitest 4, React server rendering utilities, Codex in-app Browser.

**Spec:** `docs/superpowers/specs/2026-08-26-ui-system-redesign-design.md`

## Global Constraints

- Product scope remains the local single-user monthly finance review MVP in `docs/product-scope.md`.
- Desktop-first acceptance widths are exactly 1280, 1366, 1440, 1512, 1600, and 1920px.
- Do not add mobile navigation, a hamburger menu, a drawer, bottom navigation, mobile-specific tables, or mobile-only components.
- Do not add a UI framework, font package, icon package, animation library, or any other dependency.
- Routes and client components must not contain SQL or import server database modules.
- Financial calculations remain pure TypeScript inside the monthly-snapshots feature.
- Preserve all current routes, Server Actions, database behavior, backup format, form validation, error focus, save success, delete confirmation, and restore confirmation.
- Use only the fixed Warm Editorial Finance theme; do not retain a compatibility theme provider or read the legacy `gold-finger-theme-v1` Local Storage key.
- Typography uses the existing system font stack and only weights 400, 500, and 600.
- Spacing uses only 4, 8, 12, 16, 24, 32, 48, 64, and 96px except existing chart geometry that is calculated in TypeScript.
- Before each production behavior or structural JSX change, write a focused failing test and watch it fail for the intended reason.
- CSS-only visual changes must preserve green semantic and calculation tests, then receive browser evidence at the task checkpoint.
- Before completion run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

---

## File Map

| File                                                       | Responsibility after redesign                                                                       |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/app/app-header.tsx`                                   | Shared non-interactive global header for the main page, loading state, and error state.             |
| `src/app/app-header.test.tsx`                              | Static semantic contract for the header and proof that no theme controls remain.                    |
| `src/app/layout.tsx`                                       | Minimal root HTML, metadata, and global CSS import; no theme bootstrap.                             |
| `src/app/layout.test.tsx`                                  | Static contract that root markup has no theme attribute or bootstrap script.                        |
| `src/app/page.tsx`                                         | Existing async data composition plus shared `AppHeader`; no theme import.                           |
| `src/app/loading.tsx`                                      | Calm route skeleton using the shared header and redesigned section rhythm.                          |
| `src/app/error.tsx`                                        | Calm route error state using the shared header and content container.                               |
| `src/app/route-states.test.tsx`                            | Static contracts for consistent loading and error surfaces.                                         |
| `src/app/globals.css`                                      | Single semantic token system and all desktop component/state styles.                                |
| `src/app/design-system.test.ts`                            | Exact fixed-token and legacy-theme-removal contract.                                                |
| `src/features/monthly-snapshots/monthly-review.tsx`        | Page-level month context, current summary, review details, trend section, and history table.        |
| `src/features/monthly-snapshots/monthly-review.test.ts`    | User-visible hierarchy, empty state, financial semantics, and history contracts.                    |
| `src/features/monthly-snapshots/investment-allocation.tsx` | Existing client-side allocation drilldown; behavior unchanged, visuals consumed from global tokens. |
| `src/features/monthly-snapshots/monthly-trend-charts.tsx`  | Existing interactive charts; behavior and geometry unchanged, visual classes restyled.              |
| `src/features/monthly-snapshots/monthly-snapshot-form.tsx` | Existing form behavior and content; only semantic class cleanup allowed when required by styling.   |
| `src/features/monthly-snapshots/data-safety-panel.tsx`     | Existing backup/restore behavior; layout hierarchy is changed through CSS, not state logic.         |
| `src/features/theme/*`                                     | Deleted completely in Task 1.                                                                       |

---

### Task 1: Remove Theme Switching and Establish the Shared Header

**Files:**

- Create: `src/app/app-header.tsx`
- Create: `src/app/app-header.test.tsx`
- Create: `src/app/layout.test.tsx`
- Modify: `src/app/layout.tsx:1-34`
- Modify: `src/app/page.tsx:1-73`
- Modify: `src/app/loading.tsx:1-36`
- Delete: `src/features/theme/theme-settings.tsx`
- Delete: `src/features/theme/theme.ts`
- Delete: `src/features/theme/theme.test.ts`

**Interfaces:**

- Produces: `AppHeader({ ariaHidden?: true }): ReactElement`, a synchronous non-client component used by `page.tsx`, `loading.tsx`, and later `error.tsx`.
- Preserves: `Home` async page props and every monthly feature prop exactly as they exist.

- [ ] **Step 1: Write failing header and layout tests**

Create `src/app/app-header.test.tsx`:

```tsx
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppHeader } from "@/app/app-header";

describe("AppHeader", () => {
  it("renders one quiet product identity without appearance controls", () => {
    const markup = renderToStaticMarkup(createElement(AppHeader));

    expect(markup).toContain("Gold-Finger");
    expect(markup).toContain("月度财务复盘");
    expect(markup).not.toContain("外观设置");
    expect(markup).not.toContain("<button");
  });

  it("can be hidden from assistive technology in route skeletons", () => {
    const markup = renderToStaticMarkup(
      createElement(AppHeader, { ariaHidden: true }),
    );

    expect(markup).toContain('aria-hidden="true"');
  });
});
```

Create `src/app/layout.test.tsx`:

```tsx
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("renders fixed product markup without theme bootstrap state", () => {
    const markup = renderToStaticMarkup(
      createElement(RootLayout, {
        children: createElement("main", null, "内容"),
      }),
    );

    expect(markup).toContain('<html lang="zh-CN">');
    expect(markup).not.toContain("data-theme");
    expect(markup).not.toContain("gold-finger-theme-v1");
    expect(markup).not.toContain("localStorage");
  });
});
```

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
npm test -- src/app/app-header.test.tsx src/app/layout.test.tsx
```

Expected: FAIL because `@/app/app-header` does not exist and the current layout still renders `data-theme`, the bootstrap script, and Local Storage logic.

- [ ] **Step 3: Implement the static header and minimal root layout**

Create `src/app/app-header.tsx`:

```tsx
export function AppHeader({ ariaHidden }: { ariaHidden?: true } = {}) {
  return (
    <header aria-hidden={ariaHidden} className="app-header">
      <div className="app-header-inner">
        <p className="brand">Gold-Finger</p>
        <span aria-hidden="true" className="header-divider" />
        <p className="header-context">月度财务复盘</p>
      </div>
    </header>
  );
}
```

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Gold-Finger",
  description: "个人月度财务复盘工具",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

In `src/app/page.tsx`, import `AppHeader`, remove the `ThemeSettings` import, and replace lines 43-50 with:

```tsx
<AppHeader />
```

In `src/app/loading.tsx`, import `AppHeader` and replace the existing header block with:

```tsx
<AppHeader ariaHidden />
```

Delete all three files under `src/features/theme/`.

- [ ] **Step 4: Verify GREEN and check for orphaned theme references**

Run:

```bash
npm test -- src/app/app-header.test.tsx src/app/layout.test.tsx
rg -n "ThemeSettings|THEME_STORAGE_KEY|data-theme|gold-finger-theme-v1|features/theme" src
```

Expected: both tests PASS; `rg` returns no matches.

- [ ] **Step 5: Run the complete regression suite**

Run:

```bash
npm test
```

Expected: all tests PASS with the theme test removed and the two new app tests added.

- [ ] **Step 6: Commit the isolated theme cleanup**

```bash
git add src/app/app-header.tsx src/app/app-header.test.tsx src/app/layout.tsx src/app/layout.test.tsx src/app/page.tsx src/app/loading.tsx src/features/theme
git commit -m "refactor: remove user theme switching"
```

---

### Task 2: Install the Fixed Semantic Token System and App Shell

**Files:**

- Create: `src/app/design-system.test.ts`
- Modify: `src/app/globals.css:1-432`

**Interfaces:**

- Produces: fixed CSS variables `--background-primary`, `--background-secondary`, `--surface-primary`, `--surface-subtle`, `--surface-elevated`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-inverse`, `--border-subtle`, `--border-strong`, `--accent-primary`, `--accent-hover`, `--accent-active`, `--accent-soft`, `--focus-ring`, `--success`, `--success-soft`, `--warning`, `--warning-soft`, `--error`, `--error-soft`, radius, shadow, spacing, and motion tokens.
- Consumes: `AppHeader` class names from Task 1.

- [ ] **Step 1: Write a failing fixed-token contract**

Create `src/app/design-system.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("fixed design system", () => {
  it("defines the approved Warm Editorial Finance tokens", () => {
    expect(css).toContain("--background-primary: #f5f2ec");
    expect(css).toContain("--surface-primary: #fbf9f5");
    expect(css).toContain("--text-primary: #26241f");
    expect(css).toContain("--accent-primary: #98473b");
    expect(css).toContain("--radius-control: 8px");
    expect(css).toContain("--motion-normal: 180ms");
  });

  it("contains no legacy theme branches or glass tokens", () => {
    expect(css).not.toMatch(/:root\[data-theme=/);
    expect(css).not.toContain("--glass-surface");
    expect(css).not.toContain("--background-glow-primary");
  });

  it("provides reduced-motion handling", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
```

- [ ] **Step 2: Run the token test and verify RED**

Run:

```bash
npm test -- src/app/design-system.test.ts
```

Expected: FAIL because the approved semantic tokens are absent and legacy theme/glass tokens remain.

- [ ] **Step 3: Replace the root theme branches with the fixed token block**

Keep `@import "tailwindcss";`, then make the only `:root` block start with:

```css
:root {
  color-scheme: light;
  --background-primary: #f5f2ec;
  --background-secondary: #eee9e1;
  --surface-primary: #fbf9f5;
  --surface-subtle: #f1ede6;
  --surface-elevated: #fffdfa;
  --text-primary: #26241f;
  --text-secondary: #625e55;
  --text-tertiary: #817b70;
  --text-inverse: #fffdfa;
  --border-subtle: rgb(38 36 31 / 11%);
  --border-strong: rgb(38 36 31 / 22%);
  --accent-primary: #98473b;
  --accent-hover: #81392f;
  --accent-active: #6c2f28;
  --accent-soft: #f3e5e1;
  --focus-ring: rgb(152 71 59 / 32%);
  --success: #35644d;
  --success-soft: #e8f0ea;
  --warning: #8a5b22;
  --warning-soft: #f5ecdc;
  --error: #a13d34;
  --error-soft: #f6e5e2;
  --radius-compact: 6px;
  --radius-control: 8px;
  --radius-panel: 12px;
  --radius-modal: 16px;
  --shadow-subtle: 0 1px 2px rgb(38 36 31 / 5%);
  --shadow-floating: 0 16px 40px rgb(38 36 31 / 10%);
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --motion-fast: 120ms;
  --motion-normal: 180ms;
  --motion-slow: 240ms;
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

Delete every `:root[data-theme=...]` block and every `.theme-*` selector. Replace the global shell rules with these exact dimensions and material rules:

```css
html {
  background: var(--background-secondary);
}

body {
  min-height: 100dvh;
  margin: 0;
  color: var(--text-primary);
  background: var(--background-primary);
  font-family:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Segoe UI",
    "Microsoft YaHei", system-ui, ui-sans-serif, sans-serif;
  font-variant-numeric: tabular-nums;
  text-rendering: optimizeLegibility;
}

:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.app-header {
  border-bottom: 1px solid var(--border-subtle);
  background: var(--background-primary);
}

.app-header-inner,
.page-content {
  width: min(calc(100% - 64px), 1184px);
  margin-inline: auto;
}

.app-header-inner {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: var(--space-4);
}

.brand {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.header-divider {
  width: 1px;
  height: 20px;
  background: var(--border-subtle);
}

.header-context {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.page-content {
  padding-block: var(--space-12) var(--space-24);
}
```

- [ ] **Step 4: Restyle shared buttons and form controls from semantic tokens**

Replace the conflicting legacy control declarations with:

```css
.primary-button,
.secondary-button,
.danger-button,
.retry-button {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: var(--radius-control);
  font-size: 14px;
  font-weight: 600;
  transition:
    color var(--motion-fast) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-standard);
}

.primary-button,
.retry-button {
  border: 1px solid var(--accent-primary);
  color: var(--text-inverse);
  background: var(--accent-primary);
  box-shadow: none;
}

.primary-button:hover:not(:disabled),
.retry-button:hover:not(:disabled) {
  border-color: var(--accent-hover);
  background: var(--accent-hover);
}

.secondary-button {
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  background: transparent;
  box-shadow: none;
}

.secondary-button:hover:not(:disabled) {
  border-color: var(--border-strong);
  background: var(--surface-subtle);
}

.danger-button {
  border: 1px solid var(--error);
  color: var(--text-inverse);
  background: var(--error);
  box-shadow: none;
}

.primary-button:active:not(:disabled),
.secondary-button:active:not(:disabled),
.danger-button:active:not(:disabled),
.retry-button:active:not(:disabled) {
  transform: scale(0.99);
}

.primary-button:disabled,
.secondary-button:disabled,
.danger-button:disabled,
.retry-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
  transform: none;
}

input,
select {
  min-height: 44px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-control);
  color: var(--text-primary);
  background: var(--surface-primary);
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    box-shadow var(--motion-fast) var(--ease-standard);
}

input:hover,
select:hover {
  border-color: var(--border-strong);
}

input:focus,
select:focus {
  border-color: var(--accent-primary);
  outline: 0;
  box-shadow: 0 0 0 3px var(--focus-ring);
}

input[aria-invalid="true"],
select[aria-invalid="true"] {
  border-color: var(--error);
}
```

Preserve the existing pending labels and disabled logic in JSX; remove any conflicting gradient, glow, or button-shadow declarations later in the file.

- [ ] **Step 5: Verify GREEN and run format/lint/type checks**

Run:

```bash
npm test -- src/app/design-system.test.ts src/app/app-header.test.tsx src/app/layout.test.tsx
npm run format:check
npm run lint
npm run typecheck
```

Expected: all commands PASS; no multi-theme or glass selector remains.

- [ ] **Step 6: Commit the fixed design foundation**

```bash
git add src/app/design-system.test.ts src/app/globals.css
git commit -m "refactor: establish fixed editorial design tokens"
```

---

### Task 3: Rebuild the Page-Level Month Context and Current Summary

**Files:**

- Modify: `src/features/monthly-snapshots/monthly-review.test.ts:63-120`
- Modify: `src/features/monthly-snapshots/monthly-review.tsx:65-220`
- Modify: `src/app/globals.css` monthly review selectors

**Interfaces:**

- Preserves: `MonthlyReview({ month, snapshot, previousSnapshot, categories })` signature.
- Preserves: `MonthlyEntryTrigger` behavior and `review-title` focus target used after successful save.
- Produces: page-level `.review-page-heading`, `.review-summary`, and `.review-summary-empty` hierarchy.

- [ ] **Step 1: Add failing hierarchy and empty-state tests**

Add these tests inside `describe("MonthlyReview")`:

```tsx
it("puts month navigation before the current net worth summary", () => {
  const markup = renderToStaticMarkup(
    createElement(MonthlyReview, {
      categories: INVESTMENT_CATEGORIES,
      month: "2026-07",
      previousSnapshot: snapshots[0],
      snapshot: snapshots[1],
    }),
  );

  expect(markup).toContain("2026 年 7 月");
  expect(markup).toContain("月度复盘");
  expect(markup).toContain('<h1 id="review-title"');
  expect(markup.indexOf("切换记录月份")).toBeLessThan(
    markup.indexOf("当前净资产"),
  );
  expect(markup).toContain('class="review-summary"');
});

it("renders a quiet empty summary without a decorative icon", () => {
  const markup = renderToStaticMarkup(
    createElement(MonthlyReview, {
      categories: INVESTMENT_CATEGORIES,
      month: "2026-08",
      snapshot: null,
    }),
  );

  expect(markup).toContain("暂无复盘结果");
  expect(markup).toContain("新建数据");
  expect(markup).not.toContain("review-empty-icon");
  expect(markup).not.toContain("<svg");
});
```

- [ ] **Step 2: Run the review test and verify RED**

Run:

```bash
npm test -- src/features/monthly-snapshots/monthly-review.test.ts
```

Expected: FAIL because month navigation currently follows the result heading, `.review-summary` is absent, and the empty state still contains an SVG icon.

- [ ] **Step 3: Move month context into a page heading**

Change `MonthSwitcher` only by keeping its current accessible labels and links. Replace the empty snapshot return with:

```tsx
return (
  <section
    aria-labelledby="review-title"
    className="review-panel review-panel-empty"
  >
    <header className="review-page-heading">
      <div>
        <p className="review-eyebrow">{formatMonth(month)}</p>
        <h1 id="review-title" tabIndex={-1}>
          月度复盘
        </h1>
      </div>
      <MonthSwitcher month={month} />
    </header>
    <div className="review-summary review-summary-empty">
      <div>
        <span>当前净资产</span>
        <strong aria-label="当前净资产尚未记录">—</strong>
      </div>
      <div className="review-empty-message">
        <h3>暂无复盘结果</h3>
        <p>新建这个月份的财务记录后，资金分配与资产结构会显示在这里。</p>
      </div>
      <MonthlyEntryTrigger label="新建数据" />
    </div>
  </section>
);
```

For the populated branch, replace the existing `.review-heading` and following `MonthSwitcher` with:

```tsx
<header className="review-page-heading">
  <div>
    <p className="review-eyebrow">{formatMonth(month)}</p>
    <h1 id="review-title" tabIndex={-1}>
      月度复盘
    </h1>
  </div>
  <MonthSwitcher month={month} />
</header>

<div className="review-summary">
  <div className="net-worth-summary">
    <span>当前净资产</span>
    <strong>{formatMoney(review.assets.netWorthCents)}</strong>
  </div>
  <div className="review-record-actions">
    <MonthlyEntryTrigger label="更新数据" />
    <MonthlyRecordActions month={month} />
  </div>
</div>
```

- [ ] **Step 4: Restyle the page heading and summary**

Use a 48px gap between the page heading and summary, a single `surface-primary` summary with `--radius-panel`, no nested shadows, Display 40/48/600 for net worth, and a 40×40px MonthSwitcher control. Remove the obsolete `.review-heading`, `.review-heading-actions`, `.review-empty-icon`, and glass-panel declarations.

- [ ] **Step 5: Verify GREEN and regressions**

Run:

```bash
npm test -- src/features/monthly-snapshots/monthly-review.test.ts
npm test
```

Expected: all tests PASS and all prior financial semantics remain present.

- [ ] **Step 6: Commit the current summary hierarchy**

```bash
git add src/features/monthly-snapshots/monthly-review.tsx src/features/monthly-snapshots/monthly-review.test.ts src/app/globals.css
git commit -m "refactor: clarify monthly review hierarchy"
```

---

### Task 4: Flatten Review Details, Allocation, and History Data

**Files:**

- Modify: `src/features/monthly-snapshots/monthly-review.test.ts`
- Modify: `src/features/monthly-snapshots/monthly-review.tsx:173-459`
- Modify: `src/app/globals.css` consistency, metric, asset, allocation, history, and table selectors

**Interfaces:**

- Preserves: every calculated amount, semantic positive/negative direction, allocation drilldown prop, chart point serialization, route link, and history table value.
- Produces: `.consistency-list`, `.consistency-item`, neutral metric rows, and border-light history table presentation.

- [ ] **Step 1: Replace class-fragile tests with user-visible review contracts**

Replace the test named `keeps the monthly balance card neutral while coloring a positive amount` with:

```tsx
it("shows cash flow values with mathematical signs and clear labels", () => {
  const markup = renderToStaticMarkup(
    createElement(MonthlyReview, {
      categories: INVESTMENT_CATEGORIES,
      month: "2026-07",
      previousSnapshot: snapshots[0],
      snapshot: snapshots[1],
    }),
  );

  expect(markup).toContain("资金分配");
  expect(markup).toContain("收入");
  expect(markup).toContain("支出");
  expect(markup).toContain("月度结余");
  expect(markup).toContain("+¥7,000.00");
  expect(markup).toContain('class="consistency-list"');
  expect(markup).not.toContain("consistency-card");
});
```

Update the history test name to `renders compact mathematical deltas without explanatory badges`, retain the current positive/negative text assertions, and add:

```tsx
expect(markup).not.toContain("较上次");
```

- [ ] **Step 2: Run the focused test and verify the intentionally changed assertion fails**

Run:

```bash
npm test -- src/features/monthly-snapshots/monthly-review.test.ts
```

Expected: FAIL because the current markup still uses `consistency-grid` and `consistency-card` instead of the approved flattened list structure.

- [ ] **Step 3: Replace card semantics with list/data semantics**

In both consistency items, rename `consistency-grid` to `consistency-list` and `consistency-card` to `consistency-item`. Keep the `dl`, `dt`, and `dd` content exactly unchanged. Keep metric and asset `dl` structures, but remove `metric-card-emphasis` from the balance item so emphasis comes only from its signed amount class.

- [ ] **Step 4: Restyle review details and allocation**

Replace conflicting consistency, metric, asset, allocation, and history rules with these structural declarations:

```css
.consistency-review {
  padding: var(--space-6);
  border: 0;
  border-radius: var(--radius-control);
  background: var(--surface-subtle);
  box-shadow: none;
}

.consistency-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: var(--space-6) 0 0;
}

.consistency-item {
  min-width: 0;
  padding-right: var(--space-6);
}

.consistency-item + .consistency-item {
  padding-right: 0;
  padding-left: var(--space-6);
  border-left: 1px solid var(--border-subtle);
}

.metric-grid,
.asset-summary-grid {
  display: grid;
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-control);
  background: transparent;
}

.metric-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.asset-summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card,
.asset-summary-card {
  min-width: 0;
  padding: var(--space-4);
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.metric-card + .metric-card,
.asset-summary-card + .asset-summary-card {
  border-left: 1px solid var(--border-subtle);
}

.asset-bar {
  height: 6px;
  border-radius: var(--radius-compact);
  background: var(--surface-subtle);
}

.allocation-drilldown {
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-control);
  background: transparent;
  box-shadow: none;
}

.allocation-row {
  min-height: 52px;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.allocation-list li + li {
  border-top: 1px solid var(--border-subtle);
}

.allocation-row-button:hover,
.allocation-row-button:focus-visible {
  background: var(--surface-subtle);
}

.history-table th,
.history-table td {
  border: 0;
  border-bottom: 1px solid var(--border-subtle);
  background: transparent;
}

.history-table thead th {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.history-table td {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
```

Use `--text-primary` for ordinary section titles and remove any Accent title rule overridden by these sections.

- [ ] **Step 5: Verify semantic and financial regression tests**

Run:

```bash
npm test -- src/features/monthly-snapshots/monthly-review.test.ts src/features/monthly-snapshots/review-model.test.ts src/features/monthly-snapshots/trend-chart-model.test.ts
npm test
```

Expected: all tests PASS with financial values unchanged.

- [ ] **Step 6: Commit the flattened review details**

```bash
git add src/features/monthly-snapshots/monthly-review.tsx src/features/monthly-snapshots/monthly-review.test.ts src/app/globals.css
git commit -m "refactor: flatten monthly review details"
```

---

### Task 5: Refine Trends and the Monthly Entry Experience

**Files:**

- Modify: `src/app/globals.css` trend, entry toggle, form, field, fund row, and action selectors
- Verify unchanged: `src/features/monthly-snapshots/monthly-trend-charts.tsx`
- Verify unchanged: `src/features/monthly-snapshots/monthly-snapshot-form.tsx`
- Test: `src/features/monthly-snapshots/trend-chart-model.test.ts`
- Test: `src/features/monthly-snapshots/form-model.test.ts`
- Test: `src/features/monthly-snapshots/save.test.ts`

**Interfaces:**

- Consumes: existing chart classes and form classes without changing client state.
- Preserves: chart geometry/toggles/tooltips, expandable data table, form open event, expression entry, fund add/remove, error focus, confirmation, submit, and success focus.

- [ ] **Step 1: Run the behavioral baseline for the components being restyled**

Run:

```bash
npm test -- src/features/monthly-snapshots/trend-chart-model.test.ts src/features/monthly-snapshots/form-model.test.ts src/features/monthly-snapshots/save.test.ts
```

Expected: all tests PASS before CSS changes. Stop and diagnose if they do not.

- [ ] **Step 2: Remove chart-card decoration while preserving chart affordances**

Replace conflicting chart-container rules with:

```css
.history-panel {
  margin-top: var(--space-16);
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.trend-chart-grid {
  display: grid;
  gap: var(--space-12);
}

.trend-chart-card {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.trend-chart-card + .trend-chart-card {
  padding-top: var(--space-12);
  border-top: 1px solid var(--border-subtle);
}

.trend-chart-gridline {
  stroke: var(--border-subtle);
}

.trend-chart-axis-label,
.trend-chart-caption p,
.trend-chart-legend {
  color: var(--text-secondary);
}

.trend-chart-toggle {
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--surface-subtle);
  box-shadow: none;
}
```

- [ ] **Step 3: Rebuild form rhythm through CSS**

Replace conflicting entry/form declarations with:

```css
.entry-toggle-panel {
  display: flex;
  margin-top: var(--space-16);
  padding: var(--space-8) 0 0;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-top: 1px solid var(--border-subtle);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.snapshot-form {
  margin-top: var(--space-6);
  padding: 0 var(--space-8);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-panel);
  background: var(--surface-primary);
  box-shadow: var(--shadow-subtle);
}

.entry-section {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: var(--space-4);
  padding-block: var(--space-12);
}

.entry-section:not(:last-of-type) {
  border-bottom: 1px solid var(--border-subtle);
}

.entry-section::before,
.entry-section:not(:last-of-type)::before {
  display: none;
  content: none;
}

.section-marker {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: var(--radius-compact);
  color: var(--accent-primary);
  background: var(--accent-soft);
  font-size: 12px;
  font-weight: 600;
}

.field-grid-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.fund-row {
  padding: var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-control);
  background: var(--surface-subtle);
  box-shadow: none;
}

.form-actions {
  display: flex;
  padding-block: var(--space-8);
  justify-content: flex-end;
  border-top: 1px solid var(--border-subtle);
}
```

- [ ] **Step 4: Verify no JSX or client behavior changed accidentally**

Run:

```bash
git diff -- src/features/monthly-snapshots/monthly-trend-charts.tsx src/features/monthly-snapshots/monthly-snapshot-form.tsx
npm test -- src/features/monthly-snapshots/trend-chart-model.test.ts src/features/monthly-snapshots/form-model.test.ts src/features/monthly-snapshots/save.test.ts
```

Expected: `git diff` prints nothing for both client components and all focused tests PASS.

- [ ] **Step 5: Commit trend and form styling**

```bash
git add src/app/globals.css
git commit -m "style: refine trends and monthly entry rhythm"
```

---

### Task 6: Clarify Data Safety and Complete Route States

**Files:**

- Create: `src/app/route-states.test.tsx`
- Modify: `src/app/error.tsx:1-19`
- Modify: `src/app/loading.tsx:1-36`
- Modify: `src/app/globals.css` data safety, status, loading, skeleton, and error selectors
- Verify unchanged behavior: `src/features/monthly-snapshots/data-safety-panel.tsx`

**Interfaces:**

- Consumes: `AppHeader` from Task 1.
- Preserves: backup download, file selection, size validation, restore confirmation, operation messages, router refresh, and destructive wording.
- Produces: consistent header and page-width structure for loading and error routes.

- [ ] **Step 1: Write failing route-state consistency tests**

Create `src/app/route-states.test.tsx`:

```tsx
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";
import Loading from "@/app/loading";

describe("route states", () => {
  it("keeps loading inside the product shell", () => {
    const markup = renderToStaticMarkup(createElement(Loading));

    expect(markup).toContain("Gold-Finger");
    expect(markup).toContain("正在载入月度记录");
    expect(markup).toContain("page-content");
  });

  it("keeps recoverable errors inside the product shell", () => {
    const markup = renderToStaticMarkup(
      createElement(ErrorPage, { reset: vi.fn() }),
    );

    expect(markup).toContain("Gold-Finger");
    expect(markup).toContain("暂时无法读取财务记录");
    expect(markup).toContain("重新载入");
  });
});
```

- [ ] **Step 2: Run the route-state test and verify RED**

Run:

```bash
npm test -- src/app/route-states.test.tsx
```

Expected: the error-state test FAILS because `ErrorPage` does not render `AppHeader`.

- [ ] **Step 3: Put the error state in the shared shell**

Import `AppHeader` into `src/app/error.tsx` and return:

```tsx
<div className="error-page">
  <AppHeader />
  <main className="error-shell">
    <section className="error-panel">
      <h1>暂时无法读取财务记录</h1>
      <p>
        本地数据库没有成功响应。请确认 DATABASE_FILE
        指向可读写的数据库文件，然后重新载入；已保存的数据不会被自动删除。
      </p>
      <button className="primary-button" onClick={reset} type="button">
        重新载入
      </button>
    </section>
  </main>
</div>
```

Keep `"use client"` as the first line.

- [ ] **Step 4: Restyle data safety and state surfaces**

Replace conflicting safety/state declarations with:

```css
.data-safety-panel {
  margin-top: var(--space-16);
  padding-top: var(--space-12);
  border-top: 1px solid var(--border-subtle);
  background: transparent;
}

.data-safety-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: var(--space-6);
}

.safety-card {
  padding: var(--space-6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-control);
  background: transparent;
  box-shadow: none;
}

.safety-card:first-child {
  background: var(--surface-primary);
}

.safety-card:last-child {
  color: var(--text-secondary);
  background: var(--surface-subtle);
}

.restore-confirmation,
.data-operation-message-error {
  border-color: color-mix(in srgb, var(--error) 24%, transparent);
  color: var(--error);
  background: var(--error-soft);
}

.skeleton {
  background: var(--background-secondary);
}

.error-shell {
  display: grid;
  width: min(calc(100% - 64px), 1184px);
  min-height: calc(100dvh - 64px);
  margin-inline: auto;
  place-items: center;
  padding-block: var(--space-16);
}

.error-panel {
  width: min(100%, 640px);
  padding: var(--space-8);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-panel);
  background: var(--surface-primary);
  box-shadow: var(--shadow-subtle);
}
```

- [ ] **Step 5: Verify route, backup, delete, and save behavior**

Run:

```bash
npm test -- src/app/route-states.test.tsx src/features/monthly-snapshots/backup.test.ts src/features/monthly-snapshots/delete.test.ts src/features/monthly-snapshots/save.test.ts src/app/api/backup/route.test.ts
npm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit data safety and route states**

```bash
git add src/app/error.tsx src/app/loading.tsx src/app/route-states.test.tsx src/app/globals.css
git commit -m "style: clarify safety and route states"
```

---

### Task 7: Run Static Consistency Review and Project Checks

**Files:**

- Modify only if checks expose a concrete defect: files already touched in Tasks 1-6

**Interfaces:**

- Produces: a clean buildable branch with no theme references, arbitrary legacy glass tokens, or formatting failures.

- [ ] **Step 1: Scan the completed source for forbidden legacy design patterns**

Run:

```bash
rg -n "ThemeSettings|THEME_STORAGE_KEY|data-theme|gold-finger-theme-v1|:root\[data-theme|glass|glow|linear-gradient|radial-gradient" src
```

Expected: no theme, glass, glow, or decorative gradient matches. If a chart gradient or semantic calculation string unexpectedly matches, inspect it and retain it only when it is not a decorative UI effect.

- [ ] **Step 2: Count structural visual primitives and inspect every remaining use**

Run:

```bash
rg -n "border-radius:|box-shadow:|background:" src/app/globals.css
```

Expected: every remaining radius, shadow, and background maps to a control, independent interactive surface, semantic state, or approved section surface. Delete any rule whose only purpose is filling empty space.

- [ ] **Step 3: Run all required project checks**

Run in this exact order:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: every command exits 0 with no warnings introduced by the redesign.

- [ ] **Step 4: Commit any check-driven fixes**

If Step 3 required changes:

```bash
git add src
git commit -m "fix: resolve UI consistency checks"
```

If no changes were required, do not create an empty commit.

---

### Task 8: Complete Desktop Browser QA and Final Visual Evidence

**Files:**

- Create: `audit/ui-redesign-final-2026-08-26/01-saved-month-1440.png`
- Create: `audit/ui-redesign-final-2026-08-26/02-empty-month-1440.png`
- Create: `audit/ui-redesign-final-2026-08-26/03-trends-1440.png`
- Create: `audit/ui-redesign-final-2026-08-26/04-entry-form-1440.png`
- Create: `audit/ui-redesign-final-2026-08-26/05-data-safety-1440.png`
- Create: `audit/ui-redesign-final-2026-08-26/06-saved-month-1920.png`
- Create: `audit/ui-redesign-final-2026-08-26/report.md`
- Modify only if browser QA exposes a defect: files touched in Tasks 1-7

**Interfaces:**

- Consumes: completed application and approved audit screenshots in `audit/ui-redesign-2026-08-26/`.
- Produces: accepted browser screenshots, a width/state QA report, and a verified user-facing local preview.

- [ ] **Step 1: Load the Browser skill and start the local app**

Read the Browser skill before browser work. Start with:

```bash
npm run dev
```

Use `http://localhost:3000`, not `127.0.0.1`, so Next.js client hydration is not blocked by a dev-origin mismatch.

- [ ] **Step 2: Verify all target widths**

At 1280, 1366, 1440, 1512, 1600, and 1920px, inspect a saved month and confirm:

- no horizontal overflow;
- the main container stays at or below 1184px;
- header and page content share one center line;
- the net-worth summary is the only dominant first-screen element;
- the page does not stretch columns or explanatory copy on large screens.

- [ ] **Step 3: Verify core states and interactions at 1440×900**

Capture and inspect the saved month, empty month, trend section, open entry form, and data safety section. Exercise MonthSwitcher, update/new entry CTA, form open/close, chart toggles, investment drilldown/back, history data disclosure, file input focus, delete confirmation, and restore confirmation without submitting destructive actions.

- [ ] **Step 4: Verify keyboard and accessibility risks**

Use Tab/Shift+Tab through header-adjacent navigation, summary actions, chart toggles, disclosure, form controls, fund controls, and data safety controls. Confirm focus-visible is never clipped, hover is not the only state signal, all 40px targets are usable, error text remains readable, and reduced-motion mode removes nonessential transforms/transitions.

- [ ] **Step 5: Save, inspect, and compare accepted screenshots**

Save the six named screenshots, open every saved file, reject blank/loading/cropped captures, and compare them against the corresponding audit images in `audit/ui-redesign-2026-08-26/`. The comparison should confirm fewer cards, borders, background layers, theme colors, and decorative elements while retaining all content and actions.

- [ ] **Step 6: Write the final QA report**

In `audit/ui-redesign-final-2026-08-26/report.md`, record each target width, each captured state, keyboard findings, accessibility evidence limits, console errors, and any deviation from the approved spec. Do not claim complete WCAG compliance from screenshots.

- [ ] **Step 7: Re-run required checks after browser fixes**

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands PASS after the last browser-driven fix.

- [ ] **Step 8: Commit final QA evidence**

```bash
git add audit/ui-redesign-final-2026-08-26 src
git commit -m "test: verify editorial UI redesign"
```

---

## Completion Handoff

After Task 8, use `superpowers:verification-before-completion`, then `superpowers:requesting-code-review`. Only after review findings are resolved should the worker use `superpowers:finishing-a-development-branch` to present integration options. Do not merge, push, or delete the checkpoint branch without explicit user instruction.
