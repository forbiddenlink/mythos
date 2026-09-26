"use client";

import { cinzel, sourceSans } from "./fonts";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
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
        // Ignore Sentry load errors on the global error page.
      });
  }, [error]);

  return (
    <html lang="en" className={`${cinzel.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#0d1024] text-[#f3e9d2] font-sans antialiased">
        <div className="max-w-lg mx-auto text-center px-6 py-16">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#d4a53c]/35 bg-[#171b36]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#e2bb62]"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl md:text-4xl font-semibold mb-4 text-[#f3e9d2]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            The atlas could not load
          </h1>

          <p className="text-[#f3e9d2]/80 mb-8 leading-relaxed">
            Mythos Atlas hit an unexpected problem and could not load. Try
            again, or return to the home page.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-slate-800/60 p-4 text-left">
              <p className="text-xs uppercase tracking-wide text-red-400/70 mb-2 font-semibold">
                Error Details
              </p>
              <code className="block text-sm text-slate-400 bg-slate-900/50 rounded p-3 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-xs text-[#f3e9d2]/60 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d4a53c] px-6 py-3 text-sm font-semibold text-[#0d1024] hover:bg-[#e2bb62] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d4a53c]/50 px-6 py-3 text-sm font-medium text-[#e2bb62] hover:bg-[#d4a53c]/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Return Home
            </Link>
          </div>

          <p className="mt-10 text-xs text-[#f3e9d2]/60">
            If this keeps happening, try clearing your browser cache or
            returning later.
          </p>
        </div>
      </body>
    </html>
  );
}
