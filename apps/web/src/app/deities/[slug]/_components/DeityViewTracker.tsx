"use client";

import { useContext, useEffect } from "react";
import { ProgressContext } from "@/providers/progress-provider";

/** Records the deity and its pantheon in local progress once the page mounts. */
export function DeityViewTracker({
  deityId,
  pantheonId,
}: {
  deityId: string;
  pantheonId: string;
}) {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  const { trackDeityView, trackPantheonExplore } = context;

  useEffect(() => {
    trackDeityView(deityId);
    trackPantheonExplore(pantheonId);
  }, [deityId, pantheonId, trackDeityView, trackPantheonExplore]);

  return null;
}
