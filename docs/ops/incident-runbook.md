# Incident & launch runbook — Mythos Atlas

## Rollback

1. Vercel → Project → Deployments → previous production → **Promote to Production**.
2. Confirm https://mythosatlas.com loads and `/robots.txt` returns 200.

## Oracle spend spike

1. Set `ORACLE_KILL_SWITCH=true` in Vercel (Production) and redeploy. Hiding `NEXT_PUBLIC_ORACLE_ENABLED` only removes the footer control and nav links; without `ORACLE_PROVIDER`, removing one provider key can select the other configured provider (a pinned `ORACLE_PROVIDER` never switches).
2. Check Upstash Redis keys `mythos:oracle*` and usage in the configured provider account.
3. Optionally lower `ORACLE_DAILY_REQUEST_CAP` (default 500) or `ORACLE_DAILY_TOKEN_CAP` (default 2,000,000; counter at `mythos:oracle:tokens:<UTC day>`).

## Production configuration (Oracle on)

```
ORACLE_PROVIDER=anthropic
ANTHROPIC_API_KEY=
# Or configure ORACLE_PROVIDER=groq with GROQ_API_KEY.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_ORACLE_ENABLED=true
```

Model overrides: `ANTHROPIC_ORACLE_MODEL` or `GROQ_ORACLE_MODEL`. Optional controls: `ORACLE_KILL_SWITCH`, `ORACLE_DAILY_REQUEST_CAP`, `ORACLE_DAILY_TOKEN_CAP`, `SENTRY_*`, `NEXT_PUBLIC_SENTRY_DSN`.

The kill switch disables both Oracle and story-quiz generation. Production requests require shared Redis for both Anthropic and Groq; per-IP limits and the global daily cap fail closed without it. Only development can fall back to in-memory limits. Do not infer account billing status from the provider name.

## Vercel project

- **Root Directory:** `apps/web`
- Install uses frozen lockfile (`apps/web/vercel.json`).
- Canonical URL: https://mythosatlas.com (not mythos.vercel.app).

## Monitoring

- Sentry: client SDK loads only after cookie consent; server init uses DSN.
- Cookie / analytics: footer → Cookie Settings; GPC honored.

## Contacts

- Public: /contact (GitHub). Prefer private channel for security/privacy reports.
- Owner: Elizabeth Stein (see privacy policy).

## Optional support payments

`/support` links to Stripe-hosted, one-time checkout. The live link is configured in that page; no site-side payment API or webhook is required for this flow. Verify its merchant name, currency, amount limits and one-time status before changing it. Use Stripe's records to reconcile payments; a browser return URL is not proof of payment. Do not run a live payment merely to test the link.

## Branch and release cleanup

Validate an integration branch and its protected preview before merging into `main`. Main is the production deployment branch. When consolidating PRs, preserve their commits in the replacement branch and link the replacement before closing the old PRs. Remove a worktree only after verifying it has no tracked or untracked work; delete its branch only once its commits remain reachable. Keep unrelated local edits intact.

## Weekly digest verification

Contact creation is not evidence that a digest was delivered. The dedicated
Mythos Atlas segment exists (metadata checked 2026-10-08); delivery and
unsubscribe behavior still require an authorized test destination.

Before enabling recurring sends:

1. Use only the dedicated Mythos Atlas segment. Confirm the sending domain is
   verified and the sender address belongs to it.
2. Prepare a source-backed myth with links to its entry and cited passage.
   Include the provider-managed unsubscribe link and sender identity.
3. Send a test to an explicitly authorized address. Check received rendering,
   links, unsubscribe, and that the unsubscribed contact is excluded from a
   subsequent test. Keep recipient details outside repository notes.
4. Record provider delivery status and the test date, then schedule the weekly
   broadcast through Resend. Do not infer delivery from an accepted signup.
5. Review aggregate delivered/bounced/unsubscribed totals and useful return
   visits after each send; pause scheduling when delivery or unsubscribe fails.

## Reader validation

Use `docs/audits/2026-09-23-reader-test-kit.md` with three unfamiliar readers,
including mobile. No sessions have been run. Capture anonymous observations,
then prioritize repeated obstacles to finding, reading, checking evidence, or
returning to saved material. Automated browser tests do not replace this study.
