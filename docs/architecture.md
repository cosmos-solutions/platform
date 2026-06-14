# Architecture & Stack

> Why we picked what we picked. Read this before proposing a change to the platform.
> The constraint set in [COS-2](/COS/issues/COS-2): the team can iterate on this for 12 months without a rewrite.

## TL;DR

A boring, well-supported TypeScript stack. One app, one database, one CI, one deploy target. Everything that needs to be special later (auth, billing, data pipelines) sits behind clean seams we control.

| Layer | Choice | Why this, why not the alternative |
| --- | --- | --- |
| Language | **TypeScript (strict)** everywhere | One language, one toolchain, one hiring pool. We don't have a second-language problem yet. |
| Package manager | **npm workspaces** | We have `npm` already. pnpm is faster but the team's first install shouldn't be "install the package manager first." Trivial to swap later if the workspace gets big. |
| App framework | **Next.js 15 (App Router)** | Full-stack in one repo. API routes cover the backend until we outgrow them. The hiring pool is the largest in web. |
| UI | **React + Tailwind CSS + shadcn/ui** | Tailwind is the boring choice. shadcn/ui gives us components we own, not a dependency that breaks on upgrade. |
| Data | **PostgreSQL 16** | Boring, durable, scales from $0 to first paying customer. We do not need NoSQL. |
| ORM | **Prisma** | Type-safe queries, schema-first migrations, plays well with the Next.js dev loop. |
| Auth | **Auth.js (next-auth)** | Open-source, self-hostable, can be extended with our own providers. Avoids vendor lock-in to a closed auth SaaS until we have a reason. |
| Background jobs | **Inngest** (deferred) | We don't need this on day one. Stub the seam, wire it up when we have a real async workflow. |
| Testing | **Vitest (unit/integration), Playwright (e2e)** | Vitest is fast, ESM-native, and uses the same config as Vite/Next. Playwright is the boring choice for browser tests. |
| Lint / format | **ESLint + Prettier** | Defaults; not novel. |
| CI | **GitHub Actions** | The repo lives on GitHub. The CI is the same vendor as the code. |
| Deploy (web) | **Vercel** | Zero-config Next.js deploy. Documented rollback via `vercel rollback` or redeploy of a previous deployment. Swap to a self-hosted runtime when the bill exceeds the cost of owning it. |
| Secrets | **Environment variables in Vercel + GitHub Actions secrets** | Never in the repo. `.env.example` is the only env file tracked. |
| Observability (deferred) | Sentry + structured logs | Stub the seam; do not wire up before we have a customer-facing surface. |

## What we are explicitly *not* doing yet

- **Kubernetes / Docker / Terraform.** Vercel runs the app. A Postgres provider (Neon, Supabase, RDS) runs the database. We add infra when we have infra-shaped problems.
- **Microservices.** One app, one database. Splitting is a write-up, not a pattern we adopt early.
- **A second frontend framework.** React Native, Swift, Kotlin — only when the roadmap demands them and we have a reason to staff for them.
- **GraphQL.** Server actions + REST are enough until a real client asks for it.
- **An ORM migration to Drizzle or Kysely.** Prisma is fine. Swaps cost days we don't have.
- **A monorepo tool (Turborepo, Nx).** Two workspaces and `tsc --build` is enough. Add a tool when the build is slow.

## Repository layout

```
.
├── app/                    Next.js application (the only product surface)
│   ├── src/
│   │   ├── app/            App Router routes
│   │   ├── components/     React components
│   │   └── lib/            Domain logic, server actions
│   ├── public/             Static assets
│   ├── prisma/             Schema and migrations
│   └── package.json
├── packages/               Shared TypeScript packages (add when we have two)
├── docs/                   Engineering docs (this file, DEPLOY.md, INCIDENTS.md)
├── .github/workflows/      CI
├── .env.example            Documented env vars
├── .gitignore
├── package.json            Root workspace config
├── README.md
├── tsconfig.base.json
└── vercel.json
```

## The 12-month test

If we hit a wall with this stack, the wall will be one of:

1. **Database scale.** Mitigated by Postgres being the right DB for the next 10x of revenue; beyond that, we add read replicas and a cache, not a rewrite.
2. **App runtime constraints.** Mitigated by Vercel's plan ladder; beyond that, we move the Next.js app to a container we control. The code is portable; only the host changes.
3. **Backend surface area growing past what fits in a Next.js process.** Mitigated by extracting services to `packages/` first, then to a separate deploy target if needed. We do not split until the seam is real.
4. **Frontend team growing past one framework.** Mitigated by React's breadth of hiring and the option to add React Native or a second web app from the same component library.

For any of those, the answer is "extend" not "rewrite." A rewrite would be a new architecture decision with a new one-pager.

## How to add to this

A new tool enters the stack via a PR that includes:

1. The problem it solves (a sentence).
2. The alternatives considered and why they lost.
3. The smallest integration: a flag, a config file, a doc paragraph.
4. A rollback plan: what we change back if this turns out wrong.

That last item is the "we will not silently drift" rule. See [the engineering bar](/COS/issues/COS-4#document-engineering-bar) for the same rule applied to code.
