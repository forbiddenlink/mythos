"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { OtherworldRoute } from "@/components/maps/OtherworldRoute";
import {
  isOtherworldJourney,
  mappedWaypoints,
  sortWaypoints,
  type JourneyDetail,
  type JourneyWaypoint,
} from "@/lib/journeys";

// Leaflet needs `window`; the placeholder matches the map's height.
const JourneyMap = dynamic(
  () => import("@/components/maps/JourneyMap").then((mod) => mod.JourneyMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse bg-muted/40 motion-reduce:animate-none"
        aria-hidden="true"
      />
    ),
  },
);

function TagRow({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="type-meta font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 type-ui text-foreground">{items.join(", ")}</p>
    </div>
  );
}

/**
 * The interactive part of a journey page: the route (a map, or an ordered
 * list of realms for otherworld journeys) and the stop it has selected.
 */
export function JourneyExplorer({
  journey,
  color,
}: Readonly<{ journey: JourneyDetail; color: string }>) {
  const otherworld = isOtherworldJourney(journey);
  const stops = useMemo(() => sortWaypoints(journey.waypoints), [journey]);
  const mapJourney = useMemo(
    () => ({ ...journey, waypoints: mappedWaypoints(journey.waypoints) }),
    [journey],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const current =
    stops.find((stop) => stop.id === selectedId) ?? stops[0] ?? null;
  const index = current ? stops.indexOf(current) : -1;

  const select = useCallback(
    (waypoint: JourneyWaypoint | null) => setSelectedId(waypoint?.id ?? null),
    [],
  );

  return (
    <div className="space-y-6">
      {otherworld ? (
        <OtherworldRoute
          waypoints={stops}
          color={color}
          selectedWaypointId={current?.id}
          onWaypointSelect={select}
        />
      ) : (
        <div className="h-[22rem] overflow-hidden rounded-md ring-1 ring-border sm:h-[28rem]">
          <JourneyMap
            journey={mapJourney}
            onWaypointSelect={select}
            selectedWaypointId={selectedId}
          />
        </div>
      )}

      {current ? (
        <div
          className="rounded-md border border-border/80 bg-card p-5 sm:p-6"
          aria-live="polite"
        >
          <div className="flex items-start gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-serif text-sm font-semibold text-foreground"
                style={{ borderColor: color }}
                aria-hidden="true"
              >
                {current.order}
              </span>
              <div className="min-w-0">
                <p className="type-meta text-muted-foreground">
                  Stop {index + 1} of {stops.length}
                  {current.duration ? ` · ${current.duration}` : ""}
                </p>
                <h3 className="type-h3 text-foreground">{current.name}</h3>
              </div>
            </div>
          </div>
          <p className="mt-4 type-reading text-foreground/90">
            {current.description}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <TagRow label="Events" items={current.events} />
            <TagRow label="Creatures" items={current.creatures} />
            <TagRow label="Gods involved" items={current.deities} />
          </div>
          {current.locationId ? (
            <Link
              href={`/locations/${current.locationId}`}
              className="mt-4 inline-flex min-h-10 items-center type-ui text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
            >
              Read about {current.name}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
