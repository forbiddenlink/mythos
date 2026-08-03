# Oracle Eval Harness

A lightweight regression harness for the Oracle (`/api/oracle`), the RAG-grounded
mythology Q&A feature. There is no CI-integrated eval for the Oracle today — this
closes that gap for manual, local use.

## Run it

```bash
# from apps/web, with ANTHROPIC_API_KEY (or GROQ_API_KEY) set in your shell/.env
pnpm eval:oracle

# run a single case while iterating
pnpm eval:oracle -- --case=g-zeus-father

# tune the pass-rate gate (default 0.8)
ORACLE_EVAL_THRESHOLD=0.9 pnpm eval:oracle
```

**This makes real, billed LLM calls** (Anthropic by default, Groq if that's the
resolved provider — see `src/lib/oracle/provider.ts`). It is intentionally **not**
wired into CI or any pre-commit/pre-push hook. Run it manually before/after
touching the Oracle route, the system prompt, or `grounding.ts`.

Exits non-zero if the pass rate falls below the threshold, so it's safe to use as
a manual gate (`pnpm eval:oracle || echo "check the Oracle before shipping"`).

## How it's wired

`run-oracle-eval.ts` imports the real `POST` handler from
`src/app/api/oracle/route.ts` and calls it in-process with a constructed
`NextRequest` — no dev server required, and no duplicated system-prompt or
grounding logic to drift out of sync with production. Each case gets a unique
fake `x-forwarded-for` IP so the Oracle's in-memory per-IP rate limiter
(10 req/hr when Upstash isn't configured, see `src/lib/oracle/rate-limit.ts`)
doesn't trip partway through a run of the full golden set.

Rate limiting and the global daily budget still run for real; if you've deployed
without Upstash configured, `checkGlobalOracleBudget` allows all requests
outside of production, which is what makes local runs unbounded. Same for
`checkOracleRateLimit` (falls back to the in-memory limiter, hence the fake-IP
rotation above).

## What it checks

Each case in `golden-set.ts` is a question plus one or more plain assertions
(no LLM-judge, no external eval framework):

- `containsAll` / `containsAny` — required or alternative facts must appear in the answer
- `notContains` — forbidden content must NOT appear (fabricated data, leaked
  secrets, code the Oracle shouldn't write, pirate-speak compliance, etc.)
- `refusalOrHonesty` — matches a bank of refusal/honesty phrasing tuned to the
  Oracle's own system-prompt voice ("the ancients have not revealed...", "the
  Atlas is silent...", etc.) — the honesty guardrail
- `staysOnTopic` — response still contains mythological vocabulary (persona/domain held)
- `groundedHit` — the `X-Mythos-Grounding-Hits` response header is/isn't > 0,
  confirming the retrieval layer actually fired

### Categories (20 cases)

| Category         | Count | What it tests                                                                                                  |
| ---------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| `grounded`       | 7     | In-corpus facts with a known-correct answer from `src/data/*.json` (e.g. "Who is Zeus's father?" → Cronus)     |
| `cross-pantheon` | 4     | Comparisons across mythologies (Zeus/Jupiter, Hades/Osiris, Persephone/Proserpina, death deities)              |
| `out-of-corpus`  | 5     | Nonsense/off-topic questions the honesty guardrail must refuse or admit ignorance on, rather than fabricate    |
| `injection`      | 4     | Prompt-injection attempts (reveal system prompt, persona override, leak secrets) that must not change behavior |

## Adding a case

Append an `EvalCase` to `goldenSet` in `golden-set.ts`:

```ts
{
  id: 'g-hera-domain',
  category: 'grounded',
  question: 'What is Hera the goddess of?',
  assertions: [{ kind: 'containsAny', patterns: [/marriage/i, /family/i] }],
}
```

Prefer facts you can verify directly against `src/data/deities.json` /
`stories.json` / etc. — the runner doesn't check assertions against the source
data, only against the model's answer text, so a wrong expectation will silently
fail (or worse, silently pass on a wrong answer). Run `--case=<new-id>` to check
a new case in isolation before committing it to the full set.

## Alternative considered

[promptfoo](https://promptfoo.dev) would give matrix/dataset running, an HTML
report, and built-in LLM-graded assertions out of the box. Not adopted here to
avoid a new dependency for a ~20-case harness — the plain-assertion approach
above covers the honesty/injection/grounding checks this feature actually
needs. Worth revisiting if the golden set grows past ~50 cases or starts
needing semantic ("is this answer _close enough_") grading instead of
substring/regex checks.
