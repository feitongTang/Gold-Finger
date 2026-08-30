# Gold-Finger V2 Glacier Scale UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current V2 Ice Crystal visual treatment with the approved Glacier Scale system—mist-white natural light, high-luminance ice blue, thin translucent surfaces, slightly elevated interactions, and accurate smooth trend curves—without changing the product's routes, density, data model, or financial semantics.

**Architecture:** Keep the existing five-page App Router structure and feature components. Centralize the visual change in `src/app/globals.css` and enforce it with the existing CSS guardrail test; make only two focused markup/model changes where CSS cannot express the requirement correctly: semantic positive/negative flow classes and monotone SVG curve geometry. Execute the work in independently reviewable slices, then perform a fresh isolated-database browser QA across all five desktop routes.

**Tech Stack:** Node.js 24, npm, Next.js 16.3.1 App Router, React 19.2, strict TypeScript, Tailwind CSS 4, native CSS variables, SVG, SQLite/Drizzle, Vitest 4, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-30-v2-glacier-scale-ui-redesign-design.md`

## Global Constraints

- Work only in `/Users/tangfeitong/Desktop/Gold-Finger/.worktrees/v2-multi-page-dashboard` on `codex/v2-multi-page-dashboard`.
- Before editing, read `AGENTS.md`, the approved spec, this plan, and the current `git status`/recent commits.
- Preserve the user's existing uncommitted changes in `next-env.d.ts`, `scripts/start-demo.mjs`, `scripts/start-demo.test.ts`, `src/db/client.ts`, and `src/db/client.test.ts`; do not stage or modify them for this redesign.
- Before changing TSX or global CSS, read `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`, and `node_modules/next/dist/docs/03-architecture/accessibility.md`.
- Preserve routes `/`, `/records`, `/portfolio`, `/trends`, and `/data` and their current information architecture.
- Do not change financial calculations, field semantics, month routing, SQLite/Drizzle schema, migrations, backup format, or restore behavior.
- Do not add dependencies, fonts, dark mode, theme switching, mobile scope, new product features, or unrelated refactors.
- Preserve the current desktop information density and the existing 40px minimum interactive targets.
- Canonical visual values come from the approved spec: `#f4f8fb` mist-white background, `#82bde2` ice blue, 48% L2 surface, 60% L3 surface, 16px L2 blur, and 22px L3 blur.
- Key amounts, table/form data, body text, and controls meet WCAG AA; secondary metadata may be softer but remains comfortably readable.
- No persistent glass-inside-glass; tables, inputs, allocation rows, chart canvases, and nested data regions have no backdrop blur.
- Use light functional motion only; `prefers-reduced-motion` removes translation, scaling, smooth scrolling, and non-essential animation.
- Trend paths use non-overshooting monotone curves that pass through the real monthly points; one point remains a point and two points use a straight segment.
- Each task follows RED → GREEN → REFACTOR and ends with its own focused verification and commit.
- Do not merge, push, tag, or remove the worktree.

---

## Planned File Map

```text
src/app/
├── globals.css                         # Glacier tokens, surfaces, shell, pages, states, motion, fallback
├── design-system.test.ts               # CSS token, material, accessibility, motion, and blur guardrails
└── app-sidebar.test.tsx                # Existing route/selection semantics remain intact

src/features/monthly-snapshots/
├── review-dashboard.tsx                # Adds semantic tone classes to signed monthly-flow metrics
├── review-dashboard.test.tsx           # Verifies positive/negative classes without changing calculations
├── trend-chart-model.ts                # Pure monotone curve geometry
├── trend-chart-model.test.ts            # Single/two-point fallback and no-overshoot control-point tests
├── monthly-trend-charts.tsx            # Uses monotone paths for all series
├── monthly-trend-charts.test.ts         # SVG curve rendering and existing interaction coverage
├── records-page.test.tsx               # Existing form structure/behavior regression coverage
├── portfolio-page.test.tsx             # Existing read-only hierarchy regression coverage
├── investment-allocation.test.ts        # Existing disclosure behavior regression coverage
├── monthly-history.test.tsx             # Existing six-month/table regression coverage
└── data-safety-panel.test.ts            # Existing export/restore interaction regression coverage

audit/v2-glacier-scale-final-2026-08-30/
├── 01-review-1440.png
├── 02-records-1440.png
├── 03-portfolio-1440.png
├── 04-trends-1440.png
├── 05-data-1440.png
├── 06-review-1280.png
├── 07-review-1920.png
└── report.md                            # Automated and browser QA evidence
```

`globals.css` remains the single global stylesheet because that is the established project pattern. Do not create a general component library or split the stylesheet solely for this redesign.

---

### Task 1: Glacier Scale Foundation and Surface Utilities

**Files:**

- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: existing `.surface-base`, `.surface-frosted`, and `.surface-liquid` class names used throughout the V2 pages.
- Produces: canonical Glacier tokens plus compatibility aliases so existing component class names do not need a broad markup rewrite.

```css
--background
--ambient-ice
--ambient-air
--surface-solid
--surface-frosted
--surface-interactive
--surface-frosted-fallback
--surface-interactive-fallback
--text-primary
--text-secondary
--text-muted
--ice-blue
--ice-blue-strong
--ice-blue-soft
--positive
--negative
--warning
--border-soft
--border-glass
--border-glass-cool
--focus-ring
--shadow-frosted
--shadow-interactive
--blur-frosted
--blur-interactive
```

- Existing role aliases such as `--bg-base`, `--surface-base`, `--surface-liquid`, `--accent-primary`, and chart/asset roles map to the canonical tokens instead of retaining an independent old palette.

- [ ] **Step 1: Replace the old Ice Crystal token expectations with failing Glacier token tests**

In `src/app/design-system.test.ts`, rename the suite and replace the first two tests with exact approved values:

```ts
describe("Glacier Scale design system", () => {
  it("defines the approved Glacier Scale token roles", () => {
    expect(css).toContain("--background: #f4f8fb");
    expect(css).toContain("--ambient-ice: rgb(168 221 248 / 14%)");
    expect(css).toContain("--ambient-air: rgb(211 235 249 / 12%)");
    expect(css).toContain("--surface-solid: rgb(255 255 255 / 82%)");
    expect(css).toContain("--surface-frosted: rgb(255 255 255 / 48%)");
    expect(css).toContain("--surface-interactive: rgb(238 248 255 / 60%)");
    expect(css).toContain("--surface-frosted-fallback: rgb(249 252 254 / 94%)");
    expect(css).toContain(
      "--surface-interactive-fallback: rgb(242 249 253 / 96%)",
    );
    expect(css).toContain("--text-primary: #22313a");
    expect(css).toContain("--text-secondary: #657784");
    expect(css).toContain("--text-muted: #8294a0");
    expect(css).toContain("--ice-blue: #82bde2");
    expect(css).toContain("--ice-blue-strong: #3f7fa8");
    expect(css).toContain("--positive: #487f9b");
    expect(css).toContain("--negative: #a36f75");
    expect(css).toContain("--blur-frosted: 16px");
    expect(css).toContain("--blur-interactive: 22px");
    expect(css).not.toContain("--ambient-violet");
    expect(css).not.toContain("--ambient-mint");
  });

  it("keeps ambient ice light outside a clean mist-white base", () => {
    const bodyRule = css.match(/body\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const ice = bodyRule.indexOf("var(--ambient-ice)");
    const air = bodyRule.indexOf("var(--ambient-air)");
    const base = bodyRule.indexOf("var(--background)");

    expect(ice).toBeGreaterThanOrEqual(0);
    expect(air).toBeGreaterThan(ice);
    expect(base).toBeGreaterThan(air);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/app/design-system.test.ts
```

