# Mythos Atlas — Portfolio Elevation Design

**Snapshot as of:** 2026-07-25
**Written against:** `3b2db29` (main)
**Status:** Approved direction (2026-07-25). Ready for implementation plan.
**Live:** https://mythosatlas.com · Repo: `forbiddenlink/mythos`

---

## Goal

Turn Mythos Atlas from a competent-but-generic mythology encyclopedia into a
portfolio-tier piece that (1) stops a recruiter's scroll in the first 10 seconds
and (2) survives the second look — fast, clean, obviously made by someone with
design _and_ engineering taste.

### Success criteria

- **First impression:** the homepage opens with one cinematic, scroll-driven set
  piece ("The Atlas Opens") that reads as intentional and premium, not template.
- **Second impression (the differentiator):** no jank. Hero is interactive fast,
  main thread is not saturated, Lighthouse performance does not regress (target:
  perf ≥ 90 on desktop, no CLS from the pinned hero).
- **Depth proof:** the deity detail page — one template that renders 189 pages —
  is elevated from generic shared-hero to an editorial, art-directed layout.
- **No broken windows:** the live `cta-ruins.webp` 404 is fixed. (Deity image
  resolution verified 2026-07-25 — NOT broken; see findings.)
- **Shareable artifact:** one short Remotion-rendered "sizzle" clip exists for a
  case study / social card — NOT embedded as page weight.
- **Accessibility preserved:** `prefers-reduced-motion` fully collapses the
  cinematic to a clean static layout; existing a11y (skip link, headings, aria)
  is not regressed.

## Audience

Recruiters and design-conscious engineers skimming fast. Liz is dev _and_
designer; the piece must prove both. This drives the core tension: **spectacle
that is also fast.** A slow showpiece is a net negative here.

## Strategy decision

**Chosen:** Signature set piece + foundation fix + depth proof. Depth on a few
surfaces over even uplift across ~30 routes.

**Counter-argument considered (adversarial pass):** a net-new flagship (e.g. a 3D
explorable pantheon map) is more novel and more memorable than polishing existing
pages. It wins _if_ the current pages were already solid and only a hook was
missing. They are not — the current homepage already saturates the main thread
(a browser automation screenshot injection timed out repeatedly at 5s+ against
the live hero). Piling more heavy 3D onto unfixed perf debt compounds the actual
defect. **Resolution:** fold the _novelty_ of a flagship into the signature
moment (the cinematic scroll narrative is itself new), but build it on a fixed,
fast foundation. Novelty on top of jank backfires precisely with the audience we
care about.

---

## Current-state findings (verified against code)

### Bugs / broken windows

- **`cta-ruins.webp` 404 (live).** `src/components/home/CTASection.tsx:28`
  references `bg-[url('/cta-ruins.webp')]` but only `public/cta-ruins.png`
  exists. CTA background is currently missing in production.
- **Deity images — VERIFIED OK (2026-07-25).** Initial read suggested a
  `.jpg`/`.png` mismatch; verified false. `deities.json` references are mixed
  (62 `.jpg` + 128 `.png`); all 190 referenced files exist on disk; `zeus.jpg`
  serves `200` live. No action needed. Only `cta-ruins` is actually broken.

### Performance debt (the #1 problem)

- **Hero GPU cost:** `src/components/home/HeroSection.tsx:76-136` renders three
  simultaneous `blur(40-50px)` infinitely-looping `motion.div` orbs, plus a live
  R3F canvas (`ConstellationBackground`) plus tsparticles (`GoldenDustParticles`)
  — three continuous animation systems layered on the LCP screen.
- **Reduced-motion is only partial:** `useReducedMotion()` at HeroSection L53
  gates _only_ the 3 orbs (L76). Emblem/title/scroll `motion` animations
  (L144, 191, 202, 214, 243, 274, 280) are NOT gated.
- **`ConstellationBackground` smell:** `frameloop="demand"` (L294-303) paired with
  continuous `useFrame` rotation/twinkle (L97-104, L175-180) that never calls
  `invalidate()` — a correctness/perf mismatch. Scroll hook is a raw, unthrottled
  `window.addEventListener("scroll")` (L213-232). No IntersectionObserver; canvas
  is `position:fixed` and persists across the entire page scroll.
