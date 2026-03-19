export async function register() {
  const isProduction = process.env.NODE_ENV === "production";
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (process.env.NEXT_RUNTIME === "nodejs" && isProduction && dsn) {
    const Sentry = await import("@sentry/nextjs").catch(() => null);

    if (!Sentry) {
      return;
    }

    Sentry.init({
      dsn,
      tracesSampleRate: 1,
      debug: false,
      environment: process.env.NODE_ENV,
    });
  }
}

export const onRequestError = (...args: unknown[]) => {
  const isProduction = process.env.NODE_ENV === "production";
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!isProduction || !dsn) {
    return;
  }

  void import("@sentry/nextjs")
    .then((Sentry) => {
      const capture = (
        Sentry as { captureRequestError?: (...params: unknown[]) => void }
      ).captureRequestError;
      if (capture) {
        capture(...args);
      }
    })
    .catch(() => {
      // Ignore Sentry load errors in runtime hooks.
    });
};
