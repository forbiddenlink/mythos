# Performance audit — 2026-09-26

Scope: client JavaScript that carries catalog data, and whether pages are
actually statically generated. Measured on production builds (`pnpm --filter
web build`, Next 16.3.4 webpack) served locally with `next start`; this is
build and local-server evidence, not field data (Core Web Vitals still need
checking in analytics after deploy).

## How it was measured

Next 16 no longer prints "First Load JS" in the build table, so
`apps/web/scripts/measure-client-js.mjs` reproduces it:

```bash
pnpm --filter web build
pnpm --filter web start &           # port 3000, or pass another base URL
node apps/web/scripts/measure-client-js.mjs http://localhost:3000
```

For each route it fetches the HTML, collects every `/_next/static/chunks/*.js`
referenced by a script tag or by the inline RSC payload (client component
chunks), and sums raw and gzip bytes. "Catalog text" counts how many deity
`detailedBio` openings (of 233) and story `fullNarrative` openings (of 108)
appear in the largest of those chunks: a count in the hundreds means the whole
JSON file is bundled. The script also scans every chunk in the build,
including lazy ones the HTML never references.

## Client JavaScript per route

Before = `42ada26` (main), after = this branch. Sizes are the route's
initial chunks (framework, layout and page), not lazy chunks.

| Route                  | JS raw before (KB) | JS raw after (KB) | JS gzip before (KB) | JS gzip after (KB) | Catalog text before (deity bios / story narratives) | After |
| ---------------------- | -----------------: | ----------------: | ------------------: | -----------------: | --------------------------------------------------- | ----- |
| `/`                    |             1152.5 |            1154.1 |               364.6 |              365.8 | 0 / 0                                               | 0 / 0 |
| `/deities`             |             1990.4 |            1258.4 |               632.7 |              396.8 | 213 / 0                                             | 0 / 0 |
| `/deities/zeus`        |             2763.6 |            1185.5 |               890.7 |              373.5 | 213 / 98                                            | 0 / 0 |
| `/stories`             |             1706.8 |            1205.9 |               556.6 |              382.9 | 0 / 98                                              | 0 / 0 |
| `/stories/titanomachy` |             1413.1 |            1414.7 |               447.4 |              448.5 | 0 / 0                                               | 0 / 0 |
| `/pantheons`           |             1212.9 |            1214.5 |               386.5 |              388.1 | 0 / 0                                               | 0 / 0 |
| `/pantheons/greek`     |             1048.8 |            1050.4 |               326.4 |              327.6 | 0 / 0                                               | 0 / 0 |
| `/heroes/achilles`     |             2242.2 |            1392.3 |               721.1 |              443.2 | 213 / 0                                             | 0 / 0 |
| `/creatures`           |             1257.1 |            1258.7 |               399.8 |              401.5 | 0 / 0                                               | 0 / 0 |
| `/creatures/fenrir`    |             1367.1 |            1368.7 |               433.2 |              434.8 | 0 / 0                                               | 0 / 0 |
| `/artifacts/aegis`     |             1369.3 |            1370.9 |               433.6 |              435.3 | 0 / 0                                               | 0 / 0 |
| `/timeline`            |             2457.8 |            1183.0 |               800.8 |              376.2 | 213 / 98                                            | 0 / 0 |
| `/story-timeline`      |             1705.2 |            1167.9 |               557.3 |              370.5 | 0 / 98                                              | 0 / 0 |
| `/family-tree`         |             1994.1 |            1192.2 |               633.3 |              378.2 | 213 / 0                                             | 0 / 0 |
| `/knowledge-graph`     |             1996.0 |            1193.8 |               632.6 |              377.5 | 213 / 0                                             | 0 / 0 |
| `/divine-domains`      |             1955.4 |            1189.1 |               624.1 |              375.5 | 213 / 0                                             | 0 / 0 |
| `/compare`             |             1961.9 |            1195.6 |               627.6 |              379.8 | 213 / 0                                             | 0 / 0 |
| `/compare/myths`       |             1733.5 |            1196.1 |               566.1 |              379.4 | 0 / 98                                              | 0 / 0 |
| `/compare/parallels`   |             1958.7 |            1192.0 |               627.7 |              379.6 | 213 / 0                                             | 0 / 0 |
| `/quiz/quick`          |             2157.2 |            1106.2 |               683.8 |              346.8 | 213 / 0                                             | 0 / 0 |
| `/quiz/relationships`  |             2181.0 |            1129.5 |               689.7 |              353.1 | 213 / 0                                             | 0 / 0 |
| `/learning-paths`      |             2464.2 |            1192.9 |               801.6 |              378.4 | 213 / 98                                            | 0 / 0 |
| `/bookmarks`           |             2594.8 |            1189.3 |               847.0 |              378.1 | 213 / 98                                            | 0 / 0 |
| `/progress`            |             2600.3 |            1199.8 |               845.1 |              378.8 | 213 / 98                                            | 0 / 0 |
| `/review`              |             1195.0 |            1188.3 |               377.3 |              375.9 | 0 / 0                                               | 0 / 0 |
| `/games/memory`        |             1793.5 |            1061.4 |               566.8 |              331.1 | 213 / 0                                             | 0 / 0 |
| `/facts`               |             1927.3 |            1194.7 |               616.1 |              380.2 | 213 / 0                                             | 0 / 0 |
| `/sources`             |             1228.5 |            1230.0 |               390.2 |              391.8 | 0 / 0                                               | 0 / 0 |
| `/atlas`               |             2849.7 |            2080.4 |               859.6 |              616.7 | 213 / 0                                             | 0 / 0 |
| **Sum of 29 routes**   |              54278 |             35956 |               17339 |              11346 |                                                     |       |

