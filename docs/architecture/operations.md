# Operations

**Purpose.** How the workspace is developed, tested, and deployed.

**Covers.** Commands, test projects, and the two GitHub workflows.

**Does not cover.** The exact env key list. See [production-push.md](../workflow/production-push.md) and the root `.env.example`.

`pnpm dev` is the product app on port 5173. `pnpm dev:site` is the public app on 5174. `pnpm dev:desktop` is Vite on 5175 plus an Electron window. `pnpm dev:mobile` is the Capacitor web shell on 5176. `pnpm mobile:sync` builds that shell and copies it into native projects after `cap add`. `pnpm cdev` is Convex. Desktop packaging (`pnpm --filter desktop package`) is local and unsigned. It is not a CI job.

Vitest `expect.requireAssertions` is on. Web splits `server` (Node) and `client` (headless Chromium, reduced motion). Site tests run in Node. Backend tests use `convex-test`.

Validate always reports. A docs-only pull request skips install inside the job. Deploy does not cancel, and it publishes Convex before the Workers. Commands are in the root `README.md`.
