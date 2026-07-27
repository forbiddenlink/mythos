export async function register() {
  const isProduction = process.env.NODE_ENV === "production";
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const oracleOn = process.env.NEXT_PUBLIC_ORACLE_ENABLED === "true";
  const upstashOk = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );

  if (isProduction && oracleOn && !upstashOk) {
    console.warn(
      "[mythos] NEXT_PUBLIC_ORACLE_ENABLED is true but Upstash is unset — Oracle requests will fail closed (503).",
    );
  }

  if (process.env.NEXT_RUNTIME === "nodejs" && isProduction && dsn) {
    const Sentry = await import("@sentry/nextjs").catch(() => null);

    if (!Sentry) {
      return;
    }

    Sentry.init({
      dsn,
      tracesSampleRate:
        Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.15") ||
        0.15,
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