- **Particles:** tsparticles run their own rAF with no offscreen pause; two
  engines initialize (hero + deity `DeityStatue`).
- **Console (live):** `THREE.Clock` deprecation warning; CSS preloaded-but-unused
  at ~7.4s (slow).

### Deity page (depth-proof target)

- `src/app/deities/[slug]/DeityPageClient.tsx` (705 lines). Hero (L231-321) uses a
  **single shared `/deity-hero.jpg` for ALL 189 deities** — generic. The
  per-deity art exists but is relegated to a content-grid image (L336).
- Rich data model already present (`Deity` interface L101-136): domains, symbols,
  pronunciation (+audio), detailedBio, originStory, crossPantheonParallels,
  primarySourceExcerpts, worship{temples,festivals,practices}, relationships.
  The content is there; the layout under-sells it.

### Design system (the good foundation)

- Full OKLCH token system in `src/app/globals.css` (`@theme inline` L7-60, light
  L67-139, dark L146-180+). Custom tokens: gold family, midnight, parchment,
  bronze, patina, 5-color classical chart palette.
- Fonts (`layout.tsx:15-36`): Cinzel (display), Crimson Pro (body serif),
  Source Sans 3 (UI). Dark-academia / classical-antiquity theme.
- Stack already carries everything needed: framer-motion 12, **gsap 3.15 +
  @gsap/react**, **lenis**, three 0.184 + @react-three/fiber 9 + drei 10,
  tsparticles. No new heavy deps required.

---

## The plan (phased; value ships each phase)

### Phase 0 — Stop the bleeding (ships alone, high ROI)

1. Fix `cta-ruins` 404: generate an optimized `public/cta-ruins.webp` from the
   existing `.png` (smaller) OR repoint L28 to `.png`. Prefer `.webp`.
2. ~~Verify deity image resolution~~ — DONE 2026-07-25, images OK, no action.
3. Perf pass on the hero:
   - Gate ALL hero motion (not just orbs) behind reduced-motion via
     `gsap.matchMedia()` / a single guard.
   - Reduce the three blurred orbs to one (or replace with a cheaper static
     gradient + one subtle animated layer).
   - Add IntersectionObserver gating so `ConstellationBackground` +
     `GoldenDustParticles` pause (`frameloop="never"`) when the hero is offscreen.
   - Fix the `frameloop="demand"` / `invalidate()` mismatch — drive renders from
     scroll, not an ungated continuous `useFrame`.
   - Throttle/replace the raw `window` scroll listener (use Lenis scroll event or
     rAF).
   - Address `THREE.Clock` warning (verify installed three revision first;
     `npm ls three`. R3F abstracts the clock — likely no manual `Timer` needed).

### Phase 1 — The signature: "The Atlas Opens"

Reimagine the homepage hero as a pinned, scroll-scrubbed cinematic sequence
(≤ 4 scenes, completes in one deliberate scroll — award-tier discipline is ≤5
scenes / 2-3 min). Built with the existing GSAP + Lenis + R3F.

**Scene beats:**

1. **Cosmos (pinned).** Starfield; the "Mythos Atlas" wordmark resolves _from_
   constellation lines (choreograph the existing `ConstellationBackground` to
   scroll progress instead of idle-looping). Title is LCP — rendered visible, not
   `opacity:0` (preserve the existing LCP-safe approach at HeroSection L179).
2. **Descent.** Camera/parallax moves down; the 13 culture sigils materialize
   across a horizon, parallax layers drawn from `public/environments/` art.
3. **Featured myth.** One full-bleed illustration + a primary-source pull-quote
   (from `sources.json` / a curated line), text mask-revealed on scroll.
4. **Rest state / landing.** The current stats proof-strip + "choose your path"
   CTAs (HeroSection L225-271), restyled as the sequence's resolution.

Below the pinned hero, the existing section stack (`page.tsx` L35-131) continues,
lightly restyled for continuity.

### Phase 2 — Depth proof: elevate the deity page template

Rework `DeityPageClient.tsx` into an art-directed editorial layout (upgrades 189
pages at once):

