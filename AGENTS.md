# Stack

## Global laws

- A bug fix needs a regression test in the runtime that failed.
- Do not weaken an assertion to go green.
- Ask only when the task is actually ambiguous.
- Commit only when asked.
- Durable rules belong in nested `AGENTS.md` or architecture docs.
- Convex is the source of truth for the note list and the waitlist.
- The URL owns navigation.
- bits-ui is the primitive library. Do not add a second one.
- Plain `.ts` modules do not import `.svelte` files.
- Electron APIs stay in `apps/desktop`. Capacitor APIs stay in `apps/mobile`.

## Context

Read context based on task. Do not read every project document by default.

- Product behavior → `PRODUCT.md`
- Direction and exclusions → `VISION.md`
- Color and type → `DESIGN.md`
- Architecture map → `docs/ARCHITECTURE.md`
- Product app → `apps/web/AGENTS.md`
- Public site → `apps/site/AGENTS.md`
- Desktop shell → `apps/desktop/AGENTS.md`
- Mobile shell → `apps/mobile/AGENTS.md`
- Backend → `packages/backend/AGENTS.md`
- Tokens → `packages/tokens/AGENTS.md`
- Skills → `.agents/README.md`

## Completion

- Run `pnpm check` and `pnpm test` before declaring a task complete.
- Run the checks for the workspace that changed.
- Update architecture docs only for structural changes.
- Update `CHANGELOG.md` for user-visible changes.

## Commits & Pull Requests

- Follow Conventional Commits.
- A pull request answers what changed, why, and whether anything breaks.
