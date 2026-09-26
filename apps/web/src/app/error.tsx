"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Container } from "@/components/layout/container";
import { MythosMark } from "@/components/icons/mythos-marks";
import { OpenSearchButton } from "@/components/search/OpenSearchButton";

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !process.env.NEXT_PUBLIC_SENTRY_DSN
    ) {
      return;
    }

    void import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error);
      })
      .catch(() => {
        // Ignore Sentry load errors on the error page.
      });
  }, [error]);

  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_70%_at_20%_0%,color-mix(in_oklch,var(--gold)_12%,transparent),transparent_70%)]"
      />
      <Container size="reading" className="section-space-lg">
        <p className="type-eyebrow flex items-center gap-2">
          <MythosMark id="urn" className="size-4" />
          Something went wrong
        </p>
        <h1 className="page-title mt-4 text-foreground">
          This page could not be shown
        </h1>
        <p className="type-lede mt-4 text-muted-foreground">
          We hit an unexpected problem while loading it. Try again, or return
          home and continue exploring. If it keeps happening, your device or
          network may have stale data; a hard refresh usually clears it.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <p className="type-meta font-semibold uppercase tracking-wide text-destructive">
              Error details
            </p>
            <code className="mt-2 block overflow-x-auto whitespace-pre-wrap wrap-break-word text-sm text-foreground/80">
              {error.message}
            </code>
            {error.digest && (
              <p className="mt-2 type-meta text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-5 type-ui font-semibold text-midnight transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
          >
            Return home
          </Link>
        </div>

        <div className="mt-12 border-t border-border/70 pt-8">
          <p className="type-ui mb-3 text-muted-foreground">
            Or search for what you were looking for:
          </p>
          <OpenSearchButton />
        </div>
      </Container>
    </div>
  );
}
