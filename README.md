# Cosmos Solutions — Engineering Platform

> The platform that product features land on. Bootstrap repo for [COS-2](/COS/issues/COS-2).

A new engineer should reach a running app locally in **under 30 minutes** from a clean clone. The instructions below are the path. If any step takes longer, fix the doc.

## What's in here

- **`app/`** — the Next.js 15 application. This is the only product surface.
- **`docs/architecture.md`** — why we picked the stack. Read before proposing a new tool.
- **`docs/DEPLOY.md`** — how production deploys and how to roll back. Read before touching `vercel.json`.
- **`.github/workflows/ci.yml`** — CI: lint, typecheck, test on every PR and push to `main`.
- **`.env.example`** — every env var the app reads. Copy to `.env.local` for local dev.

## Quickstart (target: 30 minutes)

### 1. Prerequisites (5 min)

You need:

- **Node.js 20+** — `nvm install` (or use the included `.nvmrc`).
- **npm 10+** — ships with Node 20.
- **Postgres 16+** — easiest path: Docker.
  ```bash
  docker run -d --name cosmos-pg -p 5432:5432 \
    -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres \
    postgres:16
  ```
  Or install Postgres natively. Either way, the connection string should look like `postgresql://postgres:postgres@localhost:5432/cosmos_dev`.

### 2. Clone and install (3 min)

```bash
git clone <repo-url> cosmos-platform
cd cosmos-platform
npm ci
```

### 3. Set up environment (2 min)

```bash
cp .env.example .env.local
# Edit .env.local and replace:
#   DATABASE_URL — the Postgres connection string from step 1
#   AUTH_SECRET — run: openssl rand -base64 32
```

### 4. Generate Prisma client (1 min)

```bash
npx prisma generate --schema=app/prisma/schema.prisma
```

The schema is currently empty. This step is a no-op until the first model lands, but it warms the cache.

### 5. Run it (2 min)

```bash
npm run dev
```

Open <http://localhost:3000>. You should see the platform landing page with a health card.

Hit <http://localhost:3000/api/health> — JSON status, `200 OK` if every env var is set, `503` if not.

### 6. Run the tests (2 min)

```bash
npm test          # one-shot
npm run test:watch # watch mode
```

If a test fails, the bar is broken; see `ENGINEERING_BAR.md` for the rules.

### 7. Lint, typecheck, build (3 min)

```bash
npm run lint
npm run typecheck
npm run build
```

All three must pass before a PR is ready for review. CI runs the same three on every push.

## Repository conventions

| Action | Command |
| --- | --- |
| Run the app | `npm run dev` |
| Run unit tests | `npm test` |
| Run a specific test file | `npm test -w app -- src/lib/health.test.ts` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Build the production bundle | `npm run build` |
| Format code | `npm run format` |

## Set up the GitHub remote and deploy target

This repo starts on the local filesystem. To turn it into a real team repo:

1. **Authenticate GitHub CLI** (one-time on the operator's machine):
   ```bash
   gh auth login
   ```
2. **Create the remote and push**:
   ```bash
   gh repo create cosmos-solutions/platform --public --source=. --remote=origin --push
   ```
3. **Wire up Vercel** — follow `docs/DEPLOY.md` § "First-time setup."
4. **Confirm CI is green** on the first push to `main`.

Until steps 1–3 are done, the platform is fully runnable locally but is not deployed and has no CI signal. The acceptance criteria for [COS-2](/COS/issues/COS-2) are otherwise satisfied.

## Where things live

| Need to … | Look here |
| --- | --- |
| Add a new API route | `app/src/app/api/<thing>/route.ts` |
| Add a new page | `app/src/app/<route>/page.tsx` |
| Add a database model | `app/prisma/schema.prisma`, then `npx prisma migrate dev` |
| Add a shared lib | `app/src/lib/<thing>.ts` + a `.test.ts` next to it |
| Change the deploy | `vercel.json` and `docs/DEPLOY.md` (both must change together) |
| Change the engineering rules | `ENGINEERING_BAR.md` |
| Propose a new tool | open a PR that touches `docs/architecture.md` |

## Getting help

- **Stuck on local setup?** Search the issue tracker for "quickstart" or open an issue.
- **Hitting a CI error?** Read the failure log; the `verify` job runs `lint`, `typecheck`, and `test` in order.
- **Found a bug in the platform itself?** Open an issue. Tag the CTO.

## License

MIT. See `LICENSE`.