Expected: FAIL on the Glacier token values and removal of violet/mint ambient tokens.

- [ ] **Step 3: Replace the root palette with canonical tokens and compatibility aliases**

At the top of `globals.css`, replace the current root color/material block. Keep spacing, radius, and motion roles, but map visual aliases to the approved system:

```css
:root {
  color-scheme: light;
  --background: #f4f8fb;
  --ambient-ice: rgb(168 221 248 / 14%);
  --ambient-air: rgb(211 235 249 / 12%);

  --surface-solid: rgb(255 255 255 / 82%);
  --surface-frosted: rgb(255 255 255 / 48%);
  --surface-interactive: rgb(238 248 255 / 60%);
  --surface-frosted-fallback: rgb(249 252 254 / 94%);
  --surface-interactive-fallback: rgb(242 249 253 / 96%);

  --text-primary: #22313a;
  --text-secondary: #657784;
  --text-muted: #8294a0;

  --ice-blue: #82bde2;
  --ice-blue-strong: #3f7fa8;
  --ice-blue-soft: rgb(130 189 226 / 12%);

  --positive: #487f9b;
  --negative: #a36f75;
  --warning: #8a744d;

  --border-soft: rgb(91 139 169 / 12%);
  --border-glass: rgb(255 255 255 / 78%);
  --border-glass-cool: rgb(109 174 214 / 14%);
  --focus-ring: #3f7fa8;

  --shadow-frosted: 0 8px 28px rgb(66 112 140 / 4%);
  --shadow-interactive: 0 6px 18px rgb(68 137 180 / 6%);
  --blur-frosted: 16px;
  --blur-interactive: 22px;

  --bg-base: var(--background);
  --surface-base: var(--surface-solid);
  --surface-liquid: var(--surface-interactive);
  --surface-liquid-fallback: var(--surface-interactive-fallback);
  --shadow-card: var(--shadow-frosted);
  --shadow-floating: var(--shadow-interactive);
  --blur-liquid: var(--blur-interactive);
  --background-primary: var(--background);
  --background-secondary: #edf5fa;
  --surface-primary: var(--surface-solid);
  --surface-subtle: rgb(255 255 255 / 58%);
  --surface-elevated: rgb(255 255 255 / 92%);
  --text-tertiary: var(--text-muted);
  --text-inverse: #fff;
  --border-subtle: var(--border-soft);
  --border-strong: rgb(91 139 169 / 28%);
  --border-interactive: rgb(63 127 168 / 42%);
  --accent-primary: var(--ice-blue-strong);
  --accent-hover: #347398;
  --accent-active: #2b6384;
  --accent-soft: var(--ice-blue-soft);
  --success: var(--positive);
  --error: var(--negative);
  --chart-net-worth: var(--ice-blue-strong);
  --chart-cash: #8eafc3;
  --chart-investment: #6f9fbe;
  --chart-income: var(--positive);
  --chart-liability: var(--negative);
  --asset-stocks: var(--ice-blue-strong);
  --asset-bonds: #9bb9ca;
  --asset-other: #c7d7e0;
  --asset-cash: #d9e5eb;
}
```

Retain existing non-color spacing/radius/motion tokens below this block. Remove old green, mint, violet, muted-gold, and duplicated glass palette values instead of leaving dead theme values in `:root`.

- [ ] **Step 4: Replace the body background with two restrained ambient layers**

```css
html {
  background: var(--background);
}

body {
  background:
    radial-gradient(circle at 82% 8%, var(--ambient-ice), transparent 42%),
    radial-gradient(circle at 12% 76%, var(--ambient-air), transparent 36%),
    var(--background);
}
```

Keep the existing typography and minimum-height declarations. Do not add animation or a third colored light.

- [ ] **Step 5: Add failing surface-role and fallback tests**

Replace the old utility test with:

```ts
it("limits blur to persistent and interactive glass with near-solid fallbacks", () => {
  const baseRule = css.match(/\.surface-base\s*\{([^}]*)\}/)?.[1] ?? "";
  const frostedRule = css.match(/\.surface-frosted\s*\{([^}]*)\}/)?.[1] ?? "";
  const liquidRule = css.match(/\.surface-liquid\s*\{([^}]*)\}/)?.[1] ?? "";

  expect(baseRule).toContain("background: var(--surface-solid)");
  expect(baseRule).not.toContain("backdrop-filter");
  expect(frostedRule).toContain("background: var(--surface-frosted-fallback)");
  expect(frostedRule).toContain("box-shadow: var(--shadow-frosted)");
  expect(liquidRule).toContain(
    "background: var(--surface-interactive-fallback)",
  );
  expect(liquidRule).toContain("var(--shadow-interactive)");
  expect(css).toMatch(
    /\.surface-frosted\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-frosted\)\)/s,
  );
  expect(css).toMatch(
    /\.surface-liquid\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-interactive\)\)/s,
  );
  expect(css).toMatch(/@supports not\s*\(\s*\(backdrop-filter:/);
});
```

- [ ] **Step 6: Run the focused test and verify RED**

Run:

```bash
npm test -- src/app/design-system.test.ts
```

Expected: FAIL until the utility rules use the new canonical fallback, shadow, and blur roles.

- [ ] **Step 7: Implement the L1/L2/L3 utilities**

```css
.surface-base {
  border: 1px solid var(--border-soft);
  background: var(--surface-solid);
}

.surface-frosted {
  border: 1px solid var(--border-glass);
  background: var(--surface-frosted-fallback);
  box-shadow:
    inset 0 1px 0 var(--border-glass),
    var(--shadow-frosted);
}

.surface-liquid {
  border: 1px solid var(--border-glass);
  background: var(--surface-interactive-fallback);
  box-shadow:
    inset 0 1px 0 var(--border-glass),
    var(--shadow-interactive);
}

@supports (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .surface-frosted {
    background: var(--surface-frosted);
    backdrop-filter: blur(var(--blur-frosted)) saturate(108%);
    -webkit-backdrop-filter: blur(var(--blur-frosted)) saturate(108%);
  }

  .surface-liquid {
    background: var(--surface-interactive);
    backdrop-filter: blur(var(--blur-interactive)) saturate(112%);
    -webkit-backdrop-filter: blur(var(--blur-interactive)) saturate(112%);
  }
}
```

