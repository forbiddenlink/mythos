# Analytics and observability

Snapshot as of 2026-10-08.

## What the site measures and why

Mythos Atlas has more than sixty routes, a quiz engine, an AI Oracle, spaced
repetition, PDF and Anki export, and a support link. Until this was wired, none
of it was measured: `/api/analytics/events` answered `{ received: true }` and
discarded the body, and `/api/analytics/vitals` did the same. The Sean Ellis
"how would you feel if you could no longer use Mythos Atlas" survey — the single
question that says whether anyone wants the product — was being asked and thrown
away.

Three rules follow from that.

1. **A sink that cannot store an event says so.** The analytics routes answer
   `501 not_configured` when no PostHog key is set and `502` when the upstream
   call fails. They never acknowledge an event they did not deliver.
2. **The event set is closed.** Every event the app can emit is declared in
   `src/lib/analytics/events.ts`. Names are validated at runtime on both the
   client and the server, so a typo drops the event instead of creating a
   second, near-identical funnel step.
3. **Nothing personal leaves the browser.** Property values are restricted to
   primitives, search queries are reduced to a length, Oracle questions are
   never sent, and person profiles are off (`$process_person_profile: false`)
   for anonymous visitors.

## Consent

Analytics loads only after an explicit cookie choice and never when Global
Privacy Control is set (`src/lib/privacy-consent.ts`). Before consent,
`trackEvent` has no registered sink and drops events rather than buffering them,
so nothing recorded pre-consent can be replayed afterwards. Withdrawing consent
removes the sink and opts the SDK out. Accepting again reconnects the cached SDK
without replaying earlier interactions; each product capture also checks current
consent so a change cannot leak an event while React updates.

## The ingest proxy

`next.config.ts` rewrites `/ingest/*` to the PostHog ingest host and
`/ingest/static/*` to its asset host, with `skipTrailingSlashRedirect: true`.
Two reasons:

- Content blockers drop requests to known analytics hostnames. Proxying keeps
  the traffic first-party, so the data the roadmap is decided from is not
  silently deleted for a large share of visitors.
- The CSP in `src/proxy.ts` can stay at `connect-src 'self'` with no analytics
  hostname allowlisted.

## Event taxonomy

| Event                             | Fires when                                             | Answers                                                 |
| --------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| `entry_viewed`                    | A deity or story detail page mounts                    | Which pantheons earn attention                          |
| `search_performed`                | Debounced search resolves                              | Which searches return nothing — the content gaps        |
| `share_clicked`                   | Any share surface is used                              | Whether the viral loop exists                           |
| `quiz_started` / `quiz_completed` | Quiz lifecycle                                         | Quiz drop-off                                           |
| `oracle_asked`                    | An Oracle reply streams, tagged grounded or not        | Whether the Oracle cites sources                        |
| `story_read_progress`             | Reader passes a depth marker                           | Whether stories are read or bounced                     |
| `study_session_completed`         | A spaced-repetition session ends                       | Whether the study loop retains                          |
| `journey_stop_selected`           | A reader explicitly selects a map/otherworld stop      | Where journey exploration stops; not reading completion |
| `learning_path_step_selected`     | A reader clicks a reading-path step or its main action | Which paths lead to reading or optional practice        |
| `bookmark_added`                  | A bookmark is saved                                    | Intent to return                                        |
| `export_generated`                | PDF or Anki export succeeds                            | Which artifacts people keep                             |
| `achievement_unlocked`            | An achievement fires                                   | Whether gamification lands                              |
| `pmf_survey_answered`             | The retention survey is answered                       | Product-market fit                                      |
| `web_vital`                       | Each Core Web Vital reports                            | Field performance per route                             |
| `support_page_viewed`             | The support page or a nudge renders                    | Top of the conversion funnel                            |
| `support_click`                   | Any route to Stripe checkout                           | The only conversion the site has                        |
| `newsletter_signup`               | The digest sign-up is accepted by /api/newsletter      | Whether readers want a weekly return path               |

## A useful-session funnel and return

For consenting readers, define a useful session as `entry_viewed` followed within
that session by `bookmark_added`, `quiz_completed`, or `study_session_completed`.
For stories, use `story_read_progress` at the final depth marker as an additional
reading signal, not proof of understanding. Compare the share of sessions that
reach a follow-on action and the seven-day return of those readers. Report only
aggregate cohorts; analytics cannot describe visitors who decline consent.

