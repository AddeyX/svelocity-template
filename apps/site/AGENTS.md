# Site

SvelteKit 2 + Svelte 5 runes. Every page prerenders. No account, no backend.

## Read when relevant

- Copy → `../../VISION.md`
- Visual changes → `../../DESIGN.md`
- Own repo, or adding the waitlist → `../../docs/workflow/site.md`

## Laws

- Use Tailwind v4 and `@stack/tokens`.
- Dependencies stay in this `package.json` and `@stack/tokens`, so the folder copies out with one link to replace.
- A page that needs request data sets `prerender = false` in its own `+page.ts`.
- `_headers` carries the security headers for prerendered pages. Change it together with `src/lib/server/securityHeaders.ts`.
- Use bits-ui for overlays, menus, and toggles. Style their state with data attributes: `data-[state=open]:`, `data-[state=on]:`, `data-highlighted:`.

## Validate

```bash
pnpm --filter site check
pnpm --filter site test
pnpm --filter site build
```