- [ ] **Step 8: Run focused tests and formatting**

Run:

```bash
npm test -- src/app/design-system.test.ts
npm run format:check
```

Expected: PASS.

- [ ] **Step 9: Commit Task 1**

```bash
git add src/app/globals.css src/app/design-system.test.ts
git commit -m "style: establish glacier scale foundation"
```

---

### Task 2: Frosted Sidebar and Restrained Interaction Primitives

**Files:**

- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/app-sidebar.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: canonical surface and ice-blue roles from Task 1; existing `.app-sidebar`, `.sidebar-brand`, `.month-switcher`, `.primary-button`, `.secondary-button`, `.trend-chart-toggle`, and backup control classes.
- Produces: a lightly frosted persistent sidebar plus shared L3 control treatment with slight elevation and accessible states.
- Does not change route links, navigation order, or `aria-current` behavior.

- [ ] **Step 1: Add failing shell/control guardrails**

Add to `design-system.test.ts`:

```ts
it("keeps the sidebar frosted while current navigation uses a small ice-blue scale", () => {
  expect(css).toMatch(
    /\.app-sidebar\s*\{[^}]*background:\s*var\(--surface-frosted\)[^}]*backdrop-filter:\s*blur\(var\(--blur-frosted\)\)/s,
  );
  expect(css).toMatch(
    /\.app-sidebar a\[aria-current="page"\]\s*\{[^}]*background:\s*var\(--ice-blue-soft\)[^}]*box-shadow:\s*none/s,
  );
  expect(css).toMatch(
    /\.app-sidebar a\[aria-current="page"\]::before\s*\{[^}]*background:\s*var\(--ice-blue\)/s,
  );
});

it("keeps shared interactive glass pale and only slightly elevated", () => {
  expect(css).toMatch(
    /\.primary-button,[\s\S]*?\.retry-button\s*\{[^}]*background:\s*var\(--surface-interactive-fallback\)[^}]*box-shadow:\s*var\(--shadow-interactive\)/,
  );
  expect(css).toMatch(
    /\.primary-button:hover:not\(:disabled\)[^}]*background:\s*color-mix\(in srgb, var\(--ice-blue\) 12%, var\(--surface-interactive-fallback\)\)/,
  );
  expect(css).not.toMatch(/translateY\(-1px\)/);
  expect(css).not.toMatch(/scale\(0\.98\)/);
});
```

Keep existing tests that require 40px targets, visible focus, route links, and `aria-current`.

- [ ] **Step 2: Run the shell tests and verify RED**

```bash
npm test -- src/app/design-system.test.ts src/app/app-sidebar.test.tsx
```

Expected: FAIL because the current sidebar is a plain 44% white surface, current navigation is a white liquid block, and controls still use stronger corner highlights/translation.

- [ ] **Step 3: Implement the lightly frosted sidebar and scale selection**

```css
.app-sidebar {
  border-right: 1px solid var(--border-soft);
  background: var(--surface-frosted-fallback);
  box-shadow: inset -1px 0 0 var(--border-glass);
}

@supports (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .app-sidebar {
    background: var(--surface-frosted);
    backdrop-filter: blur(var(--blur-frosted)) saturate(108%);
    -webkit-backdrop-filter: blur(var(--blur-frosted)) saturate(108%);
  }
}

.sidebar-brand::before {
  width: 18px;
  height: 2px;
  border-radius: 999px;
  margin-bottom: var(--space-2);
  background: var(--ice-blue);
  content: "";
}

.app-sidebar nav a,
.sidebar-utilities a {
  position: relative;
}

.app-sidebar a[aria-current="page"] {
  border-color: transparent;
  color: var(--text-primary);
  background: var(--ice-blue-soft);
  box-shadow: none;
}

.app-sidebar a[aria-current="page"]::before {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 5px;
  width: 2px;
  border-radius: 999px;
  background: var(--ice-blue);
  content: "";
}
```

- [ ] **Step 4: Simplify shared buttons and remove protruding corner effects**

Replace the primary/retry material and remove the old `::before`/`::after` corner blocks:

```css
.primary-button,
.retry-button {
  border: 1px solid var(--border-glass);
  color: var(--ice-blue-strong);
  background: var(--surface-interactive-fallback);
  box-shadow:
    inset 0 1px 0 var(--border-glass),
    var(--shadow-interactive);
  isolation: isolate;
}

@supports (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .primary-button,
  .retry-button,
  .review-toolbar .month-switcher,
  .trend-chart-toggle {
    background: var(--surface-interactive);
    backdrop-filter: blur(var(--blur-interactive)) saturate(112%);
    -webkit-backdrop-filter: blur(var(--blur-interactive)) saturate(112%);
  }
}

.primary-button:hover:not(:disabled),
.retry-button:hover:not(:disabled) {
  border-color: var(--border-glass-cool);
  color: var(--accent-hover);
  background: color-mix(
    in srgb,
    var(--ice-blue) 12%,
    var(--surface-interactive-fallback)
  );
}

.primary-button:active:not(:disabled),
.secondary-button:active:not(:disabled),
.danger-button:active:not(:disabled),
.retry-button:active:not(:disabled) {
  transform: scale(0.99);
}
```

Update month-switcher arrows and segmented controls so hover changes background/border only—remove `translateY(-1px)` and change any `scale(0.98)` to `scale(0.99)`.

- [ ] **Step 5: Normalize shared focus and selected controls**

```css
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.trend-chart-toggle {
  border-radius: var(--radius-control);
}

.trend-chart-toggle button {
  border-radius: calc(var(--radius-control) - 3px);
}

.trend-chart-toggle button[aria-pressed="true"] {
  color: var(--ice-blue-strong);
  background: var(--ice-blue-soft);
  box-shadow: none;
}
```

- [ ] **Step 6: Run shell, control, and accessibility-focused tests**

```bash
npm test -- src/app/design-system.test.ts src/app/app-sidebar.test.tsx src/app/layout.test.ts
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/app/globals.css src/app/design-system.test.ts src/app/app-sidebar.test.tsx
git commit -m "style: refine glacier shell and controls"
```

---

### Task 3: Accurate Monotone Trend Curves and Ice-Blue Chart Styling

**Files:**

- Modify: `src/features/monthly-snapshots/trend-chart-model.ts`
- Modify: `src/features/monthly-snapshots/trend-chart-model.test.ts`
- Modify: `src/features/monthly-snapshots/monthly-trend-charts.tsx`
- Modify: `src/features/monthly-snapshots/monthly-trend-charts.test.ts`
- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: `createTrendChartLayout()` and its point coordinates.
- Produces:

