# Gold-Finger UI System Redesign Handoff

## Outcome to Deliver

Implement the approved **Warm Editorial Finance** redesign for the Gold-Finger desktop MVP. Completely remove user-selectable Accent themes, establish one fixed semantic design system, reduce card/border/background noise, rebuild page hierarchy around the current net worth, and preserve every business and data behavior.

## Safe Git State

- Original pre-redesign checkpoint branch: `codex/pre-ui-redesign-checkpoint-2026-08-26`
- Original checkpoint commit: `c041422 chore: checkpoint before UI system redesign`
- Implementation branch: `codex/ui-system-redesign`
- Isolated worktree: `/Users/tangfeitong/Desktop/Gold-Finger/.worktrees/ui-system-redesign`
- Approved design-spec commit: `3f003b6 docs: define UI system redesign`
- Baseline at handoff: 16 test files, 106 tests passed.
- Product implementation status: no redesign production code has been written yet.

Work only in the isolated worktree. Do not switch the original checkout away from its checkpoint branch, merge branches, delete the checkpoint, or move uncommitted files between checkouts.

## Read First

1. `/Users/tangfeitong/Desktop/Gold-Finger/.worktrees/ui-system-redesign/AGENTS.md`
2. `docs/product-scope.md`
3. `audit/ui-redesign-2026-08-26/report.md`
4. `docs/superpowers/specs/2026-08-26-ui-system-redesign-design.md`
5. `docs/superpowers/plans/2026-08-26-ui-system-redesign.md`
6. Relevant Next.js 16.3 documentation under `node_modules/next/dist/docs/` before editing Next.js code.

## Non-Negotiable Decisions

- The selected direction is Warm Editorial Finance: warm off-white surfaces, ink text, fixed deep vermilion Accent.
- The theme selector, all seven presets, ThemeSettings UI, bootstrap script, `gold-finger-theme-v1` read path, theme state, and theme tests must be deleted.
- Header right side remains empty after theme removal; do not add filler controls.
- No new dependencies, routes, database changes, financial features, mobile navigation, mobile-specific components, or speculative abstractions.
- Keep the existing Server Component page data flow and current client component boundaries.
- Preserve form validation, error focus, save focus return, calculations, delete confirmation, backup/restore format, and all persisted data behavior.
- Desktop acceptance widths: 1280, 1366, 1440, 1512, 1600, and 1920px.

## Execution Method

Use `superpowers:executing-plans` for a direct next-task takeover, or `superpowers:subagent-driven-development` only if the user explicitly requests subagents. Execute the implementation plan task by task. Do not skip RED verification for structural/behavioral changes, do not combine commits across plan tasks, and do not claim completion before full project checks and browser evidence pass.

## Required Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Final browser QA must use the in-app Browser at `http://localhost:3000` and must save inspected screenshots and the report under `audit/ui-redesign-final-2026-08-26/`.

## Known Workspace Detail

Running `npm install` with the current npm version may mechanically move `hasInstallScript` metadata inside `package-lock.json`. That unrelated lockfile change was deliberately removed before this handoff. Do not commit lockfile changes unless a real dependency change is explicitly required.

## Copy-Paste Prompt for the Next Task

```text
Continue the Gold-Finger UI system redesign in the existing isolated worktree:
/Users/tangfeitong/Desktop/Gold-Finger/.worktrees/ui-system-redesign

Work only on branch codex/ui-system-redesign. Read AGENTS.md and then read, in order:
1. docs/superpowers/handoffs/2026-08-26-ui-system-redesign.md
2. docs/superpowers/specs/2026-08-26-ui-system-redesign-design.md
3. docs/superpowers/plans/2026-08-26-ui-system-redesign.md

Use the superpowers:executing-plans skill and execute the plan task by task with TDD and the specified commits. Preserve the checkpoint branch codex/pre-ui-redesign-checkpoint-2026-08-26. Do not merge or push without asking. Continue through all required checks and desktop browser QA; save final screenshot evidence and the QA report exactly where the plan specifies.
```

## First Action in the Next Task

Confirm the branch and clean state:

```bash
git branch --show-current
git status --short
git log -3 --oneline
```

Expected branch: `codex/ui-system-redesign`. Expected working tree: clean after the handoff-document commit.
