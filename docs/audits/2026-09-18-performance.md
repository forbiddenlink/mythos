# Performance audit — 2026-09-18

## Scope and method

This is a build-artifact audit, not field performance data. It uses the existing
production `.next` output and its React loadable manifest. No build or server
was started for this audit. A preview listener was present on port 3000, but it
was unreachable from this worker, so no browser waterfall, Lighthouse result,
or Core Web Vitals value is reported here.

The existing [Web Vitals component](/Volumes/LizsDisk/mythos/apps/web/src/components/analytics/WebVitals.tsx)
collects CLS, INP, LCP, FCP, and TTFB only after analytics consent. Those
measurements should be reviewed in the configured analytics destination before
claiming user-facing improvements.

## Measured build evidence

The current `.next` directory is 8.2 GB, which includes build caches and is
not a deploy payload measurement. Individual production JavaScript files total
9,262,504 raw bytes. The largest files are 698,203, 578,354, and 475,665 raw
bytes. These figures are not compressed transfer sizes.

The global client-addons manifest identifies these lazy modules and their raw
JavaScript dependencies:

| Module | Raw bytes | Notes |
| --- | ---: | --- |
| GlobalSearch | 1,455,480 | Includes shared JSON/search dependencies; deliberately excluded from this pass. |
| RandomDiscoveryButton | 585,548 | Includes the 578,354-byte shared chunk. |
| AudioEnhancements | 65,047 | Four chunks; rendered on every route although audio starts muted. |
| WebVitals | 9,061 | Consent-gated metric collection. |
| CookieConsent | 3,393 | Needed for informed consent. |
| OfflineIndicator | 1,201 | Small, persistent status affordance. |

The global add-ons use `next/dynamic`, but rendering a dynamic component at
initial hydration still initiates its import. The largest quick win outside the
search/data boundary is therefore to defer the audio controls/provider until
the browser is idle. Howler itself is already loaded only after the user turns
audio on.

## Change proposed for measured follow-up

Gate `AudioEnhancements` behind an idle callback with a timeout fallback in
`GlobalClientAddons`. This preserves the existing command-palette intent
handler and avoids changing the source data or global search. Before/after
verification should capture:

1. Home-page initial JavaScript requests in the preview network waterfall.
2. The response size and request timing of the audio chunk(s).
3. The audio control after idle, and audio start after an explicit user action.
4. A cold-load Lighthouse or Web Vitals sample on a throttled mobile profile.

The 65,047 raw-byte manifest total is the before reference. Do not infer a
compressed byte reduction or an LCP/INP improvement until the preview is
measurable after the change.

## Other findings, intentionally not changed

- Global search is the largest lazy dependency. Its new interaction state and
  behavior are shared work, so it is excluded from this bounded pass. The next
  safe investigation is whether the global search index can remain server-side
  or be divided into smaller route/type indexes.
- `RandomDiscoveryButton` shares a 578,354-byte chunk. Its actual initial-load
  effect must be determined from a browser waterfall before any deferral; the
  manifest alone does not establish whether that shared chunk is already needed
  by another initial dependency.
- Several visualization routes correctly split maps, graph, and 3D features.
  Keep that route-level loading boundary intact.

## Content-path opportunity (not implemented)

The Atlas already has *Epic of Gilgamesh*, *Enuma Elish*, and Mesopotamian
entries, but it lacks a clearly identified source-first path that separates
Sumerian literature from later Akkadian and Babylonian works. Add a compact
“Mesopotamian texts across languages and periods” route: begin with one
Sumerian composition, then *Gilgamesh*, then *Enuma Elish*, with each stop
showing language, approximate date/recension, tablet or composition locator,
translator, and a note that these are not interchangeable accounts.

The Oxford [Electronic Text Corpus of Sumerian Literature](https://etcsl.orinst.ox.ac.uk/index1.htm)
provides translations and transliterations for more than 400 Sumerian literary
works. The British Museum [catalogues an Enuma elish tablet](https://www.britishmuseum.org/collection/object/W_1881-0701-3289).
Use such collection/corpus records alongside a named modern translation rather
than copying generic summaries or presenting one tradition as a single,
timeless canon.
