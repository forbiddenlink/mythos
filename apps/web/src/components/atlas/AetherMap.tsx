"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  type AtlasLayout,
  prettyPantheonName,
  type AtlasNode,
} from "@/lib/atlas-layout";
import {
  declutterLabels,
  hiddenSetsDiffer,
  type LabelBox,
} from "@/lib/atlas-label-declutter";
import { StageLoading } from "@/components/layout/tool-stage";
import { cn } from "@/lib/utils";

/** Re-run the screen-space collision check at most this often, not per frame. */
const LABEL_DECLUTTER_INTERVAL_MS = 120;

/* ----------------------------- one deity star ---------------------------- */

function Star({
  node,
  isHovered,
  onHover,
  onSelect,
}: {
  node: AtlasNode;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // gentle twinkle, amplified on hover
    const twinkle =
      1 + Math.sin(state.clock.elapsedTime * 1.6 + node.position[0]) * 0.08;
    ref.current.scale.setScalar(isHovered ? twinkle * 1.9 : twinkle);
  });

  return (
    <mesh
      ref={ref}
      position={node.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(node.id);
      }}
      onPointerOut={() => {
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.slug);
      }}
    >
      <sphereGeometry args={[node.size, 12, 12]} />
      <meshStandardMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={isHovered ? 2.4 : 1.1}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Watches every pantheon label's on-screen position and size (via
 * `getBoundingClientRect`, which already accounts for drei's distance-based
 * CSS scaling) and reports which ids should be hidden to avoid an unreadable
 * overlap. Runs inside the R3F render loop but is throttled to
 * `LABEL_DECLUTTER_INTERVAL_MS` and reuses its own refs, so it does no
 * allocation on the frames it skips and only a small, bounded allocation
 * (one box per pantheon) on the frames it runs.
 */
function useLabelDeclutter({
  labelRefs,
  priorityByPantheon,
  hoveredPantheonId,
}: {
  labelRefs: React.RefObject<Map<string, HTMLSpanElement>>;
  priorityByPantheon: ReadonlyMap<string, number>;
  hoveredPantheonId: string | null;
}) {
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const elapsedSinceCheck = useRef(0);

  useFrame((_state, delta) => {
    elapsedSinceCheck.current += delta * 1000;
    if (elapsedSinceCheck.current < LABEL_DECLUTTER_INTERVAL_MS) return;
    elapsedSinceCheck.current = 0;

    const boxes: LabelBox[] = [];
    for (const [id, el] of labelRefs.current) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue; // not laid out yet
      const priority =
        id === hoveredPantheonId
          ? Number.POSITIVE_INFINITY
          : (priorityByPantheon.get(id) ?? 0);
      boxes.push({
        id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        priority,
      });
    }

    const next = declutterLabels(boxes);
    // Functional update so this frame-loop callback never reads component
    // state directly (only React may do that, outside of render/effects).
    setHiddenIds((prev) => (hiddenSetsDiffer(next, prev) ? next : prev));
  });

  return hiddenIds;
}

/* ------------------------------- the scene ------------------------------- */

function Scene({
  layout,
  onSelect,
  reducedMotion,
}: {
  layout: AtlasLayout;
  onSelect: (slug: string) => void;
  reducedMotion: boolean;
}) {
  const { nodes, edges, pantheons } = layout;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = hoveredId ? nodes.find((n) => n.id === hoveredId) : undefined;
  const hoveredPantheonId = hovered?.pantheonId ?? null;

  // Bigger clusters (more figures) win a label collision by default; the
  // hovered star's own tradition always wins regardless of size.
  const priorityByPantheon = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of nodes) {
      counts.set(n.pantheonId, (counts.get(n.pantheonId) ?? 0) + 1);
    }
    return counts;
  }, [nodes]);

  const labelRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const hiddenLabelIds = useLabelDeclutter({
    labelRefs,
    priorityByPantheon,
    hoveredPantheonId,
  });

  return (
    <>
      <color attach="background" args={["#0a0a19"]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#f5e6c8" />

      <Stars
        radius={120}
        depth={60}
        count={1200}
        factor={4}
        saturation={0}
        fade
        speed={0.4}
      />

      {/* relationship + syncretism threads */}
      {edges.map((e) => (
        <Line
          key={e.id}
          points={[e.from, e.to]}
          color={e.type === "syncretism" ? "#d4af37" : "#b28f56"}
          lineWidth={e.type === "syncretism" ? 1.5 : 1}
          transparent
          opacity={e.opacity}
          dashed={e.type === "syncretism"}
        />
      ))}

      {/* deity stars */}
      {nodes.map((n) => (
        <Star
          key={n.id}
          node={n}
          isHovered={hoveredId === n.id}
          onHover={setHoveredId}
          onSelect={onSelect}
        />
      ))}

      {/* pantheon labels floating at each cluster centre. Two clusters can
          project close enough on screen to overlap; useLabelDeclutter hides
          the lower-priority one rather than let text collide. Every
          tradition stays reachable by hovering one of its stars (the
          tooltip below) or in AtlasTraditionGrid under the map. */}
      {pantheons.map((p) => {
        const isHidden = hiddenLabelIds.has(p.id);
        return (
          <Html
            key={p.id}
            position={[p.center[0], p.center[1] + 6.5, p.center[2]]}
            center
            distanceFactor={40}
          >
            <span
              ref={(el) => {
                if (el) labelRefs.current.set(p.id, el);
                else labelRefs.current.delete(p.id);
              }}
              aria-hidden="true"
              className="pointer-events-none block whitespace-nowrap font-serif text-lg tracking-[0.2em] uppercase"
              style={{
                color: p.color,
                textShadow: "0 0 12px rgba(0,0,0,0.9)",
                opacity: isHidden ? 0 : 1,
                transition: reducedMotion ? "none" : "opacity 200ms ease",
              }}
            >
              {p.name}
            </span>
          </Html>
        );
      })}

      {/* hovered star tooltip */}
      {hovered && (
        <Html
          position={[
            hovered.position[0],
            hovered.position[1] + hovered.size + 0.6,
            hovered.position[2],
          ]}
          center
          distanceFactor={26}
        >
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-gold/40 bg-midnight/95 px-3 py-1.5 text-center shadow-lg">
            <div className="font-serif text-base text-parchment">
              {hovered.name}
            </div>
            <div
              className="text-[0.65rem] uppercase tracking-wider"
              style={{ color: hovered.color }}
            >
              {prettyPantheonName(hovered.pantheonId)}
            </div>
          </div>
        </Html>
      )}

      <OrbitControls
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={90}
        autoRotate={!hoveredId}
        autoRotateSpeed={0.35}
        makeDefault
      />
    </>
  );
}

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
      <Canvas
        camera={{ position: [0, 30, 42], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <Scene
          layout={layout}
          onSelect={(slug) => router.push(`/deities/${slug}`)}
          reducedMotion={prefersReducedMotion}
        />
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0a0a19] to-transparent px-4 pt-10 pb-4 text-center type-meta uppercase tracking-[0.2em] text-parchment/90">
        Drag to orbit · scroll to zoom · click a star
      </p>
    </div>
  );
}
