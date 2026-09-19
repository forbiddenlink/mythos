# Performance audit — 2026-09-18

## Scope and method

This is a build-artifact and local-preview audit, not field performance data.
It uses the production `.next` output, its React loadable manifest, and a local
preview response. The preview was already running; no build or server was
started for this audit. No browser waterfall, Lighthouse result, or Core Web
Vitals value is reported here.

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

| Module                | Raw bytes | Notes                                                                           |
| --------------------- | --------: | ------------------------------------------------------------------------------- |
| GlobalSearch          | 1,455,480 | Includes shared JSON/search dependencies; deliberately excluded from this pass. |
| RandomDiscoveryButton |   585,548 | Includes the 578,354-byte shared chunk.                                         |
| AudioEnhancements     |    65,047 | Four chunks; rendered on every route although audio starts muted.               |
| WebVitals             |     9,061 | Consent-gated metric collection.                                                |
| CookieConsent         |     3,393 | Needed for informed consent.                                                    |
| OfflineIndicator      |     1,201 | Small, persistent status affordance.                                            |

The global add-ons use `next/dynamic`, but rendering a dynamic component at
initial hydration still initiates its import. The largest quick win outside the
search/data boundary was therefore to defer the audio controls/provider until
the browser is idle. Howler itself is already loaded only after the user turns
audio on.

## Implemented change and verification

`GlobalClientAddons` now renders `AudioEnhancements` only after the window
`load` event and the first idle callback, with a 1.2-second idle timeout and a
zero-delay timeout fallback for browsers without `requestIdleCallback`. The
effect cancels its callback or timer and removes the event listener on unmount.
It leaves the existing command-palette intent handler untouched.

The focused component test verifies that the audio module is absent before the
load/idle sequence and appears after it, and that unmounting cleans up a
pending load listener. TypeScript and ESLint passed for the changed code.

Local-preview measurements were captured as independent requests with no
cache-clearing or network throttling. They are useful for comparing generated
assets, but are not representative of user latency and ran while other local
QA work was active.

| Measure                                        |                Before |                 After | Interpretation                                                                                                                            |
| ---------------------------------------------- | --------------------: | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Initial JS URLs in home HTML                   |                    31 |                    31 | The browser receives the same number of script URLs.                                                                                      |
| Initial JS raw bytes                           |             3,196,246 |             3,210,408 | Hashes and shared bundle layout changed during the full rebuild; this is not attributable to audio deferral.                              |
| Audio dependency files referenced by home HTML |                   n/a |                0 of 4 | The 65,047 raw-byte audio dependency group is absent from the rebuilt home HTML asset list and remains deferred in the loadable manifest. |
| Home HTML response bytes                       |               198,204 |               212,234 | Full-build content changes prevent attributing this difference to this change.                                                            |
| Local TTFB / total                             | 17.151 ms / 17.321 ms | 32.889 ms / 33.029 ms | Contention-sensitive local samples; no performance conclusion.                                                                            |

The implementation deliberately shifts module evaluation and controls rendering
out of hydration. It does not establish an LCP, INP, or compressed-transfer
improvement. A cold, throttled browser measurement and consented production
Web Vitals are still required before making that claim.

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

The Atlas already has _Epic of Gilgamesh_, _Enuma Elish_, and Mesopotamian
entries, but it lacks a clearly identified source-first path that separates
Sumerian literature from later Akkadian and Babylonian works. Add a compact
“Mesopotamian texts across languages and periods” route: begin with one
Sumerian composition, then _Gilgamesh_, then _Enuma Elish_, with each stop
showing language, approximate date/recension, tablet or composition locator,
translator, and a note that these are not interchangeable accounts.

The Oxford [Electronic Text Corpus of Sumerian Literature](https://etcsl.orinst.ox.ac.uk/index1.htm)
provides translations and transliterations for more than 400 Sumerian literary
works. The British Museum [catalogues an Enuma elish tablet](https://www.britishmuseum.org/collection/object/W_1881-0701-3289).
Use such collection/corpus records alongside a named modern translation rather
than copying generic summaries or presenting one tradition as a single,
timeless canon.
