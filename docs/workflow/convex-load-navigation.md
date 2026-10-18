# Hold the page until Convex data is ready

SvelteKit keeps the current page mounted while a `load` function is running. A query that starts after the next page mounts is already too late.

`apps/web/src/hooks.client.ts` calls `initConvex` before loads. `apps/web/src/routes/+page.ts` awaits `convexLoad`. The layout calls `setupConvex`, which reuses that client.

With `ssr` off, these loads run in the browser. Do not move the first read into the page component.
