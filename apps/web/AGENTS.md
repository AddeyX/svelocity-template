# Web app

SvelteKit 2 + Svelte 5 runes. `ssr` is off because the Convex client lives in the browser.

## Read when relevant

- Visual changes → `../../DESIGN.md`
- Page loads → `../../docs/workflow/convex-load-navigation.md`
- Frontend structure → `../../docs/architecture/frontend.md`

## Laws

- Use Tailwind v4 and `@stack/tokens`.
- Use bits-ui for overlays. The delete confirm and the auth error are `Dialog`s.
- URL owns navigation. Signed-out visits to `/` go to `/sign-in`.
- Await `convexLoad` in `+page.ts`. Create the client in `hooks.client.ts`.

## Validate

```bash
pnpm --filter web check
pnpm --filter web test
```