```ts
export type TrendCurvePoint = { x: number; y: number };
export type TrendCurveSegment = {
  start: TrendCurvePoint;
  control1: TrendCurvePoint;
  control2: TrendCurvePoint;
  end: TrendCurvePoint;
};
export function createMonotoneCurveSegments(
  points: ReadonlyArray<TrendCurvePoint>,
): ReadonlyArray<TrendCurveSegment>;
export function createMonotoneCurvePath(
  points: ReadonlyArray<TrendCurvePoint>,
): string;
```

- Zero points produce `""`.
- One point produces `M x y` and no line.
- Two points produce a straight `M ... L ...` segment.
- Three or more points produce cubic Bézier segments whose control-point y values stay within each segment's endpoint range.

- [ ] **Step 1: Write failing pure geometry tests**

Add to `trend-chart-model.test.ts`:

```ts
import {
  createMonotoneCurvePath,
  createMonotoneCurveSegments,
} from "@/features/monthly-snapshots/trend-chart-model";

describe("monotone chart curves", () => {
  it("keeps empty, single-point, and two-point charts exact", () => {
    expect(createMonotoneCurvePath([])).toBe("");
    expect(createMonotoneCurvePath([{ x: 380, y: 118 }])).toBe("M 380 118");
    expect(
      createMonotoneCurvePath([
        { x: 56, y: 212 },
        { x: 704, y: 24 },
      ]),
    ).toBe("M 56 212 L 704 24");
  });

  it("keeps every cubic control point inside its segment range", () => {
    const segments = createMonotoneCurveSegments([
      { x: 56, y: 180 },
      { x: 272, y: 60 },
      { x: 488, y: 130 },
      { x: 704, y: 40 },
    ]);

    expect(segments).toHaveLength(3);
    for (const segment of segments) {
      const low = Math.min(segment.start.y, segment.end.y);
      const high = Math.max(segment.start.y, segment.end.y);
      expect(segment.control1.y).toBeGreaterThanOrEqual(low);
      expect(segment.control1.y).toBeLessThanOrEqual(high);
      expect(segment.control2.y).toBeGreaterThanOrEqual(low);
      expect(segment.control2.y).toBeLessThanOrEqual(high);
    }
    expect(
      createMonotoneCurvePath([
        { x: 56, y: 180 },
        { x: 272, y: 60 },
        { x: 488, y: 130 },
        { x: 704, y: 40 },
      ]),
    ).toContain(" C ");
  });
});
```

- [ ] **Step 2: Run the model test and verify RED**

```bash
npm test -- src/features/monthly-snapshots/trend-chart-model.test.ts
```

Expected: FAIL because the curve functions and types do not exist.

- [ ] **Step 3: Implement monotone cubic Hermite geometry**

Append the following pure implementation to `trend-chart-model.ts`. Keep all calculations in SVG coordinate space; this is visual geometry only and does not convert financial `bigint` values to `number`.

```ts
export type TrendCurvePoint = { x: number; y: number };

export type TrendCurveSegment = {
  start: TrendCurvePoint;
  control1: TrendCurvePoint;
  control2: TrendCurvePoint;
  end: TrendCurvePoint;
};

function sameSign(left: number, right: number) {
  return left === 0 || right === 0 || Math.sign(left) === Math.sign(right);
}

function endpointSlope(
  firstWidth: number,
  secondWidth: number,
  firstSlope: number,
  secondSlope: number,
) {
  let slope =
    ((2 * firstWidth + secondWidth) * firstSlope - firstWidth * secondSlope) /
    (firstWidth + secondWidth);

  if (!sameSign(slope, firstSlope)) slope = 0;
  else if (
    !sameSign(firstSlope, secondSlope) &&
    Math.abs(slope) > Math.abs(3 * firstSlope)
  ) {
    slope = 3 * firstSlope;
  }
  return slope;
}

function createTangents(points: ReadonlyArray<TrendCurvePoint>) {
  const widths = points.slice(0, -1).map((point, index) => {
    return points[index + 1].x - point.x;
  });
  const slopes = points.slice(0, -1).map((point, index) => {
    return (points[index + 1].y - point.y) / widths[index];
  });
  const tangents = Array<number>(points.length).fill(0);

  tangents[0] = endpointSlope(widths[0], widths[1], slopes[0], slopes[1]);
  tangents[points.length - 1] = endpointSlope(
    widths[widths.length - 1],
    widths[widths.length - 2],
    slopes[slopes.length - 1],
    slopes[slopes.length - 2],
  );

  for (let index = 1; index < points.length - 1; index += 1) {
    const before = slopes[index - 1];
    const after = slopes[index];
    if (!sameSign(before, after) || before === 0 || after === 0) {
      tangents[index] = 0;
      continue;
    }
    const beforeWidth = widths[index - 1];
    const afterWidth = widths[index];
    const beforeWeight = 2 * afterWidth + beforeWidth;
    const afterWeight = afterWidth + 2 * beforeWidth;
    tangents[index] =
      (beforeWeight + afterWeight) /
      (beforeWeight / before + afterWeight / after);
  }

  return tangents;
}

export function createMonotoneCurveSegments(
  points: ReadonlyArray<TrendCurvePoint>,
): ReadonlyArray<TrendCurveSegment> {
  if (points.length < 3) return [];
  const tangents = createTangents(points);
  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const width = end.x - start.x;
    const low = Math.min(start.y, end.y);
    const high = Math.max(start.y, end.y);
    const clampY = (value: number) => Math.min(high, Math.max(low, value));
    return {
      start,
      control1: {
        x: start.x + width / 3,
        y: clampY(start.y + (tangents[index] * width) / 3),
      },
      control2: {
        x: end.x - width / 3,
        y: clampY(end.y - (tangents[index + 1] * width) / 3),
      },
      end,
    };
  });
}

function coordinate(value: number) {
  return Number(value.toFixed(3)).toString();
}

export function createMonotoneCurvePath(
  points: ReadonlyArray<TrendCurvePoint>,
) {
  if (points.length === 0) return "";
  const first = points[0];
  if (points.length === 1)
    return `M ${coordinate(first.x)} ${coordinate(first.y)}`;
  const second = points[1];
  if (points.length === 2) {
    return `M ${coordinate(first.x)} ${coordinate(first.y)} L ${coordinate(second.x)} ${coordinate(second.y)}`;
  }
  const curves = createMonotoneCurveSegments(points)
    .map(({ control1, control2, end }) => {
      return `C ${coordinate(control1.x)} ${coordinate(control1.y)} ${coordinate(control2.x)} ${coordinate(control2.y)} ${coordinate(end.x)} ${coordinate(end.y)}`;
    })
    .join(" ");
  return `M ${coordinate(first.x)} ${coordinate(first.y)} ${curves}`;
}
```

