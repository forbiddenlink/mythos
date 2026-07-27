# Master Launch Gate — Mythos Atlas (2026-07-23, post wave-2 polish)

## Verdict: **CONDITIONAL GO** for quiet/editorial launch

Launch blockers from quick + wave 2 are cleared in code. Remaining work is polish / ops / commercial PMF — not quiet-ship blockers.

### Must verify in production before Oracle is on

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_ORACLE_ENABLED=true
# optional
ORACLE_DAILY_REQUEST_CAP=200
ORACLE_KILL_SWITCH=
```

Smoke after deploy:

- [ ] `/robots.txt` → 200
- [ ] Cookie reject → no Vercel Analytics / client Sentry
- [ ] Oracle Origin mismatch → 403; kill switch → 503
- [ ] https://mythosatlas.com (not mythos.vercel.app)
- [ ] Knowledge graph keyboard list navigates to deities

### Docs

- Runbook: [docs/ops/incident-runbook.md](../../ops/incident-runbook.md)
- Wave 2: [wave2.md](./wave2.md)
