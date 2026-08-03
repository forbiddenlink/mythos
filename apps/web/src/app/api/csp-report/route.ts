/**
 * Stub CSP/Reporting API endpoint.
 *
 * The Reporting-Endpoints header (next.config.ts) points browser CSP
 * violation reports here. This is intentionally a no-op that just
 * acknowledges receipt — swap in real triage (e.g. forward to Sentry) when
 * CSP reporting becomes a priority.
 */
export async function POST() {
  return new Response(null, { status: 204 });
}
