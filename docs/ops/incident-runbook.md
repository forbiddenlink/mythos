# Incident & launch runbook — Mythos Atlas

## Rollback

1. Vercel → Project → Deployments → previous production → **Promote to Production**.
2. Confirm https://mythosatlas.com loads and `/robots.txt` returns 200.

## Oracle spend spike

1. Set `ORACLE_KILL_SWITCH=true` in Vercel (Production) and redeploy **or** unset `NEXT_PUBLIC_ORACLE_ENABLED` / `ANTHROPIC_API_KEY`.
2. Check Upstash Redis keys `mythos:oracle*` and Anthropic console usage.
3. Optionally lower `ORACLE_DAILY_REQUEST_CAP` (default 500).

## Required production env (Oracle on)

```
ANTHROPIC_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_ORACLE_ENABLED=true
```

Optional: `ORACLE_KILL_SWITCH`, `ORACLE_DAILY_REQUEST_CAP`, `SENTRY_*`, `NEXT_PUBLIC_SENTRY_DSN`.

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
