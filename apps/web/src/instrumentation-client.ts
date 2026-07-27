const isProduction = process.env.NODE_ENV === "production";
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/**
 * Router transition hook — only forwards if Sentry was already initialized
 * after cookie consent (see ConsentGatedSentry).
 */
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

// Client Sentry.init is deferred to ConsentGatedSentry (consent + GPC).
