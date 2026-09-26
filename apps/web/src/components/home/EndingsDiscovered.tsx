"use client";

import { useEffect, useState } from "react";
import { getDiscoveredEndings } from "@/lib/branching-story";

/**
 * "n/m endings discovered", read from this browser's saved story progress.
 * Renders the total alone until mounted so the static HTML stays stable.
 */
export function EndingsDiscovered({
  storyIds,
  totalEndings,
}: {
  storyIds: string[];
  totalEndings: number;
}) {
  const [discovered, setDiscovered] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate discovered totals from localStorage
    setDiscovered(
      storyIds.reduce((sum, id) => sum + getDiscoveredEndings(id).length, 0),
    );
  }, [storyIds]);

  return (
    <span>
      <span className="font-serif text-2xl font-semibold text-parchment">
        {discovered === null ? totalEndings : `${discovered}/${totalEndings}`}
      </span>{" "}
      {discovered === null ? "endings to find" : "endings discovered"}
    </span>
  );
}