Chunks anywhere in the build embedding catalog long-form text:

- Before: `6286-*.js` (733.6 KB raw: all of deities.json, shared by 17 of the
  29 routes) and `8146-*.js` (505 KB raw: all of stories.json). The command
  palette's lazy chunk (search over all seven catalog files) was a further
  1.25 MB raw, loaded on first ⌘K.
- After: none.

The ~1.05 MB raw / ~330 KB gzip floor every route shares (framework, layout,
providers, Sentry) is unchanged by this work and is the next target.

### Where the data went instead

Server components read the catalog through `src/lib/data/catalog.ts`
(`import "server-only"`, so a client import is a build error) and pass
projections of only the fields a client component renders. That data now
travels in the prerendered HTML / RSC payload instead of a JS chunk: for
example `/deities` HTML is 350 KB raw / 63 KB gzip (card fields for 233
deities) and `/deities/zeus` 283 KB raw / 46 KB gzip (one full record plus
the parallels, kin and family-tree nodes it links to).

Features that need broad data only after an interaction fetch prerendered,
cacheable indexes instead:

| Endpoint                    | Used by                                          |    Raw |  Gzip |
| --------------------------- | ------------------------------------------------ | -----: | ----: |
| `/api/catalog/deities`      | flashcard export, review cards, random discovery | 173 KB | 56 KB |
| `/api/catalog/stories`      | review cards                                     |  15 KB |  3 KB |
| `/api/catalog/search-index` | command palette (first open)                     | 208 KB | 64 KB |

For comparison, deities.json is 807 KB raw / 241 KB gzip and stories.json
525 KB / 176 KB.

Not covered (smaller files still imported by client components):
creatures/artifacts/locations/journeys detail and list clients, the
branching-stories list and banner (the play page legitimately needs its
story graph), `sources.json` in `SourceExcerpt`/`ReferencesList`, and
`mythology-facts.json`. None of these contain deity or story text.

## Rendering mode

Before, the build route table marked every page `ƒ` (84 dynamic entries;
only icons, robots and sitemap were static). The root layout read `headers()`
for the CSP nonce and `src/i18n/request.ts` read `cookies()` for the locale,
so the `generateStaticParams` + `revalidate` on 13 `[slug]` routes had no
effect: every entity page was rendered per request.

After, 1,193 pages are prerendered (`○` static and `●` SSG). Still dynamic
by design: `/heroes`, `/locations`, `/changelog` (server-side `searchParams`
filtering and pagination), `/quiz/result/[result]`,
`/stories/interactive/[slug]`, the edge Open Graph image routes and the
non-catalog API routes. The entity routes also dropped `revalidate` (content
only changes on deploy) and set `dynamicParams = false`.

### Locale

