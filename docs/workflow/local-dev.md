# Local dev

Two processes.

1. `pnpm cdev` from the repo root. It runs Convex in `packages/backend` and writes the dev deployment into `.env.local` there.
2. `pnpm dev` for the product app. `pnpm dev:site` for the public page.

`PUBLIC_CONVEX_URL` in each app must be the dev `*.convex.cloud` URL. `pnpm kill:dev` stops listening Vite, Wrangler, and workerd processes that you own.
