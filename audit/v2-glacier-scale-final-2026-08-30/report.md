# Gold-Finger V2 Glacier Scale Final QA

## Environment

- Date: 2026-08-30 (Asia/Shanghai)
- OS: macOS 26.6.2 (25G83), arm64
- Node.js: v24.15.0
- npm: 11.12.1
- Next.js: 16.3.1 (webpack build)
- Browser: Codex In-app Browser (`iab`); the runtime did not expose its engine version or user agent
- Branch: `codex/v2-multi-page-dashboard`
- Starting commit: `217a341f8e609bbfd1b80bbac6f3a6a4439136ff`
- Final commit: the Task 7 commit containing this report; its hash is recorded in the task handoff because a commit cannot contain its own hash

## Isolated database and server

- Temporary database: `/private/tmp/gold-finger-glacier-qa.x7lrBB/glacier-qa.db`
- Server command: `DATABASE_FILE=/private/tmp/gold-finger-glacier-qa.x7lrBB/glacier-qa.db npm run dev -- --hostname 127.0.0.1 --port 3100`
- Bound URL: `http://127.0.0.1:3100`
- The normal user database was not read, copied, or overwritten.

## Automated verification

| Command                                              | Result                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `npm run format:check`                               | PASS                                                                 |
| `npm run lint`                                       | PASS                                                                 |
| `npm run typecheck`                                  | PASS                                                                 |
| `npm test` (initial)                                 | PASS — 29 files, 156 tests                                           |
| `npm run build` (initial)                            | PASS                                                                 |
| `npm test -- src/app/route-metadata.test.ts` (RED)   | Expected FAIL — root title was still the single string `Gold-Finger` |
| `npm test -- src/app/route-metadata.test.ts` (GREEN) | PASS — 1 file, 1 test                                                |
| `npm run check` (final)                              | PASS — 30 files, 157 tests                                           |
| `npm run build` (final)                              | PASS                                                                 |

The final build listed `/`, `/records`, `/portfolio`, `/trends`, `/data`, `/api/backup`, and `/api/launcher`.

## Representative test data

The month `2026-08` was created through the real `/records` UI with:

- Income: `25000`
- Expense: `8500`
- Investment profit/loss: `1200`
- Emergency fund: `60000`
- Goal fund: `30000`
- Daily cash: `15000`
- Nasdaq-100 fund: market value `80000`, contribution `5000`
- China bond fund: market value `50000`, contribution `2000`
- Huabei liability: `2500`

Expected and observed calculations matched:

| Metric          |      Expected |      Observed |
| --------------- | ------------: | ------------: |
| Net worth       | `¥232,500.00` | `¥232,500.00` |
| Monthly balance |  `+¥9,500.00` |  `+¥9,500.00` |
| Cash            | `¥105,000.00` | `¥105,000.00` |
| Investment      | `¥130,000.00` | `¥130,000.00` |
| Liability       |   `¥2,500.00` |   `¥2,500.00` |

## Five-page interaction results

| Route                      | Page identity and rendering                                                                                           | Interaction proof                                                                                                             | Result |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------ |
| `/?month=2026-08`          | Unique title `月度复盘 \| Gold-Finger`; net-worth shell, five metrics, trend preview, and allocation summary rendered | Save and restore both returned to the review with exact values                                                                | PASS   |
| `/records?month=2026-08`   | Unique title `月度记录 \| Gold-Finger`; one L2 form shell with solid fields and fund rows                             | Invalid `abc` income kept all data, showed the error summary, and focused `#field-income`; corrected value saved and returned | PASS   |
| `/portfolio?month=2026-08` | Unique title `投资组合 \| Gold-Finger`; overview/allocation shells, flat rows, and read-only holdings rendered        | Debt allocation expanded through the keyboard path; exact two-fund table values remained visible                              | PASS   |
| `/trends?month=2026-08`    | Unique title `历史趋势 \| Gold-Finger`; unblurred chart canvas and exact-value table rendered                         | Asset/cash-flow mode switched; focusing the income point displayed `¥25,000.00`                                               | PASS   |
| `/data`                    | Unique title `数据安全 \| Gold-Finger`; one L2 shell and two L1 groups rendered                                       | Export status, file selection, permanent-replacement confirmation, successful restore, and review return all completed        | PASS   |

All five final page checks had meaningful DOM content, no framework error overlay, and no application console warnings or errors.

## Viewport and zoom matrix

The explicit Browser viewport was 1440×1000 for five-page QA. The review route was additionally checked at:

| Width | Page horizontal overflow | Key values clipped | Sidebar/main geometry |
| ----: | ------------------------ | ------------------ | --------------------- |
|  1280 | No                       | No                 | Stable                |
|  1366 | No                       | No                 | Stable                |
|  1440 | No                       | No                 | Stable                |
|  1512 | No                       | No                 | Stable                |
|  1600 | No                       | No                 | Stable                |
|  1920 | No                       | No                 | Stable                |

Exact browser zoom control was not exposed. Equivalent CSS-width proxies were inspected instead:

