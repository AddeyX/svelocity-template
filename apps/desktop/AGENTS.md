# Desktop

SvelteKit 2 inside Electron. Routes use the hash (`#/sign-in`) because the window loads one `index.html`.

## Read when relevant

- Shell boundary → `../../docs/architecture/frontend.md`
- Auth and notes → `../../packages/backend/AGENTS.md`

## Laws

- Keep Electron in `electron/`. The renderer does not import `electron`.
- `contextIsolation` stays on. `nodeIntegration` stays off. `sandbox` stays on.
- The preload exposes `window.stackDesktop` only: `platform`, `getVersion`, `openExternal`.
- `openExternal` accepts http(s) URLs, checked again in the main process.
- Do not add `+page.server.ts` or form actions. Hash mode does not run them.
- In-app links start with `#/`.

## Validate

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop build
```