Use `learning_path_step_selected` as an entry point to that funnel. Its action
is `start`, `continue`, `review`, `step`, or `practice`, and its properties contain
only a fixed goal, an entity type, and the public destination slug. Personalized
path names, viewed-history lists, preferences and free text are never sent.
`journey_stop_selected` contains only the public journey slug and a one-based
stop index/count. The initially displayed stop does not emit a selection.
Both contracts reject malformed values and extra properties in browser and
server capture paths. Slugs are limited to 100 characters; stop indices/counts
are safe integers bounded to 1,000. The server also verifies destinations against
the actual catalog and checks the journey's true stop count before configuration
or delivery checks.

Neither event claims a route was completed: opening the last map stop, following
a link, or seeing a locally completed path does not establish that the reader
finished a learning session. Journey abandonment can be explored from selected
stop distributions, but map visitors can browse out of order. Do not interpret
this as a sequential completion funnel. Verify real delivery in the configured
Mythos project before using these signals to choose work; tests verify capture
calls and consent behavior, not cloud ingestion or actual retention.

## The support ask

`SupportNudge` renders only after three completed value moments (a finished
quiz, an export, a study session), then stays quiet for fourteen days, and
disappears for a year once dismissed (`src/lib/support-nudge.ts`). Asking on the
first page view reads as a toll rather than a thank-you and converts worse than
not asking.

Every path to Stripe goes through `SupportButton`, so the funnel has exactly one
conversion event, tagged with the placement it came from.

## The dashboard

`https://us.posthog.com/project/626790/dashboard/2132719` — PostHog org **Mythos Atlas**,
project **626790**. The project is deliberately separate from the shared "Default project",
which already collects three other sites; a funnel computed across four unrelated products
answers nothing.

Nine saved insights, each written to answer one question rather than to look thorough:

| Insight                        | The question                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| Does anyone pay                | Visit to support click, the only conversion the site has         |
| Does anyone engage             | Landing to a finished quiz                                       |
| Product-market fit signal      | Share answering "very disappointed"; 40% is the conventional bar |
| Which pantheons earn attention | What to write next                                               |
| Searches that found nothing    | Content gaps someone actually asked for                          |
| Does the share loop exist      | No shares means no organic growth                                |
| Is the Oracle citing sources   | Ungrounded answers are the failure mode                          |
| Slowest routes (LCP p75)       | Field data per path, not an average                              |
| Value moments delivered        | Exports, study sessions, finished quizzes                        |

Read the funnels before the trend lines. A rising pageview count with a flat support funnel
is traffic, not interest.

## Configuration

See `apps/web/.env.example`. With no key set, the app runs normally and records
nothing. Set `NEXT_PUBLIC_POSTHOG_KEY` for browser and server events in the same
project; `POSTHOG_KEY` is only a fallback when the public key is absent. A second
server key no longer overrides the browser's project.

`POSTHOG_INGEST_ORIGIN` is the absolute upstream origin shared by the browser
rewrite and server capture. The server retains `POSTHOG_HOST` as a legacy fallback;
keep it aligned or migrate to the shared origin. `NEXT_PUBLIC_POSTHOG_HOST` does
not control the browser rewrite. This removes code-level split-project precedence,
but delivery still needs verification against the deployed configuration and
actual ingest responses; stored dashboard counts alone do not verify it.

## A 404 that answers 200

`notFound()` in a dynamic route returns **200** with the 404 body, not a 404 status. This is
documented Next.js behaviour, not a bug in this app: the response has already begun streaming
by the time the check runs, and the status cannot change afterwards. Reproduced on 16.3.4 with
a page whose entire body is `notFound()`, and with middleware fully disabled.

The mitigation is already in place — `src/app/not-found.tsx` sets `robots: { index: false }`,
which is the remedy Next's own documentation names. A real 404 status would mean checking the
slug before the response streams, i.e. carrying entity id lists in middleware. Not worth it.

## Errors

Sentry initialises server-side in production when `NEXT_PUBLIC_SENTRY_DSN` is
set, and client-side only after cookie consent (`ConsentGatedSentry`). Client
error volume therefore undercounts by however many visitors decline cookies;
read it as a trend, not a total.
