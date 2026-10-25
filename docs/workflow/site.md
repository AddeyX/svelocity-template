# Site

`apps/site` is a prerendered SvelteKit Worker with no backend. Two jobs grow from it: shipping it as its own repo, and adding the waitlist.

## Ship the site alone

The only workspace link is `@stack/tokens`. Run from the template root. `../my-site` is the target.

1. `rsync -a --exclude node_modules --exclude .svelte-kit --exclude .wrangler apps/site/ ../my-site/`
2. `cp packages/tokens/tokens.css packages/tokens/styles.css ../my-site/src/lib/`
3. In `../my-site/src/routes/layout.css`, import `'../lib/tokens.css'` and `'../lib/styles.css'` in place of the two `@stack/tokens/*` lines.
4. In `../my-site/package.json`, remove `@stack/tokens`. Copy `packageManager`, `engines`, and the three Prettier `devDependencies` from the root `package.json`, then add `"format": "prettier --write ."` and `"lint": "prettier --check ."` to `scripts`.
5. `cp .npmrc .prettierrc .prettierignore .node-version ../my-site/`. In the copied `.prettierrc`, replace the two `apps/*` overrides with a top-level `"tailwindStylesheet": "./src/routes/layout.css"`.
6. Write `../my-site/pnpm-workspace.yaml` with the root `allowBuilds` block, keeping `esbuild`, `workerd`, and `sharp`.
7. In `../my-site/AGENTS.md`, add the root `## Global laws` that name neither Convex, Electron, nor Capacitor. Drop the `../../` pointers.
8. Rename the Worker in `wrangler.jsonc` from `stack-site`.
9. `cd ../my-site && git init && pnpm install && pnpm format && pnpm check && pnpm test && pnpm build`

Done when step 9 passes in the new folder.

## Add the waitlist

`packages/backend/convex/waitlist.ts` already has `waitlist.join`, the tested public exception. Wiring it into the site:

1. `pnpm --filter site add @stack/backend@workspace:* convex convex-svelte`, using the versions `apps/web` pins.
2. Add `PUBLIC_CONVEX_URL` to `apps/site/.env.example`, `.env.development`, and `.env.production`. Add `cp apps/site/.env.example apps/site/.env.local` to the env step in both workflows.
3. In `+layout.svelte`, call `if (browser) setupConvex(PUBLIC_CONVEX_URL)`.
4. In the page, take the client during component init, never inside the handler:

   ```ts
   const client = browser ? useConvexClient() : undefined;

   async function join(event: SubmitEvent) {
   	event.preventDefault();
   	const result = await client?.mutation(api.waitlist.join, { email });
   }
   ```

   `useConvexClient` reads Svelte context, which exists only while the component initializes.

5. The page still prerenders. The mutation runs in the browser after submit.
6. Update the site law in `apps/site/AGENTS.md` and the backend line in `AGENTS.md`.
