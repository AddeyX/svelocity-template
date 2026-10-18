---
name: cloudflare-deploy-ci
description: Configure, audit, or fix Cloudflare deployment and CI/CD for web apps, especially SvelteKit apps using @sveltejs/adapter-cloudflare, Wrangler, Cloudflare Workers Static Assets, GitHub Actions, pnpm monorepos, preview/prod environments, custom routes, generated Worker types, and deploy secrets. Use when asked to deploy to Cloudflare, add or repair wrangler.jsonc/toml, wire Cloudflare into CI, migrate from adapter-auto or adapter-cloudflare-workers, debug Worker build/deploy failures, or make GitHub Actions deploy one or more Cloudflare apps.
---

# Cloudflare Deploy CI

## Overview

Use this skill to turn a web app into a repeatable Cloudflare deployment with CI checks before publish. Prefer Cloudflare Workers Static Assets plus `@sveltejs/adapter-cloudflare` for SvelteKit apps unless project context clearly requires Cloudflare Pages.

Before editing, inspect existing package scripts, adapter config, Wrangler config, environment files, and CI workflows. Treat current official docs as mutable; verify docs when changing non-trivial Cloudflare behavior.

## Source Docs

- SvelteKit adapter: `https://svelte.dev/docs/kit/adapter-cloudflare`
- Cloudflare Workers GitHub Actions: `https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/`
- Cloudflare SvelteKit guide: `https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/`
- Wrangler configuration: `https://developers.cloudflare.com/workers/wrangler/configuration/`

## Workflow

1. Identify deployment shape:
   - Single app or monorepo.
   - Workers or Pages.
   - Framework adapter already present or missing.
   - Build output path and deploy command.
   - Backend deploy steps that must happen before frontend deploy.

2. Normalize app config:
   - Use `@sveltejs/adapter-cloudflare` in `svelte.config.js`.
   - Keep Wrangler config in each deployable app root when using monorepo `workingDirectory`.
   - Use `main: ".svelte-kit/cloudflare/_worker.js"`.
   - Use `assets.binding: "ASSETS"` and `assets.directory: ".svelte-kit/cloudflare"`.
   - Use `compatibility_flags: ["nodejs_als"]` for SvelteKit AsyncLocalStorage support.
   - Add `nodejs_compat` only when dependencies require broader Node compatibility.
   - Set `compatibility_date` deliberately; update only with testing.
   - Put custom domains under `env.production.routes` with placeholders in examples.

3. Normalize package scripts:
   - `build`: run framework build.
   - `preview`: run `wrangler dev .svelte-kit/cloudflare/_worker.js --port <port>`.
   - `deploy`: run `pnpm build && wrangler deploy --env production`.
   - `gen` or equivalent: run `wrangler types` when project checks rely on generated Worker binding types.

4. Build CI:
   - Trigger production deploy on push to main/trunk.
   - Add concurrency group for production deploys.
   - Install with lockfile frozen.
   - Generate Wrangler types before type checks.
   - Install browser dependencies before browser tests.
   - Run check and tests before deploy.
   - Deploy backend services before frontend Workers when frontend depends on backend env.
   - Build each app immediately before its deploy step.
   - Use `cloudflare/wrangler-action@v3` with `apiToken`, `accountId`, `workingDirectory`, and `command`.

5. Validate:
   - Run local check/test commands requested by project policy.
   - Run target build command.
   - Run `wrangler deploy --dry-run --env production` when supported and safe.
   - Confirm CI secrets exist: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, app env vars, backend deploy keys.
   - Confirm API token has least privilege for target account/resources.

## SvelteKit Worker Pattern

Use this shape for `wrangler.jsonc` in each app root:

```jsonc
{
	"$schema": "./node_modules/wrangler/config-schema.json",
	"name": "APP_WORKER_NAME",
	"compatibility_date": "YYYY-MM-DD",
	"compatibility_flags": ["nodejs_als"],
	"main": ".svelte-kit/cloudflare/_worker.js",
	"assets": {
		"binding": "ASSETS",
		"directory": ".svelte-kit/cloudflare"
	},
	"workers_dev": true,
	"preview_urls": true,
	"env": {
		"production": {
			"routes": [
				{ "pattern": "example.com", "custom_domain": true },
				{ "pattern": "www.example.com", "custom_domain": true }
			]
		}
	}
}
```

Use this shape for SvelteKit config:

```js
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## CI Pattern

For GitHub Actions templates and monorepo variants, read `references/github-actions.md`.

Core rules:

- Keep secrets in CI secret storage, never in source.
- Do not deploy from PR workflows with production credentials.
- Use separate Cloudflare API tokens for production vs preview if both exist.
- Keep `workingDirectory` aligned with the app root containing `wrangler.jsonc`.
- Prefer explicit `command: deploy --env production` over hiding production deploy in nested scripts when using `wrangler-action`.
- Keep build commands outside Wrangler action when CI needs separate check/test/build visibility.

## Common Fixes

- `Cannot find module ...` during Worker runtime: remove server-side Node-only dependencies, move import behind browser-only boundary, or add `nodejs_compat` only if docs and tests support it.
- Missing `ASSETS` binding: confirm `assets.binding` and adapter output path match.
- `event.platform` missing in dev: use `@sveltejs/adapter-cloudflare` directly, not `adapter-auto`, when Cloudflare APIs matter locally.
- Type errors for `Env`: run `wrangler types` and commit generated ambient types if project expects them.
- Wrong app deployed from monorepo: set `workingDirectory` and run app-specific build before deploy.
- Custom domain not serving: check `env.production.routes`, Cloudflare zone ownership, DNS, and whether deploy command includes `--env production`.
- CI passes but deploy fails after build: ensure CI-provided env vars match variables used at build time, especially `PUBLIC_*` variables for SvelteKit.

## Output Standards

When creating examples, never use a real project name, product name, domain, account id, or secret. Use placeholders such as `APP_WORKER_NAME`, `example.com`, `apps/web`, `apps/marketing`, and `CLOUDFLARE_API_TOKEN`.

When changing a repo, leave deploy docs and architecture notes in sync if the project has them. Report exact commands run and any deploy step intentionally not run.
