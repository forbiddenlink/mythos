// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Default 0.15 in prod; override with SENTRY_TRACES_SAMPLE_RATE (0–1)
  tracesSampleRate:
    Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.15") || 0.15,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",
});
