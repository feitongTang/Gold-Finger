# Gold-Finger Project Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a runnable, documented, and verified monolithic Next.js foundation for the Gold-Finger MVP without implementing finance features.

**Architecture:** One Next.js App Router process owns the UI and future server-side operations. SQLite access is isolated in `src/db`, while future business capabilities will live vertically under `src/features` and keep financial calculations framework-independent.

**Tech Stack:** Node.js 24 LTS, npm, Next.js, React, strict TypeScript, Tailwind CSS, SQLite, Drizzle ORM/Kit, ESLint, Prettier, Vitest

**Spec:** `docs/superpowers/specs/2026-08-20-project-initialization-design.md`

## Global Constraints

- Build a single-user, local-first application centered on monthly snapshots.
- Do not add authentication, remote services, Docker, CI, a component library, a state-management library, charts, or finance business behavior.
- Install only stable package releases and commit `package-lock.json`.
- Keep SQL and database imports out of route components and browser code.
- Create only directories and abstractions used by the initialized application.

---

## File Map

- `package.json`, `package-lock.json`: dependency lock and development commands.
- `.nvmrc`: Node.js 24 runtime convention.
- `next.config.ts`, `tsconfig.json`, `next-env.d.ts`: Next.js and strict TypeScript configuration.
- `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`: lint and formatting configuration.
- `postcss.config.mjs`: Tailwind PostCSS integration.
- `vitest.config.ts`: Node-based test configuration and `@` alias.
- `.gitignore`, `.env.example`: generated/local-file exclusions and local database path example.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`: neutral runnable application shell.
- `src/db/client.ts`: the only initialized SQLite connection factory.
- `src/db/client.test.ts`: isolated in-memory database smoke test.
- `src/db/schema.ts`: explicit schema boundary, intentionally empty until the persistence task.
- `drizzle.config.ts`: migration tool configuration for the future checked-in schema.
- `README.md`: setup, commands, architecture, scope, and data-location notes.
- `AGENTS.md`: concise long-lived instructions for future Codex tasks.
- `TASKS.md`: short dependency-ordered MVP backlog.

### Task 1: Toolchain and runnable application shell

**Files:**

- Create: `package.json`
- Create: `package-lock.json` through npm
- Create: `.nvmrc`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

**Interfaces:**

- Consumes: Node.js 24 and npm.
- Produces: `npm run dev`, `npm run lint`, `npm run format:check`, `npm run typecheck`, and `npm test`; the `@/*` alias maps to `src/*`.

- [ ] **Step 1: Create the package manifest**

Create a private ESM package named `gold-finger` with these scripts:

```json
{
  "name": "gold-finger",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24 <25" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "check": "npm run format:check && npm run lint && npm run typecheck && npm test"
  }
}
```

- [ ] **Step 2: Install the minimal stable toolchain**

Run the equivalent of:

```bash
npm install next@latest react@latest react-dom@latest
npm install --save-dev @tailwindcss/postcss@latest @types/node@latest @types/react@latest @types/react-dom@latest eslint@latest eslint-config-next@latest prettier@latest tailwindcss@latest typescript@latest vite-tsconfig-paths@latest vitest@latest
```

Confirm `package-lock.json` is generated and no prerelease version was selected.

- [ ] **Step 3: Add framework, TypeScript, lint, format, CSS, and test configuration**

Create `tsconfig.json` with strict mode, `noEmit`, `moduleResolution: "bundler"`, the Next.js plugin, and `"@/*": ["./src/*"]`. Create `next-env.d.ts` with the standard Next.js type references, and keep it out of manual edits after initialization.

Create `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "coverage/**", "next-env.d.ts"]),
]);
```

Create `.prettierrc.json` with `{ "trailingComma": "all" }`, and ignore `.next`, `coverage`, `node_modules`, `package-lock.json`, and generated migration metadata. Create `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write the neutral application shell**

Create a Chinese-language root layout with metadata title `Gold-Finger` and description `个人月度财务复盘工具`. The page must remain a server component and render only this semantic shell:

```tsx
<main>
  <section>
    <p>个人月度财务复盘</p>
    <h1>Gold-Finger</h1>
    <p>用于低频记录现金流与资产快照，清楚了解每个月的钱如何流动。</p>
    <p>项目骨架已就绪，业务功能将按 TASKS.md 逐步实现。</p>
  </section>
</main>
```

Use `globals.css` for a minimal desktop-oriented centered layout, system fonts, a light neutral background, readable foreground contrast, and visible focus defaults. Do not add forms, sample financial values, navigation, charts, or client-side state.

- [ ] **Step 5: Verify the initial shell statically**

Run:

```bash
npm run format
npm run lint
npm run typecheck
```

Expected: all three commands exit with status 0.

### Task 2: SQLite infrastructure smoke test

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json` through npm
- Create: `.env.example`
- Modify: `.gitignore`
- Create: `drizzle.config.ts`
- Create: `src/db/client.ts`
- Create: `src/db/client.test.ts`
- Create: `src/db/schema.ts`

**Interfaces:**

- Consumes: `DATABASE_FILE`, defaulting to `./data/gold-finger.db`.
- Produces: `openDatabase(filename?: string): { sqlite: Database.Database; db: BetterSQLite3Database }`, plus `db:generate` and `db:migrate` npm scripts.

- [ ] **Step 1: Install the database packages**

Run the equivalent of:

```bash
npm install better-sqlite3@latest drizzle-orm@latest
npm install --save-dev @types/better-sqlite3@latest drizzle-kit@latest
```

Confirm stable releases were selected and add:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 2: Write the failing database smoke test**

Create `src/db/client.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";

import { openDatabase } from "@/db/client";

const openConnections: Array<ReturnType<typeof openDatabase>["sqlite"]> = [];

afterEach(() => {
  for (const connection of openConnections.splice(0)) connection.close();
});

describe("openDatabase", () => {
  it("opens SQLite with foreign keys enabled", () => {
    const { sqlite } = openDatabase(":memory:");
    openConnections.push(sqlite);

    const row = sqlite.prepare("PRAGMA foreign_keys").get() as {
      foreign_keys: number;
    };

    expect(row.foreign_keys).toBe(1);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```bash
npm test -- src/db/client.test.ts
```

Expected: failure because `@/db/client` does not exist.

- [ ] **Step 4: Implement the minimal connection factory**

Create `src/db/client.ts`:

```ts
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const defaultDatabaseFile = "./data/gold-finger.db";

export function openDatabase(
  filename = process.env.DATABASE_FILE ?? defaultDatabaseFile,
) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });

  const sqlite = new Database(filename);
  sqlite.pragma("foreign_keys = ON");

  return { sqlite, db: drizzle(sqlite) };
}
```

Create `src/db/schema.ts`:

```ts
// The first MVP persistence task will define the monthly snapshot schema here.
export {};
```

Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_FILE ?? "./data/gold-finger.db",
  },
});
```

Add `.env.example` with `DATABASE_FILE=./data/gold-finger.db`; ignore `.env*` except `.env.example`, `data/*.db*`, `.next`, coverage, and dependency artifacts.

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
npm test -- src/db/client.test.ts
```

Expected: one passing test and zero failures.

- [ ] **Step 6: Verify the database configuration is loadable**

Run:

```bash
npx drizzle-kit generate
```

Expected: the command loads configuration and reports no schema changes or no tables without creating a business migration. If the current stable CLI rejects an empty schema, defer migration generation to the first persistence task and document that fact instead of inventing a table.

### Task 3: Long-lived repository documentation and MVP backlog

**Files:**

- Replace: `README.md`
- Create: `AGENTS.md`
- Create: `TASKS.md`

**Interfaces:**

- Consumes: the actual scripts, directories, runtime, and architecture created in Tasks 1–2 plus `PROJECT.md`.
- Produces: setup guidance for people, durable task guidance for Codex, and the next business task sequence.

- [ ] **Step 1: Rewrite README from the actual repository**

Use the headings `Gold-Finger`, `Current status`, `Technical stack`, `Local setup`, `Commands`, `Project structure`, and `Architecture boundaries`. Include the exact setup sequence:

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Document `dev`, `build`, `start`, `format`, `format:check`, `lint`, `typecheck`, `test`, `test:watch`, `check`, `db:generate`, and `db:migrate`; state that local data defaults to `data/gold-finger.db`; state that no finance flow is implemented yet.

- [ ] **Step 2: Create concise root AGENTS.md**

Use the headings `Project`, `Structure`, `Commands`, and `Rules`. Record exactly these durable constraints in concise prose:

- Node.js 24, npm, Next.js App Router, strict TypeScript, Tailwind CSS, SQLite with Drizzle, and Vitest.
- Routes live in `src/app`, database code in `src/db`, vertical business capabilities in `src/features`, and framework-independent helpers in `src/lib` only when shared.
- Route and client components never contain SQL or import server database modules; financial calculations are pure TypeScript.
- Prefer small feature-local files, minimal diffs, and no abstractions for hypothetical needs.
- Add a dependency only when the current task uses it and the platform or existing stack cannot solve the need simply.
- Unit-test calculations, use isolated temporary/in-memory SQLite databases for persistence, and add UI tests only for meaningful interactions.
- Before completion run `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm test`; also run `npm run build` when source or build configuration changes.

- [ ] **Step 3: Create dependency-ordered TASKS.md**

Use only `Task`, `Goal`, and `Done when` fields. Keep the near-term backlog to these complete increments:

1. Monthly snapshot persistence and fixed investment taxonomy.
2. First-use/current-month data entry flow.
3. Monthly review result with net worth and allocation.
4. Historical month browsing and trends.
5. MVP usability and data-safety pass.

The first task must establish the database schema, migrations, validation, and repository tests needed by every later flow. Its `Done when` must include monthly uniqueness, non-negative money validation, fixed category seeding, migration verification, and repository round trips. Later `Done when` sections must map directly to PROJECT.md acceptance criteria. Do not create speculative post-MVP tasks.

- [ ] **Step 4: Format and inspect documentation**

Run:

```bash
npm run format
git diff --check
```

Expected: both commands exit with status 0.

### Task 4: Full verification and handoff

**Files:**

- Modify only files that fail verification.

**Interfaces:**

- Consumes: the full initialized repository.
- Produces: fresh evidence that the application starts and all required checks pass.

- [ ] **Step 1: Run the complete static and test suite**

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: every command exits with status 0 and Vitest reports one passing smoke test.

- [ ] **Step 2: Start the application and probe it**

Run `npm run dev` in a persistent terminal, wait until Next.js reports readiness, and request `http://localhost:3000`. Expected: HTTP 200 and the shell text is present. Stop the development server cleanly afterward.

- [ ] **Step 3: Inspect repository changes**

Run:

```bash
git status --short
git diff --check
git diff --stat
git diff
```

Review every changed file, preserve the pre-existing untracked `PROJECT.md` and `.DS_Store`, and fix any generated noise, accidental business behavior, missing ignore rule, or inconsistency between commands and documentation.

- [ ] **Step 4: Re-run affected verification after fixes**

Run the full `npm run check`, `npm run build`, and local HTTP probe again if any source or configuration file changed during review. Report what passed, what could not be verified, and that the next task is “Monthly snapshot persistence and fixed investment taxonomy.” Stop without implementing it.

---

## Plan Self-Review

- Every initialization requirement in the design has a corresponding task.
- The only testable runtime boundary added before business work is the SQLite connection factory.
- No finance schema, form, dashboard, authentication, deployment, or speculative abstraction is included.
- The handoff includes fresh static checks, tests, production build, local start, HTTP probe, and diff inspection.
