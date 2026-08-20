# Monthly Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single responsive form that creates and edits complete monthly financial snapshots with clear validation and persistence feedback.

**Architecture:** The page remains a Server Component that loads one month from SQLite and passes serializable defaults into a focused Client Component. A Server Action delegates untrusted `FormData` to a pure parser and a repository-backed save use case, preserving the existing database boundary and making behavior testable without a browser framework.

**Tech Stack:** Node.js 24, Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS/CSS, SQLite/Drizzle, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-20-monthly-entry-design.md`

## Global Constraints

- Do not add dependencies.
- Do not change the Task 1 schema or migration.
- Route and Client Component code must not import database modules or contain SQL.
- Store money as integer cents; accept user input in yuan with at most two decimal places.
- Do not implement Task 3 calculations or result views.
- Preserve the user's existing uncommitted files and avoid unrelated refactors.

---

### Task 1: Parse and validate monthly entry form data

**Files:**
- Create: `src/features/monthly-snapshots/form-data.ts`
- Create: `src/features/monthly-snapshots/form-data.test.ts`

**Interfaces:**
- Consumes: `INVESTMENT_CATEGORY_IDS` and `MonthlySnapshotInput`.
- Produces: `parseMonthlySnapshotFormData(formData: FormData): ParseResult`, where success contains `MonthlySnapshotInput` and failure contains `Record<string, string>` field errors.

- [ ] **Step 1: Write failing parser tests**

Create literal `FormData` cases that prove `1234.56` becomes `123456`, zero is valid, multiple funds retain order, no funds is valid, and invalid month/negative/precision/non-number/blank fund name/unknown category yield the exact field key.

```ts
const result = parseMonthlySnapshotFormData(validFormData());
expect(result).toEqual({ ok: true, value: expectedSnapshot });

