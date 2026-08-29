# Gold-Finger V2 Multi-Page Dashboard QA Report

## Result

Task 10 automated verification and desktop visual QA passed. Two dashboard defects found during high-zoom inspection were fixed with regression coverage:

1. Dashboard financial amounts could wrap because `overflow-wrap: anywhere` was applied to amount cells.
2. At the effective width of a 200% zoomed 1440px desktop viewport, the status card, five-metric strip, and analysis grid did not reflow, causing amount overlap.

After the fixes, the final automated suite, production build, required desktop widths, five-page workflow, data-safety workflow, and equivalent high-zoom layouts passed. Runtime emulation limits of the in-app Browser are documented separately below.

## Environment

- Date: 2026-08-29
- OS: macOS 26.5.2 (25F84)
- Node.js: v24.15.0
- npm: 11.12.1
- Next.js: 16.3.1 (webpack build)
- Browser: Codex In-app Browser
- Branch: `codex/v2-multi-page-dashboard`
- Starting commit: `a21c996 fix: harden v2 route states and accessibility`
- Test database: `/private/tmp/gold-finger-v2-task10.wh05T2/qa.db`
- Temporary backup: `/private/tmp/gold-finger-v2-task10.wh05T2/backup.json`
- Server command: `DATABASE_FILE=/private/tmp/gold-finger-v2-task10.wh05T2/qa.db npm run dev -- --hostname 127.0.0.1 --port 3100`
- Test origin: `http://127.0.0.1:3100`

The first sandboxed server start returned `listen EPERM`; the same command was then run with the required local-listener approval and started successfully. The temporary database was isolated from the user's real database.

## Automated Verification

Initial verification before browser QA:

