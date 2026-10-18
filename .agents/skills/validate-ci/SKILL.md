---
name: validate-ci
disable-model-invocation: true
description: Implement GitHub Actions validate.yml as a clean checkout (gen, check, test, build).
---

# Validate CI

Implement PR validation for this repo as a **clean checkout**. The **order** is the product: generate Wrangler types, check, test, then build.

**Works in:** Cursor, Claude Code, Codex — canonical files live in `.agents/skills/validate-ci/`. Symlinks: `.claude/skills/validate-ci`, `.cursor/skills/validate-ci`, `.codex/skills/validate-ci`.

**Playbook:** [docs/workflow/github-actions-validate.md](../../../docs/workflow/github-actions-validate.md). Current file: [`.github/workflows/validate.yml`](../../../.github/workflows/validate.yml).

This skill writes **validate** only.

---

## 1. Read the environment

Read the playbook, existing `.github/workflows/validate.yml` if any, root `package.json` (`packageManager`, `engines`), portal `package.json` scripts, and `apps/portal/.env.example`.

**Done when:** you can name the pinned Node and pnpm versions, the four scripts CI needs (`gen`, `check`, `test`, `build`), and whether `validate.yml` already exists.

---

## 2. Write the order

If `validate.yml` exists, edit it. If it is missing, create it from the playbook’s step list. Preserve:

- `pull_request` and `workflow_dispatch` (production push to `main` is `deploy.yml`, not this file)
- `permissions: contents: read`
- `concurrency` group `validate-${{ github.ref }}` with `cancel-in-progress: true`
- `pnpm/action-setup@v4` with no hardcoded pnpm version
- `actions/setup-node@v4` with `node-version` from `engines.node` and `cache: pnpm`
- copy of both `.env.example` files to `.env.local`
- job `env` public Convex URLs copied from `apps/portal/.env.example`
- Playwright Chromium cache keyed by `pnpm-lock.yaml`, with `install --with-deps` on a miss and `install-deps` on a hit
- docs-only skip that still reports the `validate` check (`docs/**`, `**.md`, `.cursor/**`, `.agents/**`, `.codex/**`, `.claude/**`). Changes under `.github/**` still run the full job
- steps in playbook **order**, check before build

Leave portal `check` / `gen` / `build` scripts as source checks. `wrangler types --check` in those scripts stays if it is already there.

**Done when:** every playbook step is in `validate.yml` in that **order**, and the file has no deploy job and no `CLOUDFLARE_*` secrets.

---

## 3. Prove on a clean checkout

Remove portal `.svelte-kit/cloudflare` and `.svelte-kit/output` if they exist (or use a fresh tree). Copy example env files. Run `pnpm gen`, `pnpm check`, `pnpm test`, `pnpm build`.

**Done when:** check is green on that tree, tests did not call live Stripe or Resend, and build succeeded. A later local `pnpm check` after build may report adapter JS; leave it. Hand the human playbook phase 4 for the Actions run.
