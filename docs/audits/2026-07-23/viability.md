# Viability Gate — Mythos Atlas (2026-07-23)

## What it is

Mythos Atlas is a free, interactive mythology encyclopedia (Next.js) covering ~13 pantheons with deities, stories, creatures, artifacts, locations, family-tree visualizations, quizzes/spaced-repetition, and an Anthropic-backed Oracle Q&A. Data is static JSON; progress lives in localStorage. No accounts or payments.

## Painful job (stated?)

**Not clearly stated.** Hero (`HeroSection.tsx:218-220`) markets a "free interactive encyclopedia… with family trees, quizzes, and AI-powered exploration." About (`about/page.tsx:67-70`) aims to "make mythology accessible… for everyone—from students and researchers to mythology enthusiasts." The nearest job: _help learners go from orientation to deeper study without treating myths as isolated wiki entries_ (`about/page.tsx:73-76`) — but it is not framed as a painful job.

## ICP

Intended (from About): students, researchers, enthusiasts, casual learners — too broad. Sharpest plausible ICP: undergrad / self-taught mythology students who want interactive study (trees, quiz, review) rather than primary-source lookup.

## Stage

**Live-no-users (metrics UNKNOWN).** README points at https://mythos.vercel.app; site URL also mythosatlas.com. No activation/retention product analytics in code (Vercel Analytics + stub `/api/analytics/vitals`). No revenue path.

## Competitors / alternatives

- Theoi.com — deep Greek primary sources + art
- Mythopedia / Encyclopedia Mythica (~11k articles, ~4k gods)
- Wikipedia / textbooks / Anki DIY

Switch reason would be **interaction + study loop** (trees, quiz, Oracle), not catalog depth (Mythos ~189 deities vs incumbents' thousands).

## Verdict: **NEEDS WORK**

Evidence:

1. No retention/activation instrumentation → Sean Ellis / month-3 retention UNKNOWN (kill signal if building as a product).
2. Content moat thin vs free encyclopedias; differentiation is UX/tools, not corpus.
3. Product is already built & framed as editorial/portfolio (`about`, homepage editorial block) — worth hardening for launch quality, but commercial PMF unproven.

**Biggest risk:** Spending polish cycles without a distribution experiment — feature work won't beat Theoi/Wikipedia on lookup.

**2-week demand experiment:** Pick one ICP (e.g. World Mythology undergrads). Ship 3 SEO/study landing pages + a 60-second "very disappointed" survey after quiz completion; measure returning-visitor rate in Vercel Analytics. If <10% return in 14 days and survey <20% "very disappointed," treat as portfolio-only and stop feature expansion.

Continue technical launch audit: YES (hardening a live editorial app is justified; venture scaling is not yet).
