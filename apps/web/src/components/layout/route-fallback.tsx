import { Loader2 } from "lucide-react";

/**
 * Suspense fallback for the few client pages that read the URL query
 * (`useSearchParams`) and so cannot be prerendered past their boundary.
 * Prerendered pages have no route-level loading UI: their HTML is complete,
 * and a loading boundary only delays showing it.
 */
export function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2
        aria-label="Loading"
        className="h-10 w-10 animate-spin text-gold"
      />
    </div>
  );
}