| Command                | Result                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run format:check` | PASS; all files matched Prettier style                                                              |
| `npm run lint`         | PASS; no warnings or errors                                                                         |
| `npm run typecheck`    | PASS                                                                                                |
| `npm test`             | PASS; 29 files, 141 tests                                                                           |
| `npm run build`        | PASS; `/`, `/records`, `/portfolio`, `/trends`, `/data`, `/api/backup`, and `/api/launcher` present |

TDD evidence for QA defects:

| Cycle                               | RED                                                             | GREEN                  |
| ----------------------------------- | --------------------------------------------------------------- | ---------------------- |
| Keep dashboard amounts on one line  | `npm test -- src/app/design-system.test.ts`: 1 failed, 6 passed | Same command: 7 passed |
| Reflow dashboard at high zoom       | Same command: 1 failed, 7 passed                                | Same command: 8 passed |
| Reduce high-zoom asset-cell padding | Same command: 1 failed, 7 passed                                | Same command: 8 passed |

Final verification after the fixes:

| Command         | Result                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| `npm run check` | PASS; format, lint, typecheck, and tests all passed; 29 files, 143 tests |
| `npm run build` | PASS; compiled successfully and listed all required page/API routes      |

## Test Data

The browser workflow created one isolated 2026-08 snapshot:

- Income: ¥25,000.00
- Expense: ¥8,500.00
- Investment profit/loss: +¥1,200.00
- Cash: ¥105,000.00
- Investments: ¥130,000.00
- Liability: ¥2,500.00
- Funds: Nasdaq-100 index ¥80,000.00 with +¥5,000.00 contribution; China bond fund ¥50,000.00 with +¥2,000.00 contribution

Expected displayed results were confirmed: net worth ¥232,500.00 and monthly balance +¥9,500.00.

## Five-Page Workflow

| URL                        | Confirmed evidence                                                                                                                                                                                 | Result |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `/?month=2026-08`          | Sidebar selection, status card, net worth, five cash-flow metrics, 45:55 analysis grid, trend summary, allocation summary                                                                          | PASS   |
| `/records?month=2026-08`   | Form visible on load; invalid `10000+` income produced an error summary and focused the income field; corrected save returned to review with current data; delete action remained record-page-only | PASS   |
| `/portfolio?month=2026-08` | Full stock → US market → Nasdaq-100 hierarchy, bond allocation, holdings table, and zero editable fields                                                                                           | PASS   |
| `/trends?month=2026-08`    | Asset mode, income/expense mode, one-chart-at-a-time behavior, and monthly data table                                                                                                              | PASS   |
| `/data`                    | No month query; export success status; backup selection; permanent replacement confirmation; successful restore POST and return to `/`                                                             | PASS   |

All observed page requests, backup GET requests, and the restore POST returned HTTP 200. The browser console contained no warning or error entries during the tested interactions.

## Viewport And Zoom Matrix

The review page was inspected at every required desktop width. DOM measurements used `window.innerWidth`, document scroll width, sidebar/main bounding boxes, and financial text bounds.

| Viewport  | Horizontal overflow | Sidebar/main geometry | Financial amounts        | Result |
| --------- | ------------------- | --------------------- | ------------------------ | ------ |
| 1280×1000 | None                | 210px / 1070px        | Single line, not clipped | PASS   |
| 1366×1000 | None                | 210px / 1156px        | Single line, not clipped | PASS   |
| 1440×1000 | None                | 210px / 1230px        | Single line, not clipped | PASS   |
| 1512×1000 | None                | 210px / 1302px        | Single line, not clipped | PASS   |
| 1600×1000 | None                | 210px / 1390px        | Single line, not clipped | PASS   |
| 1920×1000 | None                | 210px / 1710px        | Single line, not clipped | PASS   |

The in-app Browser accepted only one native zoom step (approximately 112.5%) and would not advance to exact 125% or 200%. To test the same available CSS space, the app was additionally inspected at effective widths of 1152px and 720px:

- 1152px proxy for 1440px at 125%: no document overflow; amounts remained single-line and visually inside their cells.
- 720px proxy for 1440px at 200%: after the fix, no document overflow; status card reflowed to one column; the funds strip reflowed to two columns; analysis panels reflowed to one column; all amounts remained single-line and inside their cells; all 12 links/buttons were reachable.

This is strong layout evidence but not a direct assertion that the browser rendered at exact native 125% and 200% zoom.

## Accessibility And Surface Boundaries

Confirmed by automated guardrails and computed browser styles:

- `:focus-visible` retains a 2px outline with 2px offset.
- All interactive controls retain a minimum 40px target.
- Reduced-motion CSS removes hover/active transforms and collapses animation/transition duration.
- Fallback Frosted/Liquid backgrounds are near-solid when `backdrop-filter` is unsupported.
- Frosted and Liquid surfaces use their intended blur levels in the tested browser.
- Allocation rows and chart canvases compute to `backdrop-filter: none` and transparent backgrounds.
- Positive/negative meaning remains accompanied by signs and labels rather than color alone.

The in-app Browser did not expose runtime media emulation or a mechanism to disable `backdrop-filter`. Therefore reduced-motion activation and fallback rendering were confirmed through the passing CSS guardrail tests, not through direct runtime toggling. Keyboard Tab events were consumed by the browser shell instead of the page, so the visible focus ring was also validated by the automated guardrail rather than a screenshot.

## Ice Crystal Visual Criteria

| Criterion                                                                      | Result | Evidence                                                                                     |
| ------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------- |
| Ambient gradients do not read as colored circles                               | PASS   | All required screenshots                                                                     |
| Page reads as clean finance UI before glass                                    | PASS   | Five 1440px page screenshots                                                                 |
| Frosted cards remain thin, light, and low elevation                            | PASS   | Review, portfolio, and data screenshots                                                      |
| Liquid controls are stronger than content surfaces without becoming decoration | PASS   | Month switcher, segmented controls, and actions                                              |
| No purple-tech, Web3, Crypto, neon, glow, or saturated-gradient impression     | PASS   | All screenshots                                                                              |
| Allocation rows and charts remain data-first and free of nested blur           | PASS   | Computed styles plus portfolio/trends screenshots                                            |
| Text, amounts, labels, and business states remain clear                        | PASS   | DOM, screenshots, and high-zoom proxies                                                      |
| No obvious blur-related scroll degradation                                     | PASS   | Full records-page scroll to the end; sticky sidebar remained stable and console stayed clean |

## Screenshot Evidence

- `01-review-1440.png` — review dashboard at a 1440px CSS viewport.
- `02-records-1440.png` — full records page at a 1440px CSS viewport; the 1425px raster width excludes the scrollbar gutter.
- `03-portfolio-1440.png` — full portfolio page at a 1440px CSS viewport; the 1425px raster width excludes the scrollbar gutter.
- `04-trends-1440.png` — full trends page at a 1440px CSS viewport; the 1425px raster width excludes the scrollbar gutter.
- `05-data-1440.png` — data-safety confirmation state at a 1440px CSS viewport.
- `06-review-1280.png` — review dashboard at a 1280px CSS viewport.
- `07-review-1920.png` — review dashboard inspected at a 1920px CSS viewport; the in-app Browser capped the exported raster at 1600px, while DOM evidence confirmed `window.innerWidth === 1920`, document width 1920px, and no overflow.

The in-app Browser's `fullPage` capture distorted pages whose content did not exceed the viewport and could reuse a stale narrow raster after repeated dynamic viewport changes. Required non-scrolling screenshots therefore use normal viewport capture from individually verified buffers. Scrollable records, portfolio, and trends screenshots use full-page capture. These capture limitations did not appear in the live DOM, computed geometry, or normal viewport screenshots.

## Confirmed Evidence Versus Tool Limits

Directly confirmed:

- All automated checks and build routes.
- Five-page routing and month propagation.
- Save validation/focus, successful save return, read-only portfolio, trend switching, export, restore confirmation, successful restore return.
- Desktop width geometry, absence of horizontal overflow, financial text bounds, high-zoom equivalent reflow, computed blur boundaries, and scroll behavior.

Tool-limited rather than directly emulated:

- Exact native 125% and 200% zoom levels.
- Active `prefers-reduced-motion: reduce` runtime media state.
- Runtime browser with `backdrop-filter` disabled.
- Screenshot raster wider than the Browser's 1600px export cap.

No application failures remained after the implemented fixes.
