# Mythos Atlas — Phase 0: Foundation Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the live `cta-ruins` 404 and eliminate homepage main-thread jank so the site is fast and clean before the cinematic hero (Phase 1) is built on top.

**Architecture:** Asset fix (generate the missing optimized `.webp`), then a hero performance pass: fully gate motion behind `prefers-reduced-motion`, cut expensive blurred orbs, make the R3F constellation truly on-demand (idle = zero renders), and throttle the raw scroll listener. No new dependencies; no visual redesign yet.

**Tech Stack:** Next.js 16 (App Router, `next build --webpack`), React 19.2, framer-motion 12, @react-three/fiber 9 + three 0.184 + drei 10, tsparticles, Vitest 4, Playwright 1.60, `cwebp` (CLI, present).

## Global Constraints

- **No new runtime dependencies** — `react-intersection-observer` is ABSENT and stays absent; use framer-motion's `useInView` (already a dep) or the native `IntersectionObserver` (already mocked in tests).
- **LCP safety:** the hero `<h1>` must stay rendered-visible (never `opacity:0`) — preserve the existing approach at `HeroSection.tsx:179`.
- **Reduced-motion is a hard gate:** under `prefers-reduced-motion: reduce`, no infinite/looping animation may run and the decorative R3F canvas must not mount.
- **Test command:** `pnpm --filter web test` (i.e. `vitest run`); unit tests live in `apps/web/src/__tests__/`. Lint: `pnpm --filter web lint`. Build: `pnpm --filter web build`.
- **Do not stage unrelated files** — the working tree has a large pre-existing dirty set; every commit stages only the exact paths named in its step.
- **Paths** are relative to `apps/web/` unless stated. Repo root: `/Volumes/LizsDisk/mythos`.

---

### Task 1: Capture performance baseline (evidence)

Accountability: this touches a live-adjacent production surface; capture before/after proof.

**Files:**

- Create: `docs/superpowers/evidence/phase0-lighthouse-before.md` (repo root)

- [ ] **Step 1: Run Lighthouse against the local production build**

```bash
cd /Volumes/LizsDisk/mythos/apps/web
pnpm build && pnpm start &   # serves on :3000
# wait for ready, then in another shell:
npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility --preset=desktop --output=json --output-path=./lh-before.json --chrome-flags="--headless"
```

If `lighthouse` CLI is unavailable, use the `mcp__lighthouse__run_audit` tool against `http://localhost:3000/` instead.

- [ ] **Step 2: Record the numbers**

Write to `docs/superpowers/evidence/phase0-lighthouse-before.md`: Performance score, LCP, TBT, CLS, and Accessibility score. These are the regression gate for Task 6.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/evidence/phase0-lighthouse-before.md
git commit -m "chore(perf): capture Phase 0 Lighthouse baseline"
```

---

### Task 2: Fix the `cta-ruins` 404 + guard against broken CSS background assets

**Files:**

- Create: `public/cta-ruins.webp` (generated)
- Create: `src/__tests__/assets/css-bg-assets.test.ts`
- Modify: none (CSS already references `.webp` at `CTASection.tsx:28` — generating the asset fixes it)

**Interfaces:**

- Produces: `public/cta-ruins.webp` exists; a regression test asserting every `bg-[url('/x')]` reference in `src/` has a matching file in `public/`.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/assets/css-bg-assets.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";

// Scan all component source for Tailwind CSS bg-[url('/...')] refs and assert the asset exists in public/.
describe("CSS background-image assets exist in public/", () => {
  const root = join(__dirname, "..", ".."); // apps/web/src
  const webRoot = join(root, ".."); // apps/web
  const files = globSync("**/*.{tsx,ts}", { cwd: root }).map((f) =>
    join(root, f),
  );
  const refs: { file: string; asset: string }[] = [];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/bg-\[url\('(\/[^']+)'\)\]/g)) {
      refs.push({ file, asset: m[1] });
    }
  }

  it("finds at least the known references", () => {
    expect(refs.length).toBeGreaterThanOrEqual(2); // cta-ruins + hero-columns
  });

  it.each(refs)("$asset referenced in $file exists in public/", ({ asset }) => {
    expect(existsSync(join(webRoot, "public", asset))).toBe(true);
  });
});
```

