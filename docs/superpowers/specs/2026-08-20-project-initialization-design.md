# Gold-Finger Project Initialization Design

## Goal

Initialize a small, maintainable foundation for a personal monthly finance review MVP. The result must run locally, enforce basic code quality, support persistent monthly data in later tasks, and contain no business feature beyond a neutral application shell.

## Product Boundary

The first version is a single-user, local-first application centered on monthly snapshots. It will not include authentication, account synchronization, transaction-level bookkeeping, background jobs, remote services, or speculative extension points.

## Technical Approach

- Use a single Next.js App Router application with React and strict TypeScript for both UI and server-side code.
- Use npm and commit `package-lock.json` for reproducible installs.
- Target Node.js 24 LTS. The local machine already provides Node.js 24, and Next.js supports the App Router on current supported Node.js releases.
- Use SQLite for local persistence and Drizzle ORM plus Drizzle Kit for typed access and checked-in migrations. Use stable package releases only, not release candidates.
- Use Tailwind CSS for the small responsive UI surface because it is part of the standard Next.js toolchain; do not add a component library during initialization.
- Use ESLint, Prettier, TypeScript, and Vitest. Add React Testing Library only if the initial shell test exercises rendered UI; otherwise keep the base test focused on framework-independent project code.

The durable decision is local SQLite storage. Moving to multi-device hosting later would require a database migration and authentication, but neither is part of the current product goal.

## Project Structure

```text
src/
  app/                 Next.js routes, layouts, and route-level UI
  features/            Business capabilities added vertically in later tasks
  db/                  Database connection and future schema modules
  lib/                 Small framework-independent shared utilities
drizzle/               Generated, reviewed SQL migrations
public/                Static assets
```

Only directories with an immediate use will be created. `features/` and migration files may wait until the first business task if the initializer has no meaningful content for them.

## Architecture Boundaries

- Route components orchestrate UI and call feature-level operations; they do not contain SQL.
- Database access stays under `src/db` or inside a feature's server-only repository module.
- Financial calculations remain pure TypeScript functions so they can be tested without Next.js or SQLite.
- Browser code never imports server-only database modules.
- Data is modeled around one monthly snapshot per calendar month. Detailed transactions and speculative generic ledger abstractions are excluded.

## Configuration and Data

Use `DATABASE_URL` only if the database adapter requires it; otherwise use a clearly named local database path such as `DATABASE_FILE`. Provide `.env.example` with a development-safe example and ignore actual environment files and SQLite database files. No secrets are required for the initialized shell.

Schema creation belongs to the first persistence task in `TASKS.md`, not initialization, unless a minimal empty migration is required to prove the database toolchain works. This keeps the initializer from implementing business behavior early.

## Error Handling

The application shell uses Next.js error boundaries only when a real failure path exists. Future server operations will validate user input at their boundary and return user-readable errors; database errors will retain their original cause for diagnostics. Initialization will not add a logging framework.

## Testing and Verification

- Vitest provides the base test runner with at least one meaningful smoke test.
- Pure calculations receive unit tests in later tasks.
- Persistence tasks use an isolated temporary SQLite database and verify migrations.
- UI flow tests are added only when interactive flows exist.
- Completion requires a successful local start, lint, format check, typecheck, base tests, and inspection of `git diff`.

## Documentation Deliverables

- `README.md`: purpose, prerequisites, setup, commands, and current scope.
- `AGENTS.md`: concise long-lived repository rules derived from the actual scaffold.
- `TASKS.md`: a short dependency-ordered MVP backlog, with each task containing only a name, goal, and done criteria.

## Non-Goals

Initialization will not implement financial forms, schemas, dashboards, charts, imports, authentication, deployment, CI, Docker, state-management libraries, API client layers, or reusable design-system abstractions.
