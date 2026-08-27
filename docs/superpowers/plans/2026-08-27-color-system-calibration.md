# Color System Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Calibrate the complete desktop page to the approved Prussian-blue and fog-gray system, with consistent financial semantics across bars, legends, charts, controls, and states.

**Architecture:** Keep the existing global-CSS design system and React structure intact. First replace the root semantic tokens, then remap the selectors whose colors conflict with their approved roles; lock both layers with Vitest assertions and finish with rendered desktop QA in the in-app Browser.

**Tech Stack:** Node.js 24, npm, Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Vitest, global CSS custom properties

**Spec:** `docs/superpowers/specs/2026-08-27-color-system-calibration-design.md`

## Global Constraints

- The foundation is Prussian blue `#003153`, fog gray `#E5DDD7`, cool-white canvas `#F6F8F8`, and white primary surfaces `#FFFFFF`.
- Do not change layout, spacing, typography, radius, copy, calculations, persistence, routing, or interaction behavior.
- Do not add mobile-specific styling or narrow-screen acceptance work; the MVP remains desktop-only.
- Add no dependency and introduce no component-local hard-coded colors.
- Preserve non-color chart signals: net worth solid, cash dashed, investment dotted, and liability patterned.
- Before editing code, read `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` and `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` in full.
- Before completion, run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/app/globals.css` | Own the approved semantic tokens and map existing selectors to them. |
| `src/app/design-system.test.ts` | Prevent token drift and verify cross-component semantic mappings. |

No React, database, migration, configuration, or dependency files should change.

---

### Task 1: Replace the foundational palette tokens

**Files:**
- Modify: `src/app/globals.css:3-38`
- Test: `src/app/design-system.test.ts:6-20`

**Interfaces:**
- Consumes: The approved roles in the linked specification.
- Produces: Root semantic color properties consumed by all selectors in Task 2; no TypeScript interface.

- [ ] **Step 1: Read the approved design and local framework guidance**

```bash
sed -n '1,260p' docs/superpowers/specs/2026-08-27-color-system-calibration-design.md
sed -n '1,380p' node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
sed -n '1,320p' node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md
```

Expected: the design assigns every role without component restructuring; the guides confirm the current global stylesheet and Vitest setup remain valid.

- [ ] **Step 2: Replace the first design-system test with a failing token contract**

```ts
it("defines the approved Prussian blue and fog gray semantic palette", () => {
  expect(css).toContain("--fog-gray: #e5ddd7");
  expect(css).toContain("--background-primary: #f6f8f8");
  expect(css).toContain("--background-secondary: var(--fog-gray)");
  expect(css).toContain("--surface-primary: #ffffff");
  expect(css).toContain("--surface-subtle: #f7f5f3");
  expect(css).toContain("--text-primary: #1d2c34");
  expect(css).toContain("--text-secondary: #58676f");
  expect(css).toContain("--text-inverse: #ffffff");
  expect(css).toContain("--accent-primary: #003153");
  expect(css).toContain("--accent-hover: #002944");
  expect(css).toContain("--accent-active: #001f33");
  expect(css).toContain("--accent-soft: #eaf0f2");
  expect(css).toContain("--success: #3f6b5a");
  expect(css).toContain("--success-soft: #eef3f0");
  expect(css).toContain("--warning: #80663d");
  expect(css).toContain("--warning-soft: #f5f0e8");
  expect(css).toContain("--error: #98534e");
  expect(css).toContain("--error-soft: #f6ecea");
  expect(css).toContain("--asset-cash: #bbc6c8");
  expect(css).toContain("--asset-investment: #536b89");
  expect(css).toContain("--chart-net-worth: var(--accent-primary)");
  expect(css).toContain("--chart-cash: #7c9398");
  expect(css).toContain("--chart-investment: var(--asset-investment)");
  expect(css).toContain("--chart-income: var(--success)");
  expect(css).toContain("--chart-liability: var(--error)");
  expect(css).toContain("--radius-control: 8px");
  expect(css).toContain("--motion-normal: 180ms");
});
```

- [ ] **Step 3: Run the targeted test and verify RED**

```bash
npm test -- src/app/design-system.test.ts
```

Expected: FAIL because the stylesheet still contains the old palette and lacks `--fog-gray` and `--chart-income`.

- [ ] **Step 4: Replace only the root color and shadow tokens**

Use this exact color block at the start of `:root`, preserving all existing radius, spacing, motion, and easing declarations after it:

```css
color-scheme: light;
--fog-gray: #e5ddd7;
--background-primary: #f6f8f8;
--background-secondary: var(--fog-gray);
--surface-primary: #ffffff;
--surface-subtle: #f7f5f3;
--surface-elevated: #ffffff;
--text-primary: #1d2c34;
--text-secondary: #58676f;
--text-tertiary: #78858b;
--text-inverse: #ffffff;
--border-subtle: var(--fog-gray);
--border-strong: #bfc0c0;
--accent-primary: #003153;
--accent-hover: #002944;
--accent-active: #001f33;
--accent-soft: #eaf0f2;
--focus-ring: rgb(0 49 83 / 32%);
--success: #3f6b5a;
--success-soft: #eef3f0;
--warning: #80663d;
--warning-soft: #f5f0e8;
--error: #98534e;
--error-soft: #f6ecea;
--asset-cash: #bbc6c8;
--asset-investment: #536b89;
--chart-net-worth: var(--accent-primary);
--chart-cash: #7c9398;
--chart-investment: var(--asset-investment);
--chart-income: var(--success);
--chart-liability: var(--error);
```

Replace the existing shadow values with:

```css
--shadow-subtle: 0 1px 2px rgb(0 49 83 / 5%);
--shadow-floating: 0 16px 40px rgb(0 49 83 / 10%);
```

- [ ] **Step 5: Verify GREEN and inspect the token-only diff**

```bash
npm test -- src/app/design-system.test.ts
git diff --check
git diff -- src/app/globals.css src/app/design-system.test.ts
```

Expected: PASS; the diff contains only palette assertions and root color/shadow tokens.

- [ ] **Step 6: Commit the palette foundation**

```bash
git add src/app/globals.css src/app/design-system.test.ts
git commit -m "style: calibrate finance color tokens"
```

---

### Task 2: Map components to the approved semantic roles

**Files:**
- Modify: `src/app/globals.css:145-1695`
- Test: `src/app/design-system.test.ts:68-80`

**Interfaces:**
- Consumes: Task 1 properties, especially `--fog-gray`, `--surface-primary`, `--text-primary`, `--text-secondary`, `--asset-investment`, `--chart-income`, `--warning`, and `--warning-soft`.
- Produces: Consistent mappings for headings, controls, warnings, asset bars, allocation bars, charts, and safety labels; no React changes.

- [ ] **Step 1: Replace the asset-color test with failing cross-component tests**

```ts
it("maps each financial meaning to one approved color role", () => {
  expect(css).toMatch(
    /\.asset-bar\s*\{[^}]*background:\s*var\(--fog-gray\)/,
  );
  expect(css).toMatch(
    /\.asset-bar-cash\s*\{[^}]*background:\s*var\(--asset-cash\)/,
  );
  expect(css).toMatch(
    /\.asset-bar-investment\s*\{[^}]*background:\s*var\(--asset-investment\)/,
  );
  expect(css).toMatch(
    /\.allocation-bar\s*\{[^}]*background:\s*var\(--fog-gray\)/,
  );
  expect(css).toMatch(
    /\.allocation-bar span\s*\{[^}]*background:\s*var\(--asset-investment\)/,
  );
  expect(css).toMatch(
    /\.allocation-row strong\s*\{[^}]*color:\s*var\(--asset-investment\)/,
  );
  expect(css).toMatch(
    /\.trend-series-income\s*\{[^}]*color:\s*var\(--chart-income\)/,
  );
});

