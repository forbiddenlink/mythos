"use client";

import { useEffect } from "react";
import {
  trackEvent,
  type AnalyticsEventMap,
  type AnalyticsEventName,
} from "@/lib/analytics/events";

/**
 * Fires one taxonomy event when a server-rendered page mounts. Keeps server
 * components free of analytics wiring while still giving the funnel a real
 * entry step.
 */
export function TrackPageView<Name extends AnalyticsEventName>({
  event,
  properties,
}: {
  event: Name;
  properties: AnalyticsEventMap[Name];
}) {
  // Serialised so a fresh object literal from the server does not refire the
  // event on every render.
  const propertyKey = JSON.stringify(properties);

  useEffect(() => {
    trackEvent(event, JSON.parse(propertyKey) as AnalyticsEventMap[Name]);
  }, [event, propertyKey]);

  return null;
}