(If `node:fs` `globSync` is unavailable in the installed Node, use `fast-glob` only if already in the lockfile; otherwise replace with a hardcoded `readdirSync` recursion — do NOT add a dependency.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test css-bg-assets`
Expected: FAIL — `/cta-ruins.webp` does not exist in `public/`.

- [ ] **Step 3: Generate the optimized webp**

```bash
cd /Volumes/LizsDisk/mythos/apps/web
cwebp -q 78 public/cta-ruins.png -o public/cta-ruins.webp
ls -la public/cta-ruins.webp   # confirm created and smaller than the 556KB png
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test css-bg-assets`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/cta-ruins.webp src/__tests__/assets/css-bg-assets.test.ts
git commit -m "fix(home): generate missing cta-ruins.webp (was 404 in prod) + asset guard test"
```

---

### Task 3: Fully gate hero motion behind `prefers-reduced-motion`

Currently `useReducedMotion()` gates only the 3 orbs; emblem/title/scroll/stat animations at `HeroSection.tsx:144,191,202,214,243,274,280` still run. Centralize the decision in a tiny pure helper so it's unit-testable, then apply it.

**Files:**

- Create: `src/components/home/heroMotion.ts`
- Create: `src/__tests__/components/heroMotion.test.ts`
- Modify: `src/components/home/HeroSection.tsx`

**Interfaces:**

- Produces: `heroMotion(reduce: boolean)` returning per-element framer props. Under `reduce`, every returned config animates to the final visible state with `transition: { duration: 0 }` and no `repeat`.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/components/heroMotion.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { heroMotion } from "../../components/home/heroMotion";

describe("heroMotion", () => {
  it("reduced motion: no looping animations anywhere", () => {
    const m = heroMotion(true);
    for (const key of Object.keys(m) as (keyof typeof m)[]) {
      const cfg = m[key] as {
        transition?: { repeat?: number; duration?: number };
      };
      expect(cfg.transition?.repeat ?? 0).toBe(0);
      expect(cfg.transition?.duration ?? 0).toBe(0);
    }
  });

  it("reduced motion: elements end at visible/final state (opacity 1)", () => {
    const m = heroMotion(true);
    expect((m.title.animate as { opacity?: number }).opacity).toBe(1);
    expect((m.emblem.animate as { opacity?: number }).opacity).toBe(1);
  });

  it("full motion: orbs loop", () => {
    const m = heroMotion(false);
    expect((m.orb.transition as { repeat?: number }).repeat).toBe(Infinity);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test heroMotion`
Expected: FAIL — `heroMotion` not found.

- [ ] **Step 3: Write the helper**

Create `src/components/home/heroMotion.ts`. Model each animated element used in `HeroSection` (`title`, `emblem`, `scroll`, `stats`, `orb`). Under `reduce`, `animate` is the final visible state and `transition` is `{ duration: 0 }` (no `repeat`). Under full motion, return the existing durations/loops. Example shape:

```ts
export interface HeroMotion {
  title: { initial: object; animate: object; transition: object };
  emblem: { initial: object; animate: object; transition: object };
  scroll: { animate: object; transition: object };
  stats: { initial: object; animate: object; transition: object };
  orb: { animate: object; transition: object };
}

export function heroMotion(reduce: boolean): HeroMotion {
  if (reduce) {
    const still = { transition: { duration: 0 } };
    return {
      title: { initial: { opacity: 1 }, animate: { opacity: 1 }, ...still },
      emblem: { initial: { opacity: 1 }, animate: { opacity: 1 }, ...still },
      scroll: { animate: { opacity: 1 }, ...still },
      stats: { initial: { opacity: 1 }, animate: { opacity: 1 }, ...still },
      orb: { animate: { opacity: 0 }, transition: { duration: 0 } }, // orbs hidden
    };
  }
  return {
    title: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8 },
    },
    emblem: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.6 },
    },
    scroll: {
      animate: { y: [0, 8, 0] },
      transition: { duration: 2, repeat: Infinity },
    },
    stats: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.3 },
    },
    orb: {
      animate: { scale: [1, 1.15, 1] },
      transition: { duration: 12, repeat: Infinity },
    },
  };
}
```

(Match the exact initial/animate values already in `HeroSection.tsx` for full-motion so the visible result is unchanged; the point is only that `reduce` collapses everything.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test heroMotion`
Expected: PASS.

- [ ] **Step 5: Apply the helper in HeroSection**

In `src/components/home/HeroSection.tsx`: call `const M = heroMotion(shouldReduceMotion)` once, then replace the inline `initial/animate/transition` props on the emblem (L152-167), title (L186-191), scroll indicator (L274-301), stats (L243), and orbs (L76-136) with `{...M.emblem}`, `{...M.title}`, etc. Under reduced motion render at most one static orb layer (or none). Keep the `<h1>` visible (LCP).

