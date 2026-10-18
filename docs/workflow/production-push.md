# Production push

Validate does not deploy. A push to `main` runs `.github/workflows/deploy.yml`: check, test, build, Convex, then the `stack-web` Worker, then `stack-site`.

Do not put secret values in git or in `validate.yml`.

1. Copy `.env.example` to `.env`.
2. Fill `@actions` with the five deploy names: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CONVEX_DEPLOY_KEY`, `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`.
3. Fill `@convex` with `SITE_URL` (the product origin), `JWT_PRIVATE_KEY`, and `JWKS`. Generate the key pair with `npx @convex-dev/auth` from `packages/backend` against production.
4. `pnpm env:push` prints destinations and no values.
5. `pnpm env:push -- --apply --convex prod` writes them. `gh auth login` first.
6. Merge to `main`.

`CONVEX_DEPLOYMENT` stays in `packages/backend/.env.local`. The script rejects it in the root file.
