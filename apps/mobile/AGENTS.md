# Mobile

SvelteKit 2 with `adapter-static`. Capacitor serves `build/` and falls back to `index.html`, so pathname routes work. `ios/` and `android/` are created with `cap add`, not committed.

## Read when relevant

- Shell boundary → `../../docs/architecture/frontend.md`
- Capacitor calls → `src/lib/native.ts`

## Laws

- Import Capacitor only from `src/lib/native.ts`.
- Do not ship `server.url` in `capacitor.config.ts`. That line is a live-reload comment.
- Plugins in the template are App, Status Bar, and Splash Screen.

## Validate

```bash
pnpm --filter mobile check
pnpm --filter mobile test
pnpm --filter mobile build
```
