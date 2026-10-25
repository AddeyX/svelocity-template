# Frontend

**Purpose.** How the two SvelteKit apps render and navigate.

**Covers.** Routes, the Convex client, and the bits-ui dialogs.

**Does not cover.** Schema and auth rules. See [backend-and-data.md](backend-and-data.md) and [security-and-auth.md](security-and-auth.md).

`apps/web` sets `ssr = false`. `hooks.client.ts` calls `initConvex` before any load, and attaches a stored access token when one exists. `src/routes/+page.ts` awaits `convexLoad(api.items.list)`. Signed-out visits redirect to `/sign-in`.

`apps/site` prerenders every page from `src/routes/+layout.ts`. It has no Convex client. Prerendered pages are served as static assets and skip `hooks.server.ts`, so `apps/site/_headers` repeats the security headers; a spec keeps the two equal.

`apps/desktop` is SvelteKit with `router.type: 'hash'` and `adapter-static`. Electron loads `http://localhost:5175` in development and `build/index.html` when packaged. A note route is `index.html#/`. There is no server route. `apps/mobile` uses the same adapter with pathname routes, because Capacitor serves `index.html` for unknown paths. Capacitor is called only from `apps/mobile/src/lib/native.ts`.

Delete confirmation and auth errors use bits-ui `Dialog`. Tailwind utilities come from `@stack/tokens/tokens.css`. Shared classes come from `@stack/tokens/styles.css`, layered so utilities override them.
