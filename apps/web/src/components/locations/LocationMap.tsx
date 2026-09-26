"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { LocationMapInset as Inset } from "@/components/locations/LocationMapInset";

// Leaflet needs `window`, so the inset loads only in the browser. The
// placeholder has the inset's own height so nothing shifts when it swaps in.
const LocationMapInset = dynamic(
  () =>
    import("@/components/locations/LocationMapInset").then(
      (mod) => mod.LocationMapInset,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-80 animate-pulse rounded-lg border border-border bg-muted/40 motion-reduce:animate-none"
        aria-hidden="true"
      />
    ),
  },
);

/** Client boundary for the location map inset on server-rendered pages. */
export function LocationMap(props: ComponentProps<typeof Inset>) {
  return <LocationMapInset {...props} />;
}