it("keeps structural surfaces neutral and accent color action-oriented", () => {
  expect(css).toMatch(
    /\.page-intro h1\s*\{[^}]*color:\s*var\(--text-primary\)/,
  );
  expect(css).toMatch(
    /\.month-switcher-arrow\s*\{[^}]*background:\s*var\(--surface-primary\)/,
  );
  expect(css).toMatch(
    /\.secondary-button\s*\{[^}]*background:\s*var\(--surface-primary\)/,
  );
  expect(css).toMatch(
    /\.consistency-difference-warning\s*\{[^}]*color:\s*var\(--warning\)[^}]*background:\s*var\(--warning-soft\)/,
  );
  expect(css).toMatch(
    /\.data-safety-eyebrow\s*\{[^}]*color:\s*var\(--text-secondary\)/,
  );
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

```bash
npm test -- src/app/design-system.test.ts
```

Expected: FAIL because allocation fills still use `--accent-primary`, income and warnings use accent roles, and structural controls still have old mappings.

- [ ] **Step 3: Edit existing declarations in place**

Apply these declaration replacements without adding duplicate selector blocks or changing geometry:

```css
.page-intro h1 {
  color: var(--text-primary);
}

.month-switcher-arrow {
  background: var(--surface-primary);
}

.consistency-difference-warning {
  border-color: color-mix(in srgb, var(--warning) 24%, transparent);
  color: var(--warning);
  background: var(--warning-soft);
}

.asset-bar {
  background: var(--fog-gray);
}

.allocation-bar {
  background: var(--fog-gray);
}

.allocation-bar span {
  background: var(--asset-investment);
}

.allocation-row strong {
  color: var(--asset-investment);
}

.trend-series-income {
  color: var(--chart-income);
}

.secondary-button {
  background: var(--surface-primary);
}

.data-safety-eyebrow {
  color: var(--text-secondary);
}
```

The asset segments and legend swatches already consume `--asset-cash` and `--asset-investment`; Task 1 changes their computed values.

- [ ] **Step 4: Verify GREEN with focused tests**

```bash
npm test -- src/app/design-system.test.ts src/features/monthly-snapshots/monthly-trend-charts.test.ts
```

Expected: PASS; markup and chart interaction behavior remain unchanged while CSS mapping tests protect the approved roles.

- [ ] **Step 5: Check for legacy palette values and accidental drift**

```bash
git diff --check
rg -n "#(?:f2f4f3|e8ebeb|f8faf9|e1e6e6|202b31|5f6c72|dfe7eb|b8c4c7|5e858c|65758f)" src/app
git diff -- src/app/globals.css src/app/design-system.test.ts
```

Expected: `rg` returns no legacy palette values; the diff changes only approved tokens, mappings, and assertions.

- [ ] **Step 6: Commit the semantic component mapping**

```bash
git add src/app/globals.css src/app/design-system.test.ts
git commit -m "style: align financial color semantics"
```

---

### Task 3: Verify rendered desktop states and the full project

**Files:**
- Verify only: `src/app/globals.css`
- Verify only: `src/app/design-system.test.ts`
- Do not create committed screenshots, traces, or temporary browser scripts.

**Interfaces:**
- Consumes: Tasks 1–2, the existing demo flow, and the in-app Browser runtime.
- Produces: Evidence that approved computed colors render in every key desktop state without regressions; no source interface.

- [ ] **Step 1: Run all required checks**

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: every command exits 0; the production build reports successful route generation.

- [ ] **Step 2: Start or reuse the demo app**

If no Gold-Finger development server is available, run in a persistent terminal:

```bash
npm run dev:demo
```

Expected: a localhost URL is printed and reachable. Preserve that exact host and port for Browser calls.

- [ ] **Step 3: Validate the saved-month asset and allocation surfaces**

Use `browser:control-in-app-browser` and `build-web-apps:frontend-testing-debugging`. Define the flow as `saved month -> asset composition and allocation render -> matching semantic colors are computed`.

Navigate to `/?month=2026-07`; verify `tab.url()`, `tab.title()`, a meaningful `domSnapshot()`, no framework overlay, and no relevant output from:

```js
await tab.dev.logs({ levels: ["error", "warn"], limit: 50 });
```

Collect computed values with:

```js
await tab.playwright.evaluate(() => ({
  page: getComputedStyle(document.body).backgroundColor,
  assetTrack: getComputedStyle(document.querySelector(".asset-bar")).backgroundColor,
  cash: getComputedStyle(document.querySelector(".asset-bar-cash")).backgroundColor,
  investment: getComputedStyle(document.querySelector(".asset-bar-investment")).backgroundColor,
  allocationTrack: getComputedStyle(document.querySelector(".allocation-bar")).backgroundColor,
  allocationFill: getComputedStyle(document.querySelector(".allocation-bar span")).backgroundColor,
}));
```

Expected:

```text
page             rgb(246, 248, 248)
assetTrack       rgb(229, 221, 215)
cash             rgb(187, 198, 200)
investment       rgb(83, 107, 137)
allocationTrack  rgb(229, 221, 215)
allocationFill   rgb(83, 107, 137)
```

Capture screenshot evidence showing the asset and allocation bars together.

- [ ] **Step 4: Exercise chart and history interactions**

```js
await tab.playwright.getByRole("button", { name: "负债" }).click();
await tab.playwright.getByRole("img", { name: /负债变化趋势/ }).waitFor({ state: "visible" });
await tab.playwright.getByRole("button", { name: "支出" }).click();
await tab.playwright.getByRole("img", { name: /支出趋势/ }).waitFor({ state: "visible" });
await tab.playwright.locator(".history-table-details summary").click();
await tab.playwright.locator(".history-table-scroll").waitFor({ state: "visible" });
```

Then evaluate:

```js
await tab.playwright.evaluate(() => ({
  liability: getComputedStyle(document.querySelector(".trend-series-liability")).color,
  expense: getComputedStyle(document.querySelector(".trend-series-expense")).color,
  positive: getComputedStyle(document.querySelector(".history-delta-positive")).color,
  negative: getComputedStyle(document.querySelector(".history-delta-negative")).color,
}));
```

Expected: liability, expense, and negative are `rgb(152, 83, 78)`; positive is `rgb(63, 107, 90)`. Capture a chart/history screenshot and confirm each click changed visible state.

- [ ] **Step 5: Verify form, empty month, and safety surfaces**

Return the chart toggles to `资产` and `收入`. Click the `.entry-toggle-button` labeled `更新数据`; verify the visible form has white inputs, fog-gray borders, Prussian-blue focus, semantic error colors, and white secondary buttons. Do not submit or alter financial data.

Navigate through the visible `查看 2026-08` link. Verify `暂无复盘结果`, then inspect `数据仅保存在这台电脑`: the first safety card is white, the second is `rgb(247, 245, 243)`, the eyebrow is secondary text, and the file button uses soft blue. Capture form and empty/safety screenshots; recheck DOM, overlay absence, and console health.

- [ ] **Step 6: Review the final repository state**

```bash
git status --short
git log -3 --oneline
git diff HEAD~2 --check
git diff HEAD~2 -- src/app/globals.css src/app/design-system.test.ts
```

Expected: exactly the two planned source commits; no screenshots, traces, database files, dependency files, or unrelated changes.
