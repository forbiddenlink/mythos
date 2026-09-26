"use client";

import Link from "next/link";
import type { JourneyWaypoint } from "@/lib/journeys";
import { cn } from "@/lib/utils";

interface OtherworldRouteProps {
  waypoints: JourneyWaypoint[];
  color: string;
  selectedWaypointId?: string | null;
  onWaypointSelect?: (waypoint: JourneyWaypoint) => void;
}

/**
 * The route of an otherworld journey (realms with no coordinates) as an
 * ordered descent: one stop per realm, joined by a line, each opening its
 * catalog location. Replaces the map for journeys that have nothing to plot.
 */
export function OtherworldRoute({
  waypoints,
  color,
  selectedWaypointId,
  onWaypointSelect,
}: Readonly<OtherworldRouteProps>) {
  return (
    <ol
      className="relative space-y-1 border border-border bg-card/60 p-4 md:p-6"
      aria-label="Route through the realms"
    >
      <span
        aria-hidden
        className="absolute bottom-10 left-[2.15rem] top-10 w-px md:left-[2.65rem]"
        style={{ backgroundColor: `${color}66` }}
      />
      {waypoints.map((waypoint) => {
        const selected = waypoint.id === selectedWaypointId;
        return (
          <li key={waypoint.id} className="relative flex items-start gap-4">
            <button
              type="button"
              onClick={() => onWaypointSelect?.(waypoint)}
              aria-pressed={selected}
              className={cn(
                "flex min-h-11 flex-1 items-start gap-4 rounded-md p-2 text-left transition-colors",
                selected ? "bg-gold/15" : "hover:bg-muted/60",
              )}
            >
              <span
                className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold text-white"
                style={{ backgroundColor: selected ? color : `${color}b3` }}
              >
                {waypoint.order}
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-lg text-foreground">
                  {waypoint.name}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                  {waypoint.description}
                </span>
              </span>
            </button>
            {waypoint.locationId ? (
              <Link
                href={`/locations/${waypoint.locationId}`}
                className="mt-2 inline-flex min-h-11 shrink-0 items-center text-sm text-gold-text underline-offset-4 hover:underline"
                aria-label={`Open ${waypoint.name} in the locations atlas`}
              >
                Place →
              </Link>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
