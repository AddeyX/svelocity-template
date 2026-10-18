# Site

SvelteKit 2 + Svelte 5 runes. SSR stays on. No account.

## Read when relevant

- Copy → `../../VISION.md`
- Waitlist exception → `../../packages/backend/AGENTS.md`

## Laws

- Use Tailwind v4 and `@stack/tokens`.
- The only Convex call is `waitlist.join`, from the browser, after the visitor submits.

## Validate

```bash
pnpm --filter site check
pnpm --filter site test
```
