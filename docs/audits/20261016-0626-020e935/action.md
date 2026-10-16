# Prioritized action

## Launch blockers

No confirmed Critical or reachable application High finding was established in the inspected local scope. This does not waive the unknown production gate rows.

## Completed this pass

SEC-001, TIME-001, REL-001, CI-001, BUILD-001 and CI-002 are repaired locally with the verification recorded in findings.md and evidence/. Earlier review-statistics/deck midnight repairs are preserved.

## Follow-up before production promotion

- Verify the protected preview's Upstash configuration and digest lease failure state, plus Sentry consent withdrawal, using owned test data and authorization for any external write. Owner: Liz. Target: before deployment. The cron now requires shared Upstash configuration for drafts as well as sends; it returns 501 without it.
- Confirm production alert delivery, rollback access, branch protections and provider/domain settings. Owner: Liz. Date: before relying on a production-readiness verdict. These are evidence gaps, not asserted misconfigurations.

## Dependency follow-up

DEP-001: revisit braces when an upstream patch exists. DEP-002: verify the actual deployed native binary and a sharp release bundling patched libheif when available. Neither was fixed by inventing a package version or adding an untested native build.

Single smallest next action: verify the repaired behavior on a protected preview with known Upstash configuration before promoting these local changes. No push, merge, deployment or real send was performed here.
