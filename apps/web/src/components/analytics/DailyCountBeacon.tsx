"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { sendCount } from "@/lib/analytics/daily-count-client";
import { arrivalSource, pageTypeForPath } from "@/lib/daily-counts";

/** True when this load is a reload or a back/forward move, not a new arrival. */
function isRepeatLoad(): boolean {
  try {
    const [entry] = performance.getEntriesByType("navigation");
    const type = (entry as PerformanceNavigationTiming | undefined)?.type;
    return type === "reload" || type === "back_forward";
  } catch {
    return false;
  }
}

/**
 * Counts one page load as an arrival, and the first move to a second page as
 * "onward". Both carry only the page type and the kind of referrer of the
 * arrival, so the two totals give an onward rate per page type without
 * following anyone: nothing links the two requests but this component's own
 * memory, which ends with the page.
 *
 * Mounted once in the root layout, so it survives client navigations.
 */
export function DailyCountBeacon() {
  const pathname = usePathname();
  const arrival = useRef<{ path: string; onwardSent: boolean } | null>(null);

  useEffect(() => {
    if (!arrival.current) {
      // A repeat load is not counted, and neither is what follows it.
      const repeat = isRepeatLoad();
      arrival.current = { path: pathname, onwardSent: repeat };
      if (!repeat) sendCount({ step: "arrive", ...arrivalFields(pathname) });
      return;
    }
    if (arrival.current.onwardSent || pathname === arrival.current.path) return;
    arrival.current.onwardSent = true;
    sendCount({ step: "onward", ...arrivalFields(arrival.current.path) });
  }, [pathname]);

  return null;
}

function arrivalFields(arrivalPath: string) {
  return {
    page: pageTypeForPath(arrivalPath),
    source: arrivalSource(document.referrer, window.location.hostname),
  };
}