- [ ] **Step 4: Run the pure geometry test and verify GREEN**

```bash
npm test -- src/features/monthly-snapshots/trend-chart-model.test.ts
```

Expected: PASS, including existing `bigint` layout coverage.

- [ ] **Step 5: Write a failing rendered-path test**

Extend `monthly-trend-charts.test.ts` with a third data point and assert cubic rendering while preserving exact point targets:

```ts
it("renders three or more months as smooth monotone paths", () => {
  const threePoints = [
    ...points,
    {
      ...points[1],
      month: "2026-09",
      netWorthCents: "2450000",
      cashCents: "1450000",
      investmentCents: "1120000",
    },
  ];
  const { container } = render(
    createElement(MonthlyTrendCharts, { points: threePoints }),
  );
  const lines = [...container.querySelectorAll(".trend-chart-line")];
  expect(lines).toHaveLength(4);
  for (const line of lines) expect(line.getAttribute("d")).toContain(" C ");
});
```

- [ ] **Step 6: Run the chart test and verify RED**

```bash
npm test -- src/features/monthly-snapshots/monthly-trend-charts.test.ts
```

Expected: FAIL because `LineChart` still builds `M/L` polylines.

- [ ] **Step 7: Use the pure curve builder in `LineChart`**

Import `createMonotoneCurvePath` and replace the inline `M/L` mapping:

```tsx
const path = createMonotoneCurvePath(points);

return (
  <g className={item.className} key={item.id}>
    {path ? <path className="trend-chart-line" d={path} /> : null}
    {/* keep the existing focusable hit targets and visible points unchanged */}
  </g>
);
```

Do not alter tooltip values, hit-target radius, `tabIndex`, or financial series selection.

- [ ] **Step 8: Add failing chart material/color guardrails**

Add to `design-system.test.ts`:

```ts
it("keeps chart canvases flat and uses ice-blue interactive details", () => {
  expect(css).toMatch(
    /\.trend-chart-canvas\s*\{[^}]*background:\s*transparent/s,
  );
  expect(css).not.toMatch(/\.trend-chart-canvas\s*\{[^}]*backdrop-filter/s);
  expect(css).toMatch(
    /\.trend-series-net-worth\s*\{[^}]*color:\s*var\(--chart-net-worth\)/s,
  );
  expect(css).toMatch(
    /\.trend-chart-tooltip rect\s*\{[^}]*fill:\s*var\(--surface-interactive-fallback\)[^}]*stroke:\s*var\(--border-glass\)/s,
  );
});
```

- [ ] **Step 9: Apply the Glacier chart styles**

- Keep `.trend-chart-canvas` transparent and unblurred.
- Change grid lines to `rgb(91 139 169 / 10%)`.
- Use `--ice-blue-strong` for net worth, `#8eafc3` dashed for cash, `#6f9fbe` dotted for investment, and the semantic negative role only for liability/expense.
- Keep `stroke-linecap: round` and `stroke-linejoin: round`.
- Use `var(--surface-interactive-fallback)` and `var(--border-glass)` for the tooltip rectangle with a light `0 6px 18px rgb(68 137 180 / 6%)` drop shadow.
- Keep data-point focus enlargement, but reduced motion must remove its transform.
- Do not add area fill, glow, or progressive drawing animation.

- [ ] **Step 10: Run all chart, history, and design tests**

```bash
npm test -- src/features/monthly-snapshots/trend-chart-model.test.ts src/features/monthly-snapshots/monthly-trend-charts.test.ts src/features/monthly-snapshots/monthly-history.test.tsx src/app/design-system.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 11: Commit Task 3**

```bash
git add src/features/monthly-snapshots/trend-chart-model.ts src/features/monthly-snapshots/trend-chart-model.test.ts src/features/monthly-snapshots/monthly-trend-charts.tsx src/features/monthly-snapshots/monthly-trend-charts.test.ts src/app/globals.css src/app/design-system.test.ts
git commit -m "feat: render smooth glacier trend curves"
```

---

### Task 4: Monthly Review and Portfolio Material Hierarchy

**Files:**

- Modify: `src/features/monthly-snapshots/review-dashboard.tsx`
- Modify: `src/features/monthly-snapshots/review-dashboard.test.tsx`
- Modify: `src/features/monthly-snapshots/portfolio-page.test.tsx`
- Modify: `src/features/monthly-snapshots/investment-allocation.test.ts`
- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: Glacier surface/token roles from Tasks 1–2 and chart output from Task 3.
- Produces: semantic monthly-flow tone classes:

```ts
type MetricTone = "positive" | "negative" | undefined;
function deltaTone(cents: bigint): MetricTone;
```

- Does not change `calculateMonthlyReview`, allocation calculations, hierarchy expansion, page geometry, or route links.

- [ ] **Step 1: Add failing semantic flow-tone tests**

In `review-dashboard.test.tsx`, retain existing hierarchy/order assertions. Update the metric-count expression so it accepts optional tone classes, then assert the existing fixture's negative investment result and positive monthly balance:

```ts
expect(markup.match(/class="monthly-flow-metric(?: |")/g)).toHaveLength(5);
expect(markup).toContain(
  'class="monthly-flow-metric monthly-flow-metric-positive"',
);
expect(markup).toContain(
  'class="monthly-flow-metric monthly-flow-metric-negative"',
);
```

- [ ] **Step 2: Run the review test and verify RED**

```bash
npm test -- src/features/monthly-snapshots/review-dashboard.test.tsx
```

Expected: FAIL because `Metric` does not emit semantic tone classes.

- [ ] **Step 3: Add semantic tone classes without changing values**

```tsx
type MetricTone = "positive" | "negative" | undefined;

function deltaTone(cents: bigint): MetricTone {
  if (cents > BigInt(0)) return "positive";
  if (cents < BigInt(0)) return "negative";
  return undefined;
}

