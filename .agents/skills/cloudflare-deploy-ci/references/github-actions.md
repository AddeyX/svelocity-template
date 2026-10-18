# GitHub Actions Reference

Use these templates as starting points. Replace placeholders; do not copy real project names, domains, account ids, or tokens into examples.

## Single SvelteKit Worker

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      PUBLIC_API_URL: ${{ secrets.PUBLIC_API_URL }}

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Generate Wrangler types
        run: pnpm exec wrangler types

      - run: pnpm check

      - run: pnpm test

      - run: pnpm build

      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env production
```

## Monorepo With Two Workers

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      PUBLIC_API_URL: ${{ secrets.PUBLIC_API_URL }}

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Generate Wrangler types
        run: |
          pnpm --filter app exec wrangler types
          pnpm --filter marketing exec wrangler types

      - name: Install browser test dependencies
        run: pnpm --filter app exec playwright install --with-deps chromium

      - run: pnpm check

      - run: pnpm test

      - name: Deploy backend
        if: ${{ secrets.BACKEND_DEPLOY_KEY != '' }}
        run: pnpm --filter app exec backend-cli deploy
        env:
          BACKEND_DEPLOY_KEY: ${{ secrets.BACKEND_DEPLOY_KEY }}

      - name: Build app Worker
        run: pnpm build:app

      - name: Deploy app Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: apps/app
          command: deploy --env production

      - name: Build marketing Worker
        run: pnpm build:marketing

      - name: Deploy marketing Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: apps/marketing
          command: deploy --env production
```

## Secret Checklist

- `CLOUDFLARE_API_TOKEN`: least-privilege token allowed to deploy target Workers.
- `CLOUDFLARE_ACCOUNT_ID`: target Cloudflare account id.
- Build-time public env vars: only values safe to expose to browsers.
- Backend deploy keys: scoped to backend deploy step, not whole workflow unless required.

## Review Checklist

- Production deploy triggers only from protected branch.
- PR checks do not receive production deploy credentials.
- `pnpm install --frozen-lockfile` runs before generated types.
- Generated Worker types happen before `pnpm check`.
- Browser test dependencies install before browser tests.
- Build happens after check/test and before Wrangler action.
- Each deploy step has correct `workingDirectory`.
- Deploy command includes intended environment, usually `deploy --env production`.