- [ ] **Step 6: Verify reduced-motion at runtime (Playwright)**

Create/extend a Playwright check that loads `/` with `reducedMotion: 'reduce'` and asserts the hero settled (title visible, no perpetual transform). Run: `pnpm --filter web exec playwright test` (or the existing e2e command). Expected: PASS; manual confirm no looping.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/heroMotion.ts src/__tests__/components/heroMotion.test.ts src/components/home/HeroSection.tsx
git commit -m "fix(a11y,perf): fully gate hero motion behind prefers-reduced-motion"
```

---

### Task 4: Cut hero GPU fill cost (blurred orbs)

Three simultaneous `blur(40-50px)` full-size radial orbs are the dominant paint/composite cost on the LCP screen.

**Files:**

- Modify: `src/components/home/HeroSection.tsx:76-136`

- [ ] **Step 1: Reduce to one orb**

Remove two of the three `motion.div` orb layers (L97-116, L117-134). Keep one, driven by `{...M.orb}` from Task 3. Reduce its blur from `blur(40-50px)` to `blur(28px)` and cap its size so it doesn't cover the full viewport.

- [ ] **Step 2: Verify visually**

Run the app (`pnpm --filter web dev`), load `/`, confirm the hero still reads as atmospheric with one orb. No test — visual judgment. Capture a screenshot into `docs/superpowers/evidence/`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HeroSection.tsx docs/superpowers/evidence/
git commit -m "perf(home): reduce hero blurred orbs 3->1 to cut GPU fill cost"
```

---

### Task 5: Make the constellation canvas truly on-demand + throttle scroll

`ConstellationBackground` runs continuous `useFrame` rotation/twinkle under `frameloop="demand"` (a mismatch) and reads scroll via an unthrottled `window` listener. Convert to genuine on-demand: idle = zero renders; renders driven by a throttled scroll handler; pause when the tab is hidden.

**Files:**

- Create: `src/lib/rafThrottle.ts`
- Create: `src/__tests__/lib/rafThrottle.test.ts`
- Modify: `src/components/three/ConstellationBackground.tsx` (scroll hook L213-232; frameloop L294-303; continuous useFrame L97-104, L175-180; drei `Stars` count L238-246)

**Interfaces:**

- Produces: `rafThrottle<T extends (...a:any[])=>void>(fn:T): T & { cancel(): void }` — coalesces calls to at most one per animation frame.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/lib/rafThrottle.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rafThrottle } from "../../lib/rafThrottle";

