# Stack

A pnpm workspace for a SvelteKit product, a SvelteKit public site, and a Convex backend. Both apps deploy as Cloudflare Workers. The demo is a private note list and a public landing page.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm dev:site     # http://localhost:5174
pnpm dev:desktop  # http://localhost:5175 and an Electron window
pnpm dev:mobile   # http://localhost:5176
pnpm test
```

`pnpm --filter mobile add:ios` and `add:android` create the native projects. They are gitignored. `pnpm mobile:sync` copies the built web shell into them. Do not leave `server.url` uncommented in `capacitor.config.ts`.

`pnpm check`, `pnpm test`, and `pnpm build` do not need a Convex account. The screens use the placeholder Convex URL until you create a deployment. `pnpm gen` writes Wrangler types. Convex bindings are already committed; `pnpm --filter @stack/backend codegen` refreshes them after `pnpm cdev` has a deployment.

## Convex

```bash
pnpm cdev
```

Write the printed deployment into `packages/backend/.env.local`. Write the printed URLs into `apps/web/.env.local`. Restart `pnpm dev`. Sign up, add a note, and delete it through the dialog.

## Which app needs Convex

Convex belongs to the product apps: `apps/web`, `apps/desktop`, and `apps/mobile`. `apps/site` has no backend. Every page prerenders to HTML, and its only workspace dependency is `@stack/tokens`.

That makes the site a template of its own. [`docs/workflow/site.md`](docs/workflow/site.md) has the steps to copy it out as a standalone repo, and the steps to wire `waitlist.join` back in when a launch needs one.

## Styles

`packages/tokens/tokens.css` is the Tailwind theme. `packages/tokens/styles.css` holds `.btn`, `.field`, `.dialog`, and the base element styles, inside `@layer base` and `@layer components`. A utility on the same element wins: `class="btn px-3"` gets the smaller padding. A second theme overrides the `--color-*` variables under `:root[data-theme='light']`.

## Rename

```bash
pnpm rename -- acme
pnpm install
```

That replaces `@stack`, `stack-web`, `stack-site`, `app.stack.desktop`, `app.stack.mobile`, `stackDesktop`, and the `Stack` title. It leaves the word "stack" in ordinary sentences.

## Env upload

Copy `.env.example` to `.env` and fill the values. `pnpm env:push` prints each name and its destination. `pnpm env:push -- --apply --convex prod` writes `@actions` names to repository Actions secrets and `@convex` names to the production Convex deployment.

CI installs Node 22.23.2. `engines` allows that version or newer so a newer local Node can install.