| Proxy          | CSS width | Horizontal overflow | Key values                                              |
| -------------- | --------: | ------------------- | ------------------------------------------------------- |
| 125% of 1440px |      1152 | No                  | All inside viewport                                     |
| 200% of 1440px |       720 | No                  | All inside viewport and controls reachable by scrolling |

## Accessibility, motion, and fallback

- RED/GREEN correction: all routes initially shared `document.title = Gold-Finger`. Route metadata now produces five unique descriptive titles while keeping the product suffix.
- Current navigation exposed `aria-current="page"` on every route.
- Form validation moved focus to the first invalid field and retained the entered values.
- Focus rings were visible on navigation, inputs, file selection, segmented controls, and chart points.
- The in-app Browser locator-level keyboard API does not synthesize the native default click for ordinary buttons. Native button semantics, Tab focus, click state changes, the custom allocation-row Enter handler, and automated accessibility guardrails were confirmed; this is recorded as a tool limitation rather than a product failure.
- Reduced-motion emulation was not exposed. The passing design-system guardrail confirms the `prefers-reduced-motion: reduce` block removes transforms and reduces transitions to `0.01ms`.
- Disabling `backdrop-filter` was not exposed. Browser capability reported backdrop support; passing CSS guardrails confirm the 94% L2 and 96% L3 near-solid fallbacks.

## Material and curve evidence

Computed styles confirmed:

- L2 shells: `rgba(255, 255, 255, 0.48)` with `blur(16px)`.
- L3 segmented control: `rgba(238, 248, 255, 0.60)` with `blur(22px)`.
- Review analysis panel, form inputs, fund rows, allocation rows, holdings table, trend canvas, and safety cards: no backdrop blur.
- Trend canvas: transparent, with no shadow.

The isolated browser dataset intentionally contained one saved month, so it verified the accurate single-point fallback and exact tooltip/table values. The multi-point smooth monotone curve and non-overshooting control-point behavior are confirmed by the passing model and rendered-chart tests in the 157-test final suite. No browser-visible overshoot was available to judge with a one-month fixture.

## Glacier Scale visual criteria

| Criterion                                              | Result           | Evidence                                                                           |
| ------------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------- |
| Calm financial software before glass                   | PASS             | Financial values dominate all seven screenshots                                    |
| Cool, clean, high-luminance ice blue                   | PASS             | Navigation scale, focus, controls, charts, and allocations use restrained ice blue |
| Ambient light has no visible colored circles           | PASS             | Five page screenshots show broad mist-white light only                             |
| Persistent glass is thin and slightly elevated         | PASS             | L2 computed styles and screenshots                                                 |
| Interactive glass is clearer without protruding        | PASS             | Month controls, segmented controls, export/save actions                            |
| No persistent glass-inside-glass                       | PASS             | Computed blur audit across all five routes                                         |
| Dense data surfaces remain flat and unblurred          | PASS             | Inputs, rows, tables, and chart canvas computed as `none`                          |
| Smooth curves are accurate and non-overshooting        | PASS (automated) | Monotone geometry/render tests; browser verified one-point fallback                |
| Primary data is clear; secondary text remains readable | PASS             | Screenshot inspection at 1280–1920 and zoom proxies                                |
| States do not rely on color alone                      | PASS             | Text, signs, markers, focus, error summary, and confirmation copy                  |
| Reduced motion and fallback remain understandable      | PASS (guardrail) | Automated CSS tests; emulation unavailable                                         |
| No obvious blur-related scrolling/overlay degradation  | PASS             | Five-page interaction and screenshot inspection                                    |

## Screenshot inventory

- `01-review-1440.png` — review at 1440×1000
- `02-records-1440.png` — records first viewport at explicit 1440×1000
- `03-portfolio-1440.png` — portfolio first viewport at explicit 1440×1000
- `04-trends-1440.png` — trends first viewport at explicit 1440×1000
- `05-data-1440.png` — data safety at 1440×1000
- `06-review-1280.png` — review at 1280×1000
- `07-review-1920.png` — review at 1920×1000

The Browser initially returned JPEG-encoded bytes despite the requested `.png` filenames. All seven assets were re-encoded to real PNG files and verified with the system file inspector. Full-page stitching also introduced large blank regions on scrollable routes, so records, portfolio, and trends were recaptured as inspected first-viewport evidence, as required by the plan's no-stretch rule.

## Confirmed evidence vs. tool-limited evidence

Confirmed directly: production build, 157 automated tests, exact financial calculations, five page titles/DOMs, error focus, save/restore navigation, export status, file selection, confirmation, exact trend point values, six desktop widths, two zoom proxies, computed material hierarchy, screenshots, and console health.

Tool-limited: exact browser engine version, exact zoom percentage control, reduced-motion emulation, forced `backdrop-filter` disablement, native default-button activation through the Browser locator key API, and visual multi-month curve inspection. Each unavailable item has an automated guardrail or documented equivalent evidence. There are no unresolved application failures.