function Metric({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: MetricTone;
  value: string;
}) {
  return (
    <div
      className={`monthly-flow-metric${tone ? ` monthly-flow-metric-${tone}` : ""}`}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
```

Pass `deltaTone(review.cashFlow.investmentProfitLossCents)` and `deltaTone(review.cashFlow.balanceCents)` only to those two signed metrics. Income, expense, and contribution remain neutral.

- [ ] **Step 4: Add failing dashboard/portfolio surface guardrails**

Add to `design-system.test.ts`:

```ts
it("uses one light shell and flat data interiors on review and portfolio", () => {
  expect(css).toMatch(
    /\.review-status-card\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)[^}]*box-shadow:[^}]*var\(--shadow-frosted\)/s,
  );
  expect(css).toMatch(
    /\.review-analysis-panel\s*\{[^}]*background:\s*var\(--surface-solid\)/s,
  );
  expect(css).not.toMatch(/\.allocation-row\s*\{[^}]*backdrop-filter/s);
  expect(css).toMatch(
    /\.allocation-row-button:hover[^}]*background:\s*color-mix\(in srgb, var\(--ice-blue\) 6%, transparent\)/s,
  );
  expect(css).toMatch(
    /\.portfolio-holdings-table\s*\{[^}]*background:\s*var\(--surface-solid\)/s,
  );
});
```

- [ ] **Step 5: Run the focused tests and verify RED**

```bash
npm test -- src/features/monthly-snapshots/review-dashboard.test.tsx src/features/monthly-snapshots/portfolio-page.test.tsx src/features/monthly-snapshots/investment-allocation.test.ts src/app/design-system.test.ts
```

Expected: review semantic test and new CSS guardrails FAIL; existing business/interaction tests remain PASS.

- [ ] **Step 6: Apply the approved review hierarchy**

In `globals.css`:

- Keep the current toolbar, status-card grid, five-column strip, and 45:55 analysis grid.
- Change `.review-status-card` to L2 fallback/background, 16–18px radius, inset lit edge, and `var(--shadow-frosted)`; remove hard-coded 28px blur and 45px shadow.
- Under `@supports`, use `var(--surface-frosted)` and `var(--blur-frosted)`.
- Keep `.monthly-flow-strip` as one L2 shell; inner metrics have only dividers.
- Style `.monthly-flow-metric-positive dd` with `var(--positive)` and `.monthly-flow-metric-negative dd` with `var(--negative)`.
- Make `.review-analysis-panel` L1 with `var(--surface-solid)` and no blur.
- If the allocation panel retains `surface-frosted` in markup, override only its outer panel to L2; `.asset-allocation`, overview, rows, and chart canvas remain unblurred.

- [ ] **Step 7: Apply the approved portfolio/allocation hierarchy**

```css
.allocation-row-button:hover {
  background: color-mix(in srgb, var(--ice-blue) 6%, transparent);
  box-shadow: none;
  transform: none;
}

.portfolio-holdings-table {
  background: var(--surface-solid);
}