describe("rafThrottle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("coalesces multiple sync calls into one invocation per frame", () => {
    const spy = vi.fn();
    const throttled = rafThrottle(spy);
    throttled();
    throttled();
    throttled();
    expect(spy).toHaveBeenCalledTimes(0); // not yet — waits for frame
    vi.advanceTimersToNextFrame?.() ?? vi.runAllTimers();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

(If `requestAnimationFrame` isn't faked by the vitest environment, polyfill it in the test via `globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16)`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test rafThrottle`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `rafThrottle`**

```ts
export function rafThrottle<T extends (...args: unknown[]) => void>(fn: T) {
  let scheduled = false;
  let lastArgs: unknown[] | null = null;
  let raf = 0;
  const wrapped = (...args: unknown[]) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    raf = requestAnimationFrame(() => {
      scheduled = false;
      if (lastArgs) fn(...lastArgs);
    });
  };
  (wrapped as { cancel(): void }).cancel = () => {
    cancelAnimationFrame(raf);
    scheduled = false;
  };
  return wrapped as T & { cancel(): void };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test rafThrottle`
Expected: PASS.

- [ ] **Step 5: Wire it into ConstellationBackground**

In `ConstellationBackground.tsx`:

- Replace the raw `window.addEventListener("scroll", handler)` (L213-232) with `addEventListener("scroll", throttled, { passive: true })` where `throttled = rafThrottle(handler)`; in the same handler call R3F's `invalidate()` (from `useThree(s => s.invalidate)`) so the `demand` frameloop actually renders on scroll. Cleanup: `throttled.cancel()` + `removeEventListener`.
- Remove the always-on rotation `useFrame` (L175-180) and star-twinkle continuous `useFrame` (L97-104) — under `demand` these should not drive continuous renders. If a gentle idle drift is wanted, drive it from a `setInterval(() => invalidate(), 1000/30)` that is cleared on `visibilitychange` hidden (see next bullet). Prefer removing idle motion entirely for the perf win; the scene remains a scroll-reactive starfield.
- Add a `visibilitychange` listener: when `document.hidden`, stop invalidating; when visible again, `invalidate()` once.
- Reduce drei `Stars` count from 3000 to 1500 (L238-246).

- [ ] **Step 6: Verify idle renders are ~zero**

Run `pnpm --filter web dev`, open `/`, DevTools Performance: with no scrolling and tab focused, confirm the R3F canvas is not painting every frame (no continuous GPU activity). Scroll → parallax still moves. Note the observation in `docs/superpowers/evidence/`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/rafThrottle.ts src/__tests__/lib/rafThrottle.test.ts src/components/three/ConstellationBackground.tsx docs/superpowers/evidence/
git commit -m "perf(three): on-demand constellation renders + rAF-throttled scroll + visibility pause"
```

---

### Task 6: Pause particles offscreen, document the Clock warning, and confirm no regression

**Files:**

- Modify: `src/components/effects/DomainParticles.tsx` (GoldenDustParticles L321-389)
- Modify: `src/components/home/HeroSection.tsx` (compute hero `inView`, pass to particles)
- Create: `docs/superpowers/evidence/phase0-lighthouse-after.md`

- [ ] **Step 1: Gate GoldenDustParticles when the hero is offscreen**

In `HeroSection.tsx`, add a `ref` on the hero `<section>` and `const inView = useInView(ref, { margin: '0px' })` (framer-motion). Pass `active={inView}` to `<GoldenDustParticles />`. In `DomainParticles.tsx`, accept an `active?: boolean` prop (default true) and stop rendering / set the tsparticles instance paused when `!active` (return `null` or call the engine's pause). Also pause on `document.hidden`.

- [ ] **Step 2: Verify**

`pnpm --filter web dev`, scroll past the hero, confirm via DevTools that the particle rAF is not running when the hero is out of view. No unit test (integration/visual).

- [ ] **Step 3: Document the THREE.Clock warning**

Confirmed: no app code instantiates `THREE.Clock` (grep of `src/` is clean); the deprecation warning originates in R3F/drei internals on three 0.184. Record in `docs/superpowers/evidence/phase0-lighthouse-after.md` that this is upstream and deferred (revisit on a future drei/R3F bump). No app change.

- [ ] **Step 4: Re-run Lighthouse (after) and gate regression**

```bash
pnpm build && pnpm start &
npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility --preset=desktop --output=json --output-path=./lh-after.json --chrome-flags="--headless"
```

Record Performance/LCP/TBT/CLS/Accessibility in `phase0-lighthouse-after.md`. **Gate:** Performance must be ≥ the baseline from Task 1 (target ≥ 90 desktop), Accessibility must not drop. If Performance regressed, do not proceed — investigate.

- [ ] **Step 5: Full test + lint + build green**

```bash
pnpm --filter web test && pnpm --filter web lint && pnpm --filter web build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/effects/DomainParticles.tsx src/components/home/HeroSection.tsx docs/superpowers/evidence/phase0-lighthouse-after.md
git commit -m "perf(home): pause particles offscreen/hidden; document Clock warning; capture after-metrics"
```

---

## Self-Review

**Spec coverage (Phase 0 items):**

- cta-ruins 404 → Task 2. ✓
- deity image verify → done pre-plan (2026-07-25, not broken); no task needed. ✓
- reduced-motion full gate → Task 3. ✓
- reduce blurred orbs → Task 4. ✓
- IntersectionObserver / offscreen pause → Task 6 (particles) + Task 5 (visibility pause for canvas). ✓
- frameloop/invalidate mismatch → Task 5. ✓
- throttle raw scroll listener → Task 5. ✓
- THREE.Clock → Task 6 Step 3 (documented; upstream). ✓
- Lighthouse before/after evidence (accountability) → Task 1 + Task 6. ✓

**Placeholder scan:** no TBD/TODO; all code steps carry real code; verification steps name exact commands. Visual steps (Tasks 4/5/6) are inherently judgment-based and say so explicitly rather than faking a unit test.

**Type consistency:** `heroMotion(reduce)` shape consumed identically in Task 3 Step 5; `rafThrottle` signature consistent Task 5 Steps 1/3/5; `active` prop consistent across DomainParticles/HeroSection in Task 6.

**Deferred to later plans:** Phase 1 (cinematic "The Atlas Opens" — introduces Lenis; none exists yet), Phase 2 (deity template), Phase 3 (taste pass + Remotion sizzle) each get their own plan.
