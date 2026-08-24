# Open-source Repository Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize Gold-Finger's repository entry points and documentation so users and contributors can understand the project quickly.

**Architecture:** Preserve the existing Next.js, database, and feature boundaries. Move only repository tooling and documentation, then update all references and add the minimum conventional open-source files.

**Tech Stack:** Node.js 24, npm, Next.js App Router, strict TypeScript, Vitest, Markdown, zsh launchers

**Spec:** `docs/designs/2026-08-24-open-source-repository-structure-design.md`

## Global Constraints

- Do not change application behavior or existing Drizzle migration filenames.
- Do not add dependencies.
- Keep the MVP desktop-only.
- Keep `package.json` marked `private`.
- Do not create a Git commit unless the user requests one.

---

### Task 1: Make launcher and tooling names consistent

**Files:**

- Rename: `启动 Gold-Finger.command` to `Gold-Finger.command`
- Move: `src/scripts/start-demo.mjs` to `scripts/start-demo.mjs`
- Move and rename: `src/scripts/open-gold-finger.test.ts` to `scripts/macos-launchers.test.ts`
- Move: `src/scripts/start-demo.test.ts` to `scripts/start-demo.test.ts`
- Modify: `package.json`
- Modify: `vitest.config.ts`

**Interfaces:**

- Consumes: the existing `npm run dev`, `npm run dev:demo`, and macOS launcher behavior.
- Produces: symmetric root launchers and root-level repository tooling discovered by Vitest.

- [x] **Step 1: Move the launcher tests and update them to reference the new paths.**
- [x] **Step 2: Update Vitest discovery and run the launcher tests to verify they fail because the new launcher and script paths do not yet exist.**
- [x] **Step 3: Rename and move the production scripts, then update `package.json`.**
- [x] **Step 4: Run `npm test -- scripts/macos-launchers.test.ts scripts/start-demo.test.ts` and confirm all script tests pass.**

### Task 2: Consolidate contributor-facing documentation

**Files:**

- Move: `PROJECT.md` to `docs/product-scope.md`
- Move: `TASKS.md` to `docs/mvp-backlog.md`
- Move: `docs/MVP_ACCEPTANCE.md` to `docs/mvp-acceptance.md`
- Move: historical files from `docs/superpowers/specs` to `docs/designs`
- Move: historical files from `docs/superpowers/plans` to `docs/plans`
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`

**Interfaces:**

- Consumes: existing product scope, backlog, acceptance records, designs, and plans.
- Produces: a conventional open-source documentation surface with lowercase kebab-case paths.

- [x] **Step 1: Move existing documents without rewriting their historical content.**
- [x] **Step 2: Add the standard MIT license text for `Gold-Finger contributors`.**
- [x] **Step 3: Add concise contribution instructions matching `AGENTS.md` and the package commands.**
- [x] **Step 4: Search the repository for references to all former paths and update every active reference.**

### Task 3: Make README the repository map

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: the final repository paths and existing setup and usage instructions.
- Produces: a user-first README with project status, quick start, complete structure map, privacy guidance, contribution instructions, and license information.

- [x] **Step 1: Update document and launcher links to their final paths.**
- [x] **Step 2: Replace the abbreviated structure section with a complete annotated repository tree.**
- [x] **Step 3: Add contribution and license sections while preserving the existing user workflow and data-safety guidance.**

### Task 4: Verify the repository migration

**Files:**

- Verify: all changed files

**Interfaces:**

- Consumes: the reorganized repository.
- Produces: evidence that the structure is internally consistent and the application still passes all required checks.

- [x] **Step 1: Run searches for former filenames and directories; confirm no stale active references remain.**
- [x] **Step 2: Run `npm run format:check`.**
- [x] **Step 3: Run `npm run lint`.**
- [x] **Step 4: Run `npm run typecheck`.**
- [x] **Step 5: Run `npm test`.**
- [x] **Step 6: Run `npm run build`.**
- [x] **Step 7: Review `git status --short` and `git diff --stat` to confirm the change set matches the approved scope.**