.portfolio-allocation-panel .asset-allocation-overview,
.portfolio-allocation-panel .asset-allocation-tree,
.portfolio-allocation-panel .allocation-list .allocation-list {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
```

Map allocation tones to the approved clean ice-blue range. Do not reintroduce gold or green:

```css
.allocation-tone-stocks {
  --allocation-color: var(--ice-blue-strong);
}
.allocation-tone-bonds {
  --allocation-color: #9bb9ca;
}
.allocation-tone-other {
  --allocation-color: #c7d7e0;
}
.allocation-tone-cash {
  --allocation-color: #d9e5eb;
}
```

- [ ] **Step 8: Run focused suites and typecheck**

```bash
npm test -- src/features/monthly-snapshots/review-dashboard.test.tsx src/features/monthly-snapshots/portfolio-page.test.tsx src/features/monthly-snapshots/investment-allocation.test.ts src/features/monthly-snapshots/review-model.test.ts src/app/design-system.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit Task 4**

```bash
git add src/features/monthly-snapshots/review-dashboard.tsx src/features/monthly-snapshots/review-dashboard.test.tsx src/features/monthly-snapshots/portfolio-page.test.tsx src/features/monthly-snapshots/investment-allocation.test.ts src/app/globals.css src/app/design-system.test.ts
git commit -m "style: apply glacier review and portfolio hierarchy"
```

---

### Task 5: Monthly Records Data-First Form Treatment

**Files:**

- Modify: `src/features/monthly-snapshots/records-page.test.tsx`
- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: existing `.snapshot-form`, `.entry-section`, `.section-marker`, `.fund-row`, input/select, form action, and confirmation classes.
- Produces: one light outer form shell, unblurred L1 inputs/fund rows, small ice-blue step scales, restrained save/add/remove/delete hierarchy.
- Does not change form state, fields, validation, zero confirmation, save/delete behavior, or navigation.

- [ ] **Step 1: Strengthen the existing records structure regression test**

Add these assertions to the visible-form test:

```ts
expect(markup).toContain('class="snapshot-form"');
expect(markup.match(/class="entry-section"/g)).toHaveLength(4);
expect(markup.match(/class="section-marker"/g)).toHaveLength(4);
expect(markup).toContain('class="fund-row"');
expect(markup).toContain('class="primary-button"');
```

Run this once before CSS changes; it should PASS and establishes that the task is a visual-only change around the existing behavioral structure.

- [ ] **Step 2: Add failing form material guardrails**

Add to `design-system.test.ts`:

```ts
it("keeps monthly records in one light shell with solid data fields", () => {
  expect(css).toMatch(
    /\.snapshot-form\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)[^}]*box-shadow:[^}]*var\(--shadow-frosted\)/s,
  );
  expect(css).toMatch(
    /input,[\s\S]*?select\s*\{[^}]*background:\s*var\(--surface-solid\)/,
  );
  expect(css).toMatch(
    /\.fund-row\s*\{[^}]*background:\s*var\(--surface-solid\)[^}]*box-shadow:\s*none/s,
  );
  expect(css).not.toMatch(/\.fund-row\s*\{[^}]*backdrop-filter/s);
  expect(css).toMatch(
    /\.section-marker\s*\{[^}]*color:\s*var\(--ice-blue-strong\)[^}]*background:\s*var\(--ice-blue-soft\)/s,
  );
});
```

- [ ] **Step 3: Run records/design tests and verify RED**

```bash
npm test -- src/features/monthly-snapshots/records-page.test.tsx src/app/design-system.test.ts
```

Expected: structure test PASS; material guardrails FAIL.

- [ ] **Step 4: Implement the records surface rules**

```css
.snapshot-form {
  border: 1px solid var(--border-glass);
  background: var(--surface-frosted-fallback);
  box-shadow:
    inset 0 1px 0 var(--border-glass),
    var(--shadow-frosted);
}

@supports (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .snapshot-form {
    background: var(--surface-frosted);
    backdrop-filter: blur(var(--blur-frosted)) saturate(108%);
    -webkit-backdrop-filter: blur(var(--blur-frosted)) saturate(108%);
  }
}

.section-marker {
  border: 1px solid var(--border-glass-cool);
  color: var(--ice-blue-strong);
  background: var(--ice-blue-soft);
}

input,
select,
.fund-row {
  background: var(--surface-solid);
}

.fund-row {
  border-color: var(--border-soft);
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

input:focus,
select:focus {
  border-color: var(--ice-blue-strong);
  outline: 0;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--focus-ring) 34%, transparent);
}
```

- [ ] **Step 5: Refine action hierarchy without behavior changes**

- Save remains the L3 `.primary-button` from Task 2.
- Add fund remains `.secondary-button` with a solid L1 background.
- `.remove-button` and `.danger-text-button` remain text-led and low weight.
- `.zero-snapshot-confirmation`, `.record-delete-confirmation`, and `.form-error-summary` use explicit text plus restrained semantic borders/backgrounds; do not use large saturated fills.
- Keep all existing 40px targets and error focus behavior.

- [ ] **Step 6: Run all records/save/delete tests**

```bash
npm test -- src/features/monthly-snapshots/records-page.test.tsx src/features/monthly-snapshots/form-model.test.ts src/features/monthly-snapshots/form-data.test.ts src/features/monthly-snapshots/save.test.ts src/features/monthly-snapshots/delete.test.ts src/app/design-system.test.ts
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit Task 5**

```bash
git add src/features/monthly-snapshots/records-page.test.tsx src/app/globals.css src/app/design-system.test.ts
git commit -m "style: refine glacier monthly records form"
```

---

### Task 6: Data Safety, Route States, Motion, and Final Accessibility Guardrails

**Files:**

- Modify: `src/features/monthly-snapshots/data-safety-panel.test.ts`
- Modify: `src/app/route-states.test.ts`
- Modify: `src/app/design-system.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: existing `DataSafetyPanel`, route loading/error markup, L1/L2/L3 roles, and reduced-motion media block.
- Produces: one L2 data-safety shell with L1 groups, restrained irreversible confirmation, static loading placeholders, final fallback/motion/blur guardrails.
- Does not change export/restore requests, file validation, rollback behavior, navigation, error copy, or route-state logic.

- [ ] **Step 1: Preserve behavior and strengthen data/route structure tests**

Keep all existing interaction assertions. Add only stable class assertions:

```ts
expect(markup).toContain('class="data-safety-panel surface-frosted"');
expect(markup.match(/class="safety-card surface-base"/g)).toHaveLength(2);
```

In `route-states.test.ts`, retain existing loading/error copy checks and assert loading remains content-only inside the shared layout.

- [ ] **Step 2: Add failing final-state guardrails**

Add to `design-system.test.ts`:

```ts
it("keeps data safety grouped without nested blur", () => {
  expect(css).toMatch(
    /\.data-safety-panel\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)/s,
  );
  expect(css).toMatch(
    /\.safety-card\s*\{[^}]*background:\s*var\(--surface-solid\)[^}]*box-shadow:\s*none/s,
  );
  expect(css).not.toMatch(/\.safety-card\s*\{[^}]*backdrop-filter/s);
});

it("uses static loading and complete reduced-motion boundaries", () => {
  expect(css).not.toContain("@keyframes skeleton-shimmer");
  expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  expect(css).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition-duration:\s*0\.01ms !important/,
  );
  expect(css).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transform:\s*none !important/,
  );
});

it("keeps every dense data surface unblurred", () => {
  for (const selector of [
    ".allocation-row",
    ".trend-chart-canvas",
    ".fund-row",
    ".safety-card",
    ".portfolio-holdings-table",
    ".history-table",
  ]) {
    const escaped = selector.replace(".", "\\.");
    const rule =
      css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
    expect(rule).not.toContain("backdrop-filter");
  }
});
```

- [ ] **Step 3: Run focused tests and verify RED**

```bash
npm test -- src/features/monthly-snapshots/data-safety-panel.test.ts src/app/route-states.test.ts src/app/design-system.test.ts
```

Expected: structural/behavior tests PASS; new material and static-loading guardrails FAIL.

- [ ] **Step 4: Implement data-safety material hierarchy**

```css
.data-safety-panel {
  border: 1px solid var(--border-glass);
  background: var(--surface-frosted-fallback);
  box-shadow:
    inset 0 1px 0 var(--border-glass),
    var(--shadow-frosted);
}

.safety-card {
  border-color: var(--border-soft);
  background: var(--surface-solid);
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.backup-file-button {
  border-color: var(--border-glass-cool);
  color: var(--ice-blue-strong);
  background: var(--ice-blue-soft);
}

.restore-confirmation {
  border-color: color-mix(in srgb, var(--negative) 24%, transparent);
  color: var(--negative);
  background: color-mix(in srgb, var(--negative) 7%, white);
}
```

The export button remains primary L3; restore remains secondary until confirmation.

- [ ] **Step 5: Remove shimmer and complete reduced-motion/fallback rules**

- Delete `@keyframes skeleton-shimmer` and any `.skeleton::after` sweeping-light animation.
- Use static `surface-solid`/`ice-blue-soft` placeholders with stable dimensions.
- In reduced motion, keep the global 0.01ms duration and explicitly remove transforms from buttons, month-switcher arrows, selected controls, and chart points.
- Confirm L2 fallback remains 94% and L3 fallback remains 96%.
- Keep focus ring 2px with 2px offset and all 40px targets.
- Ensure `.error-panel` uses a stable L1 surface and `.retry-button` uses L3.

- [ ] **Step 6: Run route, data, API, and design suites**

```bash
npm test -- src/features/monthly-snapshots/data-safety-panel.test.ts src/features/monthly-snapshots/backup.test.ts src/app/api/backup/route.test.ts src/app/route-states.test.ts src/app/layout.test.ts src/app/design-system.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Run the complete regular suite before committing**

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit Task 6**

```bash
git add src/features/monthly-snapshots/data-safety-panel.test.ts src/app/route-states.test.ts src/app/design-system.test.ts src/app/globals.css
git commit -m "style: finish glacier states and accessibility"
```

---

### Task 7: Production Verification and Desktop Browser Visual QA

**Files:**

- Create: `audit/v2-glacier-scale-final-2026-08-30/report.md`
- Create: `audit/v2-glacier-scale-final-2026-08-30/01-review-1440.png`
- Create: `audit/v2-glacier-scale-final-2026-08-30/02-records-1440.png`
- Create: `audit/v2-glacier-scale-final-2026-08-30/03-portfolio-1440.png`
- Create: `audit/v2-glacier-scale-final-2026-08-30/04-trends-1440.png`
- Create: `audit/v2-glacier-scale-final-2026-08-30/05-data-1440.png`
- Create: `audit/v2-glacier-scale-final-2026-08-30/06-review-1280.png`
- Create: `audit/v2-glacier-scale-final-2026-08-30/07-review-1920.png`
- Modify: only source/test files required by defects discovered in this task.

**Interfaces:**

- Consumes: the complete Task 1–6 implementation.
- Produces: reproducible automated results, an isolated test-database browser workflow, inspected visual evidence, and a final QA report.

- [ ] **Step 1: Invoke the frontend testing workflow before browser actions**

Read and follow `build-web-apps:frontend-testing-debugging`. Use `browser:control-in-app-browser` because it is available. Do not use the user's real database.

- [ ] **Step 2: Run the full automated suite and production build**

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands PASS; build output lists `/`, `/records`, `/portfolio`, `/trends`, `/data`, `/api/backup`, and `/api/launcher`.

- [ ] **Step 3: Start the app with an explicit temporary SQLite database**

Create a temporary directory, use a database file inside it, and record the exact resolved path:

```bash
glacier_qa_dir=$(mktemp -d /private/tmp/gold-finger-glacier-qa.XXXXXX)
DATABASE_FILE="$glacier_qa_dir/glacier-qa.db" npm run dev -- --hostname 127.0.0.1 --port 3100
```

Do not copy, read, or overwrite the user's normal database.

- [ ] **Step 4: Create one representative month through the real UI**

At `/records?month=2026-08`, enter:

- Income: `25000`
- Expense: `8500`
- Investment profit/loss: `1200`
- Emergency fund: `60000`
- Goal fund: `30000`
- Daily cash: `15000`
- Nasdaq-100 fund market value: `80000`, contribution: `5000`
- China bond fund market value: `50000`, contribution: `2000`
- Huabei liability: `2500`

Save and confirm return to `/?month=2026-08`. Expected net worth: `¥232,500.00`; expected monthly balance: `+¥9,500.00`.

- [ ] **Step 5: Verify the five-page workflow at 1440px**

Before each click, inspect the current DOM. After each route/state change, inspect the screenshot.

1. `/?month=2026-08`: current sidebar scale, L2 net-worth shell, five metrics, smooth trend preview, allocation summary, L3 month/action controls.
2. `/records?month=2026-08`: L2 outer form, solid inputs/fund rows, visible focus, validation error focus, save return, restrained delete action.
3. `/portfolio?month=2026-08`: L2 overview/allocation shells, flat allocation rows, clean ice-blue allocation palette, read-only holdings table.
4. `/trends?month=2026-08`: monotone curves through visible data nodes, mode switching, exact tooltip/table values, unblurred chart canvas.
5. `/data`: no month query, L2 outer shell, two L1 groups, export, file selection, restrained irreversible confirmation, successful restore return.

- [ ] **Step 6: Capture and inspect the required screenshots**

Save the seven exact filenames listed in this task. Use full-page capture only for pages that actually scroll; avoid stretching a viewport-only page. Inspect every screenshot after capture.

- [ ] **Step 7: Verify width, zoom, keyboard, motion, and fallback boundaries**

- Inspect `/` at 1280, 1366, 1440, 1512, 1600, and 1920px.
- Verify no horizontal overflow, clipped amounts, or unstable sidebar/main geometry.
- Verify 125% and 200% zoom if the browser supports exact zoom; otherwise document equivalent CSS-width proxies as a tool limitation.
- Traverse the sidebar, month switcher, segmented controls, allocation rows, chart points, form controls, and confirmations by keyboard when supported by the browser tool.
- Emulate `prefers-reduced-motion: reduce` when supported; otherwise validate the passing CSS guardrail and document the limitation.
- Disable `backdrop-filter` when supported; otherwise validate computed fallback roles/tests and document the limitation.

- [ ] **Step 8: Judge the approved Glacier criteria**

Record PASS/FAIL for every statement:

- The interface reads as calm financial software before glass.
- Ice blue is cool, clean, high-luminance, and not gray-green or dirty.
- Ambient light does not appear as colored circles.
- Persistent glass is thin and only slightly elevated.
- Interactive glass is clearer than content surfaces without protruding.
- There is no persistent glass-inside-glass.
- Tables, inputs, rows, and chart canvases remain data-first and unblurred.
- Trend lines are smooth, pass through the points, and show no visible overshoot.
- Key text/data/controls are clear; secondary metadata is soft but readable.
- Focus, selected, positive, negative, warning, and error states do not rely on color alone.
- Reduced-motion and fallback behavior remain understandable.
- Scrolling and overlays show no obvious blur-related performance degradation.

- [ ] **Step 9: Fix defects with RED/GREEN evidence**

For each defect:

1. Add or tighten the smallest relevant automated guardrail when the defect is structural or behavioral.
2. Run it and record RED.
3. Make the smallest in-scope correction.
4. Run the focused test and record GREEN.
5. Reinspect the affected browser state and recapture only affected screenshots.

Do not use QA findings as authorization for unrelated refactors or new features.

- [ ] **Step 10: Run final verification after the last correction**

```bash
npm run check
npm run build
```

Expected: PASS.

- [ ] **Step 11: Write the QA report**

`report.md` must contain:

- date, OS, Node/npm/Next/browser versions
- branch and starting/final commits
- temporary database path and server command
- exact command results
- test data and expected/observed calculations
- five-page interaction results
- viewport/zoom matrix
- accessibility, reduced-motion, and fallback evidence
- smooth-curve evidence and any tool limitations
- Glacier visual-criteria results
- screenshot inventory
- confirmed evidence separated from tool-limited evidence
- no unresolved failures

- [ ] **Step 12: Commit Task 7**

Stage only the audit directory and any directly related regression fixes:

```bash
git add audit/v2-glacier-scale-final-2026-08-30 src/app src/features/monthly-snapshots
git commit -m "test: verify glacier scale dashboard"
```

Before committing, inspect `git diff --cached --name-only` and unstage any user-owned dirty file. Do not stage `next-env.d.ts`, `scripts/start-demo.mjs`, `scripts/start-demo.test.ts`, `src/db/client.ts`, or `src/db/client.test.ts` unless the user separately authorizes their inclusion.

---

## Plan Completion Checklist

- [ ] Tasks 1–7 were executed in order with one reviewable commit per task.
- [ ] Canonical Glacier tokens match the approved specification.
- [ ] Violet, mint, green-theme, heavy gold, and duplicated old glass roles are absent from the active theme.
- [ ] Sidebar is lightly frosted and current navigation uses a small ice-blue scale.
- [ ] Interactive glass is the clearest material but remains only slightly elevated.
- [ ] Review and portfolio preserve current geometry/density and use flat data interiors.
- [ ] Records preserve all fields/behavior with one outer shell and solid inputs/fund rows.
- [ ] Trends use monotone, non-overshooting smooth curves through exact points.
- [ ] Data safety preserves export/restore behavior and restrained confirmation semantics.
- [ ] Tables, inputs, fund rows, allocation rows, safety groups, and chart canvases have no backdrop blur.
- [ ] Reduced motion, keyboard focus, fallback, 40px targets, and 200% zoom are verified.
- [ ] No dependency, route, schema, backup-format, or product-scope change occurred.
- [ ] Existing user-owned uncommitted changes remain unstaged and unmodified by this work.
- [ ] Full checks, production build, five-page browser workflow, screenshots, and QA report pass with no unresolved failure.
- [ ] Branch remains `codex/v2-multi-page-dashboard`; no merge, push, tag, or worktree removal occurred.
