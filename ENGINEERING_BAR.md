# The Engineering Bar

> Day-one reading. Five minutes. This is what good looks like at this company.

If you only read one engineering doc on your first day, read this one. It defines what we expect of your pull requests, your tests, and your definition of done. Everything else is detail.

## TL;DR

- **Review:** Every change gets reviewed by someone who would catch a regression in production. First review within one working day. Feedback is specific, explains *why*, and proposes an alternative when it asks for a change.
- **Test:** The smallest test that proves the change works. Cover the interesting paths; skip the obvious ones. A skipped test is a deliberate decision, not an oversight.
- **Done:** Shipped behind a flag or in a deploy, observable in production, documented if the surface area changed, and the issue has a comment that links the verification.

That's the bar. The sections below are the rules behind it.

## Code review

**What gets reviewed.** Every change to `main` goes through a pull request. No exceptions for "trivial" fixes; trivial fixes have caused real outages. The diff is the smallest unit of review, not the commit and not the whole feature.

**Who reviews.** One approver is the floor; two approvers are required for changes to auth, crypto, secrets, permissions, infra IAM, billing, or the public API surface. The author picks the primary reviewer; the second reviewer is the CTO or the relevant domain owner (Security, Infra, etc.). If you don't know who that is, ask in the issue thread before you open the PR.

**Time window.** First review within one working day. If you're blocked on review, ping the reviewer in the issue or the PR thread; do not silently wait. Reviews are a synchronous commitment, not a backlog.

**What good feedback looks like.**

- Specific. "This will OOM on a 10MB payload" beats "this could be slow."
- Explains *why*. "Because we serialize on the request thread" is a comment, not an opinion.
- Proposes an alternative when it asks for a change. "I'd extract this into a helper" beats "this is messy."
- Distinguishes blocking from non-blocking. Prefix with `[blocking]` or `[nit]` so the author knows what to fix vs. what to consider.

**What bad feedback looks like.**

- "LGTM" with no comment. If you can't say *why* it looks good, you didn't review it.
- Style nits on lines outside the diff. Open a follow-up instead.
- Rewrites disguised as reviews. If you would write it differently from scratch, say so and let the author decide.

**Reviewing your own PR.** You can't. A PR with only the author's approval is not reviewed.

## Testing

**What must be tested.**

- Every new public function, endpoint, or schema field has at least one test that exercises the *interesting* path: the failure mode, the boundary, the input that would have caught the bug we're most worried about.
- Every bug fix has a regression test that fails without the fix.
- Every change to auth, permissions, billing, or data integrity is covered by a test that would have caught the original mistake.

**What is fine to skip.**

- Pure plumbing with no business logic (boilerplate wiring, type definitions, generated code, dependency updates).
- One-line changes where the test would be longer than the implementation and would only re-exercise the language.
- Visual / interactive surface that we verify by hand or with screenshot tests in a separate suite. (Flag it in the PR; do not silently skip.)

A skipped test is a *deliberate decision*. If a reviewer asks "why isn't this tested?" and the answer is "I didn't think about it," the PR is not done.

**The bar for "good enough" coverage on a PR.** Coverage is a floor, not a goal. We don't gate on a percentage; we gate on whether the test would have caught a real bug. A 95%-covered PR with no boundary tests is worse than an 80%-covered PR with sharp boundary tests. The author says in the PR description which lines are uncovered and why.

**Flaky tests are a bug.** A test that fails intermittently is broken. Mark it, fix it the same day, or quarantine it behind a known-flake suite. Never let a flake become "just rerun CI."

## "Done"

A change is **done** only when *all* of the following are true:

1. **Deployable.** It is behind a feature flag, or it is in a deploy that has run successfully (CI green, typecheck green, smallest relevant test set green). If the deploy is the verification, the comment links the deploy URL or the run id.
2. **Observable.** If the change touches a user-facing surface, infra, or any path we have ever paged on, it ships with a metric, log, or alert that would catch a regression. "It's a small change" is not a reason to skip observability.
3. **Documented.** If the change introduces or modifies a public surface (API endpoint, schema, env var, billing path, permission model, or agent tool surface), the matching doc is updated in the same PR. Silent surface area is a regression.
4. **Verified.** The issue has a final comment that explains *how* this was verified, with a link to the test output, the deploy, the screenshot, or the reproducible steps. "Works on my machine" is not verification.
5. **Small enough to review.** The diff fits in one sitting. If it doesn't, the PR is too big and should be split. Large PRs are not a badge of honor.

A change is **not done** when: it "works on my machine," the test was skipped, the typecheck was disabled, the secret lives in the repo, or the diff touches five modules for what should have been a five-line change.

## A few hard rules

- **Never commit secrets, credentials, or customer data.** If you spot any in a diff, stop and escalate to the CTO. There is no "we'll remove it later."
- **Don't bypass CI, pre-commit hooks, or signing** unless the issue explicitly authorizes it and the commit message says why. "Hooks were slow" is not a reason.
- **Don't push to `main` directly, don't force-push to `main`, don't drop databases or take infra offline** without an explicit ticket that names the action. Destructive operations need a paper trail.
- **Code review is not optional.** No merges without an approver. No self-approval. No "I'll get a review after it ships."

## Where to find more

- The architecture and stack choices live in `docs/architecture.md` (forthcoming — see [COS-3 technical roadmap](/COS/issues/COS-3)).
- The repo conventions (lint, typecheck, test commands) live in the project `README.md`.
- The incident response runbook lives in `docs/incidents.md` (forthcoming).
- The hiring bar and take-home prompt live in `docs/hiring.md` (forthcoming — see [COS-1 hiring plan](/COS/issues/COS-1#document-plan)).

When this bar changes, the change is a PR to this file, reviewed by the CTO, and announced in the engineering channel. We do not silently drift.

---

*Owner: CTO. Source issue: [COS-4](/COS/issues/COS-4). Last updated: 2026-06-14.*
