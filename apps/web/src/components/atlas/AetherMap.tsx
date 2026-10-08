"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type AtlasLayout, prettyPantheonName } from "@/lib/atlas-layout";
import { StageLoading } from "@/components/layout/tool-stage";
import { cn } from "@/lib/utils";

const AetherScene = dynamic(() => import("./AetherScene"), {
  ssr: false,
  loading: () => (
    <StageLoading
      tone="dark"
      mark="constellation"
      label="Lighting the stars…"
      className="h-full rounded-lg"
    />
  ),
});

/* ------------------------- static sky (no motion) ------------------------ */

/**
 * The resting state: the same sky as a still, composed plate. Stars are
 * plotted top-down from the deterministic layout, one cluster per tradition,
 * inside a keyline frame with a printed caption, beside an index of every
 * tradition (colour tab and figure count).
 */
function StaticSky({
  layout,
  reason,
  onShow,
}: {
  layout: AtlasLayout;
  reason: "reduced" | "no-webgl";
  onShow?: () => void;
}) {
  const { nodes, edges, pantheons } = layout;
  const view = useMemo(() => {
    const xs = nodes.map((n) => n.position[0]);
    const zs = nodes.map((n) => n.position[2]);
    const pad = 3;
    const minX = Math.min(...xs) - pad;
    const minZ = Math.min(...zs) - pad;
    return {
      minX,
      minZ,
      width: Math.max(...xs) + pad - minX,
      height: Math.max(...zs) + pad - minZ,
    };
  }, [nodes]);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of nodes)
      map.set(n.pantheonId, (map.get(n.pantheonId) ?? 0) + 1);
    return map;
  }, [nodes]);
  const index = [...pantheons].sort(
    (a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0),
  );

  return (
    <div className="dark grid gap-8 rounded-lg bg-midnight p-5 text-foreground md:p-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
      <figure className="min-w-0">
        <div
          className="plate"
          style={{ "--plate-accent": "var(--gold)" } as React.CSSProperties}
        >
          <div className="plate-art">
            <svg
              viewBox={`${view.minX} ${view.minZ} ${view.width} ${view.height}`}
              role="img"
              aria-label={`Still chart of ${nodes.length} stars in ${pantheons.length} tradition clusters. Every figure is listed below.`}
              className="mx-auto block h-auto max-h-[34rem] w-full bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklch,var(--gold)_10%,transparent),transparent_70%)]"
            >
              {edges.map((e) => (
                <line
                  key={e.id}
                  x1={e.from[0]}
                  y1={e.from[2]}
                  x2={e.to[0]}
                  y2={e.to[2]}
                  stroke="oklch(0.85 0.05 85)"
                  strokeOpacity={0.11}
                  strokeWidth={0.06}
                />
              ))}
              {nodes.map((n) => (
                <circle
                  key={n.id}
                  cx={n.position[0]}
                  cy={n.position[2]}
                  r={Math.max(0.3, n.size * 1.1)}
                  fill={n.color}
                  fillOpacity={0.92}
                />
              ))}
            </svg>
          </div>
          <figcaption className="plate-caption">
            <span>Plate</span>
            <i>
              {nodes.length} stars, {pantheons.length} traditions
            </i>
          </figcaption>
        </div>
        <p className="mt-4 max-w-xl type-ui text-parchment/90">
          {reason === "reduced"
            ? "Your device asks for reduced motion, so the orbiting 3D map is off. This is the same sky, held still."
            : "This browser cannot draw the 3D map. This is the same sky, held still."}
        </p>
        {onShow ? (
          <button
            type="button"
            onClick={onShow}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md border border-gold/50 px-4 type-ui font-medium text-gold-light transition-colors hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Show the star map anyway
          </button>
        ) : null}
      </figure>

      <div className="min-w-0 lg:self-center">
        <p className="runhead text-gold-light">
          <span>Index of constellations</span>
          <span className="text-parchment/90">Figures</span>
        </p>
        <ol className="columns-1 gap-x-5 min-[380px]:columns-2 sm:gap-x-8 lg:columns-1 xl:columns-2 [&>li]:break-inside-avoid">
          {index.map((p) => (
            <li
              key={p.id}
              className="index-line min-h-9 items-center text-[0.9375rem] text-parchment/90"
            >
              <a
                href={`#atlas-${p.id}`}
                className="flex min-h-9 items-center gap-2 hover:text-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <span
                  aria-hidden="true"
                  className="h-3.5 w-1 shrink-0 rounded-[1px]"
                  style={{ backgroundColor: p.color }}
                />
                {prettyPantheonName(p.id)}
              </a>
              <span className="tabular-nums text-parchment/90">
                {counts.get(p.id) ?? 0}
              </span>
            </li>
          ))}
        </ol>
        <p className="runhead mt-4 text-gold-light">
          <span>Total</span>
          <span className="tabular-nums text-parchment/90">{nodes.length}</span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- wrapper --------------------------------- */

type StageState = "pending" | "canvas" | "reduced" | "no-webgl";

const STAGE_HEIGHT = "h-[min(76vh,46rem)] min-h-[28rem]";

/**
 * The 3D star map stage. The server and first paint show a loading frame; the
 * canvas mounts only with WebGL and without a reduced-motion preference. The
 * page lists every deity below the stage (AtlasTraditionGrid), so the canvas is
 * an enhancement, never the only way in.
 */
export function AetherMap({ layout }: { layout: AtlasLayout }) {
  const router = useRouter();
  const [state, setState] = useState<StageState>("pending");
  // Kept separately from `state`: "Show the star map anyway" can move state
  // to "canvas" while the user's OS preference is still reduced motion, and
  // the label fade transition needs to honour that preference either way.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only gate: choose the stage after hydration
    setPrefersReducedMotion(reduced);
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(
        c.getContext("webgl2") ||
        c.getContext("webgl") ||
        c.getContext("experimental-webgl")
      );
    } catch {
      webgl = false;
    }
    setState(!webgl ? "no-webgl" : reduced ? "reduced" : "canvas");
  }, []);

  if (state === "pending") {
    return (
      <StageLoading
        tone="dark"
        mark="constellation"
        label="Lighting the stars…"
        className={cn(STAGE_HEIGHT, "rounded-lg")}
      />
    );
  }

  if (state !== "canvas") {
    return (
      <StaticSky
        layout={layout}
        reason={state === "reduced" ? "reduced" : "no-webgl"}
        onShow={state === "reduced" ? () => setState("canvas") : undefined}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-[#0a0a19] ring-1 ring-border",
        STAGE_HEIGHT,
      )}
      data-interactive
      role="img"
      aria-label="Interactive 3D star map of deities, grouped by tradition. Every figure is also listed below the map."
    >
      <AetherScene
        layout={layout}
        onSelect={(slug) => router.push(`/deities/${slug}`)}
        reducedMotion={prefersReducedMotion}
      />

      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0a0a19] to-transparent px-4 pt-10 pb-4 text-center type-meta uppercase tracking-[0.2em] text-parchment/90">
        Drag to orbit · scroll to zoom · click a star
      </p>
    </div>
  );
}
