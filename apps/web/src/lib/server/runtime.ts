/** True on the production runtime (Next.js production build or Vercel production). */
export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

/** UTC calendar day as `YYYY-MM-DD`; budgets reset on this boundary. */
export function utcDayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
