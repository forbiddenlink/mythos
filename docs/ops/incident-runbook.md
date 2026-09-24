# Incident & launch runbook — Mythos Atlas

## Rollback

1. Vercel → Project → Deployments → previous production → **Promote to Production**.
2. Confirm https://mythosatlas.com loads and `/robots.txt` returns 200.

## Oracle spend spike

1. Set `ORACLE_KILL_SWITCH=true` in Vercel (Production) and redeploy. Hiding `NEXT_PUBLIC_ORACLE_ENABLED` only removes the footer control; removing one provider key can select the other configured provider.
2. Check Upstash Redis keys `mythos:oracle*` and usage in the configured provider account.
3. Optionally lower `ORACLE_DAILY_REQUEST_CAP` (default 500).

## Production configuration (Oracle on)

```
ORACLE_PROVIDER=anthropic
ANTHROPIC_API_KEY=
# Or configure ORACLE_PROVIDER=groq with GROQ_API_KEY.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_ORACLE_ENABLED=true
```

Model overrides: `ANTHROPIC_ORACLE_MODEL` or `GROQ_ORACLE_MODEL`. Optional controls: `ORACLE_KILL_SWITCH`, `ORACLE_DAILY_REQUEST_CAP`, `SENTRY_*`, `NEXT_PUBLIC_SENTRY_DSN`.

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
