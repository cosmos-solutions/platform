# Deploy

> How the platform ships. Read this before changing the deploy process.

## Targets

- **Production** — `https://app.cosmos.solutions` (placeholder; final hostname set by the CEO)
- **Preview** — one per pull request, automatic

Both run on Vercel. The app is a Next.js 15 project, so Vercel's Next.js detection handles most of the wiring. The explicit config lives in `vercel.json` at the repo root.

## First-time setup (one-time, ~10 minutes)

1. **Log in to Vercel** as the company account.
2. **Create a Vercel project** pointing at this GitHub repository.
   - Framework preset: Next.js
   - Build command, install command, output directory: keep Vercel's defaults (we ship `vercel.json` but it's belt-and-suspenders).
   - Region: `iad1` (US East) — change in `vercel.json` if the customer base is elsewhere.
3. **Set environment variables** in the Vercel project (Settings → Environment Variables):
   - `DATABASE_URL` — connection string to the production Postgres
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `NODE_ENV` — `production`
4. **Provision the database** (one of):
   - [Neon](https://neon.tech) — serverless Postgres with branching. Cheapest for pre-revenue.
   - [Supabase](https://supabase.com) — Postgres with a built-in admin UI.
   - AWS RDS — when we need it to live inside our own VPC.
5. **Run the first migration** (when the schema has models):
   ```bash
   npx prisma migrate deploy
   ```

## Day-to-day deploys

Every push to `main` deploys to **production** automatically. Every pull request gets a **preview URL** with its own environment.

A change does not ship until:
1. CI is green on the PR.
2. A reviewer approves.
3. The PR is merged to `main`.
4. Vercel finishes the production deploy.

## Rollback

Vercel keeps every successful production deployment. Two ways to roll back:

### Option A — Promote a previous deployment (preferred)

1. Open the Vercel dashboard → Project → Deployments.
2. Find the most recent good deploy (the one before the regression).
3. Click ⋯ → **Promote to Production**.
4. Vercel re-points the production domain to that deploy's artifacts. Total time: ~30 seconds, no rebuild.

### Option B — CLI

```bash
npx vercel rollback
```

This walks you through promoting the previous deploy. Same effect as Option A.

### Option C — Git revert (slow path, use only if Option A is not safe)

```bash
git revert <bad-sha>
git push origin main
```

This rebuilds and redeploys. Slower (1–2 minutes) and produces a new deployment, but useful when the previous deploy is also broken.

## What "rolled back" means

A rollback is a redeploy, not a fix. After a rollback:

1. Open a new issue titled `Hotfix: <regression>`.
2. Bisect or read the bad commit(s).
3. Land the fix on a new branch, PR it, and let it deploy through the normal flow.
4. Close the issue with a postmortem comment.

We do not silently leave the codebase in a "rolled back" state.

## Incidents

If the rollback itself fails, escalate. See `docs/incidents.md` (forthcoming) for the on-call runbook. Until that doc lands, page the CTO directly.

## Cost envelope (target)

- **Vercel**: Hobby / Pro plan. Estimate $0–$20/month at first; rises with traffic.
- **Database** (Neon): Free tier covers pre-revenue. Pro plan kicks in around $20/month for always-on.
- **Total run rate target**: < $100/month for the first 6 months. Revisit when a deploy bill exceeds the cost of owning the infra.

Any change to the deploy bill (new service, new region, paid plan upgrade) is a board-level decision and gets an issue + approval first.
