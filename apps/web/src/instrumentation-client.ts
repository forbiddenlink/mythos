const replayEnabled = process.env.NEXT_PUBLIC_SENTRY_REPLAY_ENABLED === "true";

const isProduction = process.env.NODE_ENV === "production";
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const onRouterTransitionStart = (...args: unknown[]) => {
  if (!isProduction || !dsn) {
    return;
  }

  void import("@sentry/nextjs")
    .then((Sentry) => {
      const capture = (
        Sentry as {
          captureRouterTransitionStart?: (...params: unknown[]) => void;
        }
      ).captureRouterTransitionStart;
      if (capture) {
        capture(...args);
      }
    })
    .catch(() => {
      // Ignore Sentry load errors in client navigation hooks.
    });
};

if (isProduction && dsn) {
  void (async () => {
    try {
      const Sentry = await import("@sentry/nextjs");

      Sentry.init({
        dsn,
        tracesSampleRate: 1,
        debug: false,
        replaysOnErrorSampleRate: replayEnabled ? 1 : 0,
        replaysSessionSampleRate: replayEnabled ? 0.1 : 0,
        integrations: replayEnabled
          ? [
              Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
              }),
            ]
          : [],
        enabled: true,
      });
    } catch {
      // Ignore Sentry load errors when observability is not available.
    }
  })();
}