expect(parseMonthlySnapshotFormData(withField("expense", "-1"))).toMatchObject({
  ok: false,
  errors: { expense: "请输入不小于 0 的金额，最多保留两位小数" },
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/features/monthly-snapshots/form-data.test.ts`

Expected: FAIL because `form-data.ts` or the exported parser does not exist.

- [ ] **Step 3: Implement the minimal pure parser**

Use string splitting rather than floating-point multiplication. Validate `YYYY-MM`, all seven required money fields, `fundCount`, trimmed fund names, fixed category membership, and both money fields for every fund. Return all detected errors in one pass.

```ts
export type ParseResult =
  | { ok: true; value: MonthlySnapshotInput }
  | { ok: false; errors: Record<string, string> };

export function parseMonthlySnapshotFormData(formData: FormData): ParseResult;
```

- [ ] **Step 4: Run parser tests and verify GREEN**

Run: `npm test -- src/features/monthly-snapshots/form-data.test.ts`

Expected: all parser tests pass with no warnings.

---

### Task 2: Save a parsed snapshot through the existing repository

**Files:**
- Create: `src/features/monthly-snapshots/save.ts`
- Create: `src/features/monthly-snapshots/save.test.ts`

**Interfaces:**
- Consumes: `parseMonthlySnapshotFormData` and a structural repository with `findByMonth`, `create`, and `update`.
- Produces: `saveMonthlySnapshot(repository, formData): MonthlySnapshotFormState` with `status`, `message`, and `fieldErrors`.

- [ ] **Step 1: Write failing save tests**

Use a migrated in-memory SQLite database and the real repository. Prove a valid form creates a missing month, a second submission updates that month without creating another, invalid input leaves prior data unchanged, and a thrown repository error becomes a recoverable message without SQLite details.

```ts
expect(saveMonthlySnapshot(repository, createFormData())).toEqual({
  status: "success",
  message: "2026-08 已保存",
  fieldErrors: {},
});
expect(repository.findByMonth("2026-08")?.cashFlow.expenseCents).toBe(800000);
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/features/monthly-snapshots/save.test.ts`

Expected: FAIL because the save use case is missing.

- [ ] **Step 3: Implement create-or-update behavior**

Return validation errors before accessing the repository. Otherwise find by month and call `update` when present or `create` when absent. Catch persistence exceptions and return `保存失败，请重试。`.

```ts
export type MonthlySnapshotFormState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: Record<string, string>;
};

export function saveMonthlySnapshot(
  repository: MonthlySnapshotRepository,
  formData: FormData,
): MonthlySnapshotFormState;
```

- [ ] **Step 4: Run save and existing repository tests**

Run: `npm test -- src/features/monthly-snapshots/save.test.ts src/features/monthly-snapshots/repository.test.ts`

Expected: all selected tests pass.

---

### Task 3: Add the application database and Server Action boundary

**Files:**
- Modify: `src/db/client.ts`
- Create: `src/features/monthly-snapshots/actions.ts`

**Interfaces:**
- Consumes: existing `openDatabase`, Drizzle migrations, repository factory, and `saveMonthlySnapshot`.
- Produces: `getApplicationDatabase()` and async `saveMonthlySnapshotAction(previousState, formData)`.

- [ ] **Step 1: Add a failing application database test**

Extend `src/db/client.test.ts` to set a temporary `DATABASE_FILE`, call `getApplicationDatabase()`, and assert the migrated `monthly_snapshots` table exists. Add a test-only reset only if module caching makes isolation impossible; prefer passing an explicit filename to a helper over production cleanup APIs.

- [ ] **Step 2: Run the database test and verify RED**

Run: `npm test -- src/db/client.test.ts`

Expected: FAIL because the application migration entry point is missing.

- [ ] **Step 3: Implement lazy migrated access and the action wrapper**

Add a lazy singleton for the default application connection, with migration performed exactly once. The action creates the repository, calls the save use case, runs `revalidatePath("/")` on success, and returns only `MonthlySnapshotFormState`.

```ts
"use server";

export async function saveMonthlySnapshotAction(
  _previousState: MonthlySnapshotFormState,
  formData: FormData,
): Promise<MonthlySnapshotFormState>;
```

- [ ] **Step 4: Run database, save, and type checks**

Run: `npm test -- src/db/client.test.ts src/features/monthly-snapshots/save.test.ts && npm run typecheck`

Expected: tests and strict type checking pass.

---

### Task 4: Build the responsive accessible monthly form

**Files:**
- Create: `src/features/monthly-snapshots/monthly-snapshot-form.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: serializable `MonthlySnapshotInput | null`, fixed categories, and `saveMonthlySnapshotAction`.
- Produces: `MonthlySnapshotForm({ month, snapshot })` with dynamic fund rows and full field feedback.

- [ ] **Step 1: Implement the narrow Client Component**

Use `useActionState`, local fund-row IDs, semantic `fieldset`/`legend`, labelled inputs, `inputMode="decimal"`, `min="0"`, `step="0.01"`, linked error text, an `aria-live` status, and disabled pending submit text. Keep all database imports outside the client graph.

```tsx
const [state, formAction, pending] = useActionState(
  saveMonthlySnapshotAction,
  initialMonthlySnapshotFormState,
);

<form action={formAction} noValidate>
  <input type="hidden" name="month" value={month} />
  <input type="hidden" name="fundCount" value={fundRows.length} />
</form>
```

The add button appends one blank row. Each remove button has an explicit accessible label containing the fund position or name. Do not add animation, modal, autosave, or wizard state.

- [ ] **Step 2: Add scoped responsive styling**

Replace the placeholder hero rules with a restrained application shell, section cards, two-column desktop fields, fund grid, visible focus, error/success colors, disabled state, and a single-column breakpoint at `40rem`. Ensure inputs use `min-width: 0` and no page-level horizontal overflow at 320px.

- [ ] **Step 3: Run formatting, lint, and type checking**

Run: `npm run format:check && npm run lint && npm run typecheck`

Expected: all commands exit 0.

---

### Task 5: Connect route loading, empty, editing, and error states

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/loading.tsx`
- Create: `src/app/error.tsx`

**Interfaces:**
- Consumes: `getApplicationDatabase`, repository `findByMonth`, `MonthlySnapshotForm`, and `searchParams: Promise<{ month?: string }>`.
- Produces: force-dynamic `/` route controlled by `?month=YYYY-MM`, a loading skeleton, and a retryable route error boundary.

- [ ] **Step 1: Replace the placeholder page**

Resolve a valid query month or the current local `YYYY-MM`, load the selected snapshot on the server, render a GET month picker with an explicit “载入月份” button, and render the form with either saved defaults or zero/empty defaults.

```tsx
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) { /* load and render */ }
```

Show concise mode copy: existing month is editable; missing month is ready for its first record. Do not show Task 3 metrics.

- [ ] **Step 2: Add meaningful loading and error UI**

`loading.tsx` renders labelled skeleton sections without pretending data is zero. `error.tsx` is a Client Component that shows a generic database failure message and calls `reset()` from a retry button.

- [ ] **Step 3: Run full automated verification**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`

Expected: every command exits 0 and the production build includes `/` without creating tracked source changes.

---

### Task 6: Browser QA and backlog handoff

**Files:**
- Modify: `TASKS.md`

**Interfaces:**
- Consumes: running local application and Task 2 acceptance criteria.
- Produces: verified Task 2 status and clean scoped diff.

- [ ] **Step 1: Run the app and inspect desktop and mobile**

At approximately 1440px and 375px widths, verify empty form, existing-month load, fund add/remove, valid save, validation errors, pending feedback, retry/error presentation where practical, no horizontal overflow, tab order, visible focus, labels, and status announcements.

- [ ] **Step 2: Fix only issues directly found in Task 2**

For any behavior bug, first add or adjust a failing unit/integration test, then make the minimum correction and rerun the relevant test. For purely visual defects, make the smallest CSS/markup change and repeat browser inspection.

- [ ] **Step 3: Mark Task 2 Done and run final fresh verification**

Add `**Status:** Done` under Task 2. Then run:

`npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`

Expected: all checks exit 0 after the status edit.

- [ ] **Step 4: Inspect the final diff**

Run: `git status --short && git diff --check && git diff --stat && git diff -- src TASKS.md`

Expected: no whitespace errors; changes are limited to Task 2, its tests, plan/spec documentation, and existing user-owned Task 1 files remain untouched except the planned `src/db/client.ts` extension.