- Per-deity hero art (the deity's own image) as the hero, not the shared
  `deity-hero.jpg`. Atmospheric treatment (gradient wash toward theme, subtle
  parallax / Ken-Burns, reduced-motion safe).
- Stronger type hierarchy (Cinzel display for name, original-language name as a
  design element, domains/symbols as refined badges).
- Choreographed reveal of relationships / family tree on scroll into view.
- Keep all existing content sections; re-compose for editorial rhythm.

### Phase 3 — Taste pass + sizzle

- Consistency pass on the shared components the above flows touch (pantheon grid
  card, story card, nav) — spacing, motion language, token discipline.
- One short **Remotion** "sizzle" clip (hero sequence highlights) rendered as a
  downloadable/shareable artifact for a case study or social card. Not embedded
  in the live hero (perf).

**Scope guard:** Phases 0-1 alone transform the first impression. 2-3 are depth.
Stop after any phase with a coherent result.

---

## Technical approach (verified)

### GSAP + Lenis + ScrollTrigger wiring (canonical)

- Register plugins once at module scope: `gsap.registerPlugin(ScrollTrigger, useGSAP)`.
- Init inside `useGSAP(() => {...}, { scope: container })` — cleanup is
  `context.revert()` (auto-kills tweens + ScrollTriggers + restores inline styles).
- Lenis driven by GSAP ticker (NOT autoRaf):
  ```
  const lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  // cleanup: gsap.ticker.remove(tick); lenis.destroy();
  ```
- Pinned scrub timeline: `scrollTrigger: { trigger, start:'top top', end:'+=300%', scrub:1, pin:true }`.
- **Check for an existing app-level Lenis provider before adding a second Lenis
  instance** (`lenis` is already a dependency; do not double-instantiate).

### Performance discipline

- Animate **transform/opacity only**; `will-change: transform` on scrub targets,
  removed after.
- R3F: `frameloop={inView ? 'demand' : 'never'}` (IntersectionObserver via
  `useInView`); call `invalidate()` from the scroll/ScrollTrigger `onUpdate`
  rather than a continuous `useFrame` — turn the 3D scene into a scrubber.
- `dpr={[1, 1.5]}` clamp (already set) + optional drei `<PerformanceMonitor>` to
  drop DPR under load.
- Lazy-load three/R3F via `next/dynamic(..., { ssr:false })` inside a `'use
client'` wrapper (ssr:false is disallowed in Server Components — Next 16).

### Reduced motion

- `gsap.matchMedia()` with `reduce: '(prefers-reduced-motion: reduce)'` — under
  `reduce`, omit `pin`/`scrub` entirely and render the static stacked layout;
  skip mounting the decorative R3F canvas. matchMedia auto-reverts on query flip.

### three.js note (uncertain — verify)

`THREE.Clock` deprecation lands ~three r183. R3F 9's internal loop still calls
`state.clock.getDelta()`, i.e. the clock is abstracted — likely no manual
`THREE.Timer` migration needed in app code. Confirm installed revision with
`npm ls three` and check the R3F changelog before touching Timer directly.

---

## Out of scope

- No hero background _video_ (LCP/page-weight cost). Motion via scroll + parallax
  - Ken-Burns on existing illustrations instead.
- No net-new flagship feature (3D pantheon map, live knowledge-graph) this round —
  considered and deferred (see Strategy counter-argument).
- No even uplift of all ~30 routes; only the shared components the signature +
  deity flows touch.
- No CMS/data-model changes; content model stays local JSON.

## Risks / open questions

- ~~Deity image `.jpg`/`.png` discrepancy~~ — RESOLVED 2026-07-25, not broken.
- **Existing Lenis usage** — confirm whether an app-level smooth-scroll provider
  already exists to avoid a second instance / scroll conflict.
- **three revision** for the Clock warning (verify, above).
- **Pinned-hero + PWA / view-transitions** — the site uses view-transition morph
  keyframes (globals.css:813-856); confirm the pinned hero doesn't fight the
  existing page-transition system.

## Accountability (validation touches a live production site)

- **Checklist:** Lighthouse perf before/after (no regression); reduced-motion
  verified; a11y (axe) not regressed; 404 + image resolution confirmed fixed.
- **Evidence:** before/after Lighthouse + screenshots captured during Phase 0/1.
- **Owner:** Liz (forbiddenlink).
- **Status after:** deploy behind normal Vercel flow; watch Speed Insights +
  Sentry post-deploy.
