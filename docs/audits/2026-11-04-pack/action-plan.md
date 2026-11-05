# Mythos Atlas audit action plan

Snapshot as of 2026-11-04, written against main `b988e108` plus PR #288 (`fix/audit-visual-findings`).
Source: `findings-*.json` in this folder. Status counts on 2026-11-05 after PRs #288 and #290 merged
and the PostHog project was corrected: 49 fixed, 3 accepted, 2 refuted, 2 duplicate, 7 partial, 15 open.

Buckets follow the pack's `action` rules: severity plus reach, never topic alone.

## Launch blockers

None. No Critical finding exists. The two open High findings (STRAT-004, STRAT-005) are editorial
depth and source labelling. Neither sits on a broken critical flow or carries a security, privacy or
compliance impact.

## This sprint

- [ ] Label each primary-source quote as quotation, paraphrase, summary or oral tradition (STRAT-005, High, larger: split per pantheon).
      What: quote fields mix verbatim translation, paraphrase and summary with no marker. Where: `src/data/deities.json` `primarySources`, `src/types/Entity.ts`, `src/lib/schemas.ts`. Fix: add `kind` to `PrimarySource` (types and Zod schema together), backfill per pantheon with a reviewer, render the kind next to each quote. Verify: schema test fails on a missing `kind`; spot-check 15 entries against the source texts.
- [ ] Finish the teachers hub: lesson outlines, reading levels, standards links (STRAT-004, High, larger: split into 3 issues).
      What: `/teachers` exists (#280) but has no per-pantheon outline, reading level or standards mapping. Fix: one-page outline per pantheon, a Flesch-Kincaid grade per story, a standards link list. Verify: each outline renders and prints; grades computed by a script, not by hand.

## Next sprint

- [ ] Upload source maps to Sentry (OPS-002, Medium, under 15 min for Liz). Add `SENTRY_AUTH_TOKEN` (Production, Sensitive) so `withSentryConfig` runs. Verify: next Sentry issue shows original file and line.
- [ ] Require strict up-to-date checks on main (OPS-001, Medium partial, under 15 min, Liz's call). Required checks already exist; strict mode and admin enforcement are optional.
- [ ] Schedule a Giving Tuesday appeal for 2026-12-01 (STRAT-003, Medium, under 1 hr). Newsletter issue plus a dated support-page note. Liz writes or approves the copy, and the send is hers.
- [ ] Replace the 1913 retelling and Budge as primary texts where better translations exist (STRAT-006, Medium, larger: per pantheon).
- [ ] Re-check headline claims against their cited passage (STRAT-007, Medium, under 4 hr per 15 entries). Start with the 15-entry sample in the finding (anubis first).
- [ ] Extend the excerpt verification ledger past the 35 verified excerpts (STRAT-008, Medium, larger: batches of 25).
- [ ] Finish living-tradition labelling: rename and label propagation into quiz and compare (STRAT-009, Medium partial, under 4 hr). The Kami label and the living-tradition note are live.
- [ ] Add a named community review and correction log for Indigenous traditions (STRAT-010, Medium, larger: needs outreach, not code).
- [ ] Add supporter recognition without paywalls (STRAT-002, Medium partial). Supporter name list needs a Stripe checkout display-name field with consent (payments sign-off).
- [ ] Grow media tie-in guides past 6 (STRAT-013, Medium, under 4 hr per guide).
- [ ] Host or link primary-text pages for the 68 sources with no external URL (STRAT-015, Medium, larger).
- [ ] Commission or draw covers for the Xibalba and Fishing Up the Islands journeys (VIS-005, Medium, needs artwork).

## Backlog

- [ ] Remove the duplicated root and app dependency pins, or move them to a pnpm catalog (CODE-008, Low partial, under 1 hr).
- [ ] Send the newsletter from mythosatlas.com instead of elizabethannstein.com (OPS-005, Low, Liz: verify the domain in Resend).
- [ ] Move DMARC from p=none to p=quarantine after reading rua reports (OPS-006, Low, Liz: DNS).
- [ ] Remove the unused Axiom ingest env var or wire a log drain (OPS-007, Low, Liz: Vercel env).
- [ ] Prove Sentry alert delivery with a test event (OPS-008, Low, under 15 min).
- [ ] Set www.mythosatlas.com to redirect with 308 instead of 307 (OPS-010, Low partial, Liz: Vercel Domains). Verified 2026-11-04: `curl -sI https://www.mythosatlas.com` returns 307.
- [ ] Per-answer quiz explanations (STRAT-012, Low partial, under 4 hr). A miss is already corrected in place (#274).
- [ ] VIS-017: home looks the same in light and dark above the fold. Intentional (dark hero band); left open as a design call, not a defect.

## Counts

Launch blockers 0. This sprint 2. Next sprint 12. Backlog 8. Launch-blocker effort: none.
