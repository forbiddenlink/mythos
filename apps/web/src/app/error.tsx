"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-midnight via-midnight-light to-midnight px-4 py-16">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Error icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -inset-5 rounded-full bg-gradient-radial from-red-500/20 to-transparent animate-pulse" />
            <div className="relative p-6 rounded-full border border-gold/30 bg-midnight-light/80 backdrop-blur-sm">
              <AlertTriangle className="w-12 h-12 text-gold" />
            </div>
          </div>
        </div>

        {/* Error title */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gradient-hero mb-4">
          Something Went Wrong
        </h1>

        {/* Clear guidance first, themed flavor second */}
        <div className="relative max-w-xl mx-auto mb-8 p-6 rounded-lg border border-gold/10 bg-midnight-light/30 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/30" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/30" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/30" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/30" />

          <p className="text-gold-light/90 font-body leading-relaxed">
            We hit an unexpected problem while loading this page. Try again, or
            return home and continue exploring.
          </p>
          <p className="text-parchment/50 text-sm mt-3">
            If it keeps happening, your device or network may have stale data.
          </p>
        </div>

        {/* Error details in development */}
        {process.env.NODE_ENV === "development" && (
          <Card className="border-red-500/20 bg-midnight-light/50 mb-8 text-left">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-red-400/70 mb-2 font-semibold">
                Error Details
              </p>
              <code className="block text-sm text-parchment/60 bg-midnight/50 rounded p-3 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-xs text-parchment/30 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-linear-to-r from-gold-dark via-gold to-gold-dark hover:from-gold hover:via-gold-light hover:to-gold text-midnight font-semibold px-8"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Subtle footer hint */}
        <div className="mt-10 text-sm text-muted-foreground">
          <p>
            If this issue persists, try clearing your browser cache or returning
            later.
          </p>
        </div>
      </div>
    </div>
  );
}
