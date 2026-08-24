# Open-source Repository Structure Design

## Goal

Make Gold-Finger immediately understandable to users and prospective contributors without changing application behavior, business boundaries, or the existing SQLite migration history.

## Naming

- Use `Gold-Finger` for the product name and lowercase kebab-case for source and documentation filenames.
- Rename the normal macOS launcher from `启动 Gold-Finger.command` to `Gold-Finger.command` so it is symmetric with `Gold-Finger-Demo.command`.
- Rename the shared launcher test to `macos-launchers.test.ts` because it verifies both launchers.
- Preserve generated Drizzle migration filenames because renaming applied migrations creates unnecessary migration-history risk.

## Repository layout

- Keep `src/app`, `src/db`, and `src/features` unchanged because their runtime responsibilities are already clear.
- Move repository tooling from `src/scripts` to root-level `scripts` so application code and development operations are not mixed.
- Consolidate product and historical development documents under `docs` using lowercase kebab-case names.
- Replace the tool-specific `docs/superpowers` grouping with contributor-facing `docs/designs` and `docs/plans` directories.

## Open-source entry points

- Keep `README.md` as the user-first entry point and add a complete repository map, contribution link, privacy warning, and license section.
- Add `CONTRIBUTING.md` with environment setup, project boundaries, checks, migration guidance, and pull-request expectations.
- Add an MIT `LICENSE` using `Gold-Finger contributors` as the copyright holder.
- Keep `package.json` marked `private` to prevent accidental npm publication; this does not restrict repository licensing.

## Compatibility and verification

- Update package scripts, Vitest discovery, tests, and Markdown links for every moved path.
- Do not add dependencies or alter runtime behavior.
- Verify formatting, lint, TypeScript, tests, and the production build after the migration.
