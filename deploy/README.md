# Frontend CI/CD (Cloudflare Pages)

`.github/workflows/ci-cd.yml` runs on every push/PR to `test-server`/`development`/`main`: installs deps, runs `npm run lint`, `npm test` (Vitest), then `npm run build`. On a push (not PR) to `test-server` specifically, and only if all of that passed, it publishes the built `dist/` to Cloudflare Pages.

## One-time setup

1. Create a Cloudflare Pages project (dashboard → Workers & Pages → Create → Pages → "Direct Upload" is fine, since GitHub Actions pushes the build, not Cloudflare's own git integration).
2. Create an API token: Cloudflare dashboard → My Profile → API Tokens → "Create Token" → use the **"Edit Cloudflare Pages"** template.
3. Set these in the frontend repo (Settings → Secrets and variables → Actions):

   **Secrets** (sensitive):
   - `CLOUDFLARE_API_TOKEN` — the token from step 2
   - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare dashboard → right sidebar of any domain/Pages page

   **Variables** (not secret, just config — same Settings page, "Variables" tab):
   - `CLOUDFLARE_PAGES_PROJECT` — the Pages project name from step 1
   - `VITE_API_BASE_URL` — e.g. `https://your-ec2-domain.com/api/v1`
   - `VITE_SOCKET_URL` — e.g. `https://your-ec2-domain.com`

Without these set, the `test` job (lint/test/build) still runs and reports pass/fail on every push and PR — only the `deploy` job is skipped.