next-intl without locale routing cannot prerender per locale from a cookie.
Pages now prerender in English; `IntlProvider` (client) reads the `locale`
cookie after hydration, loads that locale's messages chunk and re-renders the
translated UI; the language switcher updates it in place. The proxy still sets
the cookie from `Accept-Language` on first visit.

Tradeoff: readers with a non-English locale see English UI strings for a
moment after first paint, and the initial HTML (what crawlers see) is
English. Catalog content was English-only already; only UI chrome is
translated (header, compare pages, quiz hub, Oracle). The alternative,
locale-prefixed routes (`/es/...`), would prerender every locale but move
every URL.

## CSP decision and security implications

A per-request nonce cannot coexist with static HTML (the nonce is stamped at
render time). Next's experimental SRI only adds `integrity` to external
chunk tags; it does nothing for the inline RSC payload scripts App Router
emits, so `script-src 'self'` alone would block hydration.

Chosen: build-time hashes.

- `scripts/csp-hashes.mjs` runs after `next build` in both `build` and
  `build:ci`. It hashes every inline, executable `<script>` in each
  prerendered HTML file (Next's flight data and the theme bootstrap; JSON-LD
  is not executable and is skipped) and writes `.next/csp-manifest.json`
  plus a copy at `public/csp-manifest.json` (1,193 pages, at most 7 hashes a
  page, 286 KB).
- `src/proxy.ts` serves, per request,
  `script-src 'self' 'nonce-<random>' <hashes for this path> blob: https://va.vercel-scripts.com`.
  Prerendered pages match by hash; dynamic pages by the nonce Next applies to
  its own scripts. Unknown paths get the static not-found page's hashes.
- No `'unsafe-inline'`. `'strict-dynamic'` is dropped: parser-inserted chunk
  `<script src>` tags in static HTML cannot carry a nonce, so trust has to
  come from `'self'`. Script sources are therefore this origin (all JSON
  endpoints are served with `nosniff`, so they cannot be loaded as script)
  and the one Vercel analytics host, as before. PostHog loads through the
  same-origin `/ingest` rewrite and Sentry is bundled; other directives
  (`connect-src`, `frame-ancestors`, `object-src`, `base-uri`, reporting) are
  unchanged.
- Net effect versus the old nonce + `'strict-dynamic'` policy: injected inline
  script and inline event handlers are still blocked; an injected
  `<script src>` pointing at this origin would now be allowed where
  `'strict-dynamic'` would have blocked it. The app has no user-controlled
  same-origin JavaScript responses, so this is a small, documented widening
  in exchange for static generation.
- Failure mode: if the proxy cannot read the manifest (from `.next` on disk,
  then `GET /csp-manifest.json`), it serves `'self' 'unsafe-inline'` so the
  site keeps working, logs once, and sets `x-csp-mode: degraded` on
  responses. Check for that header after the first Vercel deploy: the public
  fallback is the path Vercel's proxy runtime is expected to use and was only
  verified with `next start`.
- Hash drift: with no `revalidate` and `dynamicParams = false`, prerendered
  HTML never changes after the build, so its hashes stay valid. Reintroducing
  ISR or on-demand rendering of unknown params would serve HTML the manifest
  does not know about (the latter would also cache one request's nonce).

Aliases: deity and hero pages used to redirect ids, alternate names and odd
casing at render time. With `dynamicParams = false` those URLs would 404, so
`src/lib/entity-redirects.ts` redirects them (307) in the proxy, and
`/pantheons/<id>` redirects to the slug.

## Verification

- `pnpm --filter web exec tsc --noEmit`, `pnpm lint` (no new warnings),
  `pnpm --filter web test` (114 files, 1,131 tests).
- `pnpm --filter web e2e`: 160 of 161 pass. The failure,
  `public-assets.spec.ts` › Met image, needs `collectionapi.metmuseum.org`,
  which this sandbox's egress policy blocks; it is unrelated to these
  changes.
- `e2e/csp-static-rendering.spec.ts` (new): no inline script is blocked on a
  static page, two SSG entity pages, a dynamic page and the static 404; the
  policy has no `'unsafe-inline'`; `/deities/zeus` is a prerender cache hit;
  a saved `es` locale translates `/quiz`.
