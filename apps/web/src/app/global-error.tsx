"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Cinzel, Source_Sans_3 } from "next/font/google";
import Link from "next/link";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className={`${cinzel.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans antialiased">
        <div className="max-w-lg mx-auto text-center px-6 py-16">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-slate-800/80">
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
              className="text-amber-500"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          {/* Heading */}
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Critical Error
          </h1>

          <p className="text-slate-400 mb-4 leading-relaxed">
            A catastrophic disturbance has shattered the ancient wards
            protecting this realm. The root layout itself has fallen.
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
                <p className="text-xs text-slate-500 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-linear-to-r from-amber-600 via-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 transition-all"
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
              className="inline-flex items-center justify-center gap-2 rounded-md border border-amber-500/40 px-6 py-3 text-sm font-medium text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60 transition-all"
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

          <p className="mt-10 text-xs text-slate-500">
            If this keeps happening, try clearing your browser cache or
            returning later.
          </p>
        </div>
      </body>
    </html>
  );
}
